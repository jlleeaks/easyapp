import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedWeeklyGoals } from "@/lib/suggestions";
import { computeRoadmap } from "@/lib/roadmap";
import type { ChildProfile, Session, Skill } from "@/lib/types";

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

  const [{ data: sessions }, { data: skills }] = await Promise.all([
    supabase.from("sessions").select("*").eq("child_id", childId).order("created_at", { ascending: false }).returns<Session[]>(),
    supabase.from("skills").select("*").eq("child_id", childId).returns<Skill[]>(),
  ]);

  const roadmap = computeRoadmap({
    skills: skills ?? [],
    sessions: sessions ?? [],
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });

  try {
    const parsed = await getSuggestedWeeklyGoals(child, sessions ?? [], roadmap);
    if (!parsed) {
      return NextResponse.json({ error: "Couldn't come up with a suggestion — try again." }, { status: 502 });
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
  }
}
