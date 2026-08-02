"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, ChevronLeft, Check, TrendingUp, Sparkles, PenLine, Save } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { SUBJECTS, GRADE_CONTEXT, subjectMeta } from "@/lib/subjects";
import {
  Eyebrow,
  Card,
  PrimaryButton,
  SecondaryButton,
  LoadingBlock,
  ErrorBlock,
  ChoiceGroup,
  TextField,
  Row,
  RowList,
} from "@/components/ui/primitives";
import { AskEasyCard } from "@/components/ui/AskEasyCard";
import { ReportIntakeCard } from "@/components/profile/ReportIntakeCard";
import { BriefingView } from "@/components/homework/BriefingView";
import { AssignmentRecapView } from "@/components/homework/AssignmentRecapView";
import { CompactBriefingView } from "@/components/homework/CompactBriefingView";
import { BriefingSkeleton } from "@/components/homework/BriefingSkeleton";
import { matchAreaByText } from "@/lib/standards";
import type { AreaRoadmap } from "@/lib/roadmap";
import type { Briefing, CheckinAnswers, Session, Subject } from "@/lib/types";

type Step =
  | "subject-picker"
  | "subject-detail"
  | "upload"
  | "diagnosing"
  | "briefing"
  | "delivering"
  | "checkin"
  | "submitting"
  | "iteration"
  | "session-detail";

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CHECKIN_FIELDS: { key: keyof Pick<CheckinAnswers, "overall" | "frustration" | "worked">; label: string; options: string[] }[] = [
  { key: "overall", label: "How'd it go overall?", options: ["great", "okay", "rough"] },
  { key: "frustration", label: "Did they get frustrated at any point?", options: ["not really", "a little", "yes, a lot"] },
  { key: "worked", label: "What actually worked?", options: ["the analogy", "the hands-on approach", "something I improvised"] },
];

export function HomeworkHub({
  childId,
  childName,
  sessions,
  roadmap,
  initialSubject,
  initialSessionId,
}: {
  childId: string;
  childName: string;
  sessions: Session[];
  roadmap: AreaRoadmap[];
  initialSubject?: string;
  initialSessionId?: string;
}) {
  const router = useRouter();
  const deepLinkedSession = initialSessionId ? sessions.find((s) => s.id === initialSessionId) ?? null : null;
  const validInitial = SUBJECTS.some((s) => s.key === initialSubject) ? (initialSubject as Subject) : null;
  const [step, setStep] = useState<Step>(deepLinkedSession ? "session-detail" : validInitial ? "subject-detail" : "subject-picker");
  const [subject, setSubject] = useState<Subject>(
    (deepLinkedSession?.subject as Subject | undefined) ?? validInitial ?? "math",
  );
  const [viewingSession, setViewingSession] = useState<Session | null>(deepLinkedSession);
  const [notesDraft, setNotesDraft] = useState(deepLinkedSession?.parent_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [fullBriefing, setFullBriefing] = useState(false);
  const [showBriefingWhileDelivering, setShowBriefingWhileDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkinAnswers, setCheckinAnswers] = useState<Partial<CheckinAnswers>>({});
  const [notes, setNotes] = useState("");
  const [microMessage, setMicroMessage] = useState("");

  const sessionsBySubject = useMemo(() => {
    const map: Record<Subject, Session[]> = { math: [], writing: [], reading: [] };
    for (const s of sessions) {
      const key = (SUBJECTS.some((sub) => sub.key === s.subject) ? s.subject : "math") as Subject;
      map[key].push(s);
    }
    return map;
  }, [sessions]);

  function openSubject(sub: Subject) {
    setSubject(sub);
    setStep("subject-detail");
  }

  function openSession(s: Session) {
    setViewingSession(s);
    setNotesDraft(s.parent_notes ?? "");
    setStep("session-detail");
  }

  async function saveNotes() {
    if (!viewingSession) return;
    setSavingNotes(true);
    try {
      await fetch("/api/session-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: viewingSession.id, notes: notesDraft }),
      });
      setViewingSession({ ...viewingSession, parent_notes: notesDraft });
      router.refresh();
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setMediaType(file.type || "image/jpeg");
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
  }

  async function analyze() {
    if (!imageBase64) return;
    setStep("diagnosing");
    setError(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, imageBase64, mediaType, subject }),
      });
      const data = await res.json();
      if (!res.ok || !data.briefing) {
        setError(data.error || "Something went wrong looking at the worksheet. Try again.");
        setStep("upload");
        return;
      }
      setBriefing(data.briefing);
      setStep("briefing");
    } catch {
      setError("Something went wrong looking at the worksheet. Check your connection and try again.");
      setStep("upload");
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
          source: "homework",
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
      router.refresh();
    } catch {
      setError("Couldn't process that check-in — check your connection and try again.");
      setStep("checkin");
    }
  }

  function resetUpload() {
    setImagePreview(null);
    setImageBase64(null);
    setBriefing(null);
    setCheckinAnswers({});
    setNotes("");
    setError(null);
  }

  const checkinComplete = CHECKIN_FIELDS.every((f) => checkinAnswers[f.key]);
  const meta = subjectMeta(subject);

  if (step === "subject-picker") {
    return (
      <div className="animate-fade-in-up">
        <Eyebrow color={PALETTE.accent}>Homework Helper</Eyebrow>
        <h2 className="font-serif-display mb-1.5" style={{ fontSize: 24, fontWeight: 700 }}>
          What do you need tonight?
        </h2>
        <p className="text-sm mb-5" style={{ color: PALETTE.inkSoft }}>
          We&apos;ll help with tonight&apos;s homework — or build a lesson if there isn&apos;t any. Pick a subject to start.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
          <div className="flex flex-col gap-5 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SUBJECTS.map((s) => {
                const Icon = s.icon;
                const count = sessionsBySubject[s.key].length;
                return (
                  <button
                    key={s.key}
                    onClick={() => openSubject(s.key)}
                    className="btn-press relative overflow-hidden text-left rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(155deg, #fff, ${s.soft} 220%)`, border: `1px solid ${PALETTE.line}` }}
                  >
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{ width: 110, height: 110, top: -38, right: -38, background: s.soft, opacity: 0.7 }}
                    />
                    <div
                      className="relative flex items-center justify-center mb-4"
                      style={{ width: 48, height: 48, borderRadius: RADIUS.sm, background: s.color, transform: "rotate(-6deg)" }}
                    >
                      <Icon size={21} color="#fff" />
                    </div>
                    <div className="relative font-serif-display font-bold mb-0.5" style={{ fontSize: 17 }}>
                      {s.label}
                    </div>
                    <div className="relative text-xs" style={{ color: PALETTE.inkSoft }}>
                      {count > 0 ? `${count} assignment${count === 1 ? "" : "s"}` : "No assignments yet"}
                    </div>
                  </button>
                );
              })}
            </div>

            <Card style={{ marginBottom: 0 }}>
              <div className="p-5 pb-3">
                <Eyebrow>Past assignments</Eyebrow>
              </div>
              {sessions.length === 0 ? (
                <div className="px-5 pb-5 text-sm" style={{ color: PALETTE.inkSoft }}>
                  Nothing yet — this is where {childName}&apos;s full homework history will show up.
                </div>
              ) : (
                <RowList>
                  {sessions.map((s) => {
                    const m = subjectMeta(s.subject);
                    return (
                      <Row
                        key={s.id}
                        onClick={() => openSession(s)}
                        icon={<Check size={16} />}
                        iconColor={m.color}
                        iconSoft={m.soft}
                        title={s.skill}
                        subtitle={`${formatShortDate(s.created_at)} · ${m.label}${s.micro_message ? ` · ${s.micro_message}` : ""}`}
                        trailing={<ChevronRight size={16} color={PALETTE.inkFaint} />}
                      />
                    );
                  })}
                </RowList>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <AskEasyCard prompt="“What should we work on tonight?” — get a straight answer." />
          </div>
        </div>
      </div>
    );
  }

  if (step === "subject-detail") {
    const subjectSessions = sessionsBySubject[subject];
    return (
      <div className="animate-fade-in-up">
        <button
          onClick={() => setStep("subject-picker")}
          className="flex items-center gap-1 mb-4 text-sm"
          style={{ color: PALETTE.inkSoft }}
        >
          <ChevronLeft size={16} /> All subjects
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: RADIUS.sm, background: meta.color, transform: "rotate(-6deg)" }}
          >
            <meta.icon size={19} color="#fff" />
          </div>
          <h2 className="font-serif-display font-bold" style={{ fontSize: 24 }}>
            {meta.label}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
          <div className="flex flex-col gap-5 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  resetUpload();
                  setStep("upload");
                }}
                className="btn-press rounded-2xl p-4 text-left transition-all duration-150"
                style={{ background: meta.color, color: "#fff" }}
              >
                <Camera size={18} className="mb-2" />
                <div className="text-sm font-semibold">Have homework?</div>
                <div className="text-xs opacity-90">Photograph tonight&apos;s worksheet</div>
              </button>
              <button
                onClick={() => router.push(`/practice?subject=${subject}`)}
                className="btn-press rounded-2xl p-4 text-left transition-all duration-150"
                style={{ background: meta.soft, color: PALETTE.ink, border: `1px solid ${PALETTE.line}` }}
              >
                <PenLine size={18} className="mb-2" color={meta.color} />
                <div className="text-sm font-semibold">No worksheet tonight?</div>
                <div className="text-xs" style={{ color: PALETTE.inkSoft }}>
                  Get a lesson tailored to {childName}
                </div>
              </button>
            </div>

            <Card style={{ marginBottom: 0 }}>
              <div className="p-5 pb-3">
                <Eyebrow>Past assignments</Eyebrow>
              </div>
              {subjectSessions.length === 0 ? (
                <div className="px-5 pb-5 text-sm" style={{ color: PALETTE.inkSoft }}>
                  Nothing yet — this is where {childName}&apos;s {subject} history will show up.
                </div>
              ) : (
                <RowList>
                  {subjectSessions.map((s) => (
                    <Row
                      key={s.id}
                      onClick={() => openSession(s)}
                      icon={<Check size={16} />}
                      iconColor={meta.color}
                      iconSoft={meta.soft}
                      title={s.skill}
                      subtitle={s.micro_message ? `${formatShortDate(s.created_at)} · ${s.micro_message}` : formatShortDate(s.created_at)}
                      trailing={<ChevronRight size={16} color={PALETTE.inkFaint} />}
                    />
                  ))}
                </RowList>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <AskEasyCard prompt={`"What should we focus on in ${subject} this week?" — get a straight answer.`} />
            <ReportIntakeCard
              childId={childId}
              childName={childName}
              subject={subject}
              intakeType="assignment"
              title={`Add a graded ${meta.label.toLowerCase()} assignment`}
              description={`Got a graded worksheet or test back? Add it here and Easy factors it straight into ${childName}'s ${subject} briefings.`}
              placeholder="e.g. Got an A on the counting quiz but missed 2 questions on shape names..."
              uploadLabel="Or attach a photo of the graded assignment"
            />
            <Card style={{ marginBottom: 0 }}>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Eyebrow color={meta.color}>What kindergarten {subject} generally covers</Eyebrow>
                </div>
                {GRADE_CONTEXT[subject].slice(0, 3).map((g) => (
                  <div key={g.title} className="mb-2 last:mb-0">
                    <span className="text-sm font-semibold">{g.title}</span>
                    <span className="text-xs" style={{ color: PALETTE.inkSoft }}>
                      {" "}
                      &mdash; {g.detail}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === "session-detail" && viewingSession) {
    const cin = viewingSession.checkin && "overall" in viewingSession.checkin ? viewingSession.checkin : null;
    // A logged graded assignment never goes through the check-in flow (no coaching
    // briefing was delivered), so it never has a checkin — that's how we tell it apart
    // from a real coached homework/practice session and route it to the recap view.
    const isLoggedAssignment = !viewingSession.checkin;
    const matchedArea = isLoggedAssignment
      ? matchAreaByText(viewingSession.subject as Subject, `${viewingSession.skill} ${viewingSession.micro_message ?? ""}`)
      : null;
    const matchedRoadmapItem = matchedArea ? roadmap.find((r) => r.area.id === matchedArea.id) ?? null : null;
    return (
      <div className="animate-fade-in-up max-w-[760px] mx-auto">
        <button
          onClick={() => setStep("subject-detail")}
          className="flex items-center gap-1 mb-4 text-sm"
          style={{ color: PALETTE.inkSoft }}
        >
          <ChevronLeft size={16} /> {meta.label}
        </button>

        <Eyebrow color={meta.color}>
          {new Date(viewingSession.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </Eyebrow>
        <h2 className="font-serif-display font-bold mb-4" style={{ fontSize: 22 }}>
          {viewingSession.skill}
        </h2>

        {cin && (
          <Card>
            <div className="p-5">
              <Eyebrow>How it went</Eyebrow>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: PALETTE.brandSoft, color: PALETTE.brand }}>
                  {cin.overall}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: PALETTE.goldSoft, color: PALETTE.gold }}>
                  frustration: {cin.frustration}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: PALETTE.accentSoft, color: PALETTE.accent }}>
                  worked: {cin.worked}
                </span>
              </div>
              {cin.notes && <div className="text-sm" style={{ color: PALETTE.inkSoft }}>{cin.notes}</div>}
            </div>
          </Card>
        )}

        {isLoggedAssignment ? (
          <AssignmentRecapView briefing={viewingSession.briefing} childName={childName} matchedArea={matchedRoadmapItem} />
        ) : (
          <BriefingView briefing={viewingSession.briefing} />
        )}

        <Card tint={PALETTE.goldSoft}>
          <div className="p-5">
            <Eyebrow color={PALETTE.gold}>Your notes</Eyebrow>
            <p className="text-xs mb-2" style={{ color: PALETTE.inkSoft }}>
              Anything worth remembering for next time — where {childName} struggled, where she
              excelled, what took longer than expected.
            </p>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="e.g. She really struggled connecting the numeral to the quantity, but flew through counting itself..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm outline-none mb-3"
              style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.line}`, background: PALETTE.card }}
            />
            <SecondaryButton onClick={saveNotes}>
              <Save size={15} /> {savingNotes ? "Saving…" : "Save note"}
            </SecondaryButton>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "upload") {
    return (
      <div className="animate-fade-in-up max-w-[640px] mx-auto">
        <button
          onClick={() => setStep("subject-detail")}
          className="flex items-center gap-1 mb-4 text-sm"
          style={{ color: PALETTE.inkSoft }}
        >
          <ChevronLeft size={16} /> {meta.label}
        </button>
        <Eyebrow color={meta.color}>{meta.label} &middot; Homework Helper</Eyebrow>
        <h2 className="font-serif-display mb-4" style={{ fontSize: 21, fontWeight: 700 }}>
          Tonight&apos;s {subject}
        </h2>
        <Card>
          <div className="p-5">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="worksheet preview" className="w-full rounded-xl mb-4 animate-fade-in" />
            ) : (
              <div
                className="w-full h-40 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200"
                style={{ background: PALETTE.bg, border: `1.5px dashed ${PALETTE.line}` }}
              >
                <Camera size={28} color={PALETTE.inkSoft} />
              </div>
            )}
            <label className="block">
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="worksheet-upload" />
              <div
                onClick={() => document.getElementById("worksheet-upload")?.click()}
                className="btn-press w-full text-center py-2.5 text-sm cursor-pointer font-medium transition-all duration-150"
                style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.line}` }}
              >
                {imagePreview ? "Choose a different photo" : "Take or upload a photo"}
              </div>
            </label>
          </div>
        </Card>
        {error && <ErrorBlock message={error} onRetry={analyze} />}
        <PrimaryButton onClick={analyze} disabled={!imageBase64}>Get tonight&apos;s plan</PrimaryButton>
      </div>
    );
  }

  if (step === "diagnosing") {
    return (
      <div className="max-w-[640px] mx-auto">
        <BriefingSkeleton childName={childName} />
      </div>
    );
  }

  if (step === "briefing" && briefing) {
    return (
      <div className="animate-fade-in-up max-w-[640px] mx-auto">
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
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up max-w-[640px] mx-auto">
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
          Go teach {childName} {briefing.skill.toLowerCase()}
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
      <div className="animate-fade-in-up max-w-[640px] mx-auto">
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
      <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up max-w-[640px] mx-auto">
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
        <PrimaryButton onClick={() => setStep("subject-detail")}>Back to {meta.label}</PrimaryButton>
      </div>
    );
  }

  return null;
}
