-- 004_user_game_progress.sql
-- Adds: cloud save of game progression (B8, decision register D1, option C).
--
-- Server is the source of truth; the browser keeps a working copy. Conflict
-- resolution is NEVER silent: rows carry `updated_at`, and the API returns the
-- server row on a stale write instead of overwriting it.
--
-- Only bounded, non-sensitive data is stored: a bounded JSON document per
-- (user, game), never an unbounded inventory.

create table if not exists public.user_game_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, game_id),
  constraint user_game_progress_payload_bounded
    check (pg_column_size(progress) <= 65536)
);

comment on table public.user_game_progress is
  'Cloud-saved game progression, one bounded JSON document per (user, game). Server is the source of truth; conflicts are resolved by updated_at and surfaced, never silently overwritten.';

create index if not exists user_game_progress_user_updated_idx
  on public.user_game_progress(user_id, updated_at desc);

alter table public.user_game_progress enable row level security;

drop policy if exists "Users read own game progress" on public.user_game_progress;
create policy "Users read own game progress"
on public.user_game_progress
for select
using (user_id = auth.uid());

drop policy if exists "Users insert own game progress" on public.user_game_progress;
create policy "Users insert own game progress"
on public.user_game_progress
for insert
with check (user_id = auth.uid());

drop policy if exists "Users update own game progress" on public.user_game_progress;
create policy "Users update own game progress"
on public.user_game_progress
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users delete own game progress" on public.user_game_progress;
create policy "Users delete own game progress"
on public.user_game_progress
for delete
using (user_id = auth.uid());

revoke all on table public.user_game_progress from anon;
grant select, insert, update, delete on table public.user_game_progress to authenticated;
