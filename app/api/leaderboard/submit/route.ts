import { NextResponse } from "next/server";

import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import {
  dedupeHash,
  getActiveSeason,
  normalizeGameType,
  sanitizeMetadata,
  validateScore,
} from "@/lib/server/leaderboard";
import { createServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:leaderboard:submit:${ip}`,
    windowMs: 60_000,
    limit: 40,
  });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many score submissions" }, { status: 429 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    gameType?: string;
    score?: number;
    metadata?: unknown;
  };

  if (!payload.gameType || typeof payload.score !== "number") {
    return NextResponse.json({ error: "gameType and score are required" }, { status: 400 });
  }

  const gameType = normalizeGameType(payload.gameType);
  const score = Math.trunc(payload.score);
  validateScore(gameType, score);

  const metadata = sanitizeMetadata(payload.metadata);
  const clientHash = dedupeHash(user.id, gameType, score);

  const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString();
  const { data: recentDuplicate } = await supabase
    .from("leaderboard_scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_type", gameType)
    .eq("score", score)
    .gte("created_at", tenSecondsAgo)
    .limit(1)
    .maybeSingle();

  if (recentDuplicate?.id) {
    return NextResponse.json({ accepted: true, duplicate: true }, { status: 202 });
  }

  const activeSeason = await getActiveSeason();
  if (activeSeason?.is_locked) {
    return NextResponse.json(
      { error: "Active leaderboard season is locked for new submissions" },
      { status: 409 },
    );
  }
  const seasonId = activeSeason?.id ?? null;
  const playerName =
    (typeof user.user_metadata?.username === "string" && user.user_metadata.username.trim()) ||
    user.email?.split("@")[0] ||
    "player";

  const { data, error } = await supabase
    .from("leaderboard_scores")
    .insert({
      user_id: user.id,
      game_type: gameType,
      score,
      player_name: playerName,
      season_id: seasonId,
      metadata: metadata as Json,
      client_hash: clientHash,
    })
    .select("id, score, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to persist score", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    accepted: true,
    score: data.score,
    id: data.id,
    createdAt: data.created_at,
    gameType,
  });
}
