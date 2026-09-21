"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Leaf, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  EMPTY_CHILD_PROFILE,
  type ChildProfile,
  type ChildProfileInput,
} from "@/lib/types";
import { Brand } from "@/components/easy/Brand";
import { TrailGuide } from "@/components/easy/TrailGuide";
type FormState = ChildProfileInput & { parentName: string };
type Question = {
  key: keyof FormState;
  group: string;
  title: string;
  hint: string;
  options?: string[];
  placeholder?: string;
  optional?: boolean;
};
const QUESTIONS: Question[] = [
  {
    key: "parentName",
    group: "A LITTLE INTRODUCTION",
    title: "First, what should we call you?",
    hint: "This is your space. Easy is here to help you teach.",
    placeholder: "Your first name",
  },
  {
    key: "name",
    group: "YOUR LITTLE LEARNER",
    title: "And your child’s name?",
    hint: "A first name or nickname is all we need. This is our kindergarten learning path.",
    placeholder: "Their name or nickname",
  },
  {
    key: "interests",
    group: "THEIR WORLD",
    title: "What lights up their world?",
    hint: "Dinosaurs? Space? A very specific kind of truck? Start with what they love.",
    placeholder: "A few of their favorite things",
  },
  {
    key: "hobbies",
    group: "THEIR WORLD",
    title: "What do they love doing?",
    hint: "Think of those activities they could happily do all afternoon.",
    placeholder: "Building, drawing, exploring…",
    optional: true,
  },
  {
    key: "frustration",
    group: "HOW YOU HELP",
    title: "When something feels hard, they…",
    hint: "There’s no right answer. This helps us suggest a gentler way in.",
    options: ["Keep trying", "Get frustrated fast", "Go quiet or shut down"],
  },
  {
    key: "learning_style",
    group: "HOW YOU HELP",
    title: "What helps them get into it?",
    hint: "Choose what seems to work best right now.",
    options: [
      "Moving and using objects",
      "Sitting together and focusing",
      "A little of both",
    ],
  },
  {
    key: "motivation",
    group: "HOW YOU HELP",
    title: "What keeps them going?",
    hint: "We’ll help you encourage their effort along the way.",
    options: [
      "Noticing their effort",
      "A playful challenge",
      "Doing it together",
    ],
  },
  {
    key: "letters_level",
    group: "A STARTING POINT",
    title: "Where are they with letters and sounds?",
    hint: "Your best impression is enough. The roadmap starts with plenty still to discover.",
    options: [
      "Just starting",
      "Recognizing many letters",
      "Starting to blend sounds",
      "I’m not sure yet",
    ],
  },
  {
    key: "numbers_level",
    group: "A STARTING POINT",
    title: "And with numbers?",
    hint: "Think about what you’ve noticed at home.",
    options: [
      "Exploring counting",
      "Recognizing numbers",
      "Trying simple addition",
      "I’m not sure yet",
    ],
  },
  {
    key: "read_together",
    group: "YOUR READING LIFE",
    title: "Do you read together?",
    hint: "We’ll meet you where you are.",
    options: ["Most evenings", "Sometimes", "We’d like to start"],
  },
  {
    key: "favorite_books",
    group: "YOUR READING LIFE",
    title: "Any books they ask for again and again?",
    hint: "We can build on the books you already have.",
    placeholder: "A book title or two",
    optional: true,
  },
  {
    key: "homework_time",
    group: "MAKING IT FIT",
    title: "When could a little learning fit?",
    hint: "Think of a 15–20 minute window. There’s no need to make a perfect schedule.",
    options: [
      "After school",
      "After dinner",
      "Before bedtime",
      "It changes day to day",
    ],
  },
  {
    key: "who_present",
    group: "MAKING IT FIT",
    title: "Who’s usually there?",
    hint: "A little context helps us plan for real life.",
    options: [
      "Just us",
      "Siblings around, too",
      "Another grown-up joins",
      "It varies",
    ],
  },
  {
    key: "go_to_analogy",
    group: "WHAT ALREADY WORKS",
    title: "Have a go-to way of explaining things?",
    hint: "We’ll build on your ideas. Leave this blank if you’d like us to suggest a starting point.",
    placeholder: "We count toy cars in a pretend garage…",
    optional: true,
  },
  {
    key: "math_anxiety",
    group: "A LITTLE SUPPORT FOR YOU",
    title: "Does helping with math feel stressful?",
    hint: "You’re learning how to help, too. We can make the guidance more structured.",
    options: ["Not really", "A little", "Yes, honestly"],
    optional: true,
  },
];
export function OnboardingWizard({
  existingChild,
  initialParentName,
}: {
  existingChild: ChildProfile | null;
  initialParentName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => {
    const fields = { ...EMPTY_CHILD_PROFILE };
    if (existingChild)
      for (const key of Object.keys(fields) as (keyof ChildProfileInput)[])
        fields[key] = existingChild[key] ?? "";
    return { ...fields, parentName: initialParentName };
  });
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (step > 0) heading.current?.focus();
  }, [step]);
  const question = QUESTIONS[step];
  const value = form[question.key] ?? "";
  const valid = question.optional || value.trim().length > 0;
  const update = (v: string) => {
    setForm((f) => ({ ...f, [question.key]: v }));
    setError(null);
  };
  async function finish() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      const { parentName, ...fields } = form;
      const childFields = Object.fromEntries(
        Object.entries(fields).map(([key, val]) => [
          key,
          typeof val === "string" ? val.trim() : val,
        ]),
      );
      if (!childFields.name) {
        setError("Please add a name or nickname for your child.");
        setStep(1);
        return;
      }
      const { error: parentError } = await supabase
        .from("parents")
        .update({ name: parentName.trim() })
        .eq("id", user.id);
      if (parentError) throw parentError;
      const result = existingChild
        ? await supabase
            .from("children")
            .update(childFields)
            .eq("id", existingChild.id)
            .eq("parent_id", user.id)
        : await supabase
            .from("children")
            .insert({ ...childFields, parent_id: user.id });
      if (result.error) throw result.error;
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        "We couldn’t save that just yet. Your answers are still here. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  const next = () => {
    if (!valid || saving) return;
    if (step === QUESTIONS.length - 1) void finish();
    else {
      setStep((s) => s + 1);
      setError(null);
    }
  };
  return (
    <div className="onboarding-page">
      <header className="onboarding-nav">
        <Brand />
        <span>
          {existingChild
            ? "Update your family profile"
            : "A little about your family"}
        </span>
      </header>
      <main className="onboarding-layout">
        <div className="onboarding-form">
          <div
            className="onboarding-progress"
            role="progressbar"
            aria-label="Profile setup"
            aria-valuenow={step + 1}
            aria-valuemin={0}
            aria-valuemax={QUESTIONS.length}
          >
            <span
              style={{ transform: `scaleX(${(step + 1) / QUESTIONS.length})` }}
            />
          </div>
          <p className="question-count">
            {step + 1} of {QUESTIONS.length} ·{" "}
            {question.optional ? "Optional" : "Let’s get to know you"}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <span className="section-kicker">{question.group}</span>
            <h1 ref={heading} tabIndex={-1} id="question-title">
              {question.title}
            </h1>
            <p className="question-hint" id="question-hint">
              {question.hint}
            </p>
            {question.options ? (
              <div
                className="onboarding-options"
                role="group"
                aria-labelledby="question-title"
                aria-describedby="question-hint"
              >
                {question.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-pressed={value === option}
                    onClick={() => update(option)}
                  >
                    <span>{option}</span>
                    <span className="choice-check" aria-hidden="true">
                      {value === option && <Check size={16} />}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <input
                key={question.key}
                className="onboarding-input"
                aria-labelledby="question-title"
                aria-describedby="question-hint"
                value={value}
                onChange={(e) => update(e.target.value)}
                placeholder={question.placeholder}
                maxLength={
                  question.key === "name" || question.key === "parentName"
                    ? 80
                    : 500
                }
                autoComplete={
                  question.key === "parentName" ? "given-name" : "off"
                }
                required={!question.optional}
              />
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="onboarding-actions">
              <button
                type="button"
                className="onboarding-back"
                disabled={step === 0 || saving}
                onClick={() => {
                  setStep((s) => s - 1);
                  setError(null);
                }}
                aria-label="Previous question"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                className="easy-button"
                type="submit"
                disabled={!valid || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Saving your
                    profile…
                  </>
                ) : step === QUESTIONS.length - 1 ? (
                  <>
                    Show my roadmap <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
            {question.optional && step < QUESTIONS.length - 1 && (
              <button
                type="button"
                className="skip-question"
                onClick={() => setStep((s) => s + 1)}
              >
                Skip for now
              </button>
            )}
          </form>
          <p className="onboarding-privacy">
            For parents and guardians. Share only what feels useful.
          </p>
        </div>
        <aside
          className="onboarding-preview"
          aria-label="Your roadmap is taking shape"
        >
          <span className="section-kicker">A PATH THAT STARTS WITH YOU</span>
          <h2>
            {form.name ? `${form.name}’s little world.` : "Their little world."}
          </h2>
          <p className="preview-caption">
            {step < 3
              ? "A few details help bring the first step into focus."
              : step < 8
                ? "We’re getting to know how you learn together."
                : "A starting point, with plenty still to discover."}
          </p>
          <div className="preview-trail" aria-hidden="true">
            <div className="preview-connector" />
            {[
              "Getting to know them",
              "Exploring numbers",
              "Discovering reading",
              "Growing together",
            ].map((label, i) => (
              <div
                key={label}
                className={`preview-node ${step >= i * 4 ? "preview-known" : ""}`}
                style={{ marginLeft: i % 2 ? 45 : 0 }}
              >
                <span>
                  <Leaf size={21} />
                </span>
                <p>{step >= i * 4 ? label : "A little discovery ahead"}</p>
              </div>
            ))}
          </div>
          <TrailGuide className="onboarding-guide" />
          <div className="preview-note" aria-live="polite">
            {form.interests
              ? `Inspired by ${form.interests}.`
              : "Built around what makes them, them."}
            <span>Preview · Skills begin as not yet observed.</span>
          </div>
        </aside>
      </main>
    </div>
  );
}
