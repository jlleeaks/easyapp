import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { LibraryScreen } from "@/components/library/LibraryScreen";
import type { Book, ChildProfile, Session } from "@/lib/types";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const { book: initialBookId } = await searchParams;
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

  const { data: librarySessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("child_id", child.id)
    .eq("source", "library")
    .not("book_id", "is", null)
    .order("created_at", { ascending: false })
    .returns<Session[]>();

  const insightsByBook: Record<string, Session[]> = {};
  for (const s of librarySessions ?? []) {
    if (!s.book_id) continue;
    (insightsByBook[s.book_id] ??= []).push(s);
  }

  return (
    <Shell wide>
      <LibraryScreen
        childId={child.id}
        childName={child.name}
        initialBooks={books ?? []}
        insightsByBook={insightsByBook}
        initialBookId={initialBookId}
      />
    </Shell>
  );
}
