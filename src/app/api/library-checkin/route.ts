import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ITERATION_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import type { Briefing, ChildProfile, LibraryCheckinAnswers } from "@/lib/types";
import type { SkillStage } from "@/lib/palette";
import { SKILL_STAGES } from "@/lib/palette";

type IterationResult = {
  micro_message: string;
  updated_summary: string;
  skill_status: SkillStage;
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
  const { childId, bookId, bookTitle, bookAuthor, whatItTeaches, checkin } = body as {
    childId: string;
    bookId?: string | null;
    bookTitle: string;
    bookAuthor?: string | null;
    whatItTeaches?: string | null;
    checkin: LibraryCheckinAnswers;
  };

  if (!childId || !bookTitle || !checkin) {
    return NextResponse.json({ error: "Missing session data." }, { status: 400 });
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

  try {
    const parsed = await callClaudeJSON<IterationResult>({
      system: ITERATION_SYSTEM,
      userContent: [
        {
          type: "text",
          text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nSubject: reading (bedtime story)\nBook read tonight: ${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ""}\nPrevious cumulative summary: ${child.summary || "none yet"}\nParent's check-in answers: ${JSON.stringify(checkin)}`,
        },
      ],
      maxTokens: 900,
    });

    if (!parsed || !SKILL_STAGES.includes(parsed.skill_status)) {
      return NextResponse.json({ error: "Couldn't process that check-in — try again." }, { status: 502 });
    }

    const briefing: Briefing = {
      skill: bookTitle,
      why_it_matters: whatItTeaches || "",
      is_new_concept: false,
      analogies: [],
      household_objects: [],
      followup_questions: [],
      stuck_tip: "",
      alternate_approach: "",
      watch_for: "",
      praise_phrase: "",
      autonomy_tip: "",
      real_life_connection: "",
      estimated_minutes: "",
      math_anxiety_note: "",
    };

    const { data: inserted, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        child_id: childId,
        subject: "reading",
        source: "library",
        skill: bookTitle,
        briefing,
        checkin,
        micro_message: parsed.micro_message,
        book_id: bookId ?? null,
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;

    const { error: summaryError } = await supabase
      .from("children")
      .update({ summary: parsed.updated_summary })
      .eq("id", childId);
    if (summaryError) throw summaryError;

    return NextResponse.json({ microMessage: parsed.micro_message, sessionId: inserted?.id });
  } catch {
    return NextResponse.json(
      { error: "Couldn't process that check-in — check your connection and try again." },
      { status: 502 },
    );
  }
}
