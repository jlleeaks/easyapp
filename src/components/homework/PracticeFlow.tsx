"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, Check, ChevronRight } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { SUBJECTS, subjectMeta } from "@/lib/subjects";
import {
  Eyebrow,
  Card,
  PrimaryButton,
  LoadingBlock,
  ErrorBlock,
  ChoiceGroup,
  TextField,
} from "@/components/ui/primitives";
import { BriefingView } from "@/components/homework/BriefingView";
import { CompactBriefingView } from "@/components/homework/CompactBriefingView";
import { BriefingSkeleton } from "@/components/homework/BriefingSkeleton";
import type { Briefing, CheckinAnswers, Subject } from "@/lib/types";

type Step = "loading-suggestions" | "picker" | "generating" | "briefing" | "delivering" | "checkin" | "submitting" | "iteration";
type Suggestion = { subject: Subject; focus: string; reason: string };

const CHECKIN_FIELDS: { key: keyof Pick<CheckinAnswers, "overall" | "frustration" | "worked">; label: string; options: string[] }[] = [
  { key: "overall", label: "How'd it go overall?", options: ["great", "okay", "rough"] },
  { key: "frustration", label: "Did they get frustrated at any point?", options: ["not really", "a little", "yes, a lot"] },
  { key: "worked", label: "What actually worked?", options: ["the analogy", "the hands-on approach", "something I improvised"] },
];

export function PracticeFlow({
  childId,
  childName,
  initialSubject,
  initialTopic,
  initialReason,
}: {
  childId: string;
  childName: string;
  initialSubject?: string;
  initialTopic?: string;
  initialReason?: string;
}) {
  const router = useRouter();
  const autoGenerate = Boolean(initialTopic?.trim());
  const [step, setStep] = useState<Step>(autoGenerate ? "generating" : "loading-suggestions");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [customSubject, setCustomSubject] = useState<Subject>(
    SUBJECTS.some((s) => s.key === initialSubject) ? (initialSubject as Subject) : "math",
  );
  const [customTopic, setCustomTopic] = useState("");

  const [subject, setSubject] = useState<Subject>("math");
  const [focus, setFocus] = useState("");
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [fullBriefing, setFullBriefing] = useState(false);
  const [showBriefingWhileDelivering, setShowBriefingWhileDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkinAnswers, setCheckinAnswers] = useState<Partial<CheckinAnswers>>({});
  const [notes, setNotes] = useState("");
  const [microMessage, setMicroMessage] = useState("");

  useEffect(() => {
    if (autoGenerate) {
      generate(customSubject, initialTopic!.trim(), initialReason);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/suggest-focus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch {
        // fall through to the picker with just the custom-topic form
      } finally {
        if (!cancelled) setStep("picker");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate(sub: Subject, topic: string, why?: string) {
    setSubject(sub);
    setFocus(topic);
    setStep("generating");
    setError(null);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, subject: sub, topic, reason: why }),
      });
      const data = await res.json();
      if (!res.ok || !data.briefing) {
        setError(data.error || "Couldn't build that lesson — try again.");
        setStep("picker");
        return;
      }
      setBriefing(data.briefing);
      setStep("briefing");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setStep("picker");
    }
  }

  async function submitCheckin() {
    if (!briefing) return;
    setStep("submitting");
    setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          source: "practice",
          subject,
          briefing,
          checkin: { ...checkinAnswers, notes },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't process that check-in — try again.");
        setStep("checkin");
        return;
      }
      setMicroMessage(data.microMessage);
      setStep("iteration");
    } catch {
      setError("Couldn't process that check-in — check your connection and try again.");
      setStep("checkin");
    }
  }

  const checkinComplete = CHECKIN_FIELDS.every((f) => checkinAnswers[f.key]);
  const meta = subjectMeta(subject);

  if (step === "loading-suggestions") {
    return <LoadingBlock text={`Looking at what's clicked and what hasn't for ${childName}...`} />;
  }

  if (step === "picker") {
    return (
      <div className="animate-fade-in-up">
        <Eyebrow color={PALETTE.brand}>No worksheet tonight</Eyebrow>
        <h2 className="font-serif-display mb-1" style={{ fontSize: 22, fontWeight: 700 }}>
          A lesson built for {childName}
        </h2>
        <p className="text-sm mb-4" style={{ color: PALETTE.inkSoft }}>
          Picked from what&apos;s clicking and what needs a little more time.
        </p>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-3 mb-5">
            {suggestions.map((s, i) => {
              const m = subjectMeta(s.subject);
              return (
                <button
                  key={i}
                  onClick={() => generate(s.subject, s.focus, s.reason)}
                  className="btn-press flex items-center gap-3 p-4 text-left rounded-2xl transition-all duration-150"
                  style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 36, height: 36, borderRadius: RADIUS.sm, background: m.soft }}
                  >
                    <m.icon size={17} color={m.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{s.focus}</p>
                    <p className="text-xs" style={{ color: PALETTE.inkSoft }}>{s.reason}</p>
                  </div>
                  <ChevronRight size={16} color={PALETTE.inkFaint} />
                </button>
              );
            })}
          </div>
        )}

        <Card>
          <div className="p-5">
            <Eyebrow>Or pick your own topic</Eyebrow>
            <div className="flex flex-wrap gap-2 mb-4 mt-1">
              {SUBJECTS.map((s) => {
                const selected = customSubject === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setCustomSubject(s.key)}
                    className="btn-press flex items-center gap-1.5 px-3 py-2 text-sm transition-all duration-150"
                    style={{
                      borderRadius: RADIUS.sm,
                      background: selected ? s.color : PALETTE.card,
                      color: selected ? "#fff" : PALETTE.ink,
                      border: `1px solid ${selected ? s.color : PALETTE.line}`,
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    <s.icon size={14} />
                    {s.label}
                  </button>
                );
              })}
            </div>
            <TextField
              label="What do you want to work on?"
              value={customTopic}
              onChange={setCustomTopic}
              placeholder="e.g. letter sounds, counting by 2s, sight words..."
            />
            {error && (
              <div className="text-sm mb-3" style={{ color: PALETTE.accent }}>
                {error}
              </div>
            )}
            <PrimaryButton disabled={!customTopic.trim()} onClick={() => generate(customSubject, customTopic.trim())}>
              Build this lesson
            </PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "generating") {
    return <BriefingSkeleton childName={childName} />;
  }

  if (step === "briefing" && briefing) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setFullBriefing((v) => !v)}
            className="text-xs font-bold underline"
            style={{ color: PALETTE.inkSoft }}
          >
            {fullBriefing ? "Show compact view" : "Show full briefing"}
          </button>
        </div>
        {fullBriefing ? <BriefingView briefing={briefing} /> : <CompactBriefingView briefing={briefing} />}
        <PrimaryButton onClick={() => setStep("delivering")} icon={Check}>Start the activity</PrimaryButton>
      </div>
    );
  }

  if (step === "delivering" && briefing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: RADIUS.md,
            background: meta.soft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "float-slow 3s ease-in-out infinite",
          }}
        >
          <Sparkles size={26} color={meta.color} />
        </div>
        <div className="mt-6 mb-2 font-serif-display" style={{ fontSize: 22, fontWeight: 700 }}>
          Go teach {childName} {(focus || briefing.skill).toLowerCase()}
        </div>
        <div className="text-sm mb-6" style={{ color: PALETTE.inkSoft }}>No rush — check in here whenever you&apos;re done.</div>
        <button
          onClick={() => setShowBriefingWhileDelivering((v) => !v)}
          className="text-xs font-bold underline mb-8"
          style={{ color: PALETTE.brand }}
        >
          {showBriefingWhileDelivering ? "Hide briefing" : "View briefing again"}
        </button>
        {showBriefingWhileDelivering && (
          <div className="w-full text-left mb-8">
            <CompactBriefingView briefing={briefing} />
          </div>
        )}
        <PrimaryButton onClick={() => setStep("checkin")}>We&apos;re all done</PrimaryButton>
      </div>
    );
  }

  if (step === "checkin" || step === "submitting") {
    if (step === "submitting") return <LoadingBlock text="Easy is adjusting based on tonight..." />;
    return (
      <div className="animate-fade-in-up">
        <Eyebrow color={PALETTE.brand}>Quick check-in</Eyebrow>
        <h2 className="font-serif-display mb-4" style={{ fontSize: 21, fontWeight: 700 }}>How&apos;d it go?</h2>
        <Card>
          <div className="p-5">
            {CHECKIN_FIELDS.map((f) => (
              <ChoiceGroup
                key={f.key}
                label={f.label}
                options={f.options}
                value={checkinAnswers[f.key] ?? ""}
                onChange={(v) => setCheckinAnswers((a) => ({ ...a, [f.key]: v }))}
              />
            ))}
            <TextField label="Anything else worth noting?" value={notes} onChange={setNotes} optional />
          </div>
        </Card>
        {error && <ErrorBlock message={error} onRetry={submitCheckin} />}
        <PrimaryButton disabled={!checkinComplete} onClick={submitCheckin}>Done</PrimaryButton>
      </div>
    );
  }

  if (step === "iteration") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: RADIUS.sm,
            background: PALETTE.brandSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUp size={22} color={PALETTE.brand} />
        </div>
        <div className="mt-4 mb-1 font-serif-display" style={{ fontSize: 20, fontWeight: 700 }}>
          Nice work tonight — {childName} is a step further along.
        </div>
        <Eyebrow color={PALETTE.brand}>
          <span className="mt-2 block">What&apos;s next</span>
        </Eyebrow>
        <div className="text-base mb-8 px-2" style={{ color: PALETTE.inkSoft }}>{microMessage}</div>
        <PrimaryButton
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
        >
          Back to dashboard
        </PrimaryButton>
      </div>
    );
  }

  return null;
}
