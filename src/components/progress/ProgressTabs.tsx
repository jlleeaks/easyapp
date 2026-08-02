"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PALETTE, RADIUS } from "@/lib/palette";
import { RoadmapView } from "@/components/progress/RoadmapView";
import { HistoryView } from "@/components/progress/HistoryView";
import type { AreaRoadmap } from "@/lib/roadmap";
import type { Subject, Session, LearningPattern } from "@/lib/types";

export function ProgressTabs({
  childId,
  childName,
  areasBySubject,
  patterns,
  sessions,
  dates,
}: {
  childId: string;
  childName: string;
  areasBySubject: Record<Subject, AreaRoadmap[]>;
  patterns: LearningPattern[];
  sessions: Session[];
  dates: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "history" ? "history" : "roadmap";

  function setView(next: "roadmap" | "history") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.push(`/progress?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="flex gap-1 mb-5 p-1 rounded-xl inline-flex" style={{ background: PALETTE.line }}>
        {(["roadmap", "history"] as const).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-1.5 text-sm font-bold transition-all duration-150"
              style={{
                borderRadius: RADIUS.sm - 2,
                background: active ? PALETTE.card : "transparent",
                color: active ? PALETTE.ink : PALETTE.inkSoft,
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {v === "roadmap" ? "Roadmap" : "History"}
            </button>
          );
        })}
      </div>

      {view === "roadmap" ? (
        <RoadmapView childId={childId} childName={childName} areasBySubject={areasBySubject} patterns={patterns} />
      ) : (
        <HistoryView childName={childName} sessions={sessions} dates={dates} />
      )}
    </div>
  );
}
