import { NextResponse } from "next/server";

import { aggregateRating, type ScoreDirection } from "@gamehub/game-platform/lib/rating";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Note inter-jeux (B4).
 *
 * GET /api/rating -> percentiles du joueur par jeu + note agregee.
 *
 * Un score brut n'est comparable qu'a l'interieur d'un jeu : on renvoie donc la
 * position relative (percentile) du joueur dans la population de chaque jeu, puis
 * une note = moyenne de ses N meilleurs jeux. Le classement par jeu reste
 * inchange ; cette route ne sert qu'a la vue inter-jeux.
 */

/** Direction du score par type de jeu (defaut : plus haut = mieux). */
const GAME_DIRECTION: Record<string, ScoreDirection> = {
  MEMORY: "asc",
  KNITZY: "asc",
};

type ScoreRow = { game_type: string; score: number };

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({ key: `api:rating:get:${ip}`, windowMs: 60_000, limit: 120 });
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

  const { data, error } = await supabase
    .from("leaderboard_scores")
    .select("game_type, score")
    .eq("user_id", user.id)
    .eq("status", "valid");

  if (error) {
    console.error("rating GET scores failed", { code: error.code, message: error.message });
    return NextResponse.json(
      { error: "Failed to load scores", code: error.code ?? null },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as ScoreRow[];

  // Meilleur score par jeu, selon la direction du jeu.
  const bestByGame = new Map<string, number>();
  for (const row of rows) {
    const direction = GAME_DIRECTION[row.game_type] ?? "desc";
    const current = bestByGame.get(row.game_type);
    if (current === undefined) {
      bestByGame.set(row.game_type, row.score);
      continue;
    }
    const better = direction === "asc" ? row.score < current : row.score > current;
    if (better) bestByGame.set(row.game_type, row.score);
  }

  const games: Array<{ gameType: string; score: number; percentile: number | null; direction: ScoreDirection }> = [];
  for (const [gameType, score] of bestByGame) {
    const direction = GAME_DIRECTION[gameType] ?? "desc";
    const { data: percentile, error: rpcError } = await supabase.rpc("get_game_percentile", {
      p_game_type: gameType,
      p_score: score,
      p_direction: direction,
    });
    if (rpcError) {
      console.error("rating GET percentile failed", {
        code: rpcError.code,
        message: rpcError.message,
        gameType,
      });
      return NextResponse.json(
        { error: "Failed to compute rating", code: rpcError.code ?? null },
        { status: 500 },
      );
    }
    games.push({
      gameType,
      score,
      percentile: percentile === null || percentile === undefined ? null : Number(percentile),
      direction,
    });
  }

  games.sort((a, b) => (b.percentile ?? -1) - (a.percentile ?? -1));

  const aggregate = aggregateRating(
    games.map((g) => g.percentile).filter((p): p is number => p !== null),
    { topN: 3 },
  );

  return NextResponse.json({
    aggregate,
    games,
    note: "Note normalisee (moyenne des 3 meilleurs percentiles). Le classement par jeu reste la comparaison de reference.",
  });
}
