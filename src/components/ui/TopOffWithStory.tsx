"use client";

import Link from "next/link";
import { BookOpen, Check } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import type { Book, Session } from "@/lib/types";

// Deliberately not "first sentence up to the first period" — abbreviations like
// "Dr." falsely end a sentence there. A plain length cap avoids that entirely.
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "").trimEnd() + "…";
}

export function TopOffWithStory({ childName, books, librarySessions }: { childName: string; books: Book[]; librarySessions: Session[] }) {
  const todayKey = new Date().toDateString();
  const readToday = librarySessions.some((s) => new Date(s.created_at).toDateString() === todayKey);

  if (readToday) {
    return (
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
        style={{ background: PALETTE.brandSoft, border: `1px solid ${PALETTE.brandLine}` }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 30, height: 30, borderRadius: RADIUS.sm, background: PALETTE.brand }}
        >
          <Check size={15} color="#fff" />
        </div>
        <p className="text-sm font-bold" style={{ color: PALETTE.ink }}>
          Reading complete for tonight ✓
        </p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
      >
        <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
          Add a book to {childName}&apos;s shelf and Easy will suggest one to top off the night with.
        </p>
        <Link href="/library" className="text-xs font-bold underline flex-shrink-0" style={{ color: PALETTE.brand }}>
          Go to Library
        </Link>
      </div>
    );
  }

  const recentCutoff = new Date().getTime() - 3 * 24 * 60 * 60 * 1000;
  const recentBookIds = new Set(
    librarySessions
      .filter((s) => new Date(s.created_at).getTime() >= recentCutoff)
      .map((s) => s.book_id)
      .filter(Boolean),
  );
  const pick = books.find((b) => !recentBookIds.has(b.id)) ?? books[0];
  const reason = pick.what_it_teaches
    ? truncate(pick.what_it_teaches, 110)
    : `A good one to keep ${childName}'s reading habit going tonight.`;

  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex items-center gap-3 flex-wrap sm:flex-nowrap"
      style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 34, height: 34, borderRadius: RADIUS.sm, background: PALETTE.brand, transform: "rotate(-4deg)" }}
      >
        <BookOpen size={15} color="#fff" />
      </div>
      <div className="flex-1 min-w-[180px]">
        <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: PALETTE.inkFaint, letterSpacing: "0.05em" }}>
          Top off the night with a story
        </p>
        <p className="text-sm font-bold leading-snug">{pick.title}</p>
        <p className="text-xs italic mt-0.5" style={{ color: PALETTE.inkSoft }}>
          &quot;{reason}&quot;
        </p>
      </div>
      <Link
        href={`/library?book=${pick.id}`}
        className="btn-press flex-shrink-0 text-xs font-bold px-3.5 py-2 transition-all duration-150"
        style={{ borderRadius: RADIUS.sm, background: PALETTE.brandSoft, color: PALETTE.brand }}
      >
        Open story guide
      </Link>
    </div>
  );
}
