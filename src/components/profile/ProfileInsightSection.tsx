"use client";

import { useState } from "react";
import { PALETTE } from "@/lib/palette";
import { Card, Eyebrow } from "@/components/ui/primitives";
import { InsightRow } from "@/components/ui/InsightRow";
import type { ProfileInsight, LearningPattern } from "@/lib/types";

type Item = ProfileInsight | LearningPattern;
type Field = "strengths" | "growth_areas" | "learning_patterns";

export function ProfileInsightSection({
  childId,
  field,
  title,
  icon,
  color,
  items,
  emptyText,
}: {
  childId: string;
  field: Field;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: Item[];
  emptyText: string;
}) {
  const [prevItems, setPrevItems] = useState(items);
  const [list, setList] = useState(items);

  // Server props change after a router.refresh() (e.g. following a new intake) —
  // resync local state so newly-added insights actually appear without a full reload.
  // (Adjusting state during render, not in an effect, per React's recommended pattern.)
  if (items !== prevItems) {
    setPrevItems(items);
    setList(items);
  }

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-1">
          {icon}
          <Eyebrow color={color}>{title}</Eyebrow>
        </div>
        {list.length === 0 ? (
          <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
            {emptyText}
          </p>
        ) : (
          <div className="flex flex-col">
            {list.map((item, i) => (
              <div key={item.id ?? i} style={{ borderTop: i > 0 ? `1px solid ${PALETTE.line}` : "none" }}>
                <InsightRow childId={childId} field={field} item={item} onChange={setList} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
