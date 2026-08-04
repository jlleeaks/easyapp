import type { CheckinAnswers, LibraryCheckinAnswers, LearningPattern, Subject } from "@/lib/types";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const WORKED_LABELS: Record<string, string> = {
  "the analogy": "using an analogy",
  "the hands-on approach": "hands-on objects",
  "something I improvised": "a parent-improvised approach",
};

/**
 * Deterministic, code-derived observations from a homework/practice check-in —
 * no extra AI call, so every entry traces directly back to what the parent reported.
 */
export function deriveHomeworkLearningPatterns(subject: Subject, skill: string, checkin: CheckinAnswers): LearningPattern[] {
  const now = new Date().toISOString();
  const out: LearningPattern[] = [];
  const workedLabel = WORKED_LABELS[checkin.worked] ?? checkin.worked;

  if (checkin.execution_difficulty && checkin.execution_difficulty !== "nothing else") {
    out.push({
      id: crypto.randomUUID(),
      subject,
      observation: `${checkin.execution_difficulty === "writing/hand fatigue" ? "Physical writing/hand fatigue" : capitalize(checkin.execution_difficulty)} affected execution during ${skill}, separate from understanding the concept`,
      trigger: skill,
      parent_response: null,
      helped: null,
      source: "session",
      created_at: now,
    });
  }

  if (checkin.frustration !== "not really") {
    out.push({
      id: crypto.randomUUID(),
      subject,
      observation: `${checkin.frustration === "yes, a lot" ? "Got frustrated" : "Showed some hesitation"} during ${skill}`,
      trigger: skill,
      parent_response: workedLabel || null,
      helped: workedLabel ? true : null,
      source: "session",
      created_at: now,
    });
  } else if (workedLabel) {
    out.push({
      id: crypto.randomUUID(),
      subject,
      observation: `${skill} went smoothly`,
      trigger: skill,
      parent_response: workedLabel,
      helped: true,
      source: "session",
      created_at: now,
    });
  }
  return out;
}

export function deriveLibraryLearningPatterns(bookTitle: string, checkin: LibraryCheckinAnswers): LearningPattern[] {
  const now = new Date().toISOString();
  const out: LearningPattern[] = [];

  if (checkin.response === "distracted") {
    out.push({
      id: crypto.randomUUID(),
      subject: "reading",
      observation: `Seemed distracted reading ${bookTitle}`,
      trigger: "reading",
      parent_response: null,
      helped: null,
      source: "session",
      created_at: now,
    });
  } else if (checkin.response === "really into it") {
    out.push({
      id: crypto.randomUUID(),
      subject: "reading",
      observation: `Stayed engaged reading ${bookTitle}`,
      trigger: "reading",
      parent_response: checkin.sparked_conversation !== "not really" ? "discussion questions" : null,
      helped: checkin.sparked_conversation !== "not really" ? true : null,
      source: "session",
      created_at: now,
    });
  }
  return out;
}
