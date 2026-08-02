"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { STANDARDS_FRAMEWORK } from "@/lib/standards";

export function RoadmapHeader({ childName }: { childName: string }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mb-5">
      <h1 className="font-serif-display font-bold" style={{ fontSize: 30, color: PALETTE.ink }}>
        {childName}&apos;s learning roadmap
      </h1>
      <div className="flex items-center gap-1.5 mt-1">
        <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
          {STANDARDS_FRAMEWORK.grade} · {STANDARDS_FRAMEWORK.name}
        </p>
        <button
          onClick={() => setShowInfo((v) => !v)}
          aria-label="About this roadmap reference"
          className="flex-shrink-0"
        >
          <Info size={14} color={PALETTE.inkFaint} />
        </button>
      </div>
      {showInfo && (
        <p className="text-xs mt-2 max-w-[56ch]" style={{ color: PALETTE.inkFaint }}>
          Schools may introduce these skills in a different order. Easy uses this roadmap as a reference and
          adapts it using {childName}&apos;s schoolwork and your observations.
        </p>
      )}
    </div>
  );
}
