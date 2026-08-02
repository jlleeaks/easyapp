import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";

const SUGGESTIONS = ["What should we focus on?", "What can we skip tonight?", "Give us a different activity"];

export function AskEasyMiniPrompt({ childName }: { childName: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex items-center gap-3 flex-wrap"
      style={{ background: PALETTE.brandSoft, border: `1px solid ${PALETTE.brandLine}` }}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <Sparkles size={15} color={PALETTE.brand} />
        <p className="text-sm font-bold" style={{ color: PALETTE.ink }}>
          Want to adjust {childName}&apos;s week?
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Link
            key={s}
            href={`/chat?draft=${encodeURIComponent(s)}`}
            className="text-xs font-semibold px-3 py-1.5 transition-all duration-150 hover:-translate-y-0.5"
            style={{ borderRadius: RADIUS.sm, background: "#fff", color: PALETTE.brand, border: `1px solid ${PALETTE.brandLine}` }}
          >
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}
