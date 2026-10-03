-- Rollback: 004_user_game_progress
-- Reverses 004_user_game_progress.sql completely.

drop policy if exists "Users delete own game progress" on public.user_game_progress;
drop policy if exists "Users update own game progress" on public.user_game_progress;
drop policy if exists "Users insert own game progress" on public.user_game_progress;
drop policy if exists "Users read own game progress" on public.user_game_progress;

drop index if exists user_game_progress_user_updated_idx;

drop table if exists public.user_game_progress;
