-- 005_game_percentile.sql
-- Adds: a per-game percentile function (B4, cross-game rating).
--
-- A raw score is only comparable inside its own game. This function returns the
-- percentile (0-100) of a given score within a game's valid population, taking a
-- direction: 'desc' = higher is better, 'asc' = lower is better (time, moves).
--
-- It is SECURITY DEFINER with row_security off because the population must be the
-- WHOLE population, not the caller's RLS-visible subset. It returns a single
-- rounded number (no rows, no identifiers), so granting EXECUTE to authenticated
-- is minimal and safe; anon and PUBLIC are revoked.

create or replace function public.get_game_percentile(
  p_game_type text,
  p_score integer,
  p_direction text default 'desc'
)
returns numeric
language sql
stable
security definer
set search_path = public, extensions
set row_security = off
as $$
with population as (
  select s.score
  from public.leaderboard_scores s
  where s.game_type = p_game_type
    and s.status = 'valid'
)
select round(
  100.0 * count(*) filter (
    where case
      when p_direction = 'asc' then p_score <= score
      else p_score >= score
    end
  ) / nullif(count(*), 0),
  2
)
from population;
$$;

comment on function public.get_game_percentile(text, integer, text) is
  'Percentile (0-100) of a score within a game population, direction-aware. Returns NULL for an empty population. B4 cross-game rating.';

revoke all on function public.get_game_percentile(text, integer, text) from public;
revoke all on function public.get_game_percentile(text, integer, text) from anon;
grant execute on function public.get_game_percentile(text, integer, text) to authenticated;
grant execute on function public.get_game_percentile(text, integer, text) to service_role;

-- Index to make the population scan cheap.
create index if not exists leaderboard_scores_game_status_score_idx
  on public.leaderboard_scores(game_type, status, score);
