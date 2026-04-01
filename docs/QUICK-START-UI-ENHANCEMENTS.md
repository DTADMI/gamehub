# Quick Start: UI/UX Enhancements

Last updated: April 1, 2026

## Local validation flow

1. `pnpm install --frozen-lockfile`
2. `pnpm ci:local`
3. `pnpm dev`

## Admin flag controls

Use `/admin/flags` to toggle:
- Enhanced game cards
- Enhanced carousel
- Hero animation
- Shimmer loading states
- Leaderboard guest teaser
- Local play for upcoming games

## Manual QA checklist

| Check | Expectation |
| --- | --- |
| Home hero | Renders with graceful animation when enabled |
| Home loading states | Skeletons show shimmer when enabled |
| Card interaction | Playable cards are clearly actionable and accessible |
| Carousel | Arrow buttons, keyboard arrows, and dots all work |
| Leaderboard as guest | Teaser + sign-in CTA appears when flag enabled |
| Leaderboard as signed-in user | Preview ranking list is visible |
| Game page as guest | CTA prompts sign-in/create account |
| Responsive behavior | Works at 320px, tablet, and desktop widths |

## CI guardrails

- Use `pnpm install --frozen-lockfile` in CI and local parity scripts.
- Do not push without passing `pnpm ci:local`.
- Keep workflow `pnpm` version pinned.
