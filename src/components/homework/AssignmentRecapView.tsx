"use client";

import { CheckCircle2, TrendingUp } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Eyebrow, Card, AiMarkdown } from "@/components/ui/primitives";
import type { Briefing } from "@/lib/types";

export function AssignmentRecapView({ briefing, childName }: { briefing: Briefing; childName: string }) {
  const wentWell = briefing.went_well ?? [];
  const toImprove = briefing.to_improve ?? [];

  return (
    <div>
      <Eyebrow color={PALETTE.accent}>What this covered</Eyebrow>
      <Card>
        <div className="p-5">
          <div className="text-sm">
            <AiMarkdown content={briefing.why_it_matters || `Added to ${childName}'s profile.`} />
          </div>
        </div>
      </Card>

      {wentWell.length > 0 && (
        <Card accent={PALETTE.brandLine} tint={PALETTE.brandSoft}>
          <div className="p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 size={14} color={PALETTE.brand} />
              <Eyebrow color={PALETTE.brand}>Where she did well</Eyebrow>
            </div>
            <div className="flex flex-col gap-1.5">
              {wentWell.map((w, i) => (
                <div key={i} className="text-sm">• {w}</div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {toImprove.length > 0 && (
        <Card accent="#F0C8B8" tint={PALETTE.goldSoft}>
          <div className="p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={14} color={PALETTE.gold} />
              <Eyebrow color={PALETTE.gold}>Where to focus next</Eyebrow>
            </div>
            <div className="flex flex-col gap-1.5">
              {toImprove.map((w, i) => (
                <div key={i} className="text-sm">• {w}</div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
