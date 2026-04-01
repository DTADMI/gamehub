drop policy if exists "Users insert own scores" on public.leaderboard_scores;
create policy "Users insert own scores"
on public.leaderboard_scores
for insert
with check (user_id = auth.uid());

drop policy if exists "Admins insert leaderboard moderation audit" on public.leaderboard_score_moderation_audit;
drop policy if exists "Admins read leaderboard moderation audit" on public.leaderboard_score_moderation_audit;

drop table if exists public.leaderboard_score_moderation_audit;

drop index if exists feature_flag_audit_created_idx;
drop index if exists leaderboard_scores_game_status_created_at_idx;
drop index if exists leaderboard_scores_status_created_at_idx;
drop index if exists leaderboard_seasons_single_active_idx;

alter table public.leaderboard_scores
  drop column if exists moderation_note,
  drop column if exists moderation_reason,
  drop column if exists moderated_by,
  drop column if exists moderated_at,
  drop column if exists status;

alter table public.leaderboard_seasons
  drop column if exists locked_by,
  drop column if exists locked_at,
  drop column if exists is_locked;
