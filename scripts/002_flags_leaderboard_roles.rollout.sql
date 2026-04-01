-- 002_flags_leaderboard_roles.rollout.sql
-- Adds:
-- - admin role hardening + role constraints
-- - server-persisted feature flags + audit trail
-- - leaderboard seasons + scores model with anti-spam helpers

create extension if not exists pgcrypto;

alter table public.app_admins
  alter column role set default 'admin';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_admins_role_check'
  ) then
    alter table public.app_admins
      add constraint app_admins_role_check
      check (role in ('owner', 'admin', 'editor', 'analyst'));
  end if;
end $$;

create table if not exists public.feature_flags (
  path text primary key,
  value jsonb not null,
  is_sensitive boolean not null default false,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flag_audit (
  id uuid primary key default gen_random_uuid(),
  flag_path text not null references public.feature_flags(path) on delete cascade,
  old_value jsonb,
  new_value jsonb,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  request_ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists feature_flag_audit_flag_path_created_at_idx
  on public.feature_flag_audit(flag_path, created_at desc);

create table if not exists public.leaderboard_seasons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_active boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  game_type text not null check (game_type in (
    'SNAKE',
    'BUBBLE_POP',
    'TETRIS',
    'BREAKOUT',
    'KNITZY',
    'MEMORY',
    'CHECKERS',
    'CHESS',
    'PLATFORMER',
    'TOWER_DEFENSE'
  )),
  score integer not null check (score > 0),
  season_id uuid references public.leaderboard_seasons(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  client_hash text,
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_scores_game_type_created_at_idx
  on public.leaderboard_scores(game_type, created_at desc);

create index if not exists leaderboard_scores_user_game_created_at_idx
  on public.leaderboard_scores(user_id, game_type, created_at desc);

create unique index if not exists leaderboard_scores_dedupe_idx
  on public.leaderboard_scores(user_id, game_type, client_hash, created_at);

insert into public.leaderboard_seasons (slug, name, starts_at, is_active)
values ('s1-2026', 'Season 1 (2026)', now() - interval '7 days', true)
on conflict (slug) do nothing;

insert into public.feature_flags (path, value, is_sensitive, description)
values
  ('ui.allowPlayUpcomingLocal', 'false'::jsonb, true, 'Allow local play for upcoming games'),
  ('ui.enhancedGameCards', 'true'::jsonb, false, 'Enhanced game card interactions'),
  ('ui.enhancedCarousel', 'true'::jsonb, false, 'Enhanced carousel controls'),
  ('ui.shimmerSkeletons', 'true'::jsonb, false, 'Shimmer loading states'),
  ('ui.animatedHero', 'true'::jsonb, false, 'Homepage hero animation'),
  ('ui.postGameAuthCTA', 'true'::jsonb, false, 'Post-game auth call-to-action'),
  ('auth.leaderboardGuestTeaser', 'true'::jsonb, false, 'Leaderboard teaser for guests'),
  ('auth.postGameCTAFrequency', '"occasional"'::jsonb, false, 'Post-game CTA frequency'),
  ('auth.requireEmailVerification', 'false'::jsonb, true, 'Require email verification'),
  ('auth.magicLinkLogin', 'false'::jsonb, true, 'Enable magic link auth'),
  ('games.socialShare', 'false'::jsonb, false, 'Enable social sharing'),
  ('experimental.realtimeMultiplayer', 'false'::jsonb, true, 'Enable realtime multiplayer'),
  ('experimental.threeJsGames', 'false'::jsonb, true, 'Enable 3D mode flags')
on conflict (path) do update
set value = excluded.value,
    is_sensitive = excluded.is_sensitive,
    description = excluded.description;

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

alter table public.feature_flags enable row level security;
alter table public.feature_flag_audit enable row level security;
alter table public.leaderboard_seasons enable row level security;
alter table public.leaderboard_scores enable row level security;

drop policy if exists "Authenticated read feature flags" on public.feature_flags;
create policy "Authenticated read feature flags"
on public.feature_flags
for select
using (auth.role() = 'authenticated');

drop policy if exists "Admins manage feature flags" on public.feature_flags;
create policy "Admins manage feature flags"
on public.feature_flags
for all
using (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "Admins read feature flag audit" on public.feature_flag_audit;
create policy "Admins read feature flag audit"
on public.feature_flag_audit
for select
using (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "Admins insert feature flag audit" on public.feature_flag_audit;
create policy "Admins insert feature flag audit"
on public.feature_flag_audit
for insert
with check (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "Authenticated read seasons" on public.leaderboard_seasons;
create policy "Authenticated read seasons"
on public.leaderboard_seasons
for select
using (auth.role() = 'authenticated');

drop policy if exists "Owners manage seasons" on public.leaderboard_seasons;
create policy "Owners manage seasons"
on public.leaderboard_seasons
for all
using (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
      and a.role in ('owner', 'admin')
  )
);

drop policy if exists "Authenticated read scores" on public.leaderboard_scores;
create policy "Authenticated read scores"
on public.leaderboard_scores
for select
using (auth.role() = 'authenticated');

drop policy if exists "Users insert own scores" on public.leaderboard_scores;
create policy "Users insert own scores"
on public.leaderboard_scores
for insert
with check (user_id = auth.uid());

drop policy if exists "Admins moderate scores" on public.leaderboard_scores;
create policy "Admins moderate scores"
on public.leaderboard_scores
for all
using (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
      and a.role in ('owner', 'admin')
  )
);
