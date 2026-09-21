"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flower2, Sprout, Leaf, BookOpen } from "lucide-react";
import type { AreaRoadmap } from "@/lib/roadmap";
import type { Session } from "@/lib/types";
import { LEARNING_STATE_LABELS } from "@/lib/standards";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import { TrailGuide } from "./TrailGuide";

export function GrowthGarden({
  childName,
  roadmap,
  sessions,
}: {
  childName: string;
  roadmap: AreaRoadmap[];
  sessions: Session[];
}) {
  const [subject, setSubject] = useState("math");
  const [selected, setSelected] = useState<string | null>(null);
  const areas = roadmap.filter((r) => r.area.subject === subject);
  const item = areas.find((r) => r.area.id === selected);
  const moments = sessions.filter((s) => s.checkin);
  return (
    <main className="journey-page">
      <header className="journey-heading">
        <div>
          <span className="section-kicker">LITTLE MOMENTS, LASTING ROOTS</span>
          <h1>Look what’s growing.</h1>
          <p>
            {childName}’s learning garden. Every observation helps it take
            shape.
          </p>
        </div>
        <TrailGuide />
      </header>
      <div
        className="subject-switch garden-switch"
        aria-label="Progress subject"
      >
        {["math", "reading"].map((s) => (
          <button
            key={s}
            aria-pressed={subject === s}
            onClick={() => {
              setSubject(s);
              setSelected(null);
            }}
          >
            {s === "math" ? "Math" : "Reading"}
          </button>
        ))}
      </div>
      <section className="growth-garden" aria-label="Skill garden">
        <div className="garden-sky" aria-hidden="true">
          <span>☀</span>
          <span>✦</span>
          <span>✧</span>
        </div>
        <div className="garden-plants">
          {areas.map((r) => {
            const grown =
              r.state === "comfortable" || r.state === "ready_to_extend";
            const Icon = grown
              ? Flower2
              : r.state === "not_yet_observed"
                ? Leaf
                : Sprout;
            return (
              <button
                key={r.area.id}
                className={`garden-plant ${grown ? "plant-bloom" : ""}`}
                aria-pressed={selected === r.area.id}
                onClick={() =>
                  setSelected(selected === r.area.id ? null : r.area.id)
                }
              >
                <span className="plant-art">
                  <Icon size={grown ? 76 : 54} strokeWidth={1.6} />
                </span>
                <strong>{r.area.area}</strong>
                <small>{LEARNING_STATE_LABELS[r.state]}</small>
              </button>
            );
          })}
        </div>
        <p className="garden-caption">
          Tap a plant to see the story behind it.
        </p>
      </section>
      {item && (
        <section className="journey-reveal" aria-live="polite">
          <span className="section-kicker">
            {LEARNING_STATE_LABELS[item.state]}
          </span>
          <h2>{item.area.area}</h2>
          <p>{item.area.parentWording}</p>
          {item.evidence.length ? (
            <p>{item.evidence[0].text}</p>
          ) : (
            <p>
              No observations yet. This is a place to begin, not a judgment.
            </p>
          )}
          {item.area.sourceUrl && (
            <a href={item.area.sourceUrl} target="_blank" rel="noreferrer">
              California standards: {item.area.formalCode}
            </a>
          )}
          <Link
            className="text-link"
            href={`/practice?${new URLSearchParams({ subject, topic: item.area.area })}`}
          >
            Explore this together <ArrowRight size={16} />
          </Link>
        </section>
      )}
      <section className="journey-moments">
        <span className="section-kicker">YOUR SHARED STORY</span>
        <h2>Small moments worth keeping.</h2>
        {moments.length === 0 ? (
          <div className="memory-card">
            <BookOpen size={32} />
            <p>Your first chapter is still ahead.</p>
            <Link className="text-link" href="/dashboard">
              Find your first activity <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          moments.slice(0, 3).map((s) => (
            <article className="memory-card" key={s.id}>
              <span className="memory-stamp" aria-hidden="true">
                <Sprout />
              </span>
              <div>
                <small>
                  <LocalDateLabel iso={s.created_at} />
                </small>
                <h3>{s.skill}</h3>
                <p>{s.micro_message || "You made time to explore together."}</p>
              </div>
            </article>
          ))
        )}
        {moments.length > 3 && (
          <details className="journey-details">
            <summary>Earlier moments</summary>
            {moments.slice(3).map((s) => (
              <article className="memory-card" key={s.id}>
                <div>
                  <small>
                    <LocalDateLabel iso={s.created_at} />
                  </small>
                  <h3>{s.skill}</h3>
                  <p>{s.micro_message || "A moment of learning together."}</p>
                </div>
              </article>
            ))}
          </details>
        )}
      </section>
      <p className="journey-footnote">
        Plants reflect your observations, not grades or comparisons. A bloom
        means comfortable in an area, not verified mastery of every standard.
      </p>
    </main>
  );
}
