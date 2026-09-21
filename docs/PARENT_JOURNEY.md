# Parent learning journey

Home uses a winding path and one activity card. Explanations are expandable. Progress is a skill garden plus dated learning moments; Profile is an interest-led portrait with three coaching notes and editable observations on demand. Original Easy illustration and Baloo 2 are retained.

## Math reference and tracking

The math data in `src/lib/california-math.ts` covers the 22 numbered California kindergarten mathematics standards in six parent-friendly groups. Source: California Department of Education, California Common Core State Standards: Mathematics (2013), printed pages 11–12: https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf

This is a statewide reference, not a district curriculum or a claim about Bay Area checkpoint pacing. Reading stays provisional. A group's observed state is not evidence of mastering every constituent standard. Patterns remain in historical records but are not represented as a numbered California kindergarten standard. Teen-number place value is included.

Roadmap-started math lessons carry a validated `roadmap_area_id` in the existing briefing JSON. The generation prompt includes the target codes and learning boundary. The server uses the canonical area title for check-in skill storage; roadmap evidence reads the saved ID, with legacy text matching for older sessions. No schema migration, record reset, or credentials are required in source. A generated lesson alone does not advance progress.

The existing app is kindergarten-only, without a stored per-child grade field. Intake now makes this clear and generation context explicitly includes Kindergarten. This does not add grade selection or change a child's stored answers.

## Verification

- Production fixture build, TypeScript, ESLint.
- Browser tests at 375px and 1280px, with normal and reduced motion; screenshots and axe A/AA checks on Home, Progress, Profile and onboarding.
- California code coverage and stable area mapping tests.
- Parent math flow from generation through check-in and roadmap update, using local mock Supabase and Anthropic services. No external model calls or real family records in automated tests.

Not established by fixtures: live model output quality, production Supabase policies, district-specific pacing, or individual-standard mastery. Existing server-side approval and atomic multi-write check-in limitations remain separate work; this change does not claim to resolve them.
