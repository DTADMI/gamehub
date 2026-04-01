# Setup

GameHub is a single Next.js application with Supabase for content and admin authentication.

## Requirements

- Node.js (see `package.json` engines)
- pnpm
- Supabase project (Auth + Postgres)

## Environment Variables

Create `.env.local` and add:

```
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_DISABLE_PROVIDERS="false"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
KV_REST_API_URL="https://YOUR_UPSTASH_INSTANCE.upstash.io"
KV_REST_API_TOKEN="YOUR_UPSTASH_TOKEN"
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_PROJECT.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_PROJECT.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
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

## Validation Commands

```bash
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:integration
pnpm test:e2e:smoke
pnpm check:env
pnpm smoke
```

## Admin Access

1. Create a Supabase user (email + password).
2. Add the user ID to `app_admins`.
3. Sign in at `/admin`.
