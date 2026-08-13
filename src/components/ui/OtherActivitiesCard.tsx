"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { NumericProgressBar } from "@/components/ui/MilestoneProgressBar";
import { subjectMeta } from "@/lib/subjects";
import { thisWeekCountBySubject, WEEKLY_SUBJECT_TARGET } from "@/lib/streak";
import type { StandardArea } from "@/lib/standards";
import type { Session, Subject } from "@/lib/types";

export type OtherActivity = { subject: Subject; focus: string; reason: string; area: StandardArea | null };

function OtherActivityRow({ activity, count, onStart }: { activity: OtherActivity; count: number; onStart: () => void }) {
  const meta = subjectMeta(activity.subject);
  return (
    <div className="rounded-xl p-3.5" style={{ background: meta.soft, border: `1px solid ${PALETTE.line}` }}>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: "#fff", color: meta.color }}>
          {meta.label}
        </span>
        <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: PALETTE.inkSoft }}>
          {count} of {WEEKLY_SUBJECT_TARGET} this week
        </span>
      </div>
      <p className="text-sm font-bold leading-snug mb-0.5" style={{ color: PALETTE.ink }}>
        {activity.focus}
      </p>
      <p className="text-xs italic mb-2" style={{ color: meta.color }}>
        Builds toward {meta.label}
      </p>
      <NumericProgressBar observed={count} total={WEEKLY_SUBJECT_TARGET} fillColor={meta.color} />
      <button onClick={onStart} className="text-xs font-bold underline mt-2" style={{ color: meta.color }}>
        Start this instead
      </button>
    </div>
  );
}

export function OtherActivitiesCard({ activities, sessions }: { activities: OtherActivity[]; sessions: Session[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  function start(activity: OtherActivity) {
    const params = new URLSearchParams({ subject: activity.subject, topic: activity.focus, reason: activity.reason });
    router.push(`/practice?${params.toString()}`);
  }

  if (activities.length === 0) return null;

  return (
    <div className="rounded-3xl p-6 h-full flex flex-col" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-between gap-2 text-left flex-shrink-0" aria-expanded={expanded}>
        <p className="text-xs font-bold uppercase" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
          Rather not do tonight&apos;s pick?
        </p>
        {expanded ? <ChevronDown size={15} color={PALETTE.inkFaint} /> : <ChevronRight size={15} color={PALETTE.inkFaint} />}
      </button>
      {!expanded ? (
        <div className="flex-1 flex items-center">
          <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
            {activities.length} other option{activities.length === 1 ? "" : "s"} across math, writing, and reading — tap above to see them.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 mt-3">
          {activities.map((a) => (
            <OtherActivityRow
              key={`${a.subject}-${a.focus}`}
              activity={a}
              count={thisWeekCountBySubject(sessions, a.subject)}
              onStart={() => start(a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
