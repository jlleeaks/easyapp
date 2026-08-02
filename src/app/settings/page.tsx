import { redirect } from "next/navigation";
import Link from "next/link";
import { Smile, Settings as SettingsIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { PageHeader, Card, Eyebrow } from "@/components/ui/primitives";
import type { ChildProfile } from "@/lib/types";

export default async function SettingsPage() {
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

  return (
    <Shell>
      <PageHeader
        icon={<SettingsIcon size={20} color={PALETTE.brand} />}
        color={PALETTE.brand}
        soft={PALETTE.brandSoft}
        eyebrow="Settings"
        title="Account & child access"
      />

      <Card tint={PALETTE.brandSoft} style={{ marginBottom: 0 }}>
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <Smile size={13} color={PALETTE.brand} />
            <Eyebrow color={PALETTE.brand}>Kid Mode</Eyebrow>
          </div>
          <p className="text-sm mb-3.5" style={{ color: PALETTE.inkSoft }}>
            Hand the device to {child.name} — they&apos;ll see their own activities in a simple view, with no chat
            and no way into your settings.
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
    </Shell>
  );
}
