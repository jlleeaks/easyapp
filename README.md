# Easy

An adaptive AI platform that helps parents teach their kids. A clear learning roadmap, parent-facing guidance, and 15–20 focused minutes together.

Easy is meant for parents to teach their children. Easy helps keep their child on track of their education goals.

## Current development stage

Phase 1 rebuild: Baloo 2 / Palette B, interactive sample homepage, Roadmap home, and a 15-question parent onboarding flow. See [the phase report](docs/PHASE_1.md) for verification and remaining work.

The existing Next.js application also contains homework, practice, Library, chat, progress, and profile features. Those legacy flows remain available; the shared server approval pipeline, reviewed California standards, and immersive daily session are subsequent phases. This branch is for review, not a claim that the complete production MVP is finished.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind 4
- Supabase parent authentication and Postgres with ownership policies
- Server-side Anthropic calls
- Playwright and axe for browser verification; Lighthouse for lab measurements

## Local setup

1. Install with `npm ci`.
2. Copy `.env.local.example` to `.env.local` and configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY`. `ANTHROPIC_MODEL` is optional.
3. For a new Supabase project, review and apply `supabase/schema.sql`. For an existing project, review the current database before making schema changes.
4. Enable email authentication. Keep email confirmation enabled when onboarding real families.
5. Run `npm run dev` and open `http://localhost:3000`.

## Routes and code

- `/`: public marketing page and pre-authored interest demo; signed-in parents continue to their profile or Roadmap.
- `/onboarding`: one question per screen, existing profile editing, parent and child profile save.
- `/dashboard`: Roadmap home using saved observations, math/reading filters, and skill-linked activity preparation.
- `/homework`, `/practice`, `/library`, `/chat`: existing parent tools.
- `/progress`, `/profile`, `/settings`: existing history and account tools.
- `src/components/easy`: new shared brand, original SVG illustration, and Roadmap home.
- `src/lib/standards.ts`: provisional existing reference, not an approved California standards dataset.

## Verification

```bash
npm run lint
npm run typecheck
npx playwright install chromium
# Compile the browser fixture build with local-only test configuration:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key-not-a-real-credential npm run build
npm run test:e2e
```

The browser suite starts a local fixture service and production Next.js server. It uses synthetic accounts, does not call Anthropic, and does not connect to a real Supabase project. It covers desktop/mobile layouts, motion preferences, demo interaction, onboarding save/back/error flows, existing field preservation, Roadmap selection, and unauthenticated redirects. This is UI integration coverage, not verification of production auth or database isolation.

Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if your environment supplies a separate compatible Chromium binary. Test output is ignored by Git. Rebuild with the real deployment environment before deploying; do not publish a fixture build.

## Deployment

The existing deployment target is Vercel. Import the repository there, configure the real environment variables, and add the production origin to Supabase’s allowed auth URLs. This Phase 1 branch does not deploy, change production settings, or run database migrations.

## Internal safety boundary

The AI never receives input from a child. All feedback is parent-authored. The required server-side approval timestamp and static child-output gate are Phase 3 work. The legacy `/kid` route does not meet that requirement yet and must be addressed before sharing the MVP with families. Model keys stay server-side. Homework images are sent for diagnosis and are not persisted by the existing photo flow.
