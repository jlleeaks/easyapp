import Link from "next/link";
import { Hand, Smile, Footprints } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DevelopmentalStageBar } from "@/components/ui/MilestoneProgressBar";
import { SUBJECTS } from "@/lib/subjects";
import { nextStepForSubject, type AreaRoadmap } from "@/lib/roadmap";
import type { Briefing, Session } from "@/lib/types";

const LIFE_SKILL_CATEGORIES = [
  { key: "fine_motor_support", label: "Fine motor", icon: Hand } as const,
  { key: "social_emotional_support", label: "Social-emotional", icon: Smile } as const,
  { key: "independence_skill", label: "Independence", icon: Footprints } as const,
];

/** Most recent session where Easy actually flagged this field — never a fabricated status. */
function latestLifeSkillNote(sessions: Session[], field: keyof Briefing): { text: string; date: string } | null {
  for (const s of sessions) {
    const val = s.briefing?.[field];
    if (typeof val === "string" && val.trim()) return { text: val, date: s.created_at };
  }
  return null;
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase mb-2" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
      {children}
    </p>
  );
}

export function BuildingTowardSection({
  childName,
  roadmap,
  sessions,
}: {
  childName: string;
  roadmap: AreaRoadmap[];
  sessions: Session[];
}) {
  return (
    <div>
      <SectionHeading color={PALETTE.violetDeep}>What {childName} Is Building Toward</SectionHeading>

      <GroupLabel>School</GroupLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {SUBJECTS.map((s) => {
          const items = roadmap.filter((a) => a.area.subject === s.key);
          const next = nextStepForSubject(items) ?? items[0];
          if (!next) return null;
          const hasEvidence = next.evidence.length > 0;
          const statusLabel = !hasEvidence
            ? "Starting point needed"
            : next.state === "comfortable" || next.state === "ready_to_extend"
              ? "Comfortable"
              : "Developing";
          return (
            <div key={s.key} className="rounded-2xl p-4" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <s.icon size={14} color={s.color} />
                <p className="text-[11px] font-bold uppercase" style={{ color: s.color, letterSpacing: "0.04em" }}>
                  {s.label}
                </p>
              </div>
              <p className="text-sm font-bold mb-2 leading-snug">{next.area.area}</p>
              <p className="text-xs font-semibold mb-2" style={{ color: hasEvidence ? PALETTE.inkSoft : PALETTE.inkFaint }}>
                {statusLabel}
              </p>
              {hasEvidence && <DevelopmentalStageBar state={next.state} />}
            </div>
          );
        })}
      </div>

      <GroupLabel>Social</GroupLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        {LIFE_SKILL_CATEGORIES.map((cat) => {
          const note = latestLifeSkillNote(sessions, cat.key);
          return (
            <div key={cat.key} className="rounded-2xl p-4" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <cat.icon size={14} color={PALETTE.violetDeep} />
                <p className="text-[11px] font-bold uppercase" style={{ color: PALETTE.violetDeep, letterSpacing: "0.04em" }}>
                  {cat.label}
                </p>
              </div>
              {note ? (
                <p className="text-xs leading-snug" style={{ color: PALETTE.inkSoft }}>
                  {note.text.length > 110 ? note.text.slice(0, 107).trimEnd() + "…" : note.text}
                </p>
              ) : (
                <p className="text-xs font-semibold" style={{ color: PALETTE.inkFaint }}>
                  Not yet observed
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Link href="/progress" className="text-xs font-bold underline" style={{ color: PALETTE.brand }}>
        View {childName}&apos;s full kindergarten roadmap
      </Link>
    </div>
  );
}
