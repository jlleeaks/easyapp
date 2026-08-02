"use client";

import { useState } from "react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { ReportIntakeCard } from "@/components/profile/ReportIntakeCard";
import { HomeObservationCard } from "@/components/profile/HomeObservationCard";

type Tab = "report" | "teacher" | "home";

const TABS: { key: Tab; label: string }[] = [
  { key: "report", label: "Upload schoolwork" },
  { key: "teacher", label: "Teacher said" },
  { key: "home", label: "Noticed at home" },
];

export function ProfileIntakeTabs({ childId, childName }: { childId: string; childName: string }) {
  const [tab, setTab] = useState<Tab>("report");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="btn-press px-3 py-2 text-xs font-bold transition-all duration-150"
              style={{
                borderRadius: RADIUS.sm,
                background: active ? PALETTE.brand : PALETTE.card,
                color: active ? "#fff" : PALETTE.inkSoft,
                border: `1px solid ${active ? PALETTE.brand : PALETTE.line}`,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "report" && (
        <ReportIntakeCard
          childId={childId}
          childName={childName}
          intakeType="report_card"
          title="Upload schoolwork or a report card"
          description={`Got a report card or graded schoolwork? Add it here and Easy folds it straight into what it already knows about ${childName}.`}
        />
      )}
      {tab === "teacher" && (
        <ReportIntakeCard
          childId={childId}
          childName={childName}
          intakeType="teacher"
          title="Add something a teacher said"
          description="A comment from a conference, note home, or conversation — type it in, or attach a photo of a note."
          placeholder="e.g. Ms. Rivera mentioned she's confident with sight words but rushes through math..."
          uploadLabel="Or attach a photo of a note"
        />
      )}
      {tab === "home" && <HomeObservationCard childId={childId} />}
    </div>
  );
}
