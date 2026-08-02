"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PALETTE } from "@/lib/palette";

const MESSAGES = [
  "Reading the worksheet...",
  "Figuring out the exact skill...",
  "Finding analogies she'll like...",
  "Putting tonight's briefing together...",
];

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return <div className="skeleton-shimmer rounded-md h-3" style={{ width }} />;
}

function SkeletonCard({ titleWidth, lines, delay }: { titleWidth: string; lines: number; delay: number }) {
  return (
    <div
      className="rounded-2xl p-5 mb-4 animate-fade-in-up"
      style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.line}`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="skeleton-shimmer rounded-md h-2.5 mb-3" style={{ width: "38%" }} />
      <div className="flex flex-col gap-2">
        <SkeletonLine width={titleWidth} />
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} width={i === lines - 1 ? "70%" : "94%"} />
        ))}
      </div>
    </div>
  );
}

export function BriefingSkeleton({ childName }: { childName: string }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div
          className="flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            background: PALETTE.brand,
          }}
        >
          <Sparkles size={20} color="#fff" className="animate-pulse" />
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: PALETTE.ink }}>
            {MESSAGES[messageIndex]}
          </div>
          <div className="text-xs" style={{ color: PALETTE.inkSoft }}>
            Personalizing for {childName || "your kindergartner"}
          </div>
        </div>
      </div>

      <SkeletonCard titleWidth="55%" lines={2} delay={0} />
      <SkeletonCard titleWidth="42%" lines={2} delay={80} />
      <SkeletonCard titleWidth="60%" lines={3} delay={160} />
    </div>
  );
}
