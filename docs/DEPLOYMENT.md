# Deployment

GameHub is a single Next.js application backed by Supabase. Deploy the Next.js app to your preferred host (Vercel, Cloud Run, etc.) and point it at your Supabase project.

## Environment

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
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
