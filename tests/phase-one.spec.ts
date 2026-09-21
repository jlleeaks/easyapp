import { test, expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const parentId = "00000000-0000-4000-8000-000000000001";
async function signIn(context: BrowserContext) {
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const encode = (v: unknown) =>
    Buffer.from(JSON.stringify(v)).toString("base64url");
  const session = {
    access_token: `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: parentId, exp, role: "authenticated", aud: "authenticated" })}.fixture-signature`,
    refresh_token: "fixture-refresh",
    token_type: "bearer",
    expires_at: exp,
    expires_in: 86400,
    user: { id: parentId, aud: "authenticated", role: "authenticated" },
  };
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value: `base64-${encode(session)}`,
      domain: "localhost",
      path: "/",
    },
  ]);
}
const fixtureChild = {
  id: "00000000-0000-4000-8000-000000000002",
  parent_id: parentId,
  name: "Maya",
  interests: "dinosaurs",
  summary: "",
  strengths: [],
  growth_areas: [],
  learning_patterns: [],
};
for (const width of [375, 1280])
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`homepage, onboarding and roadmap at ${width}px, motion ${reducedMotion}`, async ({
      page,
      context,
      request,
    }) => {
      fs.mkdirSync("test-results/screenshots", { recursive: true });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await request.post("http://127.0.0.1:54321/__reset", { data: {} });
      await page.goto("/");
      await expect(
        page.getByRole("heading", {
          name: "Little lessons. Big possibilities.",
        }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Space", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Ready, set, count down" }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Peek at the parent briefing" })
        .click();
      await expect(
        page.getByText(
          "Start with three objects. Touch each one together as you say its number.",
        ),
      ).toBeVisible();
      await page.getByRole("button", { name: "Nature", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "The tiny nature collection" }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Dinosaurs", exact: true })
        .click();
      await expect(page.locator("body")).not.toContainText(
        /Pre-K|kindergarten|5-10|never|Aristotle/i,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `test-results/screenshots/home-${width}-${reducedMotion}.png`,
        fullPage: true,
      });
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);
      await signIn(context);
      await page.goto("/onboarding");
      await expect(
        page.getByRole("heading", { name: "First, what should we call you?" }),
      ).toBeVisible();
      await page.getByRole("textbox").fill("Jordan");
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Continue", exact: true }),
      ).toBeDisabled();
      await page.getByRole("textbox").fill("Maya");
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.getByRole("textbox").fill("dinosaurs");
      await page.getByRole("button", { name: "Previous question" }).click();
      await expect(page.getByRole("textbox")).toHaveValue("Maya");
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await expect(page.getByRole("textbox")).toHaveValue("dinosaurs");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `test-results/screenshots/onboarding-${width}-${reducedMotion}.png`,
        fullPage: true,
      });
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.getByRole("button", { name: "Skip for now" }).click();
      for (const choice of [
        "Keep trying",
        "Moving and using objects",
        "Noticing their effort",
        "Just starting",
        "Exploring counting",
        "Sometimes",
      ]) {
        await page.getByRole("button", { name: choice, exact: true }).click();
        await page
          .getByRole("button", { name: "Continue", exact: true })
          .click();
      }
      await page.getByRole("button", { name: "Skip for now" }).click();
      for (const choice of ["After dinner", "Just us"]) {
        await page.getByRole("button", { name: choice, exact: true }).click();
        await page
          .getByRole("button", { name: "Continue", exact: true })
          .click();
      }
      await page.getByRole("button", { name: "Skip for now" }).click();
      await page.getByRole("button", { name: "A little", exact: true }).click();
      await page.getByRole("button", { name: "Show my roadmap" }).click();
      await expect(page).toHaveURL(/dashboard/);
      await expect(
        page.getByRole("heading", { name: "Growing, together." }),
      ).toBeVisible();
      const saved = await (
        await request.get("http://127.0.0.1:54321/__state")
      ).json();
      expect(saved.child.name).toBe("Maya");
      expect(saved.child.interests).toBe("dinosaurs");
      expect(saved.child.math_anxiety).toBe("A little");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `test-results/screenshots/roadmap-${width}-${reducedMotion}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.getByRole("button", { name: "Reading", exact: true }).click();
      await expect(page.locator(".skill-chip")).toContainText("Reading");
      const nodes = page.locator(".stone-button");
      await nodes.nth(1).focus();
      await page.keyboard.press("Enter");
      await expect(nodes.nth(1)).toHaveAttribute("aria-pressed", "true");
      await expect(
        page.getByRole("link", { name: "Prepare tonight’s activity" }),
      ).toHaveAttribute("href", /subject=reading/);
      expect(errors).toEqual([]);
      for (const route of ["progress", "profile"]) {
        await page.goto(`/${route}`);
        await expect(page.getByRole("heading", { level: 1 })).toContainText(route === "progress" ? "Look what’s growing." : "Uniquely Maya.");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
        if (route === "progress") {
          await page.getByRole("button", { name: /Teen numbers/ }).click();
          await expect(page.getByRole("link", { name: /California standards/ })).toContainText("K.NBT.1");
          await expect(page.getByRole("link", { name: "Explore this together" })).toHaveAttribute("href", /Teen\+numbers/);
        }
        await page.screenshot({ path: `test-results/screenshots/${route}-${width}-${reducedMotion}.png`, fullPage: true });
      }
    });
  }
test("existing profile preserves fields outside the shortened questionnaire and surfaces save errors", async ({
  page,
  context,
  request,
}) => {
  await request.post("http://127.0.0.1:54321/__reset", {
    data: {
      child: {
        ...fixtureChild,
        favorite_characters: "Trains",
        doesnt_work: "Rushing",
        frustration: "keep trying",
        learning_style: "hands on",
        motivation: "effort",
        letters_level: "letters",
        numbers_level: "counting",
        read_together: "sometimes",
        homework_time: "evening",
        who_present: "us",
      },
      failSave: true,
    },
  });
  await signIn(context);
  await page.goto("/onboarding");
  for (let i = 0; i < 14; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Show my roadmap" }).click();
  await expect(page.locator(".form-error[role=alert]")).toContainText(
    "Your answers are still here",
  );
  const state = await (
    await request.get("http://127.0.0.1:54321/__state")
  ).json();
  await request.post("http://127.0.0.1:54321/__reset", {
    data: { child: state.child, failSave: false },
  });
  await page.getByRole("button", { name: "Show my roadmap" }).click();
  await expect(page).toHaveURL(/dashboard/);
  const saved = await (
    await request.get("http://127.0.0.1:54321/__state")
  ).json();
  expect(saved.child.favorite_characters).toBe("Trains");
  expect(saved.child.doesnt_work).toBe("Rushing");
});
test("unauthenticated parents are redirected to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});

test("math lesson carries its California target through generation, check-in and the roadmap", async ({ page, context, request }) => {
  await request.post("http://127.0.0.1:54321/__reset", {data:{child:fixtureChild}});
  await signIn(context);
  await page.goto("/practice?subject=math&topic=Teen+numbers");
  await expect(page.getByRole("link", {name:/California kindergarten math/})).toContainText("K.NBT.1");
  await page.getByRole("button", {name:"Start the activity", exact:true}).click();
  await page.getByRole("button", {name:"We're all done",exact:true}).click();
  for (const choice of ["great","not really","the hands-on approach"]) await page.getByRole("button", {name:choice,exact:true}).click();
  await page.getByRole("button", {name:"Done",exact:true}).click();
  await expect(page.getByText("Objects helped. Next time, start with a group of ten.", {exact:true})).toBeVisible();
  const saved = await (await request.get("http://127.0.0.1:54321/__state")).json();
  expect(saved.sessions[0].briefing.roadmap_area_id).toBe("k-math-teen-numbers");
  expect(saved.skills[0].skill_name).toBe("Teen numbers");
  expect(saved.modelRequests[0].system).toContain("K.NBT.1");
  await page.goto("/dashboard");
  await expect(page.getByRole("button", {name:"Teen numbers: Getting there. Show activity."})).toBeVisible();
  await expect(page.getByRole("button", {name:"Counting and numbers: Not yet observed. Show activity."})).toBeVisible();
});
