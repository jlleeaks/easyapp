import Link from "next/link";
import { Heart, Sparkles, Sun, Pencil, Leaf } from "lucide-react";
import type { ChildProfile } from "@/lib/types";
import { TrailGuide } from "./TrailGuide";
import { AddInformationButton } from "@/components/profile/AddInformationButton";
import { ProfileInsightSection } from "@/components/profile/ProfileInsightSection";

export function LearnerPortrait({ child }: { child: ChildProfile }) {
  const interests = (child.interests || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <main className="journey-page portrait-page">
      <header className="journey-heading">
        <div>
          <span className="section-kicker">
            A PERSON, NOT A PROGRESS REPORT
          </span>
          <h1>Uniquely {child.name}.</h1>
          <p>The little things that help you teach.</p>
        </div>
        <Link className="portrait-edit" href="/onboarding">
          <Pencil size={16} /> Edit answers
        </Link>
      </header>
      <section className="portrait-scene">
        <span className="portrait-spark spark-one" aria-hidden="true">
          ✦
        </span>
        <span className="portrait-spark spark-two" aria-hidden="true">
          ✧
        </span>
        <div className="portrait-halo">
          <TrailGuide />
        </div>
        <h2>{child.name}’s world</h2>
        <span className="portrait-grade">Kindergarten learning path</span>
        <div className="interest-bubbles">
          {interests.length ? (
            interests.map((interest) => (
              <span key={interest}>
                <Heart size={14} />
                {interest}
              </span>
            ))
          ) : (
            <span>What makes their eyes light up?</span>
          )}
        </div>
      </section>
      <section
        className="portrait-notes"
        aria-label="What helps your child learn"
      >
        <article className="portrait-note note-green">
          <Leaf />
          <span className="section-kicker">A WAY IN</span>
          <h2>Start with what clicks.</h2>
          <p>
            {child.learning_style ||
              "Try objects, movement, or a quiet moment together."}
          </p>
          {child.go_to_analogy && (
            <details>
              <summary>Your familiar analogy</summary>
              <p>{child.go_to_analogy}</p>
            </details>
          )}
        </article>
        <article className="portrait-note note-yellow">
          <Sun />
          <span className="section-kicker">A LITTLE ENCOURAGEMENT</span>
          <h2>Make room to try.</h2>
          <p>
            {child.motivation ||
              "Notice their effort, and offer a little choice."}
          </p>
          {child.frustration && (
            <details>
              <summary>When it feels hard</summary>
              <p>{child.frustration}</p>
              {child.doesnt_work && (
                <p>What hasn’t helped: {child.doesnt_work}</p>
              )}
            </details>
          )}
        </article>
        <article className="portrait-note note-blue">
          <Heart />
          <span className="section-kicker">YOUR TIME TOGETHER</span>
          <h2>A rhythm that fits.</h2>
          <p>
            {child.homework_time ||
              "Choose a moment that works for your family."}
          </p>
          {child.who_present && <p>{child.who_present}</p>}
        </article>
      </section>
      <section className="portrait-learning">
        <div>
          <span className="section-kicker">KEEP GETTING TO KNOW THEM</span>
          <h2>What we’re learning.</h2>
          <p>One observation can make the next lesson feel more like them.</p>
        </div>
        <AddInformationButton childId={child.id} childName={child.name} />
      </section>
      {child.summary && (
        <details className="journey-details">
          <summary>Read {child.name}’s learning story</summary>
          <p>{child.summary}</p>
        </details>
      )}
      <details className="journey-details">
        <summary>Strengths, next steps & your observations</summary>
        <ProfileInsightSection
          childId={child.id}
          field="strengths"
          title="Finding their feet"
          icon={<Sparkles size={16} />}
          color="#257c4b"
          items={child.strengths ?? []}
          emptyText="Your observations will appear here."
        />
        <ProfileInsightSection
          childId={child.id}
          field="growth_areas"
          title="Still growing"
          icon={<Leaf size={16} />}
          color="#2368c1"
          items={child.growth_areas ?? []}
          emptyText="Room for new discoveries."
        />
        <ProfileInsightSection
          childId={child.id}
          field="learning_patterns"
          title="What helps"
          icon={<Heart size={16} />}
          color="#257c4b"
          items={child.learning_patterns ?? []}
          emptyText="Tell us what you notice after an activity."
        />
      </details>
      <p className="journey-footnote">
        Easy currently offers a kindergarten path. Your answers and observations
        personalize it; they do not assign a grade or diagnosis.
      </p>
    </main>
  );
}
