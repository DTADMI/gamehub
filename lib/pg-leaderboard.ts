import "server-only";

import { createServerClient } from "@/lib/supabase/server";

export async function pgUpdateScore(leaderboardKey: string, userId: string, score: number): Promise<void> {
  const supabase = await createServerClient();
  await (supabase as any)
    .from("leaderboard_entries")
    .upsert({
      user_id: userId,
      game_type: leaderboardKey,
      score,
      player_name: userId,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "user_id,game_type", ignoreDuplicates: false });
}

export async function pgGetTopScores(leaderboardKey: string, limit = 100): Promise<Array<{ user_id: string; score: number; rank: number }>> {
  const supabase = await createServerClient();
  const { data } = await (supabase as any)
    .from("leaderboard_entries")
    .select("user_id,score")
    .eq("game_type", leaderboardKey)
    .order("score", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Array<{ user_id: string; score: number }>).map((entry, index) => ({
    user_id: entry.user_id,
    score: entry.score,
    rank: index + 1,
  }));
}
