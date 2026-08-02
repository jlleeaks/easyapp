import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ITERATION_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import type { Briefing, CheckinAnswers, ChildProfile, Subject } from "@/lib/types";
import type { SkillStage } from "@/lib/palette";
import { normalizeSkillStage } from "@/lib/palette";
import { deriveHomeworkLearningPatterns } from "@/lib/patterns";

const VALID_SUBJECTS: Subject[] = ["math", "writing", "reading"];

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
  const { childId, source, subject, briefing, checkin } = body as {
    childId: string;
    source: "homework" | "practice";
    subject: string;
    briefing: Briefing;
    checkin: CheckinAnswers;
  };

  if (!childId || !briefing || !checkin) {
    return NextResponse.json({ error: "Missing session data." }, { status: 400 });
  }
  const safeSubject: Subject = VALID_SUBJECTS.includes(subject as Subject) ? (subject as Subject) : "math";

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
          text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nSubject: ${safeSubject}\nSkill taught tonight: ${briefing.skill}\nPrevious cumulative summary: ${child.summary || "none yet"}\nParent's check-in answers: ${JSON.stringify(checkin)}`,
        },
      ],
      maxTokens: 900,
    });

    if (!parsed) {
      return NextResponse.json(
        { error: "Couldn't process that check-in — try again." },
        { status: 502 },
      );
    }
    const skillStatus = normalizeSkillStage(parsed.skill_status);

    const { data: inserted, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        child_id: childId,
        subject: safeSubject,
        source,
        skill: briefing.skill,
        briefing,
        checkin,
        micro_message: parsed.micro_message,
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;

    const { error: skillError } = await supabase.from("skills").upsert(
      {
        child_id: childId,
        subject: safeSubject,
        skill_name: briefing.skill,
        stage: skillStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "child_id,subject,skill_name" },
    );
    if (skillError) throw skillError;

    const { error: summaryError } = await supabase
      .from("children")
      .update({ summary: parsed.updated_summary })
      .eq("id", childId);
    if (summaryError) throw summaryError;

    // Best-effort: never let this block the check-in itself from succeeding.
    const newPatterns = deriveHomeworkLearningPatterns(safeSubject, briefing.skill, checkin);
    if (newPatterns.length > 0) {
      const mergedPatterns = [...newPatterns, ...(child.learning_patterns ?? [])].slice(0, 50);
      const { error: patternError } = await supabase
        .from("children")
        .update({ learning_patterns: mergedPatterns })
        .eq("id", childId);
      if (patternError) console.error("[checkin] learning_patterns update failed", patternError);
    }

    return NextResponse.json({ microMessage: parsed.micro_message, sessionId: inserted?.id });
  } catch {
    return NextResponse.json(
      { error: "Couldn't process that check-in — check your connection and try again." },
      { status: 502 },
    );
  }
}
