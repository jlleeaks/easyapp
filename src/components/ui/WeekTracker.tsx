"use client";

import { Flame } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Card } from "@/components/ui/primitives";
import { thisWeekActivity } from "@/lib/streak";

export function WeekTracker({
  sessionDates,
  delay,
}: {
  sessionDates: string[];
  delay?: number;
}) {
  const days = thisWeekActivity(sessionDates);
  return (
    <Card accent={PALETTE.brandLine} tint={PALETTE.brandSoft} delay={delay} style={{ marginBottom: 0, height: "100%" }}>
      <div className="p-[1.15rem] h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3.5">
          <div
            style={{ width: 22, height: 22, borderRadius: 7, background: PALETTE.brand, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Flame size={12} color="#fff" fill="#fff" />
          </div>
          <p className="text-[11px] font-bold uppercase" style={{ color: PALETTE.brand, letterSpacing: "0.04em" }}>
            This week
          </p>
        </div>
        <div className="flex justify-between items-end flex-1">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: d.active ? PALETTE.brand : "transparent",
                  border: d.active ? `1.5px solid ${PALETTE.brand}` : `1.5px dashed #C9CFC1`,
                  boxShadow: d.active ? `0 0 0 2px ${PALETTE.brandSoft}` : "none",
                }}
              />
              <span className="text-[11px] font-semibold" style={{ color: d.isToday ? PALETTE.brand : PALETTE.inkSoft }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
