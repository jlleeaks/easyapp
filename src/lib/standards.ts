import type { Subject } from "@/lib/types";

/**
 * A curated, versioned reference of what kindergartners commonly work toward,
 * used as the fallback framework when a family's specific state/district
 * standards aren't configured. This is hand-authored from the publicly
 * published Common Core State Standards (Mathematics and English Language
 * Arts) — never generated or paraphrased by an AI model at request time.
 *
 * Where no single numbered standard cleanly covers a commonly-taught
 * kindergarten skill (e.g. patterns, writing one's own name), `code` is left
 * null rather than inventing one — see `formalCode` being optional below.
 */

export const STANDARDS_FRAMEWORK = {
  id: "common-core-fallback",
  name: "Common Core-aligned kindergarten reference",
  jurisdiction: "General U.S. reference (not a specific state's official standards)",
  version: "2024.1",
  grade: "Kindergarten",
};

export type LearningState = "not_yet_observed" | "introduced" | "developing" | "comfortable" | "ready_to_extend";

export const LEARNING_STATE_LABELS: Record<LearningState, string> = {
  not_yet_observed: "Not yet observed",
  introduced: "Introduced",
  developing: "Developing",
  comfortable: "Comfortable",
  ready_to_extend: "Ready to extend",
};

export const LEARNING_STATE_DESCRIPTIONS: Record<LearningState, string> = {
  not_yet_observed: "Easy doesn't have enough information yet — that doesn't mean your child can't do it.",
  introduced: "Your child has encountered this, but Easy has limited evidence of independent use.",
  developing: "Your child can engage with this with some support, or in some contexts.",
  comfortable: "Your child has demonstrated this consistently across what Easy has observed.",
  ready_to_extend: "Your child is comfortable here and appears ready for a more advanced next step.",
};

export type StandardArea = {
  id: string;
  subject: Subject;
  domain: string; // formal Common Core domain name
  area: string; // parent-friendly area name
  formalCode: string | null; // e.g. "K.CC.1-3", or null if no single clean code applies
  officialWording: string;
  parentWording: string;
  keywords: string[]; // used for best-effort matching against existing free-text skill/session data
  nextGrade: string; // parent-friendly 1st-grade continuation
};

export const KINDERGARTEN_STANDARDS: StandardArea[] = [
  // ---- Math ----
  {
    id: "k-math-counting",
    subject: "math",
    domain: "Counting and Cardinality",
    area: "Counting and numbers",
    formalCode: "K.CC.1–3",
    officialWording: "Count to 100 by ones and tens; count forward from a given number; write numerals 0–20.",
    parentWording: "Count forward confidently, including by ones and groups of ten, and read/write numerals 0–20.",
    keywords: ["count", "counting", "numeral", "number recognition", "number writing", "writing number", "reversal", "number formation"],
    nextGrade: "Count within 120 and understand two-digit place value (tens and ones).",
  },
  {
    id: "k-math-comparing",
    subject: "math",
    domain: "Counting and Cardinality",
    area: "Comparing quantities",
    formalCode: "K.CC.6–7",
    officialWording: "Compare two numbers between 1 and 10, or two groups of objects, using greater than, less than, or equal to.",
    parentWording: "Compare two groups or two numbers to say which has more, less, or if they're equal.",
    keywords: ["compare", "more than", "less than", "greater", "quantity"],
    nextGrade: "Compare two-digit numbers using place value reasoning.",
  },
  {
    id: "k-math-addition-subtraction",
    subject: "math",
    domain: "Operations and Algebraic Thinking",
    area: "Addition and subtraction",
    formalCode: "K.OA.1–5",
    officialWording: "Represent addition and subtraction with objects, fingers, drawings, or equations; solve problems within 10.",
    parentWording: "Combine and separate small groups using objects or fingers, working toward simple addition and subtraction within 10.",
    keywords: ["addition", "subtraction", "add", "combine", "adding", "plus", "minus"],
    nextGrade: "Add and subtract fluently within 20, using increasingly abstract strategies.",
  },
  {
    id: "k-math-measurement",
    subject: "math",
    domain: "Measurement and Data",
    area: "Measurement and data",
    formalCode: "K.MD.1–3",
    officialWording: "Describe and compare measurable attributes (length, weight); classify and count objects into categories.",
    parentWording: "Describe and compare things by size or weight, and sort objects into simple categories.",
    keywords: ["measure", "measurement", "sort", "sorting", "bigger", "smaller", "heavier"],
    nextGrade: "Measure length using standard units and represent data with simple graphs.",
  },
  {
    id: "k-math-shapes",
    subject: "math",
    domain: "Geometry",
    area: "Shapes and spatial thinking",
    formalCode: "K.G.1–6",
    officialWording: "Identify, describe, compare, and compose 2D and 3D shapes.",
    parentWording: "Name and describe basic shapes, and start putting simple shapes together to make new ones.",
    keywords: ["shape", "shapes", "circle", "square", "triangle", "geometry"],
    nextGrade: "Reason about attributes of shapes (sides, angles) and partition shapes into equal parts.",
  },
  {
    id: "k-math-patterns",
    subject: "math",
    domain: "(Commonly taught alongside Common Core, no single numbered standard)",
    area: "Patterns",
    formalCode: null,
    officialWording: "Not a distinct numbered Common Core kindergarten standard, but widely taught as early algebraic reasoning.",
    parentWording: "Notice, copy, and extend simple repeating patterns (like red-blue-red-blue).",
    keywords: ["pattern", "patterns", "sequence", "repeating"],
    nextGrade: "Extend the idea of patterns into simple number and shape sequences.",
  },

  // ---- Reading ----
  {
    id: "k-reading-print-concepts",
    subject: "reading",
    domain: "Reading: Foundational Skills — Print Concepts",
    area: "Foundational reading skills",
    formalCode: "RF.K.1",
    officialWording: "Demonstrate understanding of print organization — left-to-right, top-to-bottom, word-by-word.",
    parentWording: "Understand that print carries meaning and follow it left-to-right, top-to-bottom.",
    keywords: ["print awareness", "print concepts", "reads left to right"],
    nextGrade: "Apply print concepts fluently while reading connected text independently.",
  },
  {
    id: "k-reading-phonics",
    subject: "reading",
    domain: "Reading: Foundational Skills — Phonological Awareness & Phonics",
    area: "Letter sounds and blending",
    formalCode: "RF.K.2–3",
    officialWording: "Demonstrate phonological awareness and phonics skills — blend and segment sounds, match letters to sounds.",
    parentWording: "Match letters to their sounds and blend individual sounds into a whole word (like c-a-t → cat).",
    keywords: ["letter sounds", "phonics", "blending", "sound out", "sounding out", "rhym", "repetitive", "wordplay", "word play"],
    nextGrade: "Decode multisyllabic words and apply phonics patterns to unfamiliar text.",
  },
  {
    id: "k-reading-sight-words",
    subject: "reading",
    domain: "Reading: Foundational Skills — Phonics and Word Recognition",
    area: "High-frequency words",
    formalCode: "RF.K.3c",
    officialWording: "Read common high-frequency words by sight.",
    parentWording: "Recognize common words by sight (the, is, and, a) without sounding them out each time.",
    keywords: ["sight words", "high frequency", "high-frequency"],
    nextGrade: "Build a larger sight-word vocabulary to support reading fluency.",
  },
  {
    id: "k-reading-comprehension",
    subject: "reading",
    domain: "Reading: Literature & Informational Text",
    area: "Reading comprehension",
    formalCode: "RL.K.1–3 / RI.K.1–3",
    officialWording: "With prompting and support, ask and answer questions about key details, characters, settings, and events in a text.",
    parentWording: "Talk about a story's characters and events, and answer simple questions about what happened.",
    keywords: ["comprehension", "understand the story", "characters", "retell"],
    nextGrade: "Retell stories independently and identify the central message or lesson.",
  },
  {
    id: "k-reading-speaking-listening",
    subject: "reading",
    domain: "Speaking and Listening",
    area: "Speaking and listening",
    formalCode: "SL.K.1–6",
    officialWording: "Participate in conversations, follow discussion rules, and describe familiar people, places, things, and events.",
    parentWording: "Take turns talking about a topic and describe things clearly enough for someone else to picture them.",
    keywords: ["conversation", "discussion", "speaking", "listening"],
    nextGrade: "Ask and answer more detailed questions and build on others' ideas in discussion.",
  },

  // ---- Writing ----
  {
    id: "k-writing-letter-formation",
    subject: "writing",
    domain: "Language — Conventions",
    area: "Letter formation",
    formalCode: "L.K.1a",
    officialWording: "Print many upper- and lowercase letters.",
    parentWording: "Write uppercase and lowercase letters with correct starting points and strokes.",
    keywords: ["letter formation", "writing letters", "handwriting"],
    nextGrade: "Write all upper- and lowercase letters legibly and with growing consistency.",
  },
  {
    id: "k-writing-own-name",
    subject: "writing",
    domain: "(Commonly expected kindergarten milestone, no single numbered standard)",
    area: "Writing their name",
    formalCode: null,
    officialWording: "Not a distinct numbered standard, but a widely recognized kindergarten milestone.",
    parentWording: "Write their own first name legibly.",
    keywords: ["name writing", "write her name", "write his name", "own name"],
    nextGrade: "Write full name and other familiar words with consistent letter formation.",
  },
  {
    id: "k-writing-phonetic-spelling",
    subject: "writing",
    domain: "Language — Conventions",
    area: "Sound-to-letter spelling",
    formalCode: "L.K.2c–d",
    officialWording: "Spell simple words phonetically, writing letters for the sounds heard.",
    parentWording: "Sound out simple words and write the letters they hear — invented spelling is expected at this stage.",
    keywords: ["spelling", "sound to letter", "invented spelling", "phonetic"],
    nextGrade: "Move from phonetic spelling toward conventional spelling of common words.",
  },
  {
    id: "k-writing-simple-sentences",
    subject: "writing",
    domain: "Writing — Text Types and Purposes",
    area: "Simple sentences and ideas",
    formalCode: "W.K.1–3",
    officialWording: "Use a combination of drawing, dictating, and writing to compose opinion, informative, and narrative texts.",
    parentWording: "Write (or draw and dictate) a short sentence or story about a picture or experience, with spaces between words.",
    keywords: ["sentence", "sentences", "story writing", "drawing and labeling"],
    nextGrade: "Write short opinion, informative, and narrative pieces with more independence and detail.",
  },
];

export function areasForSubject(subject: Subject): StandardArea[] {
  return KINDERGARTEN_STANDARDS.filter((s) => s.subject === subject);
}

export function findAreaById(id: string): StandardArea | undefined {
  return KINDERGARTEN_STANDARDS.find((s) => s.id === id);
}

/**
 * Best-effort match of a free-text skill/session label onto a curated area,
 * for existing data that predates explicit roadmap tagging. This is a
 * heuristic display aid, not a precise standards-alignment claim.
 */
export function matchAreaByText(subject: Subject, text: string): StandardArea | null {
  const lower = text.toLowerCase();
  const candidates = areasForSubject(subject);
  for (const area of candidates) {
    if (area.keywords.some((k) => lower.includes(k))) return area;
  }
  return null;
}
