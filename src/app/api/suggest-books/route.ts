import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOOK_SUGGEST_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import type { ChildProfile } from "@/lib/types";

type BookSuggestion = { title: string; author: string; theme: string; why: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId } = body as { childId: string };
  if (!childId) {
    return NextResponse.json({ error: "Missing childId." }, { status: 400 });
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

  const { data: books } = await supabase.from("books").select("title").eq("child_id", childId);
  const ownedTitles = (books ?? []).map((b) => b.title);

  try {
    const parsed = await callClaudeJSON<{ suggestions: BookSuggestion[] }>({
      system: BOOK_SUGGEST_SYSTEM,
      userContent: [
        {
          type: "text",
          text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nAlready on the shelf: ${JSON.stringify(ownedTitles)}`,
        },
      ],
      maxTokens: 900,
    });

    if (!parsed?.suggestions?.length) {
      return NextResponse.json({ error: "Couldn't come up with suggestions — try again." }, { status: 502 });
    }

    return NextResponse.json({ suggestions: parsed.suggestions });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
  }
}
