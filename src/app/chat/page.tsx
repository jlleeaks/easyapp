import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { ChatScreen } from "@/components/chat/ChatScreen";
import type { ChatMessage, ChildProfile } from "@/lib/types";

export default async function ChatPage() {
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

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: true })
    .returns<ChatMessage[]>();

  return (
    <Shell wide>
      <ChatScreen childId={child.id} childName={child.name} initialMessages={messages ?? []} />
    </Shell>
  );
}
