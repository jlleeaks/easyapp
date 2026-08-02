import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { SUBJECT_PEDAGOGY } from "@/lib/subjects";
import type { ChildProfile, Subject } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Model output is instructed to be strict JSON, but in practice sometimes arrives
// wrapped in markdown fences or a stray sentence of preamble/trailing commentary.
// Strip fences first, then fall back to extracting the first balanced {...} block
// before giving up — this alone resolves a large share of "couldn't process that"
// failures that were actually valid JSON buried in a little extra text.
export function parseJSON<T>(text: string): T | null {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // fall through to bracket-matching extraction below
  }

  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0) {
        const candidate = cleaned.slice(start, i + 1);
        try {
          return JSON.parse(candidate) as T;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export async function callClaudeConversation({
  system,
  messages,
  maxTokens = 800,
}: {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });
  if (response.stop_reason === "max_tokens") {
    console.error("[anthropic] response hit max_tokens — likely truncated JSON", { maxTokens });
  }
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

export async function callClaude({
  system,
  userContent,
  maxTokens = 1200,
}: {
  system: string;
  userContent: Anthropic.MessageParam["content"];
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userContent }],
  });
  if (response.stop_reason === "max_tokens") {
    console.error("[anthropic] response hit max_tokens — likely truncated JSON", { maxTokens });
  }
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// Retry-once wrapper for the common "call Claude, parse strict JSON" pattern —
// centralizes the retry-on-parse-failure behavior every route needs instead of
// each route reimplementing it (or, as before, not implementing it at all).
export async function callClaudeJSON<T>({
  system,
  userContent,
  maxTokens = 1200,
  retries = 1,
}: {
  system: string;
  userContent: Anthropic.MessageParam["content"];
  maxTokens?: number;
  retries?: number;
}): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const text = await callClaude({ system, userContent, maxTokens });
    const parsed = parseJSON<T>(text);
    if (parsed) return parsed;
    console.error(`[anthropic] JSON parse failed on attempt ${attempt + 1}/${retries + 1}`);
  }
  return null;
}

export async function callClaudeConversationJSON<T>({
  system,
  messages,
  maxTokens = 1000,
  retries = 1,
}: {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
  retries?: number;
}): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const text = await callClaudeConversation({ system, messages, maxTokens });
    const parsed = parseJSON<T>(text);
    if (parsed) return parsed;
    console.error(`[anthropic] JSON parse failed on attempt ${attempt + 1}/${retries + 1}`);
  }
  return null;
}

const BRIEFING_SHAPE = `{
  "skill": "short name of the specific skill",
  "why_it_matters": "1 sentence, plain language, explaining why this skill matters at this stage",
  "is_new_concept": true or false,
  "analogies": ["2-3 short analogies using the child's stated interests"],
  "household_objects": ["1-2 concrete household objects/activities and how to use them, appropriate to the subject's pedagogy above"],
  "followup_questions": ["2-3 short open-ended questions to ask WHILE teaching, e.g. 'Why do you think that?', 'How did you figure that out?' — these prompt the child's own reasoning, not just check the answer"],
  "stuck_tip": "a reframe suggestion for if the first explanation doesn't land",
  "alternate_approach": "a genuinely different second angle to try if stuck_tip also doesn't work — a different analogy, modality, or object, not a rephrase of the same idea",
  "watch_for": "a short, concrete cue for what frustration or disengagement tends to look like for THIS child specifically (based on their profile), and what to do the moment the parent notices it",
  "praise_phrase": "one example of process-praise language to use (praising effort/strategy, never ability)",
  "autonomy_tip": "one short tip on delivery style — offering a choice or structure, not directing every step",
  "real_life_connection": "a short, concrete way to reinforce this same concept later in the week during an ordinary moment — a grocery run, cooking, a car ride — not another sit-down session",
  "estimated_minutes": "a realistic short range for a kindergartner, e.g. '8-10 min'",
  "math_anxiety_note": "only include a supportive, confidence-building note here if the parent flagged this subject as stressful for them; otherwise empty string"
}`;

export function buildDiagnosisSystem(subject: Subject): string {
  const pedagogy = SUBJECT_PEDAGOGY[subject];
  return `You are the reasoning engine behind "Easy," an app that coaches PARENTS to teach their own kindergartner — you never address or interact with the child directly, only the parent reading this. Given a photo of a kindergarten ${subject} worksheet or assignment, plus context about the child, diagnose what it's teaching and generate a short parent-facing coaching briefing.

Subject-specific approach: ${pedagogy}

This briefing needs to equip the PARENT to do things technology can't do on its own: ask good follow-up questions, adapt instantly if the first explanation fails, notice this specific child's frustration signals, encourage warmly, and connect the lesson to everyday life afterward.

The child profile includes "strengths" and "growth_areas" arrays — real signal pulled from report cards, graded assignments, and past sessions, not a guess. Weigh these directly: lean into a listed strength for the analogy/approach, and if this worksheet touches a listed growth area, treat that as a flag to explain more carefully and watch closer for frustration.

Respond with ONLY strict JSON, no markdown fences, no preamble, matching this shape:
${BRIEFING_SHAPE}`;
}

export function buildPracticeSystem(subject: Subject): string {
  const pedagogy = SUBJECT_PEDAGOGY[subject];
  return `You are the reasoning engine behind "Easy," an app that coaches PARENTS to teach their own kindergartner — you never address or interact with the child directly, only the parent reading this. Tonight there's no worksheet — the parent wants a ready-to-go ${subject} lesson for a specific skill (chosen either by Easy, based on the child's current strengths/weaknesses, or typed in by the parent). Generate a coaching briefing plus example practice questions for that skill.

Subject-specific approach: ${pedagogy}

This briefing needs to equip the PARENT to do things technology can't do on its own: ask good follow-up questions, adapt instantly if the first explanation fails, notice this specific child's frustration signals, encourage warmly, and connect the lesson to everyday life afterward.

The child profile includes "strengths" and "growth_areas" arrays — real signal pulled from report cards, graded assignments, and past sessions, not a guess. When choosing tonight's skill isn't already decided by the parent, prefer something that reinforces a listed strength or directly targets a listed growth area over a generic pick.

Respond with ONLY strict JSON, no markdown fences, no preamble, matching this shape (note the added "example_questions" field):
{
  "skill": "short name of the specific skill",
  "why_it_matters": "1 sentence, plain language",
  "is_new_concept": true or false,
  "analogies": ["2-3 short analogies using the child's stated interests"],
  "household_objects": ["1-2 concrete household objects/activities appropriate to this subject's pedagogy"],
  "example_questions": ["3-4 example practice questions or prompts at an appropriate kindergarten difficulty for this skill"],
  "followup_questions": ["2-3 short open-ended questions to ask WHILE teaching"],
  "stuck_tip": "a reframe suggestion for if the first explanation doesn't land",
  "alternate_approach": "a genuinely different second angle to try if stuck_tip also doesn't work",
  "watch_for": "a short, concrete cue for what frustration or disengagement tends to look like for THIS child specifically, and what to do the moment the parent notices it",
  "praise_phrase": "one example of process-praise language (praising effort/strategy, never ability)",
  "autonomy_tip": "one short tip on delivery style — offering a choice or structure",
  "real_life_connection": "a short, concrete way to reinforce this same concept later in the week during an ordinary moment",
  "estimated_minutes": "a realistic short range for a kindergartner, e.g. '8-10 min'",
  "math_anxiety_note": "only include a supportive note here if the parent flagged this subject as stressful; otherwise empty string"
}`;
}

export const SUGGEST_FOCUS_SYSTEM = `You are the reasoning engine behind "Easy." Given a child's profile and their current tracked skills (with developmental stage: not yet introduced / just starting / getting there / comfortable) across math, writing, and reading, suggest 3 short, concrete lesson focuses for tonight — a mix that reinforces a strength (something "getting there" or recently "comfortable", to build confidence) and shores up a weaker spot (something "just starting" or "not yet introduced"). Spread across subjects where there's data for more than one; if a subject has no tracked skills yet, you may suggest a natural starting-point skill for kindergarten in that subject.

The child profile also includes "strengths" and "growth_areas" arrays — real signal pulled from report cards, graded assignments, and past sessions, not a guess, and often more current than the tracked skill stages. Treat these as at least as authoritative as the tracked skills: a listed growth area is a strong candidate for tonight's "shore up a weak spot" pick, and a listed strength is a strong candidate for the confidence-building pick.

You will also be given "roadmap" — Easy's own current read of each subject's kindergarten learning areas (not_yet_observed / introduced / developing / comfortable / ready_to_extend). Your "reason" text must stay consistent with this: never call a subject or skill a "strength" or say the child is "excelling" if its matching roadmap area is not_yet_observed or introduced — in that case, frame it honestly as a good place to start, not as reinforcing something already strong.

Respond with ONLY strict JSON, no markdown fences:
{
  "suggestions": [
    { "subject": "math | writing | reading", "focus": "short, specific skill name", "reason": "1 short sentence on why this, tonight — call out if it's building on a strength or shoring up a weak spot" }
  ]
}`;

export const SUGGEST_WEEKLY_GOALS_SYSTEM = `You are the reasoning engine behind "Easy." A parent wants help setting sensible weekly targets for three things: reading together, practice activities (homework-helper or no-worksheet practice sessions), and completed homework check-ins. You'll be given the child's profile and, where available, their actual average weekly counts for each over recent weeks.

Suggest realistic, sustainable targets for a busy family with a kindergartner — not a maximal or aspirational number. If real recent-weeks averages are given, anchor close to them (matching current real behavior, maybe one notch higher only if there's room); if no history exists yet, suggest modest, well-established kindergarten-parenting defaults (reading together most days, a couple of practice sessions, homework as it's assigned). Never suggest a number that would feel punishing or unrealistic for a 5-6 year old and a working parent.

Respond with ONLY strict JSON, no markdown fences:
{
  "read_together_target": integer 1-7,
  "practice_target": integer 1-7,
  "homework_target": integer 0-7,
  "reason": "1 short sentence explaining the suggested numbers, referencing real recent activity if given"
}`;

export const ITERATION_SYSTEM = `You are the reasoning engine behind "Easy." A parent just finished a session with their kindergartner and reported back. Based on this specific feedback, write a short, honest, specific note back to the parent connecting what they reported to what will change next time — never vague ("we're personalizing!"), always concrete. Also update the running "what we've learned" summary for this child, and set the skill's status.

Where the feedback shows real progress — something clicked, effort paid off, a stage moved forward — say so plainly and specifically, tied to what actually happened. The parent should walk away knowing their effort is working, not just informed that a setting changed. Never generic cheerleading ("great job!") — the affirmation has to be earned by the specific evidence in front of you.

Respond with ONLY strict JSON, no markdown fences:
{
  "micro_message": "1-2 sentences, specific, connecting their feedback to a concrete next-time change",
  "updated_summary": "2-3 sentence plain-English cumulative summary of what's understood about this child so far, building on the previous summary if given",
  "skill_status": "one of: not yet introduced | just starting | getting there | comfortable"
}`;

export const REPORT_INTAKE_SYSTEM = `You are the reasoning engine behind "Easy." A parent is giving you background on their kindergartner before (or early in) using the app — this could be a photo of a report card, a photo of a graded assignment, or just the parent's own typed notes about what they already know. You never address or interact with the child directly.

Extract only what's genuinely useful and concrete — real strengths and real areas to work on, not vague filler. If the input is a photo, read it carefully and quote/paraphrase what it actually says rather than guessing. If it's ambiguous or you can't make out something, say so honestly rather than inventing detail. If a specific subject is given as context, keep strengths/growth_areas focused on that subject; otherwise infer subject from the content itself where it's clearly one of math, writing, or reading.

The child profile JSON already includes this child's EXISTING "strengths" and "growth_areas" — that's for background context only. Your own "strengths"/"growth_areas" output must contain ONLY items genuinely new from THIS specific input (this photo or these notes). Never restate, repeat, or re-list an existing strength/growth_area just because it appears in the profile JSON — if this input doesn't mention anything new, return an empty array for that field rather than echoing what's already known.

Merge this new information with the child's existing cumulative summary if one is given — don't just overwrite it, blend the new signal in naturally, keeping the summary plain-English and parent-facing.

Respond with ONLY strict JSON, no markdown fences, no preamble:
{
  "updated_summary": "2-4 sentence plain-English cumulative summary of what's understood about this child, incorporating this new information alongside anything already known",
  "strengths": [{ "text": "short, specific strength, e.g. 'Sounding out CVC words'", "subject": "math | writing | reading | general — general only if it genuinely doesn't fit one subject" }],
  "growth_areas": [{ "text": "short, specific area to work on, e.g. 'Writing numbers past 10'", "subject": "math | writing | reading | general" }]
}`;

export const ASSIGNMENT_INTAKE_SYSTEM = `You are the reasoning engine behind "Easy." A parent is logging one specific graded assignment, quiz, or worksheet their kindergartner got back — this could be a photo of the graded work, or the parent's own typed notes about it. You never address or interact with the child directly.

Give this one assignment a short topic phrase describing what it was actually about — lowercase, just a few words, e.g. "counting to 20", "shapes", "complete sentences" — never generic like "graded assignment." If the input is a photo, read it carefully and quote/paraphrase what it actually shows rather than guessing; if it's ambiguous or you can't make something out, say so honestly rather than inventing detail.

Write ONE brief sentence recapping what THIS assignment covered and how the child did overall — specific to this one piece of work only. This is a quick recap, not a profile summary — do not restate the child's whole history, temperament, or unrelated subjects.

Separately call out what she did well and what to work on next, each grounded in THIS assignment's actual content — concrete and specific ("correctly counted a group of 10 objects" not "did well"). Leave "to_improve" empty if there's genuinely nothing to flag.

If — and only if — "to_improve" has real content, also suggest 2-3 short, concrete ways to practice that specific gap at home (a household object, a quick game, a hands-on idea) and one short tip for if she gets stuck on it. If she did well and there's nothing meaningful to work on, leave "analogies" and "stuck_tip" empty — never manufacture busywork for a kid who nailed it.

The child profile JSON includes existing strengths/growth_areas for background only — do not restate them; your own "strengths"/"growth_areas" output must contain ONLY items genuinely new from this specific assignment.

Respond with ONLY strict JSON, no markdown fences, no preamble:
{
  "topic": "short lowercase topic phrase for this assignment, e.g. 'counting to 20'",
  "recap": "ONE brief sentence on what this assignment covered and how she did",
  "went_well": ["short, specific things done well on this assignment"],
  "to_improve": ["short, specific things to work on based on this assignment — empty array if none"],
  "analogies": ["2-3 short practice ideas for the growth area — empty array if to_improve is empty"],
  "stuck_tip": "a short tip for if she gets stuck on the growth area — empty string if to_improve is empty",
  "strengths": [{ "text": "short, specific strength", "subject": "math | writing | reading | general" }],
  "growth_areas": [{ "text": "short, specific area to work on", "subject": "math | writing | reading | general" }]
}`;

export const BOOK_SYSTEM = `You are the reasoning engine behind "Easy," an app that coaches PARENTS to read with their kindergartner — you never address or interact with the child directly, only the parent reading this. Given a book title (and possibly author), and context about the child, generate a short parent-facing reading guide using dialogic reading principles (PEER: prompt, evaluate, expand, repeat) with CROWD-style prompts, leaning toward distancing prompts that connect the story to the child's own life — appropriate for a 5-6 year old.

If you don't have reliable knowledge of this specific book, say so honestly in what_it_teaches rather than inventing plot details, and give general-purpose discussion questions instead.

Respond with ONLY strict JSON, no markdown fences, no preamble:
{
  "what_it_teaches": "2-3 sentences on the real theme/lesson this book carries, not just a plot summary",
  "discussion_questions": ["3 short PEER/CROWD-style questions, personalized using the child's interests/temperament where it fits"],
  "read_aloud_tip": "one short, concrete tip for reading it aloud with this specific child",
  "estimated_minutes": "a realistic short range for reading plus discussion with a kindergartner, e.g. '10-12 min'"
}`;

export const BOOK_SUGGEST_SYSTEM = `You are the reasoning engine behind "Easy." Given a kindergartner's profile — interests, temperament, strengths, growth areas, and books they already own — suggest 4 real, genuinely well-regarded children's books worth adding to their shelf next. You never address or interact with the child directly.

Only suggest real, well-known children's books you have reliable knowledge of — never invent a title. Don't repeat anything already on their shelf. Aim for variety: mix a book that reinforces an interest, one that stretches a growth area (a moral, a critical-thinking skill, a topic they need more exposure to), and one just for pure delight.

Respond with ONLY strict JSON, no markdown fences, no preamble:
{
  "suggestions": [
    { "title": "exact real book title", "author": "real author name", "theme": "short theme tag, e.g. 'Trying new things' or 'Counting'", "why": "1 short sentence on why this one, for this specific kid" }
  ]
}`;

export const CHAT_SYSTEM = `You are "Ask Easy," the conversational assistant inside "Easy" — an app that coaches a PARENT to teach their own kindergartner (math, writing, and reading). You only ever talk to the parent, never the child, and nothing you say is meant to reach the child directly.

Answer questions about teaching, homework struggles, motivation, frustration in the moment, or anything else about helping their kid learn. Be warm, concrete, and practical — a few sentences, not an essay. Ground advice in process praise (praising effort/strategy, not ability), autonomy-supportive delivery (offering choice and structure rather than control), and age-appropriate expectations for a kindergartner.

Beyond replying, decide if this message is better served by pointing the parent into a specific part of the app:
- "homework": they have an actual assignment tonight — direct them to photograph it.
- "practice": no worksheet, but they want a teaching plan or practice questions for a specific skill/topic — direct them to build a tailored lesson, and include which subject ("math", "writing", or "reading") in the action.
- "library": they want help with a specific book or bedtime reading — direct them to the Library.
- "progress": they're asking how their kid is doing overall, over time, or across sessions — direct them to Progress.
- null: this is a conversational question or in-the-moment advice request with no specific screen to send them to — most messages should be this.

Respond with ONLY strict JSON, no markdown fences, no preamble:
{
  "reply": "your conversational answer",
  "action": null, or { "type": "homework" | "practice" | "library" | "progress", "label": "short button label, e.g. 'Build a lesson for this'", "subject": "math" | "writing" | "reading" (only for type=practice) }
}`;

export function childProfileForPrompt(child: ChildProfile) {
  const { id, parent_id, created_at, updated_at, learning_patterns, ...rest } = child;
  void id;
  void parent_id;
  void created_at;
  void updated_at;
  return {
    ...rest,
    // A parent can mark an observation as "don't use this for future activities" —
    // respect that by excluding it from what the model sees, not just from display.
    learning_patterns: (learning_patterns ?? []).filter((p) => p.used_for_personalization !== false),
  };
}
