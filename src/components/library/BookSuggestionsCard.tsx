"use client";

import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Plus, Check } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Card, Eyebrow } from "@/components/ui/primitives";
import type { Book } from "@/lib/types";

type BookSuggestion = { title: string; author: string; theme: string; why: string };

export function BookSuggestionsCard({
  childId,
  childName,
  onAdded,
}: {
  childId: string;
  childName: string;
  onAdded: (book: Book) => void;
}) {
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTitle, setAddingTitle] = useState<string | null>(null);
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      const res = await fetch("/api/suggest-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      const data = await res.json();
      if (!data.suggestions?.length) throw new Error("no suggestions");
      return data.suggestions as BookSuggestion[];
    }

    (async () => {
      try {
        const result = await fetchOnce().catch(() => fetchOnce());
        if (!cancelled) setSuggestions(result);
      } catch {
        // fail silently — card just won't render
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [childId]);

  async function addToShelf(s: BookSuggestion) {
    setAddingTitle(s.title);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, title: s.title, author: s.author }),
      });
      const data = await res.json();
      if (res.ok && data.book) {
        setAddedTitles((prev) => new Set(prev).add(s.title));
        onAdded(data.book);
      }
    } finally {
      setAddingTitle(null);
    }
  }

  if (!loading && suggestions.length === 0) return null;

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={13} color={PALETTE.gold} />
          <Eyebrow color={PALETTE.gold}>Recommended for {childName}</Eyebrow>
        </div>
        <p className="text-xs mb-4" style={{ color: PALETTE.inkFaint }}>
          Suggestions only — no purchase links, just books Easy thinks are worth tracking down.
        </p>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
            <div className="h-32 rounded-xl" style={{ background: PALETTE.line }} />
            <div className="h-32 rounded-xl" style={{ background: PALETTE.line }} />
            <div className="h-32 rounded-xl hidden lg:block" style={{ background: PALETTE.line }} />
            <div className="h-32 rounded-xl hidden lg:block" style={{ background: PALETTE.line }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {suggestions.map((s) => {
              const added = addedTitles.has(s.title);
              return (
                <div
                  key={s.title}
                  className="rounded-xl p-3 flex flex-col"
                  style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.line}` }}
                >
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 32, height: 32, borderRadius: RADIUS.sm, background: PALETTE.brand, transform: "rotate(-5deg)" }}
                    >
                      <BookOpen size={14} color="#fff" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug">{s.title}</p>
                      <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
                        {s.author}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs flex-1 mb-2.5" style={{ color: PALETTE.inkSoft }}>
                    {s.why}
                  </p>
                  <button
                    onClick={() => addToShelf(s)}
                    disabled={added || addingTitle === s.title}
                    className="btn-press w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition-all duration-150"
                    style={{
                      background: added ? PALETTE.brandSoft : "#fff",
                      color: added ? PALETTE.brand : PALETTE.ink,
                      border: `1px solid ${added ? PALETTE.brandLine : PALETTE.line}`,
                    }}
                  >
                    {added ? (
                      <>
                        <Check size={13} /> On the shelf
                      </>
                    ) : addingTitle === s.title ? (
                      "Adding..."
                    ) : (
                      <>
                        <Plus size={13} /> Add to shelf
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
