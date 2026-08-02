import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOOK_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import type { ChildProfile } from "@/lib/types";

type BookGuide = {
  what_it_teaches: string;
  discussion_questions: string[];
  read_aloud_tip: string;
  estimated_minutes: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, title, author } = body as { childId: string; title: string; author?: string };
  if (!childId || !title?.trim()) {
    return NextResponse.json({ error: "Missing book title." }, { status: 400 });
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

  let guide: BookGuide | null = null;
  try {
    guide = await callClaudeJSON<BookGuide>({
      system: BOOK_SYSTEM,
      userContent: [
        {
          type: "text",
          text: `Book: "${title.trim()}"${author?.trim() ? ` by ${author.trim()}` : ""}\nChild profile: ${JSON.stringify(childProfileForPrompt(child))}`,
        },
      ],
      maxTokens: 900,
    });
  } catch {
    guide = null;
  }

  const { data: book, error: insertError } = await supabase
    .from("books")
    .insert({
      child_id: childId,
      title: title.trim(),
      author: author?.trim() || null,
      what_it_teaches: guide?.what_it_teaches ?? null,
      discussion_questions: guide?.discussion_questions ?? null,
      read_aloud_tip: guide?.read_aloud_tip ?? null,
      estimated_minutes: guide?.estimated_minutes ?? null,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Couldn't add that book — try again." }, { status: 502 });
  }

  return NextResponse.json({ book });
}
