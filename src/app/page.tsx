import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingSite } from "@/components/marketing/MarketingSite";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: child } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", user.id)
      .limit(1)
      .maybeSingle();
    redirect(child ? "/dashboard" : "/onboarding");
  }

  return <MarketingSite />;
}
