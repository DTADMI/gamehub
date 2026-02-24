# Setup

GameHub is a single Next.js application with Supabase for content and admin authentication.

## Requirements

- Node.js (see `package.json` engines)
- pnpm
- Supabase project (Auth + Postgres)

## Environment Variables

Create `.env.local` and add:

```
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Optional social links used in the header:

```
NEXT_PUBLIC_GITHUB_URL="https://github.com/your-handle"
NEXT_PUBLIC_LINKEDIN_URL="https://www.linkedin.com/in/your-handle"
```

## Database Setup

Run the rollout script in Supabase SQL editor:

- `scripts/001_resume_blog_content.rollout.sql`

To rollback:

- `scripts/001_resume_blog_content.rollback.sql`

## Install & Run

```bash
pnpm install
pnpm dev
```

## Admin Access

1. Create a Supabase user (email + password).
2. Add the user ID to `app_admins`.
3. Sign in at `/admin`.
