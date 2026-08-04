/**
 * A curated, hand-authored list of small, real-world fine-motor, social-emotional, and
 * independence practice ideas for a kindergartner — never AI-generated at request time,
 * same principle as the curated standards dataset. Many are drawn directly from NAEYC's
 * family-facing guidance ("Ready or Not, Kindergarten Here We Come!", "Help Your Child
 * Build Fine Motor Skills", and "Building Social and Emotional Skills at Home" —
 * naeyc.org/our-work/families); a few extend that same spirit with everyday practice
 * (ordering food, introducing herself) that isn't a literal NAEYC bullet but fits the same
 * confidence-building intent. Deliberately NOT a formal skill taxonomy or roadmap: these
 * are optional "Growth Moments," not tracked/scored milestones.
 */

export type GrowthMoment = {
  id: string;
  title: string;
  category: "fine-motor" | "social-emotional" | "independence";
  /** One short, concrete real-life activity to try — the "do this" line. */
  activity: (childName: string) => string;
  /** One-line "why this matters" — what the activity builds. */
  benefit: string;
};

export const GROWTH_MOMENTS: GrowthMoment[] = [
  // Independence — NAEYC, "Ready or Not, Kindergarten Here We Come!"
  {
    id: "dress-self",
    title: "Getting dressed on her own",
    category: "independence",
    activity: (name) => `Let ${name} pick out and put on her own clothes this morning, start to finish.`,
    benefit: "Builds the self-dressing independence kindergarten expects from day one.",
  },
  {
    id: "coat-shoes",
    title: "Coat and shoes, start to finish",
    category: "independence",
    activity: (name) => `Have ${name} put on and zip her own coat and put on her own shoes before you leave the house.`,
    benefit: "One less thing a teacher has to help with — and one more thing she's proud she can do herself.",
  },
  {
    id: "bathroom-handwashing",
    title: "Bathroom and handwashing, unprompted",
    category: "independence",
    activity: (name) => `Encourage ${name} to use the bathroom and wash her hands on her own, without reminders.`,
    benefit: "A daily routine kindergarten assumes she can already manage independently.",
  },
  {
    id: "serve-clear",
    title: "Serving and clearing her own plate",
    category: "independence",
    activity: (name) => `Let ${name} serve herself at dinner with a serving spoon, then clear her own plate when she's done.`,
    benefit: "Practices the same self-sufficiency she'll need at the kindergarten lunch table.",
  },
  {
    id: "order-food",
    title: "Ordering for herself",
    category: "independence",
    activity: (name) => `Let ${name} order her own food next time you're out to eat — rehearse what she'll say beforehand.`,
    benefit: "Builds confidence speaking to an adult who isn't you.",
  },
  {
    id: "pack-bag",
    title: "Packing her own bag",
    category: "independence",
    activity: (name) => `Let ${name} pack her own school bag or folder tonight, checking a simple list together first.`,
    benefit: "Practices the planning and self-checking kindergarten mornings run on.",
  },
  {
    id: "make-a-choice",
    title: "Making an age-appropriate choice",
    category: "independence",
    activity: (name) => `Give ${name} two reasonable options for something small — snack, outfit, activity — and let her choose.`,
    benefit: "Builds decision-making confidence in low-stakes moments.",
  },

  // Fine motor — NAEYC, "Help Your Child Build Fine Motor Skills"
  {
    id: "playdough",
    title: "Playdough or clay",
    category: "fine-motor",
    activity: (name) => `Give ${name} playdough or clay to roll, smoosh, pat, and pound — try tools like a popsicle stick or a stamp.`,
    benefit: "Builds the hand strength kindergarten writing depends on.",
  },
  {
    id: "draw-scribble",
    title: "Free drawing and scribbling",
    category: "fine-motor",
    activity: (name) => `Let ${name} draw, scribble, or write freely with crayons, pencils, or markers — no assignment, just practice.`,
    benefit: "Strengthens pencil control before it's asked of her on a worksheet.",
  },
  {
    id: "cutting-practice",
    title: "Cutting along a line",
    category: "fine-motor",
    activity: (name) => `Give ${name} safety scissors and scrap paper to practice cutting along a line.`,
    benefit: "Builds the hand control kindergarten cutting-and-pasting projects need.",
  },
  {
    id: "beads-lacing",
    title: "Beading or lacing",
    category: "fine-motor",
    activity: (name) => `Have ${name} string beads onto a lace, or thread dry pasta onto string.`,
    benefit: "Builds the pincer grip and hand-eye coordination behind good pencil control.",
  },

  // Social-emotional — NAEYC, "Building Social and Emotional Skills at Home"
  {
    id: "puppets-feelings",
    title: "Talking through feelings with a puppet",
    category: "social-emotional",
    activity: (name) => `Use a puppet or stuffed animal to act out a tricky moment — like sharing or losing a game — with ${name}.`,
    benefit: "Puppets give kids a safe way to name and work through big feelings.",
  },
  {
    id: "think-aloud",
    title: "Modeling your own coping out loud",
    category: "social-emotional",
    activity: (name) => `Next time you're frustrated, say your thinking out loud in front of ${name} — "I'm frustrated, so I'm going to take a breath."`,
    benefit: "Modeling how you cope teaches her how to cope.",
  },
  {
    id: "feelings-book",
    title: "Reading about a character's big feeling",
    category: "social-emotional",
    activity: (name) => `Read a picture book with ${name} about a character dealing with a big feeling, and talk about it together.`,
    benefit: "Stories give kids a safe way to explore emotions that are hard to talk about directly.",
  },
  {
    id: "introduce-self",
    title: "Introducing herself",
    category: "social-emotional",
    activity: (name) => `Practice a simple introduction with ${name} — her name, and one thing she likes — then try it for real this week.`,
    benefit: "Gives her words ready to go the next time she meets someone new.",
  },
  {
    id: "handle-losing",
    title: "Handling losing a game",
    category: "social-emotional",
    activity: (name) => `Play a quick game with ${name} where losing is likely, and talk beforehand about what she could say if she loses.`,
    benefit: "Practicing before the real moment makes the real moment easier.",
  },
  {
    id: "express-frustration",
    title: "Using words for frustration",
    category: "social-emotional",
    activity: (name) => `Practice a phrase ${name} can use when she's frustrated, like "I need a break" or "This is hard."`,
    benefit: "Gives her a tool besides tears or shutting down.",
  },
];

export function growthMomentsByCategory(category: GrowthMoment["category"]): GrowthMoment[] {
  return GROWTH_MOMENTS.filter((m) => m.category === category);
}

function hashString(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic weekly pick within a single category — used when Easy has no observed
 * evidence yet for that category, so the parent still sees a concrete, real-life example
 * instead of a bare "not yet observed." Rotates weekly like GrowthMomentCard, but scoped
 * to one category so each of the three "Social" cards can suggest something different.
 */
export function suggestedMomentForCategory(category: GrowthMoment["category"]): GrowthMoment {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.floor(dayOfYear / 7);
  const options = growthMomentsByCategory(category);
  const index = hashString(`${now.getFullYear()}-w${week}-${category}`) % options.length;
  return options[index];
}
