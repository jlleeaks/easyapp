"use client";

import { PALETTE } from "@/lib/palette";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeGreeting({ parentName, childName }: { parentName?: string | null; childName: string }) {
  const greeting = timeOfDayGreeting();

  return (
    <div className="mb-5">
      <h1 className="font-serif-display font-bold" style={{ fontSize: 26, color: PALETTE.ink }}>
        {greeting}
        {parentName ? `, ${parentName}` : ""}
      </h1>
      <p className="text-sm mt-0.5" style={{ color: PALETTE.inkSoft }}>
        Here&apos;s what would help {childName} tonight.
      </p>
    </div>
  );
}
