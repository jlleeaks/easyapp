import "server-only";
import { SUGGEST_FOCUS_SYSTEM, SUGGEST_WEEKLY_GOALS_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import { computeRoadmap, roadmapSummary, type AreaRoadmap } from "@/lib/roadmap";
import { SUBJECTS } from "@/lib/subjects";
import type { ChildProfile, Session, Skill, Subject, WeeklyGoals } from "@/lib/types";

export type Suggestion = { subject: Subject; focus: string; reason: string };

/**
 * Shared, server-only suggestion generator used directly (no HTTP round trip)
 * by pages that need it at render time, and by /api/suggest-focus for any
 * client-side caller. Grounds the model's reasoning in Easy's own current
 * roadmap read so the "why" text can't contradict the state shown elsewhere.
 */
export async function getTonightSuggestions(
  child: ChildProfile,
  skills: Skill[],
  sessions: Session[],
): Promise<Suggestion[] | null> {
  const roadmap = computeRoadmap({
    skills,
    sessions,
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });
  const roadmapContext = SUBJECTS.map((s) => ({
    subject: s.key,
    areas: roadmap.filter((r) => r.area.subject === s.key).map((r) => ({ area: r.area.area, state: r.state })),
  }));

  const focusArea = child.weekly_goals?.focus_area?.trim();

  const parsed = await callClaudeJSON<{ suggestions: Suggestion[] }>({
    system: SUGGEST_FOCUS_SYSTEM,
    userContent: [
      {
        type: "text",
        text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nCurrently tracked skills: ${JSON.stringify(skills)}\nroadmap: ${JSON.stringify(roadmapContext)}${focusArea ? `\nThe parent has said they specifically want to build toward this week: "${focusArea}" — strongly prefer a suggestion that serves this, and reference it in your reason.` : ""}`,
      },
    ],
    maxTokens: 1400,
  });

  return parsed?.suggestions?.length ? parsed.suggestions : null;
}

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

export type SuggestedWeeklyGoals = Pick<WeeklyGoals, "read_together_target" | "practice_target" | "homework_target"> & {
  reason: string;
};

/**
 * Shared, server-only weekly-goals generator — used directly (no HTTP round trip) so a
 * personalized default can render on Home immediately, without the parent having to ask
 * for one first. Grounded in the same roadmap coverage Progress shows (how many of the 15
 * curated kindergarten areas are still not yet observed) so targets track real ground left
 * to cover before kindergarten ends, not just how often the family has happened to log in.
 */
export async function getSuggestedWeeklyGoals(
  child: ChildProfile,
  sessions: Session[],
  roadmap: AreaRoadmap[],
): Promise<SuggestedWeeklyGoals | null> {
  const cutoff = Date.now() - FOUR_WEEKS_MS;
  const recent = sessions.filter((s) => new Date(s.created_at).getTime() >= cutoff);
  const hasHistory = recent.length >= 3;

  const recentWeeklyAverages = hasHistory
    ? {
        read_together_per_week: Math.round((recent.filter((s) => s.source === "library").length / 4) * 10) / 10,
        practice_per_week: Math.round((recent.filter((s) => s.source === "practice").length / 4) * 10) / 10,
        homework_per_week: Math.round((recent.filter((s) => s.source === "homework").length / 4) * 10) / 10,
      }
    : null;

  const summary = roadmapSummary(roadmap);
  const bySubject = SUBJECTS.map((s) => roadmapSummary(roadmap.filter((r) => r.area.subject === s.key)));
  const roadmapContext = {
    total_areas: roadmap.length,
    ...summary,
    by_subject: SUBJECTS.map((s, i) => ({ subject: s.key, ...bySubject[i] })),
  };

  const userContent = `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nroadmap coverage (15 curated kindergarten areas across math/writing/reading): ${JSON.stringify(roadmapContext)}\n${
    recentWeeklyAverages
      ? `Actual average weekly activity over the last 4 weeks: ${JSON.stringify(recentWeeklyAverages)}`
      : "No reliable recent activity history yet — this family is just getting started."
  }`;

  const parsed = await callClaudeJSON<SuggestedWeeklyGoals>({
    system: SUGGEST_WEEKLY_GOALS_SYSTEM,
    userContent: [{ type: "text", text: userContent }],
    maxTokens: 300,
  });

  return parsed ?? null;
}

/**
 * A guaranteed, non-AI weekly-goals default for when the AI call fails or returns
 * nothing — same "Easy should suggest something no matter what" principle as
 * deterministicFallbackSuggestion. Grounded in real roadmap coverage rather than a fixed
 * default, so it still tracks how much kindergarten ground is left even without the model.
 */
export function deterministicWeeklyGoals(roadmap: AreaRoadmap[]): SuggestedWeeklyGoals {
  const summary = roadmapSummary(roadmap);
  const total = roadmap.length || 1;
  const notObservedFraction = summary.notObserved / total;
  const comfortableFraction = summary.comfortable / total;

  if (notObservedFraction > 0.5) {
    return {
      read_together_target: 5,
      practice_target: 4,
      homework_target: 3,
      reason: "A number of kindergarten areas haven't been observed yet, so practice leans a little higher to help cover more ground before the year ends.",
    };
  }
  if (comfortableFraction > 0.5) {
    return {
      read_together_target: 5,
      practice_target: 3,
      homework_target: 3,
      reason: "Most areas already look comfortable — these keep up steady, sustainable progress rather than adding pressure.",
    };
  }
  return {
    read_together_target: 5,
    practice_target: 3,
    homework_target: 3,
    reason: "A steady, realistic weekly rhythm to keep building across math, writing, and reading.",
  };
}
