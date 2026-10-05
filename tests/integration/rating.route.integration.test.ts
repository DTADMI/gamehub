import { beforeEach, describe, expect, it, vi } from "vitest";

const dbState = vi.hoisted(() => ({
  rows: [] as unknown[],
  rpc: {} as Record<string, number | null>,
  rpcError: null as unknown,
}));

vi.mock("@/lib/supabase/server", () => {
  const makeChain = () => {
    const chain: Record<string, unknown> = {
      select: () => chain,
      eq: () => chain,
      then: (resolve: (value: unknown) => void) => resolve({ data: dbState.rows, error: null }),
    };
    return chain;
  };
  return {
    createServerClient: vi.fn().mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
      from: () => makeChain(),
      rpc: async (_name: string, args: { p_game_type: string }) => ({
        data: dbState.rpc[args.p_game_type] ?? null,
        error: dbState.rpcError,
      }),
    }),
  };
});

import { GET } from "@/app/api/rating/route";

function get() {
  return GET(new Request("http://localhost/api/rating"));
}

describe("rating route (B4)", () => {
  beforeEach(() => {
    dbState.rows = [];
    dbState.rpc = {};
    dbState.rpcError = null;
  });

  it("renvoie une note nulle et aucune partie sans score", async () => {
    const response = await get();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.games).toEqual([]);
    expect(json.aggregate).toBeNull();
  });

  it("calcule le percentile du meilleur score par jeu et la note agregee", async () => {
    dbState.rows = [
      { game_type: "SNAKE", score: 100 },
      { game_type: "SNAKE", score: 250 },
      { game_type: "TETRIS", score: 400 },
    ];
    dbState.rpc = { SNAKE: 90, TETRIS: 60 };

    const response = await get();
    const json = await response.json();

    // SNAKE garde le plus haut (desc), TETRIS aussi
    const snake = json.games.find((g: { gameType: string }) => g.gameType === "SNAKE");
    expect(snake.score).toBe(250);
    expect(snake.percentile).toBe(90);
    // Note = moyenne des (jusqu'a) 3 meilleurs percentiles
    expect(json.aggregate).toBe(75);
  });

  it("garde le score le PLUS BAS pour un jeu en direction asc", async () => {
    dbState.rows = [
      { game_type: "MEMORY", score: 30 },
      { game_type: "MEMORY", score: 18 },
    ];
    dbState.rpc = { MEMORY: 80 };

    const response = await get();
    const json = await response.json();
    const memory = json.games.find((g: { gameType: string }) => g.gameType === "MEMORY");
    expect(memory.score).toBe(18);
    expect(memory.direction).toBe("asc");
  });

  it("n'invente pas de note quand le percentile est indisponible", async () => {
    dbState.rows = [{ game_type: "SNAKE", score: 100 }];
    dbState.rpc = { SNAKE: null };

    const response = await get();
    const json = await response.json();
    expect(json.games[0].percentile).toBeNull();
    expect(json.aggregate).toBeNull();
  });

  it("remonte une erreur de base au lieu de la masquer", async () => {
    dbState.rows = [{ game_type: "SNAKE", score: 100 }];
    dbState.rpcError = { code: "42P01", message: "relation does not exist" };

    const response = await get();
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.code).toBe("42P01");
  });
});
