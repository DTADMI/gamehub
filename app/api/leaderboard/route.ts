import { NextResponse } from "next/server";

import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { normalizeGameType } from "@/lib/server/leaderboard";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:leaderboard:get:${ip}`,
    windowMs: 60_000,
    limit: 240,
  });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const gameTypeParam = url.searchParams.get("gameType") ?? "SNAKE";
  const limitParam = Number(url.searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, Math.trunc(limitParam))) : 10;

  const gameType = normalizeGameType(gameTypeParam);

  const { data: season } = await supabase
    .from("leaderboard_seasons")
    .select("id, slug, name")
    .eq("is_active", true)
    .maybeSingle();

  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_game_type: gameType,
    p_limit: limit,
    p_season_slug: season?.slug ?? null,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load leaderboard", details: error.message },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as Array<{
    rank: number;
    user_id: string;
    player_name: string;
    score: number;
    submitted_at: string;
  }>;

  return NextResponse.json({
    gameType,
    season: season ?? null,
    entries: rows.map((row) => ({
      rank: row.rank,
      score: row.score,
      submittedAt: row.submitted_at,
      user: {
        id: row.user_id,
        username: row.player_name,
      },
    })),
  });
}
