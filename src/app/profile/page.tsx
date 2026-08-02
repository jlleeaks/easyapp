import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Heart,
  Brain,
  Footprints,
  Trophy,
  Users,
  Moon,
  MessageCircle,
  BookOpen,
  Clock,
  ThumbsUp,
  Lightbulb,
  AlertTriangle,
  Smile,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { Avatar, Chip, Card, Eyebrow, AiMarkdown } from "@/components/ui/primitives";
import { ReportIntakeCard } from "@/components/profile/ReportIntakeCard";
import type { ChildProfile } from "@/lib/types";

function TempPill({ icon: Icon, label }: { icon: typeof Brain; label: string | null }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.line}` }}>
      <Icon size={13} color={PALETTE.brand} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function FactTile({ icon: Icon, label, value, color }: { icon: typeof Moon; label: string; value: string | null; color: string }) {
  if (!value) return null;
  return (
    <div className="rounded-xl p-3" style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.line}` }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} color={color} />
        <span className="text-[10px] font-bold uppercase" style={{ color: PALETTE.inkFaint, letterSpacing: "0.04em" }}>
          {label}
        </span>
      </div>
      <div className="text-sm font-semibold leading-snug">{value}</div>
    </div>
  );
}

function FactGroup({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <Eyebrow color={color}>{label}</Eyebrow>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">{children}</div>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .limit(1)
    .maybeSingle<ChildProfile>();
  if (!child) redirect("/onboarding");

  const { data: parent } = await supabase
    .from("parents")
    .select("name")
    .eq("id", user.id)
    .maybeSingle<{ name: string | null }>();

  const interestChips = (child.interests || "").split(",").filter((s) => s.trim());
  const hobbyChips = (child.hobbies || "").split(",").filter((s) => s.trim());
  const characterChips = (child.favorite_characters || "").split(",").filter((s) => s.trim());

  const hasStartingPoint = child.letters_level || child.numbers_level;
  const hasReadingRoutine = child.read_together || child.talks_after_story || child.favorite_books || child.homework_time || child.who_present;
  const hasWhatWorks = child.enjoys_learning || child.subject_likes || child.go_to_analogy;
  const hasWatchFor = child.subject_struggle || child.doesnt_work || child.math_anxiety;

  return (
    <Shell wide>
      <div className="flex items-center gap-4 pb-6 mb-6 animate-fade-in-up" style={{ borderBottom: `1px solid ${PALETTE.line}` }}>
        <Avatar name={child.name} size={56} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-0.5" style={{ color: PALETTE.inkSoft }}>
            {parent?.name ? `${parent.name} · managing 1 child` : "Managing 1 child"}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1 className="font-serif-display" style={{ fontSize: 26, fontWeight: 700, color: PALETTE.accent, letterSpacing: "-0.01em" }}>
              {child.name}
            </h1>
            <Chip color={PALETTE.brandSoft}>Kindergarten</Chip>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <Card tint={PALETTE.accentSoft} style={{ marginBottom: 0 }}>
            <div className="p-5">
              <Eyebrow color={PALETTE.accent}>Temperament</Eyebrow>
              <div className="flex flex-wrap gap-2 mt-1">
                <TempPill icon={Brain} label={child.frustration} />
                <TempPill icon={Footprints} label={child.learning_style} />
                <TempPill icon={Trophy} label={child.motivation} />
                <TempPill icon={Users} label={child.shy} />
              </div>
            </div>
          </Card>

          {(interestChips.length > 0 || hobbyChips.length > 0 || characterChips.length > 0) && (
            <Card style={{ marginBottom: 0 }}>
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Heart size={13} color={PALETTE.accent} />
                  <Eyebrow color={PALETTE.accent}>Loves right now</Eyebrow>
                </div>
                <div>
                  {interestChips.map((t, i) => (
                    <Chip key={"i" + i}>{t.trim()}</Chip>
                  ))}
                  {hobbyChips.map((t, i) => (
                    <Chip key={"h" + i} color={PALETTE.brandSoft}>
                      {t.trim()}
                    </Chip>
                  ))}
                  {characterChips.map((t, i) => (
                    <Chip key={"c" + i} color={PALETTE.goldSoft}>
                      {t.trim()}
                    </Chip>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {(hasStartingPoint || hasReadingRoutine || hasWhatWorks || hasWatchFor) && (
            <Card style={{ marginBottom: 0 }}>
              <div className="p-5">
                {hasStartingPoint && (
                  <FactGroup label="Where she's starting from" color={PALETTE.gold}>
                    <FactTile icon={Trophy} label="Letters & sounds" value={child.letters_level} color={PALETTE.gold} />
                    <FactTile icon={Trophy} label="Numbers" value={child.numbers_level} color={PALETTE.gold} />
                  </FactGroup>
                )}
                {hasReadingRoutine && (
                  <FactGroup label="Reading & routine" color={PALETTE.brand}>
                    <FactTile icon={Moon} label="Reads together" value={child.read_together} color={PALETTE.brand} />
                    <FactTile icon={MessageCircle} label="After a story" value={child.talks_after_story} color={PALETTE.brand} />
                    <FactTile icon={BookOpen} label="Favorite books" value={child.favorite_books} color={PALETTE.brand} />
                    <FactTile icon={Clock} label="Homework time" value={child.homework_time} color={PALETTE.brand} />
                    <FactTile icon={Users} label="Who's usually there" value={child.who_present} color={PALETTE.brand} />
                  </FactGroup>
                )}
                {hasWhatWorks && (
                  <FactGroup label="What already works" color={PALETTE.brand}>
                    <FactTile icon={ThumbsUp} label="Enjoys learning" value={child.enjoys_learning} color={PALETTE.brand} />
                    <FactTile icon={Heart} label="Lights up for" value={child.subject_likes} color={PALETTE.brand} />
                    <FactTile
                      icon={Lightbulb}
                      label="Go-to analogy"
                      value={child.go_to_analogy ? `"${child.go_to_analogy}"` : null}
                      color={PALETTE.brand}
                    />
                  </FactGroup>
                )}
                {hasWatchFor && (
                  <FactGroup label="Worth watching for" color={PALETTE.accent}>
                    <FactTile icon={AlertTriangle} label="A fight to get done" value={child.subject_struggle} color={PALETTE.accent} />
                    <FactTile icon={AlertTriangle} label="Reliably doesn't work" value={child.doesnt_work} color={PALETTE.accent} />
                    <FactTile icon={AlertTriangle} label="Math feels stressful" value={child.math_anxiety} color={PALETTE.accent} />
                  </FactGroup>
                )}
              </div>
            </Card>
          )}

          <Link href="/onboarding">
            <div
              className="btn-press w-full flex items-center justify-center gap-2 py-2.5 font-medium border transition-all duration-150"
              style={{ borderRadius: RADIUS.sm, borderColor: PALETTE.line, color: PALETTE.ink, background: PALETTE.card }}
            >
              <Pencil size={15} /> Edit profile
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          {child.summary && (
            <Card tint={PALETTE.brandSoft} style={{ marginBottom: 0 }}>
              <div className="p-5">
                <Eyebrow color={PALETTE.brand}>What Easy has learned so far</Eyebrow>
                <div className="text-sm" style={{ color: PALETTE.inkSoft, lineHeight: 1.55 }}>
                  <AiMarkdown content={child.summary} />
                </div>
              </div>
            </Card>
          )}

          <ReportIntakeCard childId={child.id} childName={child.name} />

          <Card tint={PALETTE.brandSoft} style={{ marginBottom: 0 }}>
            <div className="p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <Smile size={13} color={PALETTE.brand} />
                <Eyebrow color={PALETTE.brand}>Kid Mode</Eyebrow>
              </div>
              <p className="text-sm mb-3.5" style={{ color: PALETTE.inkSoft }}>
                Hand the device to {child.name}
                {" "}
                — she&apos;ll see her own lessons in a simple view, with no chat and no way into your settings.
              </p>
              <Link href="/kid">
                <div
                  className="btn-press w-full flex items-center justify-center gap-2 py-2.5 font-semibold transition-all duration-150"
                  style={{ borderRadius: RADIUS.sm, background: PALETTE.brand, color: "#fff" }}
                >
                  <Smile size={15} /> Open Kid Mode
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
