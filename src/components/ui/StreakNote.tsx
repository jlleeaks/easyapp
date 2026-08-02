"use client";

import { PALETTE } from "@/lib/palette";
import { computeStreak } from "@/lib/streak";

export function StreakNote({ sessionDates }: { sessionDates: string[] }) {
  const streak = computeStreak(sessionDates);
  if (streak <= 0) return null;
  return (
    <p className="text-xs -mb-1 px-1" style={{ color: PALETTE.inkSoft }}>
      {streak} day{streak === 1 ? "" : "s"} in a row — that consistency is what moves the needle.
    </p>
  );
}
