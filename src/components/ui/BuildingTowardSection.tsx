import Link from "next/link";
import { PALETTE } from "@/lib/palette";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DevelopmentalStageBar } from "@/components/ui/MilestoneProgressBar";
import { SUBJECTS } from "@/lib/subjects";
import { nextStepForSubject, type AreaRoadmap } from "@/lib/roadmap";

export function BuildingTowardSection({ childName, roadmap }: { childName: string; roadmap: AreaRoadmap[] }) {
  return (
    <div>
      <SectionHeading color={PALETTE.violetDeep}>What {childName} Is Building Toward</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
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
      <Link href="/progress" className="text-xs font-bold underline" style={{ color: PALETTE.brand }}>
        View {childName}&apos;s full kindergarten roadmap
      </Link>
    </div>
  );
}
