/**
 * A curated, hand-authored list of small, real-world social-emotional and independence
 * practice ideas for a kindergartner — never AI-generated at request time, same principle
 * as the curated standards dataset. Deliberately NOT a formal skill taxonomy or roadmap:
 * these are optional "Growth Moments," not tracked/scored milestones.
 */

export type GrowthMoment = {
  id: string;
  title: string;
  category: "independence" | "social-emotional";
  description: (childName: string) => string;
};

export const GROWTH_MOMENTS: GrowthMoment[] = [
  {
    id: "order-food",
    title: "Ordering for herself",
    category: "independence",
    description: (name) =>
      `Let ${name} practice ordering for herself next time you're out. Rehearse what she'll say before you go, then give her the chance to try — step in only if she asks for help.`,
  },
  {
    id: "ask-for-help",
    title: "Asking a trusted adult for help",
    category: "independence",
    description: (name) =>
      `Practice the words ${name} could use to ask a trusted adult for help. Role-play a low-pressure version at home, then create a real chance for her to use it this week.`,
  },
  {
    id: "introduce-self",
    title: "Introducing herself",
    category: "social-emotional",
    description: (name) =>
      `Practice a simple introduction with ${name} — name, and one thing she likes. Try it together at a park, class, or family gathering this week.`,
  },
  {
    id: "pack-bag",
    title: "Packing her own bag",
    category: "independence",
    description: (name) =>
      `Let ${name} pack her own school bag or folder tonight, checking a simple list together first. Resist fixing it for her — let her notice what's missing.`,
  },
  {
    id: "tough-puzzle",
    title: "Sticking with a challenging puzzle",
    category: "social-emotional",
    description: (name) =>
      `Give ${name} a puzzle that's a little harder than usual. When she gets frustrated, resist solving it for her — ask "What could you try next?" instead.`,
  },
  {
    id: "handle-losing",
    title: "Handling losing a game",
    category: "social-emotional",
    description: (name) =>
      `Play a quick game with ${name} where losing is likely. Beforehand, talk about what she could say or do if she loses — then let the real moment happen.`,
  },
  {
    id: "make-a-choice",
    title: "Making an age-appropriate choice",
    category: "independence",
    description: (name) =>
      `Give ${name} two reasonable options for something small — snack, outfit, activity — and let her choose without you steering the decision.`,
  },
  {
    id: "express-frustration",
    title: "Using words for frustration",
    category: "social-emotional",
    description: (name) =>
      `Practice a phrase ${name} can use when she's frustrated, like "I need a break" or "This is hard." Model it yourself first, then notice if she reaches for it this week.`,
  },
  {
    id: "clean-up",
    title: "Cleaning up after an activity",
    category: "independence",
    description: (name) =>
      `Let ${name} clean up after an activity on her own, start to finish. Narrate the steps once, then let her carry it out without taking over.`,
  },
  {
    id: "follow-routine",
    title: "Following a simple routine alone",
    category: "independence",
    description: (name) =>
      `Pick one small routine — brushing teeth, getting shoes on — and let ${name} do every step herself this week, even if it's slower than you doing it.`,
  },
];
