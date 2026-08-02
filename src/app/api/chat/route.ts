import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CHAT_SYSTEM, callClaudeConversationJSON, childProfileForPrompt } from "@/lib/anthropic";
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

    const parsed = await callClaudeConversationJSON<ChatReply>({
      system: `${CHAT_SYSTEM}\n\nChild profile for context: ${JSON.stringify(childProfileForPrompt(child))}`,
      messages: [...priorTurns, { role: "user" as const, content: message.trim() }],
      maxTokens: 1000,
    });

    const reply = parsed?.reply || "Sorry, I didn't catch that — could you try rephrasing?";
    const action = parsed?.action ?? null;

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
