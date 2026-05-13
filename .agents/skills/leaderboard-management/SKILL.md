---
name: leaderboard-management
description: Manage GameHub leaderboard schema, anti-cheat measures, ranking queries, score submission validation, and leaderboard UI. Use when a task touches leaderboard data, score integrity, ranking display, or leaderboard-related API routes.
---

# Leaderboard Management

Use this skill for leaderboard and scoring work.

## Workflow

1. Identify the leaderboard surface: schema design, score submission, ranking queries, anti-cheat validation, or leaderboard UI.
2. Enforce server-side score validation: never trust client-submitted scores without server-side integrity checks.
3. Rate-limit score submissions per user per time window to prevent spam and abuse.
4. Use efficient ranking queries: materialized views or cached top-N queries for high-traffic leaderboards.
5. Support guest leaderboard teaser mode behind the `auth.leaderboardGuestTeaser` feature flag.
6. Keep leaderboard UI responsive: paginated results, skeleton loading states, and mobile-friendly layout.
7. Verify that leaderboard queries respect RLS policies and user visibility rules.

## Guardrails

- Do not accept client-side score computation without server validation.
- Do not expose internal ranking algorithms or anti-cheat thresholds to end users.
- Keep admin-only leaderboard tools behind admin role checks.
