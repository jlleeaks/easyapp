import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChildProfile, WeeklyGoals } from "@/lib/types";

function isValidTarget(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 14;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, read_together_target, practice_target, homework_target } = body as {
    childId: string;
    read_together_target: number;
    practice_target: number;
    homework_target: number;
  };

  if (!childId || !isValidTarget(read_together_target) || !isValidTarget(practice_target) || !isValidTarget(homework_target)) {
    return NextResponse.json({ error: "Missing or invalid goal values." }, { status: 400 });
  }

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single<Pick<ChildProfile, "id">>();
  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const weeklyGoals: WeeklyGoals = {
    read_together_target,
    practice_target,
    homework_target,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase.from("children").update({ weekly_goals: weeklyGoals }).eq("id", childId);
  if (updateError) {
    return NextResponse.json({ error: "Couldn't save those goals — try again." }, { status: 502 });
  }

  return NextResponse.json({ weeklyGoals });
}
