# Quick Start

```bash
pnpm install
pnpm dev
```

## Required Env Vars

```
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

## Supabase Schema

Run the rollout script:

- `scripts/001_resume_blog_content.rollout.sql`

## Admin

Visit `/admin` and sign in with a Supabase user that exists in `app_admins`.
