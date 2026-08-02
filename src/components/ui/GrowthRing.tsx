"use client";

import { useEffect, useState } from "react";
import { PALETTE, SKILL_STAGES, STAGE_COLORS, STAGE_LABELS, stageIndex } from "@/lib/palette";

export function GrowthRing({ label, stage }: { label: string; stage: string }) {
  const idx = stageIndex(stage);
  const pct = idx / (SKILL_STAGES.length - 1);
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const targetDash = Math.max(circumference * pct, 0.001);
  const color = STAGE_COLORS[SKILL_STAGES[idx]];
  const mastered = SKILL_STAGES[idx] === "comfortable";

  const [dash, setDash] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDash(targetDash));
    return () => cancelAnimationFrame(id);
  }, [targetDash]);

  return (
    <div className="flex flex-col items-center gap-1.5 animate-fade-in-up" style={{ width: 88 }}>
      <div style={{ position: "relative", width: 60, height: 60 }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={radius} fill="none" stroke={PALETTE.line} strokeWidth="7" strokeDasharray="2 5" />
          {idx > 0 && (
            <circle
              cx="30"
              cy="30"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 30 30)"
              style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          )}
        </svg>
        {mastered && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: PALETTE.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 0 3px ${PALETTE.card}`,
              transform: "rotate(12deg)",
            }}
          >
            <svg viewBox="0 0 24 24" width={11} height={11} fill="#fff">
              <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.3l7.1-.7z" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-xs font-semibold text-center mt-0.5">{label}</div>
      <div className="text-[11px] text-center" style={{ color: PALETTE.inkSoft }}>
        {STAGE_LABELS[SKILL_STAGES[idx]]}
      </div>
    </div>
  );
}
