# 🎮 GameHub - Games + Portfolio Platform

A single Next.js + Supabase application that hosts a curated game library and a professional portfolio (projects, resume, and blog). Games remain modularized in `packages/` for reuse and performance.

## ✨ Highlights

- **Next.js + Supabase**: App Router frontend with Supabase Auth + Postgres.
- **Games in Packages**: Each game lives in `packages/games/*` and is loaded by the app.
- **Portfolio Ready**: Projects link directly to GitHub repositories.
- **Resume + Blog**: Public pages backed by Supabase content tables.
- **Admin Dashboard**: Content, feature-flag operations, and leaderboard moderation controls.
- **Responsive UI**: Mobile-first layouts with Tailwind CSS v4 and `@gamehub/ui`.

## 🧱 Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Supabase (Auth + Postgres)
- Tailwind CSS v4 + @gamehub/ui

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

If you add/update/remove dependencies, always sync lockfiles before commit:

```bash
pnpm lockfile:sync
```

Create a Supabase project and copy the env vars into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
KV_REST_API_URL="https://YOUR_UPSTASH_INSTANCE.upstash.io"
KV_REST_API_TOKEN="YOUR_UPSTASH_TOKEN"
```

Run rollout SQL scripts in order:

1. `scripts/001_resume_blog_content.rollout.sql`
2. `scripts/002_flags_leaderboard_roles.rollout.sql`
3. `scripts/003_leaderboard_moderation_and_flags_audit.rollout.sql`

## 🔐 Admin Access

1. Create a Supabase user (email + password).
2. Insert the user ID into the `app_admins` table.
3. Visit `/admin` and sign in.

The admin dashboard lets you:

- Add, edit, reorder, and hide resume sections
- Draft, edit, and publish blog posts
- Upload blog cover images to Supabase Storage
- Manage server-persisted feature flags with audit timeline/export
- Moderate leaderboard scores and lock/activate seasons

## 📁 Project Structure

```
app/                  # Next.js app router
components/           # Shared UI + admin components
lib/                  # Supabase clients + types
packages/
  game-platform/      # Shared game platform utilities + metadata
  games/              # Individual games (packages)
  ui/                 # UI component library
scripts/              # Supabase SQL rollouts/rollbacks
```

## 🧪 Useful Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:e2e:smoke`
- `pnpm test:all`
- `pnpm check:env`
- `pnpm smoke`
- `pnpm check:deps`
- `pnpm audit:all`

Guardrail:

- A repo pre-commit hook runs `pnpm guard:precommit` and blocks commits unless:
  - `pnpm install --frozen-lockfile` passes
  - `pnpm build` passes
- CI also verifies lockfiles do not drift after frozen install.

## 📚 Documentation

- `docs/SETUP.md` for environment and Supabase setup
- `docs/DEPLOYMENT.md` for deployment notes
- `docs/ADMIN_DASHBOARD_REQUIREMENTS.md` for admin scope
- `docs/ARCHITECTURE_CURRENT_STATE_2026-03-31.md` for current architecture, functionality status, and gap analysis

## ☁️ CI/CD

- GitHub CI workflows in `.github/workflows/`:
  - `ci.yml` for lint/type/unit/integration/build
  - `e2e.yml` for Playwright smoke E2E
- Vercel deploys via native Git integration (push-to-deploy)
- Vercel project config in `vercel.json`

---

Built for a clean, recruiter-friendly portfolio with strong technical depth.
