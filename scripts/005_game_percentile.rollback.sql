-- Rollback: 005_game_percentile
-- Reverses 005_game_percentile.sql completely.

drop index if exists leaderboard_scores_game_status_score_idx;

drop function if exists public.get_game_percentile(text, integer, text);
