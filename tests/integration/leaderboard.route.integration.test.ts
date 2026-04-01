import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "user-1",
            email: "player@test.dev",
            user_metadata: { username: "player-one" },
          },
        },
      }),
    },
    from: (table: string) => {
      if (table === "leaderboard_scores") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  gte: () => ({
                    limit: () => ({
                      maybeSingle: async () => ({ data: null }),
                    }),
                  }),
                }),
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "s1", score: 123, created_at: new Date().toISOString() },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "leaderboard_seasons") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: "season-1" } }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null }),
          }),
        }),
      };
    },
    rpc: async () => ({
      data: [
        {
          rank: 1,
          user_id: "user-1",
          player_name: "player-one",
          score: 123,
          submitted_at: new Date().toISOString(),
        },
      ],
      error: null,
    }),
  }),
}));

describe("leaderboard routes", () => {
  it("accepts score submission for authenticated user", async () => {
    const { POST } = await import("@/app/api/leaderboard/submit/route");
    const response = await POST(
      new Request("http://localhost/api/leaderboard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "SNAKE", score: 123 }),
      }),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.accepted).toBe(true);
  });

  it("returns leaderboard rows for authenticated user", async () => {
    const { GET } = await import("@/app/api/leaderboard/route");
    const response = await GET(
      new Request("http://localhost/api/leaderboard?gameType=SNAKE&limit=10"),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(json.entries)).toBe(true);
    expect(json.entries[0].user.username).toBe("player-one");
  });
});
