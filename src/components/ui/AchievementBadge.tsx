"use client";

import { PALETTE, SKILL_STAGES, STAGE_LABELS, stageIndex } from "@/lib/palette";
import { Card } from "@/components/ui/primitives";

export function AchievementBadge({
  skillName,
  stage,
  note,
  delay,
}: {
  skillName: string;
  stage: string;
  note: string;
  delay?: number;
}) {
  const idx = stageIndex(stage);
  const pct = idx / (SKILL_STAGES.length - 1);
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(circumference * pct, 0.001);

  return (
    <Card accent={PALETTE.goldLine} tint={PALETTE.goldSoft} delay={delay} style={{ marginBottom: 0, height: "100%" }}>
      <div className="p-[1.15rem] flex items-center gap-4 h-full">
        <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r={radius} fill="none" stroke="#F0E4C4" strokeWidth="7" />
            <circle
              cx="30"
              cy="30"
              r={radius}
              fill="none"
              stroke={PALETTE.gold}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 30 30)"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -8,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: PALETTE.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 3px #FFFDF7",
              transform: "rotate(12deg)",
            }}
          >
            <svg viewBox="0 0 24 24" width={12} height={12} fill="#fff">
              <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.3l7.1-.7z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase mb-0.5" style={{ color: PALETTE.gold, letterSpacing: "0.04em" }}>
            {STAGE_LABELS[SKILL_STAGES[idx]]}
          </p>
          <p className="font-serif-display font-bold leading-tight mb-1" style={{ fontSize: 18 }}>
            {skillName}
          </p>
          <p className="text-xs leading-snug" style={{ color: PALETTE.inkSoft }}>
            {note}
          </p>
        </div>
      </div>
    </Card>
  );
}
