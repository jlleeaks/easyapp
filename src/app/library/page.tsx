import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { LibraryScreen } from "@/components/library/LibraryScreen";
import type { Book, ChildProfile } from "@/lib/types";

export default async function LibraryPage() {
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

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false })
    .returns<Book[]>();

  return (
    <Shell wide>
      <LibraryScreen childId={child.id} childName={child.name} initialBooks={books ?? []} />
    </Shell>
  );
}
