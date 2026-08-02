import { KINDERGARTEN_STANDARDS, matchAreaByText, type StandardArea, type LearningState } from "@/lib/standards";
import { SKILL_STAGES } from "@/lib/palette";
import type { Skill, Session, ProfileInsight, LearningPattern, InsightSource } from "@/lib/types";

export type RoadmapEvidence = {
  type: "session" | "insight";
  text: string;
  date: string;
  source: InsightSource | Session["source"];
};

export type AreaRoadmap = {
  area: StandardArea;
  state: LearningState;
  evidence: RoadmapEvidence[];
};

function stageRank(stage: string): number {
  const idx = (SKILL_STAGES as readonly string[]).indexOf(stage);
  return idx === -1 ? -1 : idx;
}

function deriveState(bestStageRank: number, evidenceCount: number): LearningState {
  if (evidenceCount === 0) return "not_yet_observed";
  // "comfortable" requires corroborating evidence, not a single generated activity or tap.
  if (bestStageRank === 3) {
    if (evidenceCount >= 5) return "ready_to_extend";
    if (evidenceCount >= 2) return "comfortable";
    return "developing";
  }
  if (bestStageRank === 2) return "developing"; // "getting there"
  if (bestStageRank === 1) return evidenceCount >= 2 ? "developing" : "introduced"; // "just starting"
  return evidenceCount >= 2 ? "developing" : "introduced";
}

export function computeRoadmap(input: {
  skills: Skill[];
  sessions: Session[];
  strengths: ProfileInsight[];
  growthAreas: ProfileInsight[];
}): AreaRoadmap[] {
  return KINDERGARTEN_STANDARDS.map((area) => {
    const evidence: RoadmapEvidence[] = [];
    let bestStageRank = -1;

    // The skills-table stage is Easy's own derived summary FROM sessions, not a
    // separate piece of evidence — use it only to inform the state, never list it
    // alongside the session it was itself computed from (that double-counts one
    // check-in as two independent evidence items).
    for (const sk of input.skills) {
      if (sk.subject !== area.subject) continue;
      const matched = matchAreaByText(area.subject, sk.skill_name);
      if (matched?.id !== area.id) continue;
      bestStageRank = Math.max(bestStageRank, stageRank(sk.stage));
    }

    for (const s of input.sessions) {
      if (s.subject !== area.subject || !s.checkin) continue;
      const matched = matchAreaByText(area.subject, s.skill);
      if (matched?.id !== area.id) continue;
      evidence.push({ type: "session", text: s.micro_message ?? `Completed: ${s.skill}`, date: s.created_at, source: s.source });
    }

    for (const i of [...input.strengths, ...input.growthAreas]) {
      if (i.subject !== area.subject) continue;
      const matched = matchAreaByText(area.subject, i.text);
      if (matched?.id !== area.id) continue;
      evidence.push({ type: "insight", text: i.text, date: i.created_at, source: i.source });
    }

    evidence.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const state = deriveState(bestStageRank, evidence.length);
    return { area, state, evidence };
  });
}

export function roadmapSummary(areas: AreaRoadmap[]) {
  return {
    withEvidence: areas.filter((a) => a.evidence.length > 0).length,
    comfortable: areas.filter((a) => a.state === "comfortable" || a.state === "ready_to_extend").length,
    developing: areas.filter((a) => a.state === "developing" || a.state === "introduced").length,
    notObserved: areas.filter((a) => a.state === "not_yet_observed").length,
  };
}

/** Best-effort match of a suggest-focus recommendation onto a curated roadmap area, for display only. */
export function areaForFocusText(subject: string, focusText: string): StandardArea | null {
  if (subject !== "math" && subject !== "writing" && subject !== "reading") return null;
  return matchAreaByText(subject, focusText);
}

export function derivePatternInsights(patterns: LearningPattern[]) {
  const withResponse = patterns.filter((p) => p.parent_response);
  const grouped = new Map<string, { text: string; count: number; latest: string; confirmed: boolean }>();
  for (const p of withResponse) {
    const key = p.parent_response!.toLowerCase().trim();
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      if (new Date(p.created_at) > new Date(existing.latest)) existing.latest = p.created_at;
      if (p.confirmed === "confirmed") existing.confirmed = true;
    } else {
      grouped.set(key, { text: p.parent_response!, count: 1, latest: p.created_at, confirmed: p.confirmed === "confirmed" });
    }
  }
  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
}
