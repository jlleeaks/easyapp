import type { SkillStage } from "@/lib/palette";

export type ChildProfile = {
  id: string;
  parent_id: string;
  name: string;
  interests: string | null;
  hobbies: string | null;
  favorite_characters: string | null;
  frustration: string | null;
  learning_style: string | null;
  motivation: string | null;
  shy: string | null;
  letters_level: string | null;
  numbers_level: string | null;
  read_together: string | null;
  favorite_books: string | null;
  talks_after_story: string | null;
  homework_time: string | null;
  who_present: string | null;
  enjoys_learning: string | null;
  subject_likes: string | null;
  subject_struggle: string | null;
  go_to_analogy: string | null;
  doesnt_work: string | null;
  math_anxiety: string | null;
  summary: string;
  strengths: ProfileInsight[];
  growth_areas: ProfileInsight[];
  learning_patterns: LearningPattern[];
  weekly_goals: WeeklyGoals | null;
  created_at: string;
  updated_at: string;
};

/** Parent-set weekly targets, shown against real activity counts on Home — never AI-invented after the fact. */
export type WeeklyGoals = {
  read_together_target: number;
  practice_target: number;
  homework_target: number;
  updated_at: string;
};

export type InsightSource = "report_card" | "assignment" | "session" | "teacher" | "parent";

export type ProfileInsight = {
  id?: string;
  subject: Subject | "general";
  text: string;
  source: InsightSource;
  created_at: string;
  confirmed?: "confirmed" | "corrected" | null;
};

/**
 * Observable learning-confidence pattern — engagement/frustration behavior tied to a
 * subject/context, never a clinical or personality label. Kept separate from the
 * academic strengths/growth_areas model per the app's core "no diagnosis" principle.
 */
export type LearningPattern = {
  id: string;
  subject: Subject | "general";
  observation: string;
  trigger?: string | null;
  parent_response?: string | null;
  helped?: boolean | null;
  source: InsightSource;
  created_at: string;
  confirmed?: "confirmed" | "corrected" | null;
  /** Defaults to true when absent — set false to exclude from AI personalization prompts. */
  used_for_personalization?: boolean;
};

export type ChildProfileInput = Omit<
  ChildProfile,
  "id" | "parent_id" | "summary" | "strengths" | "growth_areas" | "learning_patterns" | "weekly_goals" | "created_at" | "updated_at"
>;

export const EMPTY_CHILD_PROFILE: ChildProfileInput = {
  name: "",
  interests: "",
  hobbies: "",
  favorite_characters: "",
  frustration: "",
  learning_style: "",
  motivation: "",
  shy: "",
  letters_level: "",
  numbers_level: "",
  read_together: "",
  favorite_books: "",
  talks_after_story: "",
  homework_time: "",
  who_present: "",
  enjoys_learning: "",
  subject_likes: "",
  subject_struggle: "",
  go_to_analogy: "",
  doesnt_work: "",
  math_anxiety: "",
};

export type Subject = "math" | "writing" | "reading";

export type Briefing = {
  skill: string;
  why_it_matters: string;
  is_new_concept: boolean;
  analogies: string[];
  household_objects: string[];
  example_questions?: string[];
  followup_questions: string[];
  stuck_tip: string;
  alternate_approach: string;
  watch_for: string;
  praise_phrase: string;
  autonomy_tip: string;
  real_life_connection: string;
  estimated_minutes: string;
  math_anxiety_note: string;
  /** Only present for a logged graded assignment (never a coaching briefing) — see AssignmentRecapView. */
  went_well?: string[];
  to_improve?: string[];
};

export type CheckinAnswers = {
  overall: "great" | "okay" | "rough";
  frustration: "not really" | "a little" | "yes, a lot";
  worked: string;
  notes?: string;
};

export type LibraryCheckinAnswers = {
  response: "really into it" | "okay" | "distracted";
  sparked_conversation: "yes" | "a little" | "not really";
  noticed?: string;
  revisit: "yes" | "not sure" | "move on";
};

export type Session = {
  id: string;
  child_id: string;
  subject: string;
  source: "homework" | "practice" | "library";
  skill: string;
  briefing: Briefing;
  checkin: CheckinAnswers | LibraryCheckinAnswers | null;
  micro_message: string | null;
  parent_notes: string | null;
  book_id: string | null;
  created_at: string;
};

export type Skill = {
  id: string;
  child_id: string;
  subject: string;
  skill_name: string;
  stage: SkillStage;
  updated_at: string;
};

export type Book = {
  id: string;
  child_id: string;
  title: string;
  author: string | null;
  what_it_teaches: string | null;
  discussion_questions: string[] | null;
  read_aloud_tip: string | null;
  estimated_minutes: string | null;
  created_at: string;
};

export type ChatAction = {
  type: "homework" | "progress" | "practice" | "library";
  label: string;
  subject?: Subject;
} | null;

export type ChatMessage = {
  id: string;
  child_id: string;
  role: "user" | "assistant";
  content: string;
  action: ChatAction;
  created_at: string;
  /** Not persisted — set on local error messages so the UI can offer a retry of the original text. */
  retryText?: string;
};
