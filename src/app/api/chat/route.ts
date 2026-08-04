import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CHAT_SYSTEM, callClaudeConversation, parseJSON, childProfileForPrompt } from "@/lib/anthropic";
import type { ChatAction, ChatMessage, ChildProfile } from "@/lib/types";

type ChatReply = { reply: string; action: ChatAction };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, message } = body as { childId: string; message: string };
  if (!childId || !message?.trim()) {
    return NextResponse.json({ error: "Missing message." }, { status: 400 });
  }

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single<ChildProfile>();

  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const { data: history } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(12)
    .returns<ChatMessage[]>();

  const { error: userInsertError } = await supabase
    .from("chat_messages")
    .insert({ child_id: childId, role: "user", content: message.trim() });
  if (userInsertError) {
    return NextResponse.json({ error: "Couldn't send that — try again." }, { status: 502 });
  }

  try {
    const priorTurns = (history ?? [])
      .slice()
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    const system = `${CHAT_SYSTEM}\n\nChild profile for context: ${JSON.stringify(childProfileForPrompt(child))}`;
    const messages = [...priorTurns, { role: "user" as const, content: message.trim() }];

    // The model occasionally ignores the JSON envelope entirely for answers that read like
    // a "plan" (breaking straight into markdown) despite the system prompt forbidding it.
    // Rather than let that show the parent a hard "didn't catch that" error, fall back to
    // using the raw reply text directly — a real answer with no action button beats no
    // answer at all. Only retry once before falling back, same budget as the JSON path had.
    let reply: string | null = null;
    let action: ChatAction = null;
    let lastText = "";
    for (let attempt = 0; attempt < 2 && !reply; attempt++) {
      lastText = await callClaudeConversation({ system, messages, maxTokens: 1000 });
      const parsed = parseJSON<ChatReply>(lastText);
      if (parsed?.reply) {
        reply = parsed.reply;
        action = parsed.action ?? null;
      }
    }
    if (!reply) {
      reply = lastText.trim() || "Sorry, I didn't catch that — could you try rephrasing?";
    }

    const { error: assistantInsertError } = await supabase
      .from("chat_messages")
      .insert({ child_id: childId, role: "assistant", content: reply, action });
    if (assistantInsertError) throw assistantInsertError;

    return NextResponse.json({ reply, action });
  } catch {
    const fallback = "Couldn't reach Easy just now — check your connection and try again.";
    await supabase.from("chat_messages").insert({ child_id: childId, role: "assistant", content: fallback, action: null });
    return NextResponse.json({ reply: fallback, action: null });
  }
}
