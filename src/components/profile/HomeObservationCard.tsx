"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Check } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Eyebrow, Card, PrimaryButton, TextField, ChoiceGroup } from "@/components/ui/primitives";

export function HomeObservationCard({ childId }: { childId: string }) {
  const router = useRouter();
  const [observation, setObservation] = useState("");
  const [context, setContext] = useState("");
  const [useForPersonalization, setUseForPersonalization] = useState("yes");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!observation.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/observation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          observation,
          context,
          useForPersonalization: useForPersonalization === "yes",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save that — try again.");
        return;
      }
      setDone(true);
      setObservation("");
      setContext("");
      router.refresh();
    } catch {
      setError("Couldn't save that — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-1">
          <Home size={13} color={PALETTE.brand} />
          <Eyebrow color={PALETTE.brand}>Add something you noticed at home</Eyebrow>
        </div>
        {done ? (
          <div className="rounded-2xl p-4 mt-2" style={{ background: PALETTE.brandSoft }}>
            <div className="flex items-center gap-1.5">
              <Check size={14} color={PALETTE.brand} />
              <p className="text-sm font-bold" style={{ color: PALETTE.brand }}>Saved</p>
            </div>
            <button onClick={() => setDone(false)} className="text-xs font-bold mt-2" style={{ color: PALETTE.inkSoft }}>
              Add another
            </button>
          </div>
        ) : (
          <>
            <TextField
              label="What happened?"
              value={observation}
              onChange={setObservation}
              placeholder="e.g. Maya rushed through her writing tonight."
            />
            <TextField
              label="When or where?"
              value={context}
              onChange={setContext}
              placeholder="e.g. Writing homework"
              optional
            />
            <ChoiceGroup
              label="Should Easy use this for future activities?"
              options={["yes", "no"]}
              value={useForPersonalization}
              onChange={setUseForPersonalization}
            />
            {error && (
              <div className="text-sm mb-3" style={{ color: PALETTE.accent }}>
                {error}
              </div>
            )}
            <PrimaryButton disabled={!observation.trim() || submitting} onClick={submit}>
              {submitting ? "Saving…" : "Save"}
            </PrimaryButton>
          </>
        )}
      </div>
    </Card>
  );
}
