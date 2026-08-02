"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ClipboardList, Check } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Eyebrow, Card, PrimaryButton, LoadingBlock } from "@/components/ui/primitives";
import type { Subject } from "@/lib/types";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ReportIntakeCard({
  childId,
  childName,
  subject,
  intakeType = "report_card",
  title = "Give Easy a head start",
  description,
  placeholder = "e.g. Teacher said she's strong with sight words but rushes through math without checking her work...",
  uploadLabel = "Or attach a photo of a report card",
}: {
  childId: string;
  childName: string;
  subject?: Subject;
  intakeType?: "report_card" | "assignment";
  title?: string;
  description?: string;
  placeholder?: string;
  uploadLabel?: string;
}) {
  const router = useRouter();
  const inputId = `intake-upload-${subject ?? "general"}-${intakeType}`;
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ strengths: string[]; growthAreas: string[] } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setMediaType(file.type || "image/jpeg");
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
  }

  async function submit() {
    if (!notes.trim() && !imageBase64) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/intake-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, notes, imageBase64, mediaType, subject, intakeType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't process that — try again.");
        return;
      }
      setResult({ strengths: data.strengths ?? [], growthAreas: data.growthAreas ?? [] });
      setNotes("");
      setImagePreview(null);
      setImageBase64(null);
      router.refresh();
    } catch {
      setError("Couldn't process that — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-1">
          <ClipboardList size={13} color={PALETTE.brand} />
          <Eyebrow color={PALETTE.brand}>{title}</Eyebrow>
        </div>
        <p className="text-sm mb-4" style={{ color: PALETTE.inkSoft }}>
          {description ??
            `Got a report card, recent schoolwork, or just something a teacher told you? Add it here and Easy folds it straight into what it already knows about ${childName}.`}
        </p>

        {result ? (
          <div className="rounded-2xl p-4 mb-2" style={{ background: PALETTE.brandSoft }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Check size={14} color={PALETTE.brand} />
              <p className="text-sm font-bold" style={{ color: PALETTE.brand }}>
                Added to {childName}&apos;s profile
              </p>
            </div>
            {result.strengths.length > 0 && (
              <div className="mb-2">
                <p className="text-[11px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.04em" }}>
                  Strengths noted
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.strengths.map((s, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#fff", color: PALETTE.brand }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.growthAreas.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.04em" }}>
                  Areas to work on
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.growthAreas.map((s, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#fff", color: PALETTE.gold }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setResult(null)} className="text-xs font-bold mt-3" style={{ color: PALETTE.inkSoft }}>
              Add another
            </button>
          </div>
        ) : submitting ? (
          <LoadingBlock text="Reading through that..." />
        ) : (
          <>
            {imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="upload preview" className="w-full rounded-xl mb-3" />
            )}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm outline-none mb-3"
              style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.line}`, background: PALETTE.card }}
            />
            <label className="block mb-3">
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" id={inputId} />
              <div
                onClick={() => document.getElementById(inputId)?.click()}
                className="btn-press flex items-center justify-center gap-2 w-full text-center py-2.5 text-sm cursor-pointer font-medium transition-all duration-150"
                style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.line}` }}
              >
                <Camera size={15} /> {imagePreview ? "Choose a different photo" : uploadLabel}
              </div>
            </label>
            {error && (
              <div className="text-sm mb-3" style={{ color: PALETTE.accent }}>
                {error}
              </div>
            )}
            <PrimaryButton disabled={!notes.trim() && !imageBase64} onClick={submit}>
              Add to profile
            </PrimaryButton>
          </>
        )}
      </div>
    </Card>
  );
}
