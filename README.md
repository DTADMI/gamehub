# 🎮 GameHub — Arcade & Game Platform

A Next.js monorepo hosting a curated library of 24 arcade, puzzle, strategy, and point-and-click games. Built with Next.js 16 (App Router), React 19, TypeScript, Supabase, and Tailwind CSS v4.

## ✨ Highlights

- **24 Games**: Arcade (breakout, snake, tetris, platformer, bubble-pop, tower-defense, block-blast, dungeon-delver), board (chess, checkers), puzzle (knitzy, memory, pattern-matching, spell-craft, chrono-shift, elemental-conflux, quantum-architect, glyph-weaver), point-and-click (systems-discovery, toymaker-escape, rite-of-discovery, escape-room, mystery-manor, artifact-hunter, clockwork-conspiracy)
- **Monorepo Architecture**: Each game in `packages/games/*`, loaded dynamically via `dynamicImport` + `ssr:false`
- **i18n**: 18 games wired via `@games/i18n` with EN/FR TX maps, Quebec French conventions
- **Feature Flags**: 25 boolean flags gating all games + social features via `lib/feature-flags.ts`
- **Leaderboard**: 12 game types registered with score submission + moderation
- **Dungeon Delver**: Roguelike with 7 races, 5 classes, 25 perks, modifier pipeline, procedural audio, particles, fog of war, merchant shop, equipment sets, daily challenge, 12 achievements
- **Admin Dashboard**: Feature flag operations and leaderboard moderation
- **Responsive UI**: Mobile-first layouts with Tailwind CSS v4 and `@gamehub/ui`

## 🧱 Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (Auth + Postgres + RLS)
- Tailwind CSS v4 + `@gamehub/ui`
- Vitest 4 (unit + integration), Playwright (E2E)
- Husky pre-commit + pre-push hooks
- GitHub Actions CI + Vercel deploy

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

Create a Supabase project and copy the env vars into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

Run rollout SQL scripts in order:

1. `scripts/002_flags_leaderboard_roles.rollout.sql`
2. `scripts/003_leaderboard_moderation_and_flags_audit.rollout.sql`

## 🔐 Admin Access

1. Create a Supabase user (email + password).
2. Insert the user ID into the `app_admins` table.
3. Visit `/admin` and sign in.

The admin dashboard lets you:
- Toggle feature flags for all 24 games + social features
- View audit timeline for flag changes
- Moderate leaderboard scores and lock/activate seasons

## 📁 Project Structure

```
app/                  # Next.js App Router (pages, layouts, API routes)
components/           # Shared UI + admin components
lib/                  # Supabase clients, feature flags, server utilities
packages/
  game-platform/      # Shared game platform utilities, contexts, metadata
  games/              # 24 individual games (packages)
  pointclick-engine/  # Point-and-click adventure engine
  ui/                 # UI component library (@gamehub/ui)
scripts/              # Supabase SQL rollouts/rollbacks, validation scripts
tests/                # Vitest unit and integration tests
tests-e2e/            # Playwright E2E smoke tests (46 spec files, 95 tests)
docs/                 # Technical documentation
```

## 🧪 Useful Scripts

- `pnpm dev` — Start dev server
- `pnpm build` — Production build (NF-GATE-001 gate)
- `pnpm lint` — ESLint
- `pnpm type-check` — TypeScript compiler check
- `pnpm test:unit` — Unit + component tests (vitest)
- `pnpm test:integration` — Integration tests (vitest)
- `pnpm test:e2e:smoke` — E2E smoke tests (Playwright)
- `pnpm test:all` — All tests
- `pnpm check:supabase-security` — RLS policy audit
- `pnpm check:deps` — Dependency audit
- `pnpm smoke` — Quick smoke test
- `pnpm run-all-checks` — Full pipeline (lint → tsc → unit → integration → security → build)

## 🔒 Pre-Commit & Pre-Push Gates

Husky enforces these gates (`.husky/`):

- **pre-commit**: lint → type-check → supabase-security → unit tests → encoding checks → **build** (NF-GATE-001)
- **pre-push**: type-check (full pipeline in GitHub Actions CI)

## 📚 Documentation

- `docs/action-plan.md` — Master task tracker with phase status
- `docs/technical/encoding-reference.md` — Encoding handling guide
- `docs/technical/performance-optimization.md` — SSR strategy, caching, revalidation
- `docs/technical/feature-flags-testing.md` — Feature flag testing guide
- `docs/games/dungeon-delver-design.md` — Dungeon Delver design document

## ☁️ CI/CD

- **CI** (`ci.yml`): lint → typecheck → unit tests → integration tests → build on push/PR to `main`
- **E2E** (`e2e.yml`): Playwright smoke tests
- **Deploy** (`vercel-deploy.yml`): Prebuilt output deploy to Vercel on `main` push

---

Built for clean architecture, game performance, and developer experience. Node 26.3.0, pnpm 11.5.0.