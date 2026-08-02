import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import type { Session } from "@/lib/types";

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export function ContinueLastTime({ session }: { session: Session | null }) {
  if (!session || !session.micro_message) return null;

  const isLibrary = session.source === "library";
  const meta = subjectMeta(session.subject);
  const href = isLibrary ? (session.book_id ? `/library?book=${session.book_id}` : "/library") : `/homework?subject=${session.subject}&session=${session.id}`;
  const label = isLibrary ? "Open story guide" : "Open session";

  return (
    <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 34, height: 34, borderRadius: RADIUS.sm, background: meta.soft, transform: "rotate(-4deg)" }}
      >
        {isLibrary ? <BookOpen size={15} color={meta.color} /> : <Check size={15} color={meta.color} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase mb-0.5" style={{ color: PALETTE.inkFaint, letterSpacing: "0.05em" }}>
          Continue from last time
        </p>
        <p className="text-sm mb-1.5" style={{ color: PALETTE.ink }}>
          {truncate(session.micro_message, 110)}
        </p>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: meta.color }}>
          {label} <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
