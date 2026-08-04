"use client";

import { useSyncExternalStore } from "react";
import { Sprout, RefreshCw, Bookmark, Check } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { GROWTH_MOMENTS } from "@/lib/growthMoments";

type Status = "pending" | "accepted" | "dismissed";
type Stored = { index: number; status: Status; weekKey: string };

const STORAGE_KEY = "easy_growth_moment";
const LOCAL_EVENT = "easy-growth-moment-change";

function weekKey(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.floor(dayOfYear / 7);
  return `${now.getFullYear()}-w${week}`;
}

function hashWeek(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Reads current status from localStorage, falling back to this week's deterministic pick
// when nothing's been saved yet. Used as a useSyncExternalStore snapshot so the initial
// client read (a browser-only API) never has to happen inside an effect.
function getSnapshot(): string {
  const key = weekKey();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.weekKey === key) return raw;
    }
  } catch {
    // fall through to the deterministic default below
  }
  const index = Math.abs(hashWeek(key)) % GROWTH_MOMENTS.length;
  return JSON.stringify({ index, status: "pending", weekKey: key } satisfies Stored);
}

function getServerSnapshot(): string {
  // Server has no localStorage and no meaningful "this week" without a client clock —
  // render nothing until the client subscribes and supplies the real snapshot.
  return "";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_EVENT, callback);
  };
}

function save(value: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event(LOCAL_EVENT));
  } catch {
    // best-effort only — a growth moment that doesn't persist is not worth an error state
  }
}

export function GrowthMomentCard({ childName }: { childName: string }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!raw) return null;

  const stored = JSON.parse(raw) as Stored;
  if (stored.status === "dismissed") return null;

  const moment = GROWTH_MOMENTS[stored.index];

  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex items-start gap-3 flex-wrap sm:flex-nowrap"
      style={{ background: PALETTE.violetSoft, border: `1px solid ${PALETTE.violetLine}` }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 34, height: 34, borderRadius: RADIUS.sm, background: "#fff" }}
      >
        <Sprout size={16} color={PALETTE.violetDeep} />
      </div>
      <div className="flex-1 min-w-[220px]">
        <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: PALETTE.violetDeep, letterSpacing: "0.05em" }}>
          A growth moment for this week
        </p>
        <p className="text-sm font-bold mb-1">{moment.title}</p>
        {stored.status === "accepted" ? (
          <p className="text-sm flex items-center gap-1.5" style={{ color: PALETTE.violetDeep }}>
            <Check size={14} /> Great — enjoy trying this with {childName}.
          </p>
        ) : (
          <>
            <p className="text-sm mb-2.5" style={{ color: PALETTE.inkSoft }}>
              {moment.description(childName)}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => save({ ...stored, status: "accepted" })}
                className="btn-press text-xs font-bold px-3 py-1.5 transition-all duration-150"
                style={{ borderRadius: RADIUS.sm, background: PALETTE.violetDeep, color: "#fff" }}
              >
                Try this week
              </button>
              <button
                onClick={() => save({ ...stored, index: (stored.index + 1) % GROWTH_MOMENTS.length, status: "pending" })}
                className="btn-press flex items-center gap-1 text-xs font-bold px-3 py-1.5 transition-all duration-150"
                style={{ borderRadius: RADIUS.sm, background: "#fff", color: PALETTE.violetDeep, border: `1px solid ${PALETTE.violetLine}` }}
              >
                <RefreshCw size={11} /> Choose another
              </button>
              <button
                onClick={() => save({ ...stored, status: "dismissed" })}
                className="btn-press flex items-center gap-1 text-xs font-bold px-3 py-1.5 transition-all duration-150"
                style={{ borderRadius: RADIUS.sm, background: "transparent", color: PALETTE.inkSoft }}
              >
                <Bookmark size={11} /> Save for later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
