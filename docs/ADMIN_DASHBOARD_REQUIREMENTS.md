# Admin Dashboard - Scope Update

**Project**: GameHub Admin Dashboard
**Status**: ✅ Implemented (content + flags + leaderboard moderation)
**Priority**: High (portfolio readiness)

## Implemented Scope

The admin dashboard now supports:

- Resume sections (create, update, reorder, hide)
- Blog posts (draft, publish, edit, delete)
- Blog cover uploads to Supabase Storage
- Rich Text Editor for content editing
- Server-backed feature flags with audit trail
- Feature-flag audit timeline + CSV export
- Leaderboard moderation (score status, season lock, active season switch)

## Routes

```
/admin
/admin/resume
/admin/blog
/admin/flags
/admin/leaderboard
```

## Authentication

- Supabase Auth (email + password)
- Admin access is granted via the `app_admins` table

## Next Steps (Future Expansion)

- User management
- Project analytics
- Delegated policy UI for per-feature approvals
- Unified post-game CTA telemetry and experimentation
