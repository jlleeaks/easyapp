import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTonightSuggestions } from "@/lib/suggestions";
import type { ChildProfile, Session } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId } = body as { childId: string };
  if (!childId) {
    return NextResponse.json({ error: "Missing childId." }, { status: 400 });
  }

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single<ChildProfile>();
  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const { data: skills } = await supabase.from("skills").select("*").eq("child_id", childId);
  const { data: sessions } = await supabase.from("sessions").select("*").eq("child_id", childId).returns<Session[]>();

  try {
    const suggestions = await getTonightSuggestions(child, skills ?? [], sessions ?? []);
    if (!suggestions) {
      return NextResponse.json({ error: "Couldn't come up with suggestions — try again." }, { status: 502 });
    }
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
  }
}
