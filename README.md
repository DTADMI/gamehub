# 🎮 GameHub - Games + Portfolio Platform

A single Next.js + Supabase application that hosts a curated game library and a professional portfolio (projects, resume, and blog). Games remain modularized in `packages/` for reuse and performance.

## ✨ Highlights

- **Next.js + Supabase**: App Router frontend with Supabase Auth + Postgres.
- **Games in Packages**: Each game lives in `packages/games/*` and is loaded by the app.
- **Portfolio Ready**: Projects link directly to GitHub repositories.
- **Resume + Blog**: Public pages backed by Supabase content tables.
- **Admin Dashboard**: Create, edit, and publish resume sections and blog posts with a rich text editor.
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

Create a Supabase project and copy the env vars into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
KV_REST_API_URL="https://YOUR_UPSTASH_INSTANCE.upstash.io"
KV_REST_API_TOKEN="YOUR_UPSTASH_TOKEN"
```

Run the rollout SQL in `scripts/001_resume_blog_content.rollout.sql` to create the content tables and seed the resume data.

## 🔐 Admin Access

1. Create a Supabase user (email + password).
2. Insert the user ID into the `app_admins` table.
3. Visit `/admin` and sign in.

The admin dashboard lets you:

- Add, edit, reorder, and hide resume sections
- Draft, edit, and publish blog posts

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

Guardrail:

- A repo pre-commit hook runs `pnpm build` and blocks commits on build failure.

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
