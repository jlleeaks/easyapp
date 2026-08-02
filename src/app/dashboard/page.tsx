import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, Sparkles, BookOpen, Lightbulb, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { Wordmark, Eyebrow, Card } from "@/components/ui/primitives";
import { HomeGreeting } from "@/components/ui/HomeGreeting";
import { TonightActivityCard, SecondaryActionLink } from "@/components/ui/TonightActivityCard";
import type { ChildProfile, Session } from "@/lib/types";

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

  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<Session[]>();

  const continuation = (recentSessions ?? []).find((s) => s.micro_message?.trim());
  const continuationHref = continuation
    ? continuation.source === "library"
      ? continuation.book_id
        ? `/library?book=${continuation.book_id}`
        : "/library"
      : `/homework?subject=${continuation.subject}&session=${continuation.id}`
    : null;
  const continuationLabel = continuation?.source === "library" ? "Open story guide" : "Open session";

  const patterns = child.learning_patterns ?? [];
  const noticing = patterns.length > 0 ? patterns[0] : null;

  return (
    <Shell wide>
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <Wordmark small />
      </div>

      <HomeGreeting parentName={parent?.name} childName={child.name} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <TonightActivityCard childId={child.id} childName={child.name} />

          <div>
            <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
              Something else tonight?
            </p>
            <div className="flex flex-wrap gap-2">
              <SecondaryActionLink href="/homework" icon={<Camera size={15} />} label="Upload homework" />
              <SecondaryActionLink href="/practice" icon={<Sparkles size={15} />} label="Choose another activity" />
              <SecondaryActionLink href="/library" icon={<BookOpen size={15} />} label="Read together" />
            </div>
          </div>

          {noticing && (
            <Card style={{ marginBottom: 0 }}>
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb size={13} color={PALETTE.brand} />
                  <Eyebrow color={PALETTE.brand}>One thing to notice</Eyebrow>
                </div>
                <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
                  {noticing.observation}
                  {noticing.parent_response ? ` — ${noticing.parent_response} appeared to help.` : "."}
                </p>
              </div>
            </Card>
          )}

          {continuation && continuationHref && (
            <Card style={{ marginBottom: 0 }}>
              <div className="p-5">
                <Eyebrow color={PALETTE.gold}>Continue from last time</Eyebrow>
                <p className="text-sm mt-1 mb-3" style={{ color: PALETTE.inkSoft }}>
                  {continuation.micro_message}
                </p>
                <Link
                  href={continuationHref}
                  className="inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: PALETTE.brand }}
                >
                  {continuationLabel} <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <Card style={{ marginBottom: 0 }}>
            <div className="p-4 text-center">
              <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
                Not sure what {child.name} needs?{" "}
                <Link href="/chat" className="font-bold underline" style={{ color: PALETTE.brand }}>
                  Ask Easy
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
