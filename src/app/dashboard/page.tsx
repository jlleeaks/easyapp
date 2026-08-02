import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, Sparkles, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { Wordmark } from "@/components/ui/primitives";
import { HomeGreeting } from "@/components/ui/HomeGreeting";
import { TonightActivityHero, SecondaryActionTile } from "@/components/ui/TonightActivityCard";
import { NoticingStrip } from "@/components/ui/NoticingStrip";
import { ContinueLastTime } from "@/components/ui/ContinueLastTime";
import { getTonightSuggestions } from "@/lib/suggestions";
import { areaForFocusText } from "@/lib/roadmap";
import type { ChildProfile, Session, Skill } from "@/lib/types";

export default async function DashboardPage() {
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

  const [{ data: allSessions }, { data: skills }] = await Promise.all([
    supabase.from("sessions").select("*").eq("child_id", child.id).order("created_at", { ascending: false }).returns<Session[]>(),
    supabase.from("skills").select("*").eq("child_id", child.id).returns<Skill[]>(),
  ]);
  const sessions = allSessions ?? [];

  // Resolve tonight's suggestion server-side (no client loading delay) and ground
  // its "why" against the same roadmap state Progress shows, so the two can't disagree.
  let suggestion = null;
  let suggestionArea = null;
  try {
    const suggestions = await getTonightSuggestions(child, skills ?? [], sessions);
    suggestion = suggestions?.[0] ?? null;
    if (suggestion) {
      suggestionArea = areaForFocusText(suggestion.subject, suggestion.focus);
    }
  } catch {
    suggestion = null;
  }

  const continuation = sessions.slice(0, 3).find((s) => s.micro_message?.trim()) ?? null;

  const patterns = child.learning_patterns ?? [];
  const noticing = patterns.length > 0 ? patterns[0] : null;

  return (
    <Shell wide>
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <Wordmark small />
      </div>

      <HomeGreeting parentName={parent?.name} childName={child.name} />

      <TonightActivityHero childName={child.name} suggestion={suggestion} area={suggestionArea} />

      <div className="mt-5">
        <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
          Something else tonight?
        </p>
        <div className="flex flex-wrap gap-2.5">
          <SecondaryActionTile href="/homework" icon={<Camera size={16} />} label="Upload homework" />
          <SecondaryActionTile href="/practice" icon={<Sparkles size={16} />} label="Choose another activity" />
          <SecondaryActionTile href="/library" icon={<BookOpen size={16} />} label="Read together" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <NoticingStrip pattern={noticing} />
        <ContinueLastTime session={continuation} />
      </div>

      <p className="text-xs text-center mt-6" style={{ color: PALETTE.inkFaint }}>
        Not sure what {child.name} needs?{" "}
        <Link href="/chat" className="font-bold underline" style={{ color: PALETTE.brand }}>
          Ask Easy
        </Link>
      </p>
    </Shell>
  );
}
