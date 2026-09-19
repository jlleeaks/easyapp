"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Leaf,
  Rocket,
  Star,
  Trees,
} from "lucide-react";
import { TrailGuide } from "@/components/easy/TrailGuide";
const SAMPLES = {
  Dinosaurs: {
    icon: Leaf,
    title: "A little dinosaur count",
    object: "5 blocks or toy dinosaurs",
    say: "Five dinosaurs are heading home. Move one into the cave each time you count. How many made it home?",
    connection: "Count five little footsteps on your next walk.",
  },
  Space: {
    icon: Rocket,
    title: "Ready, set, count down",
    object: "5 blocks and a paper planet",
    say: "Five astronauts are landing on a planet. Move one block at a time. How many astronauts have landed?",
    connection: "Count five windows on an imaginary spaceship.",
  },
  Nature: {
    icon: Trees,
    title: "The tiny nature collection",
    object: "5 leaves or small pebbles",
    say: "Let’s make a little nature collection. Move one leaf into a line for each number. How many did we collect?",
    connection: "Find and count five leaves on your next walk.",
  },
};
export function InterestDemo() {
  const [interest, setInterest] = useState<keyof typeof SAMPLES>("Dinosaurs");
  const [expanded, setExpanded] = useState(false);
  const sample = SAMPLES[interest];
  return (
    <div className="interest-demo" id="try-it">
      <div className="demo-toolbar">
        <span>
          <span className="live-dot" /> A little look inside Easy
        </span>
        <span className="sample-tag">SAMPLE</span>
      </div>
      <div className="demo-interest">
        <p>What lights up their world?</p>
        <div className="interest-chips" aria-label="Sample interest">
          {Object.entries(SAMPLES).map(([key, value]) => (
            <button
              key={key}
              aria-pressed={interest === key}
              onClick={() => {
                setInterest(key as keyof typeof SAMPLES);
                setExpanded(false);
              }}
            >
              <value.icon size={16} />
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="demo-map" aria-hidden="true">
        <div className="map-cloud cloud-one" />
        <div className="map-cloud cloud-two" />
        <svg viewBox="0 0 420 240" className="demo-trail">
          <path
            d="M65 213C15 154 190 185 170 123S335 118 323 35"
            fill="none"
            stroke="#CEE2CF"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <path
            d="M65 213C15 154 190 185 170 123S335 118 323 35"
            fill="none"
            stroke="#FFF"
            strokeWidth="3"
            strokeDasharray="4 10"
            strokeLinecap="round"
          />
        </svg>
        <div className="map-stop stop-one">
          <Check size={20} />
        </div>
        <div className="map-stop stop-two">
          <Star size={24} fill="currentColor" />
        </div>
        <div className="map-stop stop-three">
          <Leaf size={20} />
        </div>
        <span className="map-caption">Little steps. A bigger picture.</span>
        <TrailGuide className="demo-guide" />
        <span className="map-label">A path built around them</span>
      </div>
      <div
        className="sample-briefing"
        aria-live="polite"
        aria-atomic="true"
        key={interest}
      >
        <div className="briefing-kicker">
          <span>TONIGHT’S LITTLE ADVENTURE</span>
          <span>
            <Clock3 size={13} /> 15–20 min
          </span>
        </div>
        <h2>{sample.title}</h2>
        <p className="sample-skill">
          Sample skill · Counting objects, one by one
        </p>
        <div className="sample-objects">
          <span className="object-icon" aria-hidden="true">
            ✦
          </span>
          <div>
            <span className="mini-label">GATHER TOGETHER</span>
            <p>{sample.object}</p>
          </div>
        </div>
        {expanded && (
          <div className="demo-expanded" id="sample-details">
            <strong>Show them first</strong>
            <p>Move and count each object yourself, then invite them to try.</p>
            <blockquote>“{sample.say}”</blockquote>
            <strong>If they get stuck</strong>
            <p>
              Start with three objects. Touch each one together as you say its
              number.
            </p>
            <strong>A little encouragement</strong>
            <p>“You took your time and counted each one.”</p>
            <strong>Keep it going</strong>
            <p>{sample.connection}</p>
          </div>
        )}
        <button
          className="sample-open"
          aria-expanded={expanded}
          aria-controls="sample-details"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Close sample briefing" : "Peek at the parent briefing"}
          <ArrowRight size={17} />
        </button>
      </div>
      <p className="demo-disclaimer">
        Illustrative roadmap and pre-authored activity. No sign-up or personal
        information.
      </p>
    </div>
  );
}
