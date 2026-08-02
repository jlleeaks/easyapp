import { User, GraduationCap, FileText, ClipboardCheck, Sparkles, type LucideIcon } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import type { InsightSource } from "@/lib/types";

export const SOURCE_LABELS: Record<InsightSource, string> = {
  report_card: "Report card",
  assignment: "Graded assignment",
  session: "Easy observation",
  teacher: "Teacher",
  parent: "Parent",
};

const SOURCE_ICONS: Record<InsightSource, LucideIcon> = {
  report_card: FileText,
  assignment: ClipboardCheck,
  session: Sparkles,
  teacher: GraduationCap,
  parent: User,
};

/** Small, consistent per-source icon so a parent can visually tell teacher evidence from their own observations at a glance. */
export function EvidenceSourceIcon({ source, size = 12 }: { source: InsightSource; size?: number }) {
  const Icon = SOURCE_ICONS[source];
  return <Icon size={size} color={PALETTE.inkFaint} />;
}

export function EvidenceSourceLabel({ source, size = 12 }: { source: InsightSource; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: PALETTE.inkFaint }}>
      <EvidenceSourceIcon source={source} size={size} />
      {SOURCE_LABELS[source]}
    </span>
  );
}
