import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Heart,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Brand } from "@/components/easy/Brand";
import { TrailGuide } from "@/components/easy/TrailGuide";
import { InterestDemo } from "./InterestDemo";
const nights = [
  {
    night: "01",
    title: "A good place to start.",
    note: "Maya loves dinosaurs. Let’s try counting with a little herd.",
    detail: "We start with what you share.",
    color: "blue",
  },
  {
    night: "08",
    title: "Oh, that clicked.",
    note: "Moving the dinosaurs helped. We’ll lead with hands-on objects next time.",
    detail: "Your observations shape the next lesson.",
    color: "green",
  },
  {
    night: "20",
    title: "Look how far you’ve come.",
    note: "Maya is more comfortable counting objects. Let’s explore comparing two groups.",
    detail: "The path grows as you learn together.",
    color: "yellow",
  },
];
export function MarketingSite() {
  return (
    <div className="marketing-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="marketing-nav">
        <div className="marketing-container nav-inner">
          <Brand />
          <nav aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#the-roadmap">The roadmap</a>
            <a href="#questions">Good questions</a>
          </nav>
          <Link href="/login" className="nav-login">
            Log in <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main-content">
        <section className="marketing-container hero-section">
          <div className="hero-copy">
            <span className="eyebrow-pill">
              <span className="live-dot" /> FOR THE PARENT. FOR THEIR
              POSSIBILITIES.
            </span>
            <h1>
              Little lessons.
              <br />
              <span>Big possibilities.</span>
            </h1>
            <p className="hero-description">
              You know your kid.
              <br />
              We help you know what comes next.
            </p>
            <p className="hero-body">
              An adaptive AI platform that turns everyday moments into a clear
              path forward. You bring the connection. Easy brings the plan.
            </p>
            <Link className="easy-button" href="/login">
              Let’s grow together <ArrowRight size={19} />
            </Link>
            <p className="hero-reassurance">
              <Clock3 size={16} /> 15–20 minutes together. One meaningful next
              step.
            </p>
            <div className="parent-first">
              <ShieldCheck size={23} />
              <span>
                Today, every lesson goes through you first.
                <br />
                <strong>You’re the teacher. We’re here for you.</strong>
              </span>
            </div>
          </div>
          <InterestDemo />
        </section>
        <div className="promise-band">
          <span>
            <Heart size={18} /> Parent-led, connection-first
          </span>
          <span>
            <Route size={18} /> A path that grows with them
          </span>
          <span>
            <Sparkles size={18} /> Small moments that matter
          </span>
        </div>
        <section className="marketing-container problem-section">
          <div>
            <span className="section-kicker">
              YOU DON’T NEED TO HAVE ALL THE ANSWERS
            </span>
            <h2>
              “I want to help.
              <br />
              Where do I start?”
            </h2>
          </div>
          <div>
            <p>
              You’ve got a kitchen table, a handful of blocks, and a kid with a
              world of questions. What you need is a little direction.
            </p>
            <p>
              Easy helps you choose what to work on, find an explanation that
              makes sense, and notice what’s clicking. One evening at a time.
            </p>
          </div>
        </section>
        <section id="how-it-works" className="how-section">
          <div className="marketing-container">
            <div className="section-heading">
              <span className="section-kicker">
                A LITTLE STRUCTURE. A LOT OF CONNECTION.
              </span>
              <h2>Your evening, made a little easier.</h2>
              <p>
                15-20 minutes of real, focused progress, a genuine daily habit,
                not a quick task.
              </p>
            </div>
            <div className="how-grid">
              {[
                {
                  icon: Heart,
                  n: "01",
                  title: "Notice their world",
                  text: "Tell us what they love, where they get stuck, and what already works.",
                },
                {
                  icon: Route,
                  n: "02",
                  title: "See a path forward",
                  text: "A roadmap brings the next learning step into focus. No worksheet needed.",
                },
                {
                  icon: BookOpen,
                  n: "03",
                  title: "Make it yours",
                  text: "Review the plan, grab a few everyday objects, and teach in your own voice.",
                },
                {
                  icon: MessageCircle,
                  n: "04",
                  title: "Tell us what clicked",
                  text: "A quick parent check-in helps shape the next lesson. You’ll see what changes, and why.",
                },
              ].map((item) => (
                <article className="how-card" key={item.n}>
                  <div className="how-card-top">
                    <item.icon size={27} />
                    <span>{item.n}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <div className="plan-payoff">
              <Check size={20} />
              <span>
                A thoughtful plan for tonight. A clearer picture for tomorrow.
              </span>
            </div>
          </div>
        </section>
        <section className="marketing-container learning-story">
          <div className="section-heading">
            <span className="section-kicker">
              PERSONALIZATION YOU CAN ACTUALLY SEE
            </span>
            <h2>Watch Easy learn Maya.</h2>
            <p>
              An illustrative journey: the more you notice, the better the next
              step fits.
            </p>
          </div>
          <div className="night-grid">
            {nights.map((night, i) => (
              <article
                className={`night-card night-${night.color}`}
                key={night.night}
              >
                <span className="night-label">NIGHT {night.night}</span>
                <div className="night-art" aria-hidden="true">
                  <TrailGuide variant={i === 0 ? "blue" : "green"} />
                  <span className="night-spark">
                    {i === 0 ? "?" : i === 1 ? "!" : "✦"}
                  </span>
                </div>
                <h3>{night.title}</h3>
                <p>{night.note}</p>
                <div className="night-footer">{night.detail}</div>
              </article>
            ))}
          </div>
        </section>
        <section id="the-roadmap" className="roadmap-story marketing-container">
          <div>
            <span className="section-kicker">
              THE BIG PICTURE, ONE LITTLE STEP AT A TIME
            </span>
            <h2>
              A roadmap.
              <br />
              Not a guessing game.
            </h2>
            <p>
              See what you’ve explored, what needs a little practice, and where
              to go next. Learning has twists and turns. Your plan should, too.
            </p>
            <ul className="check-list">
              <li>
                <Check /> A focused next step when you open Easy
              </li>
              <li>
                <Check /> Clear skill labels, without scores or comparisons
              </li>
              <li>
                <Check /> Your feedback shapes the way forward
              </li>
            </ul>
            <Link href="/login" className="text-link">
              Find your starting point <ArrowRight size={18} />
            </Link>
          </div>
          <div className="story-path" aria-label="Illustrative learning path">
            <span className="sample-tag">ILLUSTRATIVE PATH</span>
            <div className="story-path-line" aria-hidden="true" />
            {[
              {
                title: "A first discovery",
                label: "Just starting",
                icon: Sparkles,
              },
              { title: "Something clicks", label: "Getting there", icon: Star },
              { title: "A new possibility", label: "Comfortable", icon: Route },
            ].map((n, i) => (
              <div className={`story-node story-node-${i}`} key={n.title}>
                <span>
                  <n.icon size={25} />
                </span>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.label}</p>
                </div>
              </div>
            ))}
            <TrailGuide className="story-guide" />
          </div>
        </section>
        <section className="difference-section">
          <div className="marketing-container">
            <div className="section-heading">
              <span className="section-kicker">
                YOUR CONNECTION IS THE STARTING POINT
              </span>
              <h2>
                Support for the teacher
                <br />
                they already trust.
              </h2>
            </div>
            <div className="difference-grid">
              <article>
                <BookOpen />
                <span className="section-kicker">AI TUTORS · SUCH AS ELLO</span>
                <h3>The AI teaches.</h3>
                <p>A digital tutor takes the teaching role.</p>
              </article>
              <article>
                <Route />
                <span className="section-kicker">
                  CENTERS · KUMON & MATHNASIUM
                </span>
                <h3>You go to the lesson.</h3>
                <p>Structured practice takes place at a learning center.</p>
              </article>
              <article className="easy-difference">
                <Heart />
                <span className="section-kicker">THE EASY WAY</span>
                <h3>
                  You teach.
                  <br />
                  We prepare you.
                </h3>
                <p>
                  Guidance that fits into the time you already spend together.
                </p>
              </article>
            </div>
          </div>
        </section>
        <section id="questions" className="marketing-container faq-section">
          <div>
            <span className="section-kicker">GOOD QUESTIONS</span>
            <h2>A little reassurance.</h2>
            <TrailGuide className="faq-guide" />
          </div>
          <div className="faq-list">
            {[
              [
                "What if I’m not a teacher?",
                "That’s who Easy is for. Each briefing gives you an explanation, everyday objects to use, questions to ask, and another approach for when something doesn’t click.",
              ],
              [
                "Does my kid talk to the AI?",
                "Today, Easy works with you, the parent. You review the lesson and lead the learning. Feedback comes from you, too.",
              ],
              [
                "Do we need homework to get started?",
                "No. The Roadmap is the starting point. A homework photo can help inform the plan, but it isn’t a prerequisite.",
              ],
              [
                "What if we miss an evening?",
                "Come back when you can. There’s room for real life here. Pick up with one manageable next step.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="marketing-container">
          <div className="closing-card">
            <span className="section-kicker">
              MORE “LET’S TRY.” LESS “I DON’T KNOW.”
            </span>
            <h2>
              You’ve got the connection.
              <br />
              Let’s give it a little direction.
            </h2>
            <p>Less than one Kumon session. For the whole month.</p>
            <span className="pricing-note">
              Our pricing is still being tested. No paid plan is available yet.
            </span>
            <Link href="/login" className="easy-button">
              Start your little adventure <ArrowRight size={19} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="marketing-container marketing-footer">
        <Brand />
        <p>
          Easy is meant for parents to teach their children. Easy helps keep
          their child on track of their education goals.
        </p>
        <span>Made for growing together.</span>
      </footer>
    </div>
  );
}
