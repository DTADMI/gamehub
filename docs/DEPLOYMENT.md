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
  - `.github/workflows/deploy.yml`
- Required GitHub Secrets for deploy:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- Vercel build behavior is configured in `vercel.json`.
