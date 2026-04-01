# UI/UX Design Improvements

Last updated: April 1, 2026

## Objective

Improve clarity, responsiveness, conversion, and accessibility without regressions, while keeping rollouts safe through feature flags.

## Recommendations

| Recommendation | Why it matters | Status |
| --- | --- | --- |
| Use flag-gated enhanced cards and carousel | Safer rollout and fast rollback | DONE |
| Improve loading feedback (shimmer/skeleton states) | Better perceived performance | DONE |
| Add guest-to-auth conversion UX on leaderboard and game surfaces | Better account conversion and clearer value | DONE |
| Keep controls touch-friendly and keyboard-usable | Mobile and accessibility baseline | DONE |
| Add post-game completion modal with smart CTA frequency | High-value conversion point after game completion | IN_PROGRESS |
| Persist feature flags server-side with auditability | Team-wide consistent behavior across devices | DONE |
| Add leaderboard moderation + season control operations | Safer anti-abuse and operational playbook | DONE |

## Security and UX guardrails

| Guardrail | Requirement |
| --- | --- |
| Auth-only ranking surfaces | Guests should not access full leaderboard content |
| Non-intrusive CTAs | Prompt users without blocking primary gameplay |
| Reduced-motion support | Respect `prefers-reduced-motion` for animations |
| Build-before-commit discipline | Avoid avoidable CI regressions |

## Remaining engineering tasks

| Priority | Task | Notes |
| --- | --- | --- |
| P1 | Hook game completion events to shared post-game modal | Requires a small completion contract per playable game |
| P2 | Add e2e coverage for guest/auth UX flows | Validate teaser/CTA and redirect behavior |
