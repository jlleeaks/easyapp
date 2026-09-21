import { test, expect } from "@playwright/test";
import { computeRoadmap } from "../src/lib/roadmap";
import { CA_MATH_UNITS } from "../src/lib/california-math";
import type { Session, Skill } from "../src/lib/types";

test("California kindergarten covers all 22 standards without treating patterns as a standard", () => {
  const codes = CA_MATH_UNITS.flatMap((u) => [...u.codes]);
  const expected = [
    ...Array.from({ length: 7 }, (_, i) => `K.CC.${i + 1}`),
    ...Array.from({ length: 5 }, (_, i) => `K.OA.${i + 1}`),
    "K.NBT.1",
    ...Array.from({ length: 3 }, (_, i) => `K.MD.${i + 1}`),
    ...Array.from({ length: 6 }, (_, i) => `K.G.${i + 1}`),
  ];
  expect([...codes].sort()).toEqual(expected.sort());
});
test("saved area wins over ambiguous activity wording; generation alone is not progress", () => {
  const session = {
    id: "one",
    subject: "math",
    skill: "Counting dinosaur shapes",
    briefing: { roadmap_area_id: "k-math-shapes" },
    checkin: { overall: "okay" },
    created_at: "2026-09-20T12:00:00Z",
  } as Session;
  const skills = [
    {
      subject: "math",
      skill_name: "Shapes and spatial thinking",
      stage: "getting there",
    },
  ] as Skill[];
  const result = computeRoadmap({
    skills,
    sessions: [session],
    strengths: [],
    growthAreas: [],
  });
  expect(
    result.find((r) => r.area.id === "k-math-counting")?.evidence,
  ).toHaveLength(0);
  expect(result.find((r) => r.area.id === "k-math-shapes")?.state).toBe(
    "developing",
  );
  const unsaved = computeRoadmap({
    skills: [],
    sessions: [{ ...session, checkin: null }],
    strengths: [],
    growthAreas: [],
  });
  expect(unsaved.every((r) => r.state === "not_yet_observed")).toBeTruthy();
});
