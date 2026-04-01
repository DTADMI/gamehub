# UI/UX Index

Last updated: April 1, 2026

## Scope

This index tracks the current GameHub UI/UX recommendation set, implementation status, and remaining work.

## Documents

| File | Purpose |
| --- | --- |
| `docs/UI-UX-DESIGN-IMPROVEMENTS.md` | Recommendation baseline and rationale |
| `docs/UI-UX-IMPLEMENTATION-SUMMARY.md` | Implementation status, gaps, and completed fixes |
| `docs/QUICK-START-UI-ENHANCEMENTS.md` | Practical rollout and validation checklist |

## Current status

| Area | Status | Notes |
| --- | --- | --- |
| Home hero animation and loading feedback | DONE | Hero motion + shimmer skeletons are now flag-controlled |
| Enhanced cards and carousel | DONE | Implemented in active `GameCard` and `Carousel` components |
| Leaderboard guest teaser UX | DONE | Flag-controlled teaser + sign-in CTA live in `/leaderboard` |
| Game-level auth CTA | DONE | CTA banner added on `/games/[slug]` for guests |
| Post-game completion modal | NEXT | Shared component design exists, but per-game completion hooks still needed |
| Server-persisted flags | NEXT | Flags remain browser-local until Supabase persistence is added |
