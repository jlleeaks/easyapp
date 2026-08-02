import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import { LEARNING_STATE_LABELS } from "@/lib/standards";
import type { LearningState } from "@/lib/standards";
import type { Subject } from "@/lib/types";

export function ThisWeekCard({
  childName,
  activitiesThisWeek,
  focusSubject,
  focusState,
  nextFocusLabel,
}: {
  childName: string;
  activitiesThisWeek: number;
  focusSubject: Subject | null;
  focusState: LearningState | null;
  nextFocusLabel: string | null;
}) {
  const meta = focusSubject ? subjectMeta(focusSubject) : null;

  return (
    <div
      className="rounded-3xl p-6 h-full flex flex-col"
      style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
    >
      <p className="text-xs font-bold uppercase mb-4" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
        {childName} this week
      </p>

      <div className="flex flex-col gap-4 flex-1">
        <div>
          <p className="font-serif-display font-bold leading-none" style={{ fontSize: 32, color: PALETTE.ink }}>
            {activitiesThisWeek}
          </p>
          <p className="text-xs mt-1" style={{ color: PALETTE.inkSoft }}>
            activit{activitiesThisWeek === 1 ? "y" : "ies"} completed
          </p>
        </div>

        {meta && focusState ? (
          <div>
            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
              {meta.label}
            </p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: meta.soft, color: meta.color }}>
              {LEARNING_STATE_LABELS[focusState]}
            </span>
          </div>
        ) : (
          <p className="text-sm" style={{ color: PALETTE.inkFaint }}>
            Easy is still getting to know {childName}.
          </p>
        )}

        {nextFocusLabel && (
          <div>
            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
              Next focus
            </p>
            <p className="text-sm font-semibold" style={{ color: PALETTE.ink }}>
              {nextFocusLabel}
            </p>
          </div>
        )}
      </div>

      <Link
        href="/progress"
        className="flex items-center gap-1 text-xs font-bold underline mt-4"
        style={{ color: PALETTE.brand }}
      >
        View roadmap <ArrowRight size={12} />
      </Link>
    </div>
  );
}
