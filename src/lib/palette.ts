// Palette B: locked base colors, with darker text/action variants for AA contrast.
export const PALETTE = {
  bg: "#FAFCF7",
  card: "#FFFFFF",
  ink: "#2B3648",
  inkSoft: "#586579",
  inkFaint: "#647084",
  line: "#DEE7DF",
  growth: "#3CAA6B",
  trust: "#2F7DE0",
  spark: "#FFC63D",
  brand: "#2368C1",
  brandDeep: "#1B529B",
  brandSoft: "#ECF3FE",
  brandLine: "#CADCF7",
  accent: "#257C4B",
  accentDeep: "#1C603A",
  accentSoft: "#EBF7ED",
  gold: "#80600A",
  goldSoft: "#FFF4CB",
  goldLine: "#F2D678",
  violet: "#6655A0",
  violetDeep: "#514082",
  violetSoft: "#F0ECFC",
  violetLine: "#D9D0EC",
  blue: "#2368C1",
  blueSoft: "#ECF3FE",
  blueLine: "#CADCF7",
  honey: "#80600A",
  honeyDeep: "#765009",
  honeySoft: "#FFF4CB",
  clay: "#257C4B",
  claySoft: "#EBF7ED",
  sage: "#257C4B",
  sageSoft: "#EBF7ED",
  ringEmpty: "#E6ECE4",
  navy: "#2B3648",
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
export function normalizeSkillStage(
  raw: unknown,
  fallback: SkillStage = "just starting",
): SkillStage {
  const s = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[.!?]+$/, "");
  if ((SKILL_STAGES as readonly string[]).includes(s)) return s as SkillStage;
  if (
    s.includes("comfortable") ||
    s.includes("confident") ||
    s.includes("mastered")
  )
    return "comfortable";
  if (
    s.includes("getting there") ||
    s.includes("almost") ||
    s.includes("progress")
  )
    return "getting there";
  if (
    s.includes("just start") ||
    s.includes("beginning") ||
    s.includes("new to")
  )
    return "just starting";
  if (
    s.includes("not yet") ||
    s.includes("hasn't") ||
    s.includes("has not") ||
    s.includes("introduc")
  )
    return "not yet introduced";
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
