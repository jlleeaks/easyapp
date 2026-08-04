import "server-only";
import { SUGGEST_FOCUS_SYSTEM, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
import { computeRoadmap } from "@/lib/roadmap";
import { SUBJECTS } from "@/lib/subjects";
import type { ChildProfile, Session, Skill, Subject } from "@/lib/types";

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
