import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KidHome } from "@/components/kid/KidHome";
import type { ChildProfile, Session } from "@/lib/types";

export default async function KidPage() {
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

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false })
    .limit(8)
    .returns<Session[]>();

  return <KidHome childName={child.name} sessions={sessions ?? []} />;
}
