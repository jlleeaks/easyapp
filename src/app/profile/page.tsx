import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { LearnerPortrait } from "@/components/easy/LearnerPortrait";
import type { ChildProfile } from "@/lib/types";
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: child, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .limit(1)
    .maybeSingle<ChildProfile>();
  if (error)
    throw new Error("We couldn’t load your profile. Please try again.");
  if (!child) redirect("/onboarding");
  return (
    <Shell wide>
      <LearnerPortrait child={child} />
    </Shell>
  );
}
