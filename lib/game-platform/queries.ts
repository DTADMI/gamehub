// lib/game-platform/queries.ts
// Stub implementations for score submission and leaderboard.
// Replace with real GraphQL calls when the backend is connected.

export type GameType =
  | "SNAKE" | "BUBBLE_POP" | "TETRIS" | "BREAKOUT" | "KNITZY"
  | "MEMORY" | "CHECKERS" | "CHESS" | "PLATFORMER" | "TOWER_DEFENSE";

export type LeaderboardEntry = {
  rank: number;
  user: { id: string; username: string; avatar?: string | null };
  score: number;
  gameType: GameType;
};

export type SubmitScoreResult = {
  submitScore: {
    id: string;
    score: number;
    createdAt: string;
    gameType: GameType;
    user: { id: string; username: string };
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function gqlFetch<T = any>(opts: { query: string; variables?: Record<string, any> }): Promise<T> {
  if (!API_URL) {
    console.warn("[game-platform] No API_URL configured; returning empty result.");
    return {} as T;
  }
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  const json = await res.json();
  return json.data;
}

export async function submitScore(params: {
  gameType: GameType;
  score: number;
  metadata?: Record<string, any>;
}): Promise<SubmitScoreResult> {
  if (!API_URL) {
    console.info("[game-platform] Score submitted locally:", params.gameType, params.score);
    return {
      submitScore: {
        id: crypto.randomUUID(),
        score: params.score,
        createdAt: new Date().toISOString(),
        gameType: params.gameType,
        user: { id: "local", username: "Player" },
      },
    };
  }
  return gqlFetch<SubmitScoreResult>({
    query: `mutation SubmitScore($input: ScoreInput!) { submitScore(input: $input) { id score createdAt gameType user { id username } } }`,
    variables: { input: params },
  });
}

export async function fetchLeaderboard(params: {
  gameType: GameType;
  limit?: number;
}): Promise<{ leaderboard: LeaderboardEntry[] }> {
  const data = await fetchLeaderboardPaged({ gameType: params.gameType, first: params.limit ?? 25 });
  const entries = data.leaderboard?.edges?.map((e: any) => e.node) ?? [];
  return { leaderboard: entries };
}

export async function fetchLeaderboardPaged(params: {
  gameType: GameType;
  first?: number;
  after?: string | null;
}): Promise<any> {
  if (!API_URL) return { leaderboard: { edges: [], pageInfo: { hasNextPage: false } } };
  return gqlFetch({
    query: `query Leaderboard($gameType: GameType!, $first: Int, $after: String) { leaderboard(gameType: $gameType, first: $first, after: $after) { edges { cursor node { rank score gameType user { id username avatar } } } pageInfo { hasNextPage endCursor } } }`,
    variables: params,
  });
}
