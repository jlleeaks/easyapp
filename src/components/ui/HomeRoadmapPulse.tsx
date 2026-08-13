import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { NumericProgressBar } from "@/components/ui/MilestoneProgressBar";
import { SUBJECTS } from "@/lib/subjects";
import { STANDARDS_FRAMEWORK } from "@/lib/standards";
import { roadmapSummary, roadmapEncouragingNote, type AreaRoadmap } from "@/lib/roadmap";

/**
 * The Roadmap is the product's primary value prop — this gives it real, immediate
 * presence on Home (not a small link buried at the bottom) so a parent sees "where does
 * my kid stand" before "what's tonight's task." Reuses the exact same roadmapSummary/
 * roadmapEncouragingNote logic the full Roadmap page uses, so the two can't disagree.
 */
export function HomeRoadmapPulse({ childName, roadmap }: { childName: string; roadmap: AreaRoadmap[] }) {
  const summary = roadmapSummary(roadmap);

  return (
    <div className="rounded-3xl p-6" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-xs font-bold uppercase" style={{ color: PALETTE.brand, letterSpacing: "0.06em" }}>
          {childName}&apos;s learning roadmap
        </p>
        <Link
          href="/progress"
          className="flex items-center gap-1 text-xs font-bold underline flex-shrink-0"
          style={{ color: PALETTE.brand }}
        >
          View full roadmap <ArrowRight size={12} />
        </Link>
      </div>
      <p className="text-xs mb-4" style={{ color: PALETTE.inkFaint }}>
        Based on {STANDARDS_FRAMEWORK.name}
      </p>

      <div className="flex items-start gap-2 mb-4">
        <Sparkles size={14} color={PALETTE.brand} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm italic" style={{ color: PALETTE.ink }}>
          {roadmapEncouragingNote(childName, summary)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUBJECTS.map((s) => {
          const items = roadmap.filter((r) => r.area.subject === s.key);
          const subjectSummary = roadmapSummary(items);
          return (
            <div key={s.key}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <s.icon size={13} color={s.color} />
                <p className="text-[11px] font-bold uppercase" style={{ color: s.color, letterSpacing: "0.04em" }}>
                  {s.label}
                </p>
              </div>
              <p className="text-xs font-bold mb-1.5" style={{ color: PALETTE.inkSoft }}>
                {subjectSummary.withEvidence} of {items.length} areas observed
              </p>
              <NumericProgressBar observed={subjectSummary.withEvidence} total={items.length} fillColor={s.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
