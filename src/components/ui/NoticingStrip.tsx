import { Lightbulb } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import type { LearningPattern } from "@/lib/types";

export function NoticingStrip({ pattern }: { pattern: LearningPattern | null }) {
  if (!pattern) return null;
  const meta = pattern.subject !== "general" ? subjectMeta(pattern.subject) : null;

  return (
    <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: PALETTE.brandSoft }}>
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff" }}
      >
        <Lightbulb size={14} color={PALETTE.brand} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase mb-0.5" style={{ color: PALETTE.brand, letterSpacing: "0.05em" }}>
          One thing to notice{meta ? ` · ${meta.label}` : ""}
        </p>
        <p className="text-sm" style={{ color: PALETTE.ink }}>
          {pattern.observation}
          {pattern.parent_response ? ` — ${pattern.parent_response} appeared to help.` : "."}
        </p>
      </div>
    </div>
  );
}
