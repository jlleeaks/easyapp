# Easy — Homework Helper (MVP)

An AI coaching layer for parents, not a chatbot for kids: Easy never talks to your child directly.
It preps you before a lesson and debriefs with you after — you're the one teaching.

This build covers the v1 slice: **onboarding** (child profile) and **Homework Helper for
kindergarten math** (photograph a worksheet → get a parent-facing teaching briefing → deliver
the lesson → quick check-in → visible profile update). See
[`extracted/easy_product_map.md`](extracted/easy_product_map.md) for the full product spec this
was built from.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Supabase** — auth (email/password) + Postgres (Row Level Security on every table)
- **Anthropic API** (`@anthropic-ai/sdk`) — worksheet diagnosis (vision) and post-session
  iteration, called server-side only

## 1. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** and run everything in [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `parents`, `children`, `sessions`, and `skills` tables, an auto-provisioning
   trigger for new signups, and RLS policies so a parent can only ever see their own data.
3. Under **Authentication → Providers**, confirm Email is enabled.
4. For easier local testing, under **Authentication → Sign In / Providers → Email**, you can
   turn off "Confirm email" so new accounts don't need to click a verification link. Turn it back
   on before sharing the app with real testers.
5. Grab your **Project URL** and **anon public key** from **Settings → API**.

## 2. Get an Anthropic API key

Create one at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
Diagnosing a worksheet sends the photo to Claude; nothing is sent to or from the child at any
point — only the parent ever sees the app.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY`.

## 4. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, complete onboarding for your
kindergartner, then try Homework Helper with a photo of any simple math worksheet (or even a
handwritten problem).

## Project structure

```
src/
  app/
    page.tsx              welcome screen (redirects signed-in parents onward)
    login/                 email + password sign in / sign up
    onboarding/             5-step child profile wizard
    dashboard/              entry point, streak, recent sessions
    homework/               the Homework Helper flow (client component)
    progress/               math skills map + session history
    profile/                parent & child profile view
    api/
      diagnose/route.ts     server-side: photo → Claude vision → briefing JSON
      checkin/route.ts      server-side: check-in → Claude → session + skill + summary update
  components/
    ui/                    shared design system (Card, Button, GrowthRing, Shell/nav, ...)
    onboarding/            OnboardingWizard
    homework/               HomeworkFlow, BriefingView
  lib/
    supabase/              browser/server/middleware Supabase clients
    anthropic.ts           Claude prompts + call helper (server-only)
    types.ts, palette.ts, streak.ts
supabase/schema.sql        run this once in the Supabase SQL editor
```

## Data & privacy notes

- Every table (`children`, `sessions`, `skills`) is protected by Postgres Row Level Security —
  a signed-in parent can only read or write rows tied to their own account.
- Worksheet photos are sent to Anthropic for diagnosis and are **not stored** — only the
  generated briefing (text) is saved, as part of a session record.
- This is a prototype: if you share it with other families to try, let them know their child's
  name/interests and homework photos are being processed by Claude and stored in Supabase.

## Not in this build yet

Per the product map, everything below is scoped for later — this build is deliberately just
onboarding + math Homework Helper:

- Other subjects (writing, reading) and the Library / bedtime-reading guide
- "Ask Easy" open-ended chat
- Weekly cross-subject planning
- Typed-topic practice sessions (worksheet photo is the only entry point for now)

## Deploy to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In the [Vercel dashboard](https://vercel.com/new), import the repo.
3. Add the same three environment variables from `.env.local` in the Vercel project's
   **Settings → Environment Variables**.
4. Deploy. Vercel builds with `next build` automatically — no other config needed.
5. Back in Supabase, under **Authentication → URL Configuration**, add your Vercel deployment
   URL to the allowed redirect URLs/site URL so auth works in production.
