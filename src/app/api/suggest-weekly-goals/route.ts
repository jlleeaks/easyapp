import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUGGEST_WEEKLY_GOALS_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import type { ChildProfile, Session } from "@/lib/types";

type SuggestedGoals = {
  read_together_target: number;
  practice_target: number;
  homework_target: number;
  reason: string;
};

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

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

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .returns<Session[]>();

  const cutoff = new Date().getTime() - FOUR_WEEKS_MS;
  const recent = (sessions ?? []).filter((s) => new Date(s.created_at).getTime() >= cutoff);
  const hasHistory = recent.length >= 3;

  const recentWeeklyAverages = hasHistory
    ? {
        read_together_per_week: Math.round((recent.filter((s) => s.source === "library").length / 4) * 10) / 10,
        practice_per_week: Math.round((recent.filter((s) => s.source === "practice").length / 4) * 10) / 10,
        homework_per_week: Math.round((recent.filter((s) => s.source === "homework").length / 4) * 10) / 10,
      }
    : null;

  try {
    const userContent = `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\n${
      recentWeeklyAverages
        ? `Actual average weekly activity over the last 4 weeks: ${JSON.stringify(recentWeeklyAverages)}`
        : "No reliable recent activity history yet — this family is just getting started."
    }`;

    const parsed = await callClaudeJSON<SuggestedGoals>({
      system: SUGGEST_WEEKLY_GOALS_SYSTEM,
      userContent: [{ type: "text", text: userContent }],
      maxTokens: 300,
    });
    if (!parsed) {
      return NextResponse.json({ error: "Couldn't come up with a suggestion — try again." }, { status: 502 });
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
  }
}
