import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { HomeworkHub } from "@/components/homework/HomeworkHub";
import type { ChildProfile, Session } from "@/lib/types";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; session?: string }>;
}) {
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
    .neq("source", "library")
    .order("created_at", { ascending: false })
    .returns<Session[]>();

  const { subject, session } = await searchParams;

  return (
    <Shell wide>
      <HomeworkHub
        childId={child.id}
        childName={child.name}
        sessions={sessions ?? []}
        initialSubject={subject}
        initialSessionId={session}
      />
    </Shell>
  );
}
