"use client";

import { Moon } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { computeStreak, thisWeekActivity } from "@/lib/streak";

export function TonightNudgeBanner({ childName, sessionDates }: { childName: string; sessionDates: string[] }) {
  const week = thisWeekActivity(sessionDates);
  const doneToday = week.find((d) => d.isToday)?.active ?? false;
  if (doneToday) return null;
  const streak = computeStreak(sessionDates);

  return (
    <div
      className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl animate-fade-in-up"
      style={{ background: PALETTE.goldSoft, border: `1px solid ${PALETTE.goldLine}` }}
    >
      <Moon size={16} color={PALETTE.gold} className="flex-shrink-0" />
      <p className="text-sm font-semibold" style={{ color: "#8a5c10" }}>
        {childName}
        {" "}
        hasn&apos;t done tonight&apos;s session yet
        {streak > 0 ? ` — pick one below to keep the ${streak}-day streak going.` : " — pick one below to get started."}
      </p>
    </div>
  );
}
