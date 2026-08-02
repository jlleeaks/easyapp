"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { STANDARDS_FRAMEWORK } from "@/lib/standards";
import { roadmapSummary, type AreaRoadmap } from "@/lib/roadmap";

export function RoadmapHeader({ childName, roadmap }: { childName: string; roadmap: AreaRoadmap[] }) {
  const [showInfo, setShowInfo] = useState(false);
  const summary = roadmapSummary(roadmap);

  return (
    <div className="mb-6">
      <h1 className="font-serif-display font-bold" style={{ fontSize: 30, color: PALETTE.ink }}>
        {childName}&apos;s learning roadmap
      </h1>

      <div
        className="mt-3 rounded-2xl p-5"
        style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
      >
        <p className="text-sm font-bold mb-1" style={{ color: PALETTE.ink }}>
          {childName} is in {STANDARDS_FRAMEWORK.grade}
        </p>
        <p className="text-sm mb-3" style={{ color: PALETTE.inkSoft }}>
          This roadmap tracks {childName}&apos;s progress against what kindergartners commonly work toward, across
          math, writing, and reading.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold" style={{ color: PALETTE.inkSoft }}>
          <span
            className="px-2.5 py-1 rounded-full font-bold"
            style={{ background: PALETTE.brandSoft, color: PALETTE.brand }}
          >
            {roadmap.length} total milestone areas
          </span>
          <span>
            {summary.developing} developing · {summary.notObserved} not yet observed
          </span>
          <button
            onClick={() => setShowInfo((v) => !v)}
            aria-label="About this roadmap reference"
            className="flex items-center gap-1"
            style={{ color: PALETTE.inkFaint }}
          >
            <Info size={13} /> Based on {STANDARDS_FRAMEWORK.name}
          </button>
        </div>
        {showInfo && (
          <p className="text-xs mt-3 pt-3 max-w-[60ch]" style={{ color: PALETTE.inkFaint, borderTop: `1px solid ${PALETTE.line}` }}>
            Schools may introduce these skills in a different order, and {STANDARDS_FRAMEWORK.jurisdiction.toLowerCase()}
            {" "}— not a specific state&apos;s official standards. Easy uses this roadmap as a reference and adapts it
            using {childName}&apos;s schoolwork and your observations.
          </p>
        )}
      </div>
    </div>
  );
}
