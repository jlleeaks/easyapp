"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import { PrimaryButton } from "@/components/ui/primitives";
import { subjectScene } from "@/components/ui/SubjectScene";
import { thisWeekCountBySubject, WEEKLY_SUBJECT_TARGET } from "@/lib/streak";
import type { StandardArea } from "@/lib/standards";
import type { Session, Subject } from "@/lib/types";

type Suggestion = { subject: Subject; focus: string; reason: string };

export function TonightActivityHero({
  childName,
  suggestion,
  area,
  sessions,
}: {
  childName: string;
  suggestion: Suggestion | null;
  area: StandardArea | null;
  sessions: Session[];
}) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  // Honest fallback: don't invent a personalized pick when generation failed —
  // still give the parent a way to start something, just not falsely tailored.
  if (!suggestion) {
    return (
      <div
        className="rounded-3xl p-7"
        style={{ background: PALETTE.goldSoft, border: `1px solid ${PALETTE.goldLine}` }}
      >
        <p className="text-xs font-bold uppercase mb-1.5" style={{ color: PALETTE.gold, letterSpacing: "0.06em" }}>
          Tonight
        </p>
        <h2 className="font-serif-display font-bold mb-2" style={{ fontSize: 24 }}>
          What should we do with {childName} tonight?
        </h2>
        <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
          Easy couldn&apos;t put together a personalized pick right now — pick one of the paths below instead.
        </p>
      </div>
    );
  }

  const meta = subjectMeta(suggestion.subject);
  const weekCount = thisWeekCountBySubject(sessions, suggestion.subject);

  function start() {
    setStarting(true);
    const params = new URLSearchParams({ subject: suggestion!.subject, topic: suggestion!.focus, reason: suggestion!.reason });
    router.push(`/practice?${params.toString()}`);
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl grid grid-cols-1 md:grid-cols-[1fr_auto]"
      style={{ background: meta.soft, border: `1px solid ${PALETTE.line}` }}
    >
      <div className="p-7 md:p-8 min-w-0">
        <p className="text-xs font-bold uppercase mb-2" style={{ color: meta.color, letterSpacing: "0.06em" }}>
          Tonight&apos;s activity
        </p>
        <h2 className="font-serif-display font-bold mb-2.5" style={{ fontSize: 26, lineHeight: 1.15, color: PALETTE.ink }}>
          {suggestion.focus}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold" style={{ color: PALETTE.inkSoft }}>
          <span className="px-2.5 py-1 rounded-full" style={{ background: "#fff", color: meta.color }}>
            {meta.label}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> 5-10 min
          </span>
          <span>No printing needed</span>
          <span style={{ color: meta.color, fontWeight: 700 }}>
            {weekCount} of {WEEKLY_SUBJECT_TARGET} this week
          </span>
          {area && <span>· {meta.label} → {area.area}</span>}
        </div>

        <p className="text-sm mb-6 max-w-[46ch]" style={{ color: PALETTE.ink }}>
          <span className="font-bold">Why this tonight: </span>
          {suggestion.reason}
        </p>

        <PrimaryButton onClick={start} disabled={starting}>
          {starting ? "Starting…" : "Start activity"}
        </PrimaryButton>
      </div>

      <div className="hidden md:flex items-center justify-center px-7" style={{ minWidth: 210 }}>
        {subjectScene(suggestion.subject, 180)}
      </div>
    </div>
  );
}
