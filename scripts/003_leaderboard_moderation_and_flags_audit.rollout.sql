-- 003_leaderboard_moderation_and_flags_audit.rollout.sql
-- Adds:
-- - leaderboard moderation fields + audit trail
-- - season lock controls + single active-season guardrail
-- - admin-readable feature flag audit query performance indexes

alter table public.leaderboard_seasons
  add column if not exists is_locked boolean not null default false,
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by uuid references auth.users(id) on delete set null;

create unique index if not exists leaderboard_seasons_single_active_idx
  on public.leaderboard_seasons((is_active))
  where is_active = true;

alter table public.leaderboard_scores
  add column if not exists status text not null default 'valid'
    check (status in ('valid', 'flagged', 'removed')),
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderation_reason text,
  add column if not exists moderation_note text;

create index if not exists leaderboard_scores_status_created_at_idx
  on public.leaderboard_scores(status, created_at desc);

create index if not exists leaderboard_scores_game_status_created_at_idx
  on public.leaderboard_scores(game_type, status, created_at desc);

create table if not exists public.leaderboard_score_moderation_audit (
  id uuid primary key default gen_random_uuid(),
  score_id uuid not null references public.leaderboard_scores(id) on delete cascade,
  old_status text,
  new_status text not null check (new_status in ('valid', 'flagged', 'removed')),
  reason text,
  note text,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  request_ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_score_moderation_audit_score_created_idx
  on public.leaderboard_score_moderation_audit(score_id, created_at desc);

create index if not exists leaderboard_score_moderation_audit_actor_created_idx
  on public.leaderboard_score_moderation_audit(actor_user_id, created_at desc);

create index if not exists feature_flag_audit_created_idx
  on public.feature_flag_audit(created_at desc);

create or replace function public.get_leaderboard(
  p_game_type text,
  p_limit integer default 10,
  p_season_slug text default null
)
returns table (
  rank integer,
  user_id uuid,
  player_name text,
  score integer,
  submitted_at timestamptz
)
language sql
stable
as $$
with active_season as (
  select id
  from public.leaderboard_seasons
  where
    case
      when p_season_slug is null then is_active = true
      else slug = p_season_slug
    end
  order by created_at desc
  limit 1
),
best_scores as (
  select
    s.user_id,
    max(s.player_name) as player_name,
    max(s.score) as score,
    max(s.created_at) as submitted_at
  from public.leaderboard_scores s
  left join active_season a on true
  where
    s.game_type = p_game_type
    and s.status = 'valid'
    and (
      a.id is null
      or s.season_id = a.id
    )
  group by s.user_id
)
select
  row_number() over (order by score desc, submitted_at asc)::integer as rank,
  user_id,
  player_name,
  score,
  submitted_at
from best_scores
order by score desc, submitted_at asc
limit greatest(1, least(coalesce(p_limit, 10), 100));
$$;

alter table public.leaderboard_score_moderation_audit enable row level security;

drop policy if exists "Admins read leaderboard moderation audit" on public.leaderboard_score_moderation_audit;
create policy "Admins read leaderboard moderation audit"
on public.leaderboard_score_moderation_audit
for select
using (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
      and a.role in ('owner', 'admin')
  )
);

drop policy if exists "Admins insert leaderboard moderation audit" on public.leaderboard_score_moderation_audit;
create policy "Admins insert leaderboard moderation audit"
on public.leaderboard_score_moderation_audit
for insert
with check (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
      and a.role in ('owner', 'admin')
  )
);

drop policy if exists "Users insert own scores" on public.leaderboard_scores;
create policy "Users insert own scores"
on public.leaderboard_scores
for insert
with check (
  user_id = auth.uid()
  and status = 'valid'
);
