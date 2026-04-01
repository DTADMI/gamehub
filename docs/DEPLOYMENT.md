# Deployment

GameHub is a single Next.js application backed by Supabase. Deploy the Next.js app to your preferred host (Vercel, Cloud Run, etc.) and point it at your Supabase project.

## Environment

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
KV_REST_API_URL
KV_REST_API_TOKEN
```

Optional:

```
NEXT_PUBLIC_GITHUB_URL
NEXT_PUBLIC_LINKEDIN_URL
```

## Supabase

Run the rollout SQL for content tables:

- `scripts/001_resume_blog_content.rollout.sql`

## Build

```bash
pnpm install
pnpm build
pnpm start
```

## GitHub and Vercel Deployment

- GitHub Actions:
  - `.github/workflows/ci.yml`
  - `.github/workflows/e2e.yml`
- Vercel deployment path:
  - Native Vercel Git integration (no GitHub `vercel` CLI deploy workflow).
  - Vercel build behavior is configured in `vercel.json`.
  - Preview deploys can be skipped for docs/metadata-only changes via `scripts/vercel-ignore-build.mjs`.
- Vercel dashboard settings (recommended):
  - Framework Preset: `Next.js`
  - Root Directory: `/`
  - Node.js Version: `24.x`
  - Include files outside root directory in the Build Step: `Enabled`
  - Skip deployments when no changes to root directory/dependencies: `Enabled`
  - Ignored Build Step: `Automatic`
  - On-Demand Concurrent Builds: `Run all builds immediately`
  - Build Machine: `Turbo` (or `Elastic` to reduce cost)
