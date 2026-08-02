"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Card, TextField, ChoiceGroup, PrimaryButton, SecondaryButton } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { EMPTY_CHILD_PROFILE, type ChildProfile, type ChildProfileInput } from "@/lib/types";

const STEPS = ["identity", "temperament", "academic", "reading", "signal"] as const;
const STEP_TITLES: Record<(typeof STEPS)[number], string> = {
  identity: "Let's get set up",
  temperament: "How they handle hard stuff",
  academic: "Where they're starting from",
  reading: "Reading & routine",
  signal: "What already works",
};

type FormState = ChildProfileInput & { parentName: string };

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
  const [form, setForm] = useState<FormState>(() => ({
    parentName: initialParentName,
    ...EMPTY_CHILD_PROFILE,
    ...(existingChild
      ? {
          name: existingChild.name,
          interests: existingChild.interests ?? "",
          hobbies: existingChild.hobbies ?? "",
          favorite_characters: existingChild.favorite_characters ?? "",
          frustration: existingChild.frustration ?? "",
          learning_style: existingChild.learning_style ?? "",
          motivation: existingChild.motivation ?? "",
          shy: existingChild.shy ?? "",
          letters_level: existingChild.letters_level ?? "",
          numbers_level: existingChild.numbers_level ?? "",
          read_together: existingChild.read_together ?? "",
          favorite_books: existingChild.favorite_books ?? "",
          talks_after_story: existingChild.talks_after_story ?? "",
          homework_time: existingChild.homework_time ?? "",
          who_present: existingChild.who_present ?? "",
          enjoys_learning: existingChild.enjoys_learning ?? "",
          subject_likes: existingChild.subject_likes ?? "",
          subject_struggle: existingChild.subject_struggle ?? "",
          go_to_analogy: existingChild.go_to_analogy ?? "",
          doesnt_work: existingChild.doesnt_work ?? "",
          math_anxiety: existingChild.math_anxiety ?? "",
        }
      : {}),
  }));

  const key = STEPS[step];
  const update = <K extends keyof FormState>(field: K) => (val: FormState[K]) =>
    setForm((f) => ({ ...f, [field]: val }));

  async function finish() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { parentName, ...childFields } = form;

    await supabase.from("parents").update({ name: parentName }).eq("id", user.id);

    if (existingChild) {
      const { error: updateError } = await supabase
        .from("children")
        .update(childFields)
        .eq("id", existingChild.id);
      if (updateError) {
        setError("Couldn't save — try again.");
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("children")
        .insert({ ...childFields, parent_id: user.id });
      if (insertError) {
        setError("Couldn't save — try again.");
        setSaving(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh" }} className="w-full flex justify-center px-6 py-10">
      <div className="w-full animate-fade-in" style={{ maxWidth: 560 }}>
        <div className="flex gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: PALETTE.line }}>
              <div
                className="h-full rounded-full transition-transform duration-500 ease-out"
                style={{
                  background: PALETTE.brand,
                  transform: i <= step ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                }}
              />
            </div>
          ))}
        </div>
        <div className="text-xs mb-5" style={{ color: PALETTE.inkSoft }}>
          Step {step + 1} of {STEPS.length}
        </div>

        <Card>
          <div className="p-5">
            <h2 className="font-serif-display mb-4" style={{ fontSize: 20, fontWeight: 700 }}>
              {STEP_TITLES[key]}
            </h2>

            {key === "identity" && (
              <>
                <TextField label="Your name" value={form.parentName} onChange={update("parentName")} placeholder="e.g. Jordan" />
                <TextField label="Your kindergartner's name" value={form.name} onChange={update("name")} placeholder="e.g. Maya" />
                <TextField
                  label="2–3 things they're obsessed with right now"
                  value={form.interests ?? ""}
                  onChange={update("interests")}
                  placeholder="dinosaurs, unicorns, soccer..."
                />
                <TextField
                  label="What do they love doing outside school?"
                  value={form.hobbies ?? ""}
                  onChange={update("hobbies")}
                  placeholder="building blocks, drawing..."
                  optional
                />
                <TextField
                  label="Any favorite characters or shows?"
                  value={form.favorite_characters ?? ""}
                  onChange={update("favorite_characters")}
                  placeholder="used for tone, never reproduced directly"
                  optional
                />
              </>
            )}

            {key === "temperament" && (
              <>
                <ChoiceGroup
                  label="When something's hard, they usually..."
                  options={["keep trying", "get frustrated fast", "shut down"]}
                  value={form.frustration ?? ""}
                  onChange={update("frustration")}
                />
                <ChoiceGroup
                  label="They learn better..."
                  options={["sitting & focused", "moving / hands-on"]}
                  value={form.learning_style ?? ""}
                  onChange={update("learning_style")}
                />
                <ChoiceGroup
                  label="They're more motivated by..."
                  options={["praise", "a challenge", "getting it right"]}
                  value={form.motivation ?? ""}
                  onChange={update("motivation")}
                />
                <ChoiceGroup
                  label="With new people or situations, they're..."
                  options={["shy, slow-to-warm", "jump-right-in"]}
                  value={form.shy ?? ""}
                  onChange={update("shy")}
                />
              </>
            )}

            {key === "academic" && (
              <>
                <ChoiceGroup
                  label="Letters & sounds"
                  options={["just starting", "knows most letters", "blending sounds"]}
                  value={form.letters_level ?? ""}
                  onChange={update("letters_level")}
                />
                <ChoiceGroup
                  label="Numbers"
                  options={["counting", "recognizing numbers", "simple addition"]}
                  value={form.numbers_level ?? ""}
                  onChange={update("numbers_level")}
                />
              </>
            )}

            {key === "reading" && (
              <>
                <ChoiceGroup
                  label="Do you already read together at night?"
                  options={["yes", "sometimes", "not really"]}
                  value={form.read_together ?? ""}
                  onChange={update("read_together")}
                />
                <TextField
                  label="Any books they ask for over and over?"
                  value={form.favorite_books ?? ""}
                  onChange={update("favorite_books")}
                  optional
                />
                <ChoiceGroup
                  label="After a story, do they want to talk about it?"
                  options={["yes, loves to", "just wants to sleep"]}
                  value={form.talks_after_story ?? ""}
                  onChange={update("talks_after_story")}
                />
                <TextField
                  label="What time does homework usually happen?"
                  value={form.homework_time ?? ""}
                  onChange={update("homework_time")}
                  optional
                />
                <TextField
                  label="Who's usually there for it?"
                  value={form.who_present ?? ""}
                  onChange={update("who_present")}
                  placeholder="just me, siblings around..."
                  optional
                />
              </>
            )}

            {key === "signal" && (
              <>
                <ChoiceGroup
                  label="Do they generally enjoy learning?"
                  options={["yes, mostly", "it's a struggle to engage them"]}
                  value={form.enjoys_learning ?? ""}
                  onChange={update("enjoys_learning")}
                />
                <TextField
                  label="Any subject they already light up for?"
                  value={form.subject_likes ?? ""}
                  onChange={update("subject_likes")}
                  optional
                />
                <TextField
                  label="Any subject that's been a fight to get done?"
                  value={form.subject_struggle ?? ""}
                  onChange={update("subject_struggle")}
                  optional
                />
                <TextField
                  label="A go-to analogy or comparison you already use"
                  value={form.go_to_analogy ?? ""}
                  onChange={update("go_to_analogy")}
                  placeholder='e.g. "I compare fractions to pizza slices"'
                  optional
                />
                <TextField
                  label="Anything that reliably doesn't work with them?"
                  value={form.doesnt_work ?? ""}
                  onChange={update("doesnt_work")}
                  optional
                />
                <ChoiceGroup
                  label="Does helping with math feel stressful for you?"
                  options={["not really", "a little", "yes, honestly"]}
                  value={form.math_anxiety ?? ""}
                  onChange={update("math_anxiety")}
                />
              </>
            )}
          </div>
        </Card>

        {error && (
          <div className="text-sm mb-4" style={{ color: PALETTE.accent }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          {step > 0 && (
            <SecondaryButton onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft size={16} /> Back
            </SecondaryButton>
          )}
          {step < STEPS.length - 1 ? (
            <PrimaryButton onClick={() => setStep((s) => s + 1)} icon={ChevronRight}>
              Continue
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={finish} disabled={saving} icon={Check}>
              {saving ? "Saving…" : existingChild ? "Save changes" : "Create profile"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
