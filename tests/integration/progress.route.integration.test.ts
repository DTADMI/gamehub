import { beforeEach, describe, expect, it, vi } from "vitest";

const serverState = vi.hoisted(() => ({ row: null as unknown, saved: null as unknown }));

vi.mock("@/lib/supabase/server", () => {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  Object.assign(chain, {
    select: self,
    eq: self,
    upsert: (payload: unknown) => {
      serverState.saved = payload;
      return chain;
    },
    single: async () => ({ data: serverState.saved ?? serverState.row, error: null }),
    maybeSingle: async () => ({ data: serverState.row, error: null }),
  });
  return {
    createServerClient: vi.fn().mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: "user-1", email: "p@test.dev" } } }),
      },
      from: () => chain,
    }),
  };
});

import { GET, PUT } from "@/app/api/progress/route";

function put(body: unknown) {
  return PUT(
    new Request("http://localhost/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("progress route (B8 / D1)", () => {
  beforeEach(() => {
    serverState.row = null;
    serverState.saved = null;
  });

  it("ecrit la progression quand le serveur est vide", async () => {
    const response = await put({
      gameId: "SNAKE",
      data: { level: 3 },
      updatedAt: "2026-10-03T10:00:00.000Z",
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
  });

  it("presente le conflit (409) quand la copie distante est plus recente", async () => {
    serverState.row = {
      game_id: "SNAKE",
      progress: { level: 9 },
      updated_at: "2026-10-09T10:00:00.000Z",
    };
    const response = await put({
      gameId: "SNAKE",
      data: { level: 3 },
      updatedAt: "2026-10-03T10:00:00.000Z",
    });
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.conflict).toBe(true);
    expect(json.reason).toBe("stale_local");
    expect(json.record.data).toEqual({ level: 9 });
  });

  it("ecrit quand la copie locale est plus recente", async () => {
    serverState.row = {
      game_id: "SNAKE",
      progress: { level: 3 },
      updated_at: "2026-10-01T10:00:00.000Z",
    };
    const response = await put({
      gameId: "SNAKE",
      data: { level: 5 },
      updatedAt: "2026-10-05T10:00:00.000Z",
    });
    expect(response.status).toBe(200);
  });

  it("rejette un corps invalide", async () => {
    const response = await put({ gameId: "", data: { a: 1 }, updatedAt: "pas-une-date" });
    expect(response.status).toBe(400);
  });

  it("GET renvoie null quand aucune copie n'existe", async () => {
    const response = await GET(new Request("http://localhost/api/progress?gameId=SNAKE"));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.record).toBeNull();
  });

  it("GET exige un gameId", async () => {
    const response = await GET(new Request("http://localhost/api/progress"));
    expect(response.status).toBe(400);
  });
});
