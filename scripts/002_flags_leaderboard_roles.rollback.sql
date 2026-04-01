drop function if exists public.get_leaderboard(text, integer, text);

drop table if exists public.feature_flag_audit;
drop table if exists public.feature_flags;
drop table if exists public.leaderboard_scores;
drop table if exists public.leaderboard_seasons;

alter table public.app_admins
  drop constraint if exists app_admins_role_check;
