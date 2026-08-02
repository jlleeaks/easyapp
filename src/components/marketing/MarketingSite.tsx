import Link from "next/link";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Wordmark } from "@/components/ui/primitives";
import {
  TornEdge,
  DoodleSprout,
  DoodleOpenBook,
  DoodleHeart,
  DoodlePencil,
  DoodleSparkle,
  DoodleShield,
  DoodleChat,
} from "@/components/marketing/Doodles";

const M = {
  cream: "#FBF3E7",
  creamDeep: "#F3E4C8",
  paper: "#FFFCF6",
  ink: "#2B2318",
  inkSoft: "#6B6151",
  inkFaint: "#948A76",
  line: "#E7DCC5",
};

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#included", label: "What's included" },
  { href: "#research", label: "Our approach" },
];

export function MarketingSite() {
  return (
    <div style={{ background: M.cream, color: M.ink }} className="w-full overflow-x-hidden">
      <Nav />
      <Hero />
      <PrincipleBand />
      <Contrast />
      <HowItWorks />
      <WhatsIncluded />
      <Research />
      <FounderProof />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30" style={{ background: `${M.cream}E8`, backdropFilter: "blur(10px)" }}>
      <div className="max-w-[1160px] mx-auto flex items-center justify-between px-6 sm:px-8 py-4">
        <Wordmark />
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold" style={{ color: M.inkSoft }}>
              {l.label}
            </a>
          ))}
        </nav>
        <Link
          href="/login"
          className="btn-press text-sm font-bold px-5 py-2.5 rounded-full transition-transform duration-150"
          style={{ background: PALETTE.brand, color: "#fff" }}
        >
          Get started
        </Link>
      </div>
    </header>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full"
      style={{ background: PALETTE.goldSoft, color: "#8a5c10", letterSpacing: "0.06em" }}
    >
      {children}
    </span>
  );
}

function Hero() {
  return (
    <section className="relative px-6 sm:px-8 pt-16 sm:pt-20 pb-10">
      <DoodleSprout color={PALETTE.brand} size={34} className="hidden sm:block" />
      <div className="max-w-[820px] mx-auto text-center relative">
        <div
          className="absolute hidden lg:block"
          style={{ top: -6, left: -110, transform: "rotate(-8deg)", color: PALETTE.brand, opacity: 0.8 }}
        >
          <DoodleSprout color={PALETTE.brand} size={44} />
        </div>
        <div
          className="absolute hidden lg:block"
          style={{ top: 30, right: -100, transform: "rotate(10deg)", color: PALETTE.accent, opacity: 0.8 }}
        >
          <DoodlePencil color={PALETTE.accent} size={40} />
        </div>

        <Pill>For parents of Pre-K–3rd graders</Pill>

        <h1
          className="font-fraunces mt-6 mb-5"
          style={{ fontSize: "clamp(34px, 5.2vw, 58px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.01em" }}
        >
          The best tutor your kid will ever have is already home.
        </h1>

        <p className="text-lg mx-auto mb-8" style={{ color: M.inkSoft, maxWidth: 560, lineHeight: 1.55 }}>
          Easy preps you before you teach, and coaches you through it — so you can be the confident teacher
          your kid needs, without guessing. The AI never talks to your child. Not once.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
          <Link
            href="/login"
            className="btn-press text-[15px] font-bold px-7 py-3.5 rounded-full transition-transform duration-150"
            style={{ background: PALETTE.brand, color: "#fff" }}
          >
            Get started
          </Link>
          <a
            href="#how-it-works"
            className="text-[15px] font-bold px-7 py-3.5 rounded-full transition-colors duration-150"
            style={{ color: M.ink, border: `1.5px solid ${M.line}` }}
          >
            See how it works
          </a>
        </div>
        <p className="text-xs font-semibold" style={{ color: M.inkFaint }}>
          Kindergarten, today. 1st–3rd grade, next.
        </p>
      </div>

      <BriefingPreview />
    </section>
  );
}

function BriefingPreview() {
  return (
    <div className="max-w-[720px] mx-auto mt-14 relative">
      <div
        className="absolute hidden sm:block"
        style={{ top: -18, right: 8, transform: "rotate(12deg)", color: PALETTE.gold }}
      >
        <DoodleSparkle color={PALETTE.gold} size={30} />
      </div>
      <div
        className="rounded-[28px] p-2"
        style={{ background: M.paper, border: `1px solid ${M.line}`, boxShadow: "0 30px 60px -30px rgba(43,35,24,0.25)" }}
      >
        <div className="rounded-3xl p-6 sm:p-8" style={{ background: "#fff", border: `1px solid ${M.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 10, background: PALETTE.accent, transform: "rotate(-6deg)" }}
            >
              <span className="text-white text-xs font-bold">Aa</span>
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase" style={{ color: PALETTE.accent, letterSpacing: "0.05em" }}>
                Tonight&apos;s briefing
              </p>
              <p className="text-sm font-bold font-fraunces">Addition within 10</p>
            </div>
          </div>
          <div className="text-left grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl p-3.5" style={{ background: M.cream }}>
              <p className="text-[11px] font-bold uppercase mb-1" style={{ color: M.inkFaint, letterSpacing: "0.04em" }}>
                Try this analogy
              </p>
              <p className="text-sm font-semibold">
                &ldquo;If you have 4 dinosaurs and 3 more show up, how many are stomping around now?&rdquo;
              </p>
            </div>
            <div className="rounded-2xl p-3.5" style={{ background: PALETTE.brandSoft }}>
              <p className="text-[11px] font-bold uppercase mb-1" style={{ color: PALETTE.brand, letterSpacing: "0.04em" }}>
                Say this
              </p>
              <p className="text-sm font-semibold">
                &ldquo;You figured that out yourself — I love how you counted it out.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrincipleBand() {
  return (
    <section className="relative" style={{ background: PALETTE.brandDeep }}>
      <TornEdge fill={PALETTE.brandDeep} />
      <div className="max-w-[720px] mx-auto text-center px-6 py-16 sm:py-20 -mt-8">
        <DoodleShield color="#EFEBDA" size={38} className="mx-auto mb-5 opacity-90" />
        <p
          className="font-fraunces mb-4"
          style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.15, color: "#fff" }}
        >
          The AI never talks to your child.
          <br />
          Not once.
        </p>
        <p className="text-base max-w-[46ch] mx-auto" style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
          Not in homework mode, not in bedtime stories, not when you&apos;re not in the room. Everything Easy
          generates is reviewed and approved by you first — it&apos;s a smarter worksheet, never a chatbot for
          your kid.
        </p>
      </div>
      <TornEdge fill={M.cream} flip />
    </section>
  );
}

function Contrast() {
  return (
    <section className="px-6 sm:px-8 py-16 sm:py-20 text-center">
      <div className="max-w-[680px] mx-auto">
        <p className="font-fraunces mb-2" style={{ fontSize: "clamp(22px, 3.4vw, 30px)", color: M.inkFaint, fontWeight: 500 }}>
          Other AI tutors talk to your kid.
        </p>
        <p className="font-fraunces" style={{ fontSize: "clamp(28px, 4.4vw, 40px)", color: PALETTE.accent, fontWeight: 600 }}>
          Easy talks to you.
        </p>
        <p className="text-base mt-5 max-w-[52ch] mx-auto" style={{ color: M.inkSoft, lineHeight: 1.6 }}>
          Kids under 2nd or 3rd grade learn best from someone they trust — not a screen. So instead of building
          a better chatbot, we built a coach for the person your kid already trusts most: you.
        </p>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: DoodlePencil,
    color: PALETTE.accent,
    soft: PALETTE.accentSoft,
    title: "Snap it, or skip it",
    body: "Photograph tonight's worksheet, or let Easy suggest a lesson built around your kid when there isn't any homework.",
  },
  {
    icon: DoodleOpenBook,
    color: PALETTE.gold,
    soft: PALETTE.goldSoft,
    title: "Get briefed, not handed a script",
    body: "What to teach, why it matters at this stage, and exactly how to explain it using what your kid already loves.",
  },
  {
    icon: DoodleHeart,
    color: PALETTE.brand,
    soft: PALETTE.brandSoft,
    title: "You teach. We prepped you.",
    body: "You're still the one in the room. Easy's job ends the moment yours begins.",
  },
  {
    icon: DoodleSparkle,
    color: PALETTE.accent,
    soft: PALETTE.accentSoft,
    title: "It remembers next time",
    body: "Tell us how it went in under a minute, and every future lesson gets sharper about your specific kid.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 sm:px-8 py-16 sm:py-20">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center mb-12">
          <Pill>Driven by design, not scores</Pill>
          <h2 className="font-fraunces mt-4" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600 }}>
            How Easy works
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-3xl p-6 text-left"
              style={{
                background: M.paper,
                border: `1px solid ${M.line}`,
                transform: i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)",
              }}
            >
              <div
                className="flex items-center justify-center mb-4"
                style={{ width: 52, height: 52, borderRadius: RADIUS.md, background: s.soft }}
              >
                <s.icon color={s.color} size={26} />
              </div>
              <p className="font-fraunces font-semibold mb-1.5" style={{ fontSize: 18 }}>
                {s.title}
              </p>
              <p className="text-sm" style={{ color: M.inkSoft, lineHeight: 1.5 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: DoodlePencil,
    color: PALETTE.accent,
    soft: PALETTE.accentSoft,
    title: "Homework Helper",
    body: "Photograph any kindergarten worksheet and get a full teaching briefing in under a minute.",
  },
  {
    icon: DoodleOpenBook,
    color: PALETTE.brand,
    soft: PALETTE.brandSoft,
    title: "Bedtime story guide",
    body: "Themes, discussion questions, and read-aloud tips for books your family already owns.",
  },
  {
    icon: DoodleSparkle,
    color: PALETTE.gold,
    soft: PALETTE.goldSoft,
    title: "Tonight's suggested lesson",
    body: "No homework? Easy builds a five-minute lesson around what's clicking and what needs more time.",
  },
  {
    icon: DoodleHeart,
    color: PALETTE.accent,
    soft: PALETTE.accentSoft,
    title: "Progress, not scores",
    body: "Not yet introduced → just starting → getting there → comfortable. No grades, no percentiles, ever.",
  },
  {
    icon: DoodleChat,
    color: PALETTE.brand,
    soft: PALETTE.brandSoft,
    title: "Visible iteration",
    body: "Easy tells you exactly what it's adjusting and why, every time — never a silent backend update.",
  },
  {
    icon: DoodleShield,
    color: PALETTE.gold,
    soft: PALETTE.goldSoft,
    title: "Built on the safety principle",
    body: "No live AI-child interaction, no session recording, ever. It's the one rule nothing else overrides.",
  },
];

function WhatsIncluded() {
  return (
    <section id="included" className="relative" style={{ background: M.creamDeep }}>
      <TornEdge fill={M.creamDeep} />
      <div className="max-w-[1080px] mx-auto px-6 sm:px-8 py-16 sm:py-20 -mt-8">
        <div className="text-center mb-12">
          <h2 className="font-fraunces" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600 }}>
            What&apos;s included
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl p-6 text-left" style={{ background: M.paper, border: `1px solid ${M.line}` }}>
              <div
                className="flex items-center justify-center mb-4"
                style={{ width: 44, height: 44, borderRadius: RADIUS.sm, background: f.soft }}
              >
                <f.icon color={f.color} size={22} />
              </div>
              <p className="font-fraunces font-semibold mb-1.5" style={{ fontSize: 17 }}>
                {f.title}
              </p>
              <p className="text-sm" style={{ color: M.inkSoft, lineHeight: 1.5 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
      <TornEdge fill={M.cream} flip />
    </section>
  );
}

const RESEARCH = [
  {
    title: "Vygotsky's Zone of Proximal Development",
    body: "Kids learn best just past what they can do alone, with guidance from someone they trust — not solo, not passively.",
  },
  {
    title: "Bloom's two-sigma problem",
    body: "One-on-one tutoring reliably outperforms group instruction by roughly two standard deviations. Easy tries to make that kind of attention achievable at home.",
  },
  {
    title: "Process praise, not person praise",
    body: "“You worked hard on that” builds persistence in 5–6 year olds. “You're so smart” measurably doesn't. Every briefing hands you the exact phrasing.",
  },
  {
    title: "Math-anxiety transmission",
    body: "Math-anxious parents' kids learn measurably less — but giving those parents more structure changes the outcome. That's the exact mechanism Easy is built around.",
  },
];

function Research() {
  return (
    <section id="research" className="px-6 sm:px-8 py-16 sm:py-20">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-12">
          <Pill>Grounded in real research</Pill>
          <h2 className="font-fraunces mt-4" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600 }}>
            Our approach isn&apos;t a guess
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {RESEARCH.map((r) => (
            <div key={r.title} className="rounded-3xl p-6" style={{ background: M.paper, border: `1px solid ${M.line}` }}>
              <p className="font-fraunces font-semibold mb-2" style={{ fontSize: 16 }}>
                {r.title}
              </p>
              <p className="text-sm" style={{ color: M.inkSoft, lineHeight: 1.55 }}>
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderProof() {
  return (
    <section className="px-6 sm:px-8 py-16 sm:py-20" style={{ background: M.creamDeep }}>
      <div className="max-w-[820px] mx-auto text-center">
        <Pill>Already tested at scale</Pill>
        <h2 className="font-fraunces mt-4 mb-5" style={{ fontSize: "clamp(26px, 3.6vw, 34px)", fontWeight: 600 }}>
          This isn&apos;t a technology bet with research cited after the fact.
        </h2>
        <p className="text-base mb-9 max-w-[58ch] mx-auto" style={{ color: M.inkSoft, lineHeight: 1.6 }}>
          The parent-mediated model behind Easy was already run once, at real scale, under bad conditions —
          before AI was ever the mechanism.
        </p>
        <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
          {[
            ["20,000+", "kids reached"],
            ["20+", "schools"],
            ["2.5 yrs", "as founder & ops lead"],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <p className="font-fraunces" style={{ fontSize: 34, fontWeight: 600, color: PALETTE.brand }}>
                {stat}
              </p>
              <p className="text-xs font-semibold uppercase mt-1" style={{ color: M.inkFaint, letterSpacing: "0.04em" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-6 sm:px-8 py-20 sm:py-24 text-center">
      <DoodleSprout color={PALETTE.brand} size={30} className="mx-auto mb-5" />
      <h2 className="font-fraunces mb-7" style={{ fontSize: "clamp(28px, 4.4vw, 42px)", fontWeight: 600 }}>
        Start teaching, tonight.
      </h2>
      <Link
        href="/login"
        className="btn-press inline-flex text-[15px] font-bold px-8 py-4 rounded-full transition-transform duration-150"
        style={{ background: PALETTE.brand, color: "#fff" }}
      >
        Get started free
      </Link>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "What's included", href: "#included" },
      { label: "Our approach", href: "#research" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create an account", href: "/login" },
    ],
  },
];

function Footer() {
  return (
    <footer className="relative" style={{ background: M.creamDeep }}>
      <TornEdge fill={M.creamDeep} />
      <div className="max-w-[1080px] mx-auto px-6 sm:px-8 pt-10 pb-4">
        <div className="flex flex-wrap gap-12 justify-between mb-16">
          <div style={{ maxWidth: 260 }}>
            <Wordmark />
            <p className="text-sm mt-3" style={{ color: M.inkSoft, lineHeight: 1.5 }}>
              An AI coaching layer for parents — never a chatbot for kids.
            </p>
          </div>
          <div className="flex flex-wrap gap-14">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-bold uppercase mb-3" style={{ color: M.inkFaint, letterSpacing: "0.05em" }}>
                  {col.heading}
                </p>
                <div className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <a key={l.label} href={l.href} className="text-sm font-semibold" style={{ color: M.ink }}>
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex items-center justify-between flex-wrap gap-2 pb-6 pt-4"
          style={{ borderTop: `1px solid ${M.line}` }}
        >
          <p className="text-xs" style={{ color: M.inkFaint }}>
            © 2026 Easy. Made for parents, not investors in your kid&apos;s screen time.
          </p>
        </div>
        <p
          className="font-fraunces select-none pointer-events-none leading-none overflow-hidden"
          style={{
            fontSize: "clamp(64px, 15vw, 180px)",
            fontWeight: 600,
            color: M.line,
            marginBottom: -20,
            whiteSpace: "nowrap",
          }}
        >
          Easy
        </p>
      </div>
    </footer>
  );
}
