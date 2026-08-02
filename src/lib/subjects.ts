import { Calculator, PenTool, BookOpen, type LucideIcon } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import type { Subject } from "@/lib/types";

export const SUBJECTS: {
  key: Subject;
  label: string;
  icon: LucideIcon;
  color: string;
  soft: string;
}[] = [
  { key: "math", label: "Math", icon: Calculator, color: PALETTE.accent, soft: PALETTE.accentSoft },
  { key: "writing", label: "Writing", icon: PenTool, color: PALETTE.gold, soft: PALETTE.goldSoft },
  { key: "reading", label: "Reading", icon: BookOpen, color: PALETTE.brand, soft: PALETTE.brandSoft },
];

export function subjectMeta(key: string) {
  return SUBJECTS.find((s) => s.key === key) ?? SUBJECTS[0];
}

export const SUBJECT_PEDAGOGY: Record<Subject, string> = {
  math: "Use the concrete-representational-abstract (CRA) progression — concrete household objects before pictures, pictures before symbols/numbers.",
  writing:
    "Focus on modeling and guided practice — demonstrate the letter/word formation or sentence structure first ('watch me, then you try'), emphasizing motor formation and sound-to-symbol connection over abstract rules.",
  reading:
    "Use dialogic reading (PEER: prompt, evaluate, expand, repeat) with CROWD-style prompts. For a kindergartner, lean toward distancing prompts that connect the text to their own life, alongside phonics-based decoding support where relevant.",
};

export const GRADE_CONTEXT: Record<Subject, { title: string; detail: string }[]> = {
  math: [
    { title: "Counting", detail: "Counting to 20+ by ones, and understanding that each number represents one more." },
    { title: "Number recognition", detail: "Reading and writing numerals 0–20, matching a numeral to a quantity." },
    { title: "Addition & subtraction within 10", detail: "Using objects or fingers before moving to symbols — concrete before abstract." },
    { title: "Shapes", detail: "Naming and describing basic 2D and 3D shapes in the world around them." },
    { title: "Patterns", detail: "Recognizing and extending simple repeating patterns (AB, AAB, ABC)." },
  ],
  writing: [
    { title: "Letter formation", detail: "Writing uppercase and lowercase letters with correct starting points and strokes." },
    { title: "Name writing", detail: "Writing their own first name legibly, a major kindergarten milestone." },
    { title: "Sound-to-letter spelling", detail: "Sounding out simple words and writing the letters they hear (invented spelling is expected)." },
    { title: "Simple sentences", detail: "Writing a short sentence about a picture or an experience, with spaces between words." },
    { title: "Drawing + labeling", detail: "Combining a drawing with a word or short caption to tell a story." },
  ],
  reading: [
    { title: "Letter sounds", detail: "Matching letters to their sounds — the foundation of sounding out words." },
    { title: "Blending", detail: "Combining individual sounds into a whole word (c-a-t → cat)." },
    { title: "Sight words", detail: "Recognizing common high-frequency words by sight (the, is, and, a)." },
    { title: "Reading comprehension", detail: "Answering simple questions about a story's characters and events." },
    { title: "Print awareness", detail: "Understanding that print carries meaning, reads left-to-right, top-to-bottom." },
  ],
};
