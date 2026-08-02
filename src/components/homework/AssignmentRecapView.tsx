"use client";

import { CheckCircle2, TrendingUp, PartyPopper, Lightbulb } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Eyebrow, Card, AiMarkdown } from "@/components/ui/primitives";
import { StateMarker } from "@/components/ui/StateMarker";
import { DevelopmentalStageBar } from "@/components/ui/MilestoneProgressBar";
import type { AreaRoadmap } from "@/lib/roadmap";
import type { Briefing } from "@/lib/types";

export function AssignmentRecapView({
  briefing,
  childName,
  matchedArea,
}: {
  briefing: Briefing;
  childName: string;
  matchedArea: AreaRoadmap | null;
}) {
  const wentWell = briefing.went_well ?? [];
  const toImprove = briefing.to_improve ?? [];
  const needsSupport = toImprove.length > 0;

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

      {matchedArea && (
        <Card>
          <div className="p-5">
            <Eyebrow color={PALETTE.violetDeep}>Kindergarten goal this targets</Eyebrow>
            <p className="text-sm font-bold mb-1">{matchedArea.area.area}</p>
            <p className="text-sm mb-2.5" style={{ color: PALETTE.inkSoft }}>
              {matchedArea.area.parentWording}
            </p>
            <StateMarker state={matchedArea.state} />
            <div className="mt-2 max-w-[180px]">
              <DevelopmentalStageBar state={matchedArea.state} />
            </div>
          </div>
        </Card>
      )}

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

      {needsSupport ? (
        <>
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

          {briefing.analogies && briefing.analogies.length > 0 && (
            <Card>
              <div className="p-5">
                <Eyebrow>Try this</Eyebrow>
                {briefing.analogies.map((a, i) => (
                  <div key={i} className="text-sm mb-1">• {a}</div>
                ))}
              </div>
            </Card>
          )}

          {briefing.stuck_tip && (
            <Card>
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb size={14} color={PALETTE.inkSoft} />
                  <Eyebrow>If she gets stuck</Eyebrow>
                </div>
                <div className="text-sm">
                  <AiMarkdown content={briefing.stuck_tip} />
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card accent={PALETTE.brandLine} tint={PALETTE.brandSoft}>
          <div className="p-5 flex items-center gap-3">
            <PartyPopper size={20} color={PALETTE.brand} className="flex-shrink-0" />
            <div>
              <p className="text-sm font-bold" style={{ color: PALETTE.brand }}>
                No suggestions needed right now — great job!
              </p>
              <p className="text-xs mt-0.5" style={{ color: PALETTE.inkSoft }}>
                Keep practicing to build on this.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
