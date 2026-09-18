"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Leaf,
  LockKeyhole,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";
import { type AreaRoadmap, nextStepForSubject } from "@/lib/roadmap";
import type { LearningState } from "@/lib/standards";
import { TrailGuide } from "./TrailGuide";
const LABELS: Record<LearningState, string> = {
  not_yet_observed: "Not yet observed",
  introduced: "Just starting",
  developing: "Getting there",
  comfortable: "Comfortable",
  ready_to_extend: "Comfortable",
};
export function RoadmapHome({
  childName,
  parentName,
  interests,
  roadmap,
  summary,
  latestMessage,
}: {
  childName: string;
  parentName?: string | null;
  interests?: string | null;
  roadmap: AreaRoadmap[];
  summary: string;
  latestMessage?: string | null;
}) {
  const first =
    roadmap.find(
      (r) => r.state !== "comfortable" && r.state !== "ready_to_extend",
    ) ?? roadmap[0];
  const [subject, setSubject] = useState<"math" | "reading">(
    first?.area.subject === "reading" ? "reading" : "math",
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(
    first?.area.id,
  );
  const items = roadmap.filter((r) => r.area.subject === subject);
  const selected =
    items.find((r) => r.area.id === selectedId) ??
    nextStepForSubject(items) ??
    items[0];
  const practiceHref = selected
    ? `/practice?${new URLSearchParams({ subject, topic: selected.area.area, reason: selected.evidence[0]?.text ?? "Explore this starting point together and tell Easy what you notice." })}`
    : "/practice";
  return (
    <main className="roadmap-home">
      <div className="roadmap-topline">
        <span>
          <span className="live-dot" /> YOUR LITTLE DAILY ADVENTURE
        </span>
        <span className="parent-mode">
          <LockKeyhole size={13} /> Parent space
        </span>
      </div>
      <header className="roadmap-welcome">
        <div>
          <p>Welcome{parentName ? `, ${parentName}` : " back"}.</p>
          <h1>
            A little progress.
            <br />A lot of possibility.
          </h1>
          <p className="roadmap-subtitle">
            {childName}’s path, one moment together at a time.
          </p>
        </div>
        <TrailGuide className="home-guide" />
      </header>
      <div className="roadmap-layout">
        <section
          className="learning-map"
          aria-label={`${childName}’s learning roadmap`}
        >
          <div className="map-heading">
            <div>
              <span className="section-kicker">
                {childName.toUpperCase()}’S ROADMAP
              </span>
              <h2>Growing, together.</h2>
            </div>
            <Compass size={27} />
          </div>
          <div className="subject-switch" aria-label="Roadmap subject">
            {(["math", "reading"] as const).map((s) => (
              <button
                key={s}
                aria-pressed={subject === s}
                onClick={() => {
                  setSubject(s);
                  setSelectedId(
                    nextStepForSubject(
                      roadmap.filter((r) => r.area.subject === s),
                    )?.area.id,
                  );
                }}
              >
                {s === "math" ? <Sparkles size={16} /> : <BookOpen size={16} />}{" "}
                {s === "math" ? "Math" : "Reading"}
              </button>
            ))}
          </div>
          <p className="map-helper">Tap a stepping stone to explore a skill.</p>
          <ol className="learning-stones">
            {items.map((item, i) => {
              const comfortable =
                item.state === "comfortable" ||
                item.state === "ready_to_extend";
              const active = selected?.area.id === item.area.id;
              const Icon = comfortable
                ? Star
                : item.state === "not_yet_observed"
                  ? Leaf
                  : Check;
              return (
                <li
                  key={item.area.id}
                  className={`learning-stone stone-offset-${i % 4}`}
                >
                  <button
                    className={`stone-button ${active ? "stone-selected" : ""} ${comfortable ? "stone-comfortable" : ""}`}
                    aria-pressed={active}
                    aria-label={`${item.area.area}: ${LABELS[item.state]}. Show activity.`}
                    onClick={() => {
                      setSelectedId(item.area.id);
                      if (window.matchMedia("(max-width: 850px)").matches)
                        document
                          .querySelector(".tonight-card")
                          ?.scrollIntoView({
                            behavior: window.matchMedia(
                              "(prefers-reduced-motion: reduce)",
                            ).matches
                              ? "auto"
                              : "smooth",
                            block: "start",
                          });
                    }}
                  >
                    <span className="stone-circle">
                      <Icon
                        size={24}
                        fill={comfortable ? "currentColor" : "none"}
                      />
                    </span>
                    <span className="stone-copy">
                      <strong>{item.area.area}</strong>
                      <span>{LABELS[item.state]}</span>
                    </span>
                    {active && (
                      <span className="you-are-here">LET’S EXPLORE</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="map-end">
            <Leaf size={18} />
            <p>There’s room to grow at their pace.</p>
          </div>
          <details className="reference-note">
            <summary>
              About this learning map <ChevronDown size={15} />
            </summary>
            <p>
              This is the app’s provisional learning reference. California
              framework alignment and checkpoint pacing are awaiting review.
              “Not yet observed” means we need your observations, not that your
              child cannot do it.
            </p>
          </details>
        </section>
        <aside
          className="roadmap-sidebar"
          aria-label="Selected skill and parent guidance"
        >
          {selected ? (
            <article
              className="tonight-card"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="tonight-top">
                <span className="section-kicker">YOUR NEXT LITTLE STEP</span>
                <span>
                  <Clock3 size={14} /> 15–20 min
                </span>
              </div>
              <div className="tonight-illustration">
                <TrailGuide />
                <div className="illustration-block block-a">1</div>
                <div className="illustration-block block-b">2</div>
                <div className="illustration-block block-c">3</div>
              </div>
              <span className="skill-chip">
                {subject === "math" ? "Math" : "Reading"} ·{" "}
                {LABELS[selected.state]}
              </span>
              <h2>{selected.area.area}</h2>
              <p>{selected.area.parentWording}</p>
              <div className="why-this">
                <strong>Why this step?</strong>
                <p>
                  {selected.evidence[0]?.text ??
                    "We haven’t explored this together yet. A gentle first activity will help us find a good starting point."}
                </p>
              </div>
              <Link className="easy-button" href={practiceHref}>
                Prepare tonight’s activity <ArrowRight size={18} />
              </Link>
              <p className="parent-review-note">
                Read the briefing first. Then make it your own.
              </p>
            </article>
          ) : (
            <div className="tonight-card">
              <h2>Your path is getting ready.</h2>
              <p>No skills are available for this subject yet.</p>
            </div>
          )}
          {latestMessage && (
            <article className="learned-card">
              <span className="section-kicker">WHAT WE’RE ADJUSTING</span>
              <p>{latestMessage}</p>
            </article>
          )}
          <article className="learned-card">
            <div className="learned-heading">
              <span aria-hidden="true" className="learned-heart">
                ♡
              </span>
              <h3>Uniquely {childName}.</h3>
            </div>
            <p>
              {summary ||
                (interests
                  ? `You told us ${childName} loves ${interests}. We’ll use what you share to help make activities feel familiar.`
                  : "Every observation helps. Your check-ins will build a picture of what works for your child.")}
            </p>
            <Link href="/profile" className="text-link">
              What we’ve learned <ArrowRight size={16} />
            </Link>
          </article>
          <Link href="/chat" className="ask-parent">
            <MessageCircle size={22} />
            <span>
              Need a little guidance?<strong>Ask Easy</strong>
            </span>
            <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
