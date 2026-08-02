import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REPORT_INTAKE_SYSTEM, ASSIGNMENT_INTAKE_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import type { Briefing, ChildProfile, ProfileInsight, Subject } from "@/lib/types";
import type Anthropic from "@anthropic-ai/sdk";

type TaggedInsight = { text: string; subject?: string };

type ProfileIntakeResult = {
  updated_summary: string;
  strengths: TaggedInsight[];
  growth_areas: TaggedInsight[];
};

type AssignmentIntakeResult = {
  topic: string;
  recap: string;
  went_well: string[];
  to_improve: string[];
  strengths: TaggedInsight[];
  growth_areas: TaggedInsight[];
};

const VALID_SUBJECTS: Subject[] = ["math", "writing", "reading"];
const MAX_INSIGHTS = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, notes, imageBase64, mediaType, subject, intakeType } = body as {
    childId: string;
    notes?: string;
    imageBase64?: string;
    mediaType?: string;
    subject?: string;
    intakeType?: "report_card" | "assignment" | "teacher";
  };

  if (!childId || (!notes?.trim() && !imageBase64)) {
    return NextResponse.json({ error: "Add a note or a photo first." }, { status: 400 });
  }
  const safeSubject: Subject | "general" = VALID_SUBJECTS.includes(subject as Subject) ? (subject as Subject) : "general";
  const source: ProfileInsight["source"] =
    intakeType === "assignment" ? "assignment" : intakeType === "teacher" ? "teacher" : "report_card";
  const isAssignment = intakeType === "assignment" && safeSubject !== "general";

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single<ChildProfile>();

  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const allowedMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
  const safeMediaType = (allowedMediaTypes as readonly string[]).includes(mediaType ?? "")
    ? (mediaType as (typeof allowedMediaTypes)[number])
    : "image/jpeg";

  try {
    const userContent: Anthropic.MessageParam["content"] = [
      {
        type: "text",
        text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nExisting cumulative summary: ${child.summary || "none yet"}\n${safeSubject !== "general" ? `This input is specifically about the subject: ${safeSubject}.\n` : ""}${notes?.trim() ? `Parent's notes: ${notes.trim()}` : "The parent attached a photo instead of typing notes."}`,
      },
    ];
    if (imageBase64) {
      userContent.push({
        type: "image",
        source: { type: "base64", media_type: safeMediaType, data: imageBase64 },
      });
    }

    // When the intake entry point already pins a subject (e.g. a Homework subject page),
    // trust that context. Otherwise (the general Profile intake) use the model's own
    // per-item subject tag so insights stay findable by the roadmap for the right subject.
    function resolveSubject(itemSubject?: string): Subject | "general" {
      if (safeSubject !== "general") return safeSubject;
      return VALID_SUBJECTS.includes(itemSubject as Subject) ? (itemSubject as Subject) : "general";
    }

    if (isAssignment) {
      const parsed = await callClaudeJSON<AssignmentIntakeResult>({ system: ASSIGNMENT_INTAKE_SYSTEM, userContent, maxTokens: 900 });
      if (!parsed) {
        return NextResponse.json({ error: "Couldn't make sense of that — try again." }, { status: 502 });
      }

      const now = new Date().toISOString();
      const newStrengths: ProfileInsight[] = (parsed.strengths ?? []).map((item) => ({
        id: crypto.randomUUID(),
        subject: resolveSubject(item.subject),
        text: item.text,
        source,
        created_at: now,
      }));
      const newGrowthAreas: ProfileInsight[] = (parsed.growth_areas ?? []).map((item) => ({
        id: crypto.randomUUID(),
        subject: resolveSubject(item.subject),
        text: item.text,
        source,
        created_at: now,
      }));

      const mergedStrengths = [...newStrengths, ...(child.strengths ?? [])].slice(0, MAX_INSIGHTS);
      const mergedGrowthAreas = [...newGrowthAreas, ...(child.growth_areas ?? [])].slice(0, MAX_INSIGHTS);

      // Deliberately NOT touching child.summary here — that's the cumulative, whole-child
      // picture, and folding every single quiz into it is exactly what made "why it matters"
      // balloon into an unrelated wall of text. A single assignment's context belongs on its
      // own session (topic/recap/went_well/to_improve below), not smeared across the profile.
      const { error: updateError } = await supabase
        .from("children")
        .update({ strengths: mergedStrengths, growth_areas: mergedGrowthAreas })
        .eq("id", childId);
      if (updateError) throw updateError;

      const topic = parsed.topic?.trim() || "Graded assignment";
      const briefing: Briefing = {
        skill: topic,
        why_it_matters: parsed.recap ?? "",
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
        went_well: parsed.went_well ?? [],
        to_improve: parsed.to_improve ?? [],
      };
      const { error: sessionError } = await supabase.from("sessions").insert({
        child_id: childId,
        subject: safeSubject,
        source: "homework",
        skill: topic,
        briefing,
        checkin: null,
        micro_message: parsed.recap ?? null,
        parent_notes: notes?.trim() || null,
      });
      if (sessionError) console.error("[intake-report] session insert failed", sessionError);

      return NextResponse.json({
        topic,
        recap: parsed.recap,
        wentWell: parsed.went_well ?? [],
        toImprove: parsed.to_improve ?? [],
        strengths: newStrengths.map((s) => s.text),
        growthAreas: newGrowthAreas.map((g) => g.text),
      });
    }

    const parsed = await callClaudeJSON<ProfileIntakeResult>({ system: REPORT_INTAKE_SYSTEM, userContent, maxTokens: 900 });
    if (!parsed) {
      return NextResponse.json({ error: "Couldn't make sense of that — try again." }, { status: 502 });
    }

    const now = new Date().toISOString();
    const newStrengths: ProfileInsight[] = (parsed.strengths ?? []).map((item) => ({
      id: crypto.randomUUID(),
      subject: resolveSubject(item.subject),
      text: item.text,
      source,
      created_at: now,
    }));
    const newGrowthAreas: ProfileInsight[] = (parsed.growth_areas ?? []).map((item) => ({
      id: crypto.randomUUID(),
      subject: resolveSubject(item.subject),
      text: item.text,
      source,
      created_at: now,
    }));

    const mergedStrengths = [...newStrengths, ...(child.strengths ?? [])].slice(0, MAX_INSIGHTS);
    const mergedGrowthAreas = [...newGrowthAreas, ...(child.growth_areas ?? [])].slice(0, MAX_INSIGHTS);

    const { error: updateError } = await supabase
      .from("children")
      .update({
        summary: parsed.updated_summary,
        strengths: mergedStrengths,
        growth_areas: mergedGrowthAreas,
      })
      .eq("id", childId);
    if (updateError) throw updateError;

    return NextResponse.json({
      updatedSummary: parsed.updated_summary,
      strengths: newStrengths.map((s) => s.text),
      growthAreas: newGrowthAreas.map((g) => g.text),
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong reading that — check your connection and try again." },
      { status: 502 },
    );
  }
}
