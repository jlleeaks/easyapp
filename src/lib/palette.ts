export const PALETTE = {
  bg: "#FDFCF9",
  card: "#FFFFFF",
  ink: "#21271D",
  inkSoft: "#71756A",
  inkFaint: "#8F9285",
  line: "#E9E6D9",

  brand: "#3B4F42",
  brandDeep: "#2E3F34",
  brandSoft: "#E9EFE9",
  brandLine: "#D3E0D6",

  accent: "#D2582F",
  accentDeep: "#B84A24",
  accentSoft: "#FAE4D6",

  gold: "#C6871F",
  goldSoft: "#FBEDD1",
  goldLine: "#F0DCA8",

  // legacy aliases kept for any not-yet-migrated call sites
  honey: "#C6871F",
  honeyDeep: "#B84A24",
  honeySoft: "#FBEDD1",
  clay: "#D2582F",
  claySoft: "#FAE4D6",
  sage: "#3B4F42",
  sageSoft: "#E9EFE9",
  ringEmpty: "#EFEBDF",
  navy: "#3B4F42",
} as const;

export const RADIUS = {
  lg: 20,
  md: 16,
  sm: 12,
} as const;

export const SKILL_STAGES = [
  "not yet introduced",
  "just starting",
  "getting there",
  "comfortable",
] as const;

export type SkillStage = (typeof SKILL_STAGES)[number];

// The model is asked to return one of SKILL_STAGES verbatim, but sometimes adds
// punctuation, capitalization, or a close paraphrase. Coerce leniently instead
// of failing the whole check-in over a cosmetic mismatch.
export function normalizeSkillStage(raw: unknown, fallback: SkillStage = "just starting"): SkillStage {
  const s = String(raw ?? "").toLowerCase().trim().replace(/[.!?]+$/, "");
  if ((SKILL_STAGES as readonly string[]).includes(s)) return s as SkillStage;
  if (s.includes("comfortable") || s.includes("confident") || s.includes("mastered")) return "comfortable";
  if (s.includes("getting there") || s.includes("almost") || s.includes("progress")) return "getting there";
  if (s.includes("just start") || s.includes("beginning") || s.includes("new to")) return "just starting";
  if (s.includes("not yet") || s.includes("hasn't") || s.includes("has not") || s.includes("introduc")) return "not yet introduced";
  return fallback;
}

export const STAGE_COLORS: Record<SkillStage, string> = {
  "not yet introduced": PALETTE.line,
  "just starting": PALETTE.accent,
  "getting there": PALETTE.gold,
  comfortable: PALETTE.brand,
};

export const STAGE_LABELS: Record<SkillStage, string> = {
  "not yet introduced": "Not yet introduced",
  "just starting": "Just starting",
  "getting there": "Getting there",
  comfortable: "Comfortable",
};

export function stageIndex(stage: string | null | undefined): number {
  const i = SKILL_STAGES.indexOf((stage ?? "") as SkillStage);
  return i === -1 ? 0 : i;
}
