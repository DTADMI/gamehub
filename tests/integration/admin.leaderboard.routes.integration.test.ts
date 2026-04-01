import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  getAdminUser: vi.fn().mockResolvedValue({
    user: { id: "u1", email: "admin@test.dev" },
    isAdmin: true,
    role: "admin",
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    from: (table: string) => {
      if (table === "leaderboard_seasons") {
        return {
          select: () => ({
            order: () => ({
              limit: async () => ({
                data: [
                  {
                    id: "season-1",
                    slug: "s1-2026",
                    name: "Season 1",
                    starts_at: "2026-03-01T00:00:00.000Z",
                    ends_at: null,
                    is_active: true,
                    is_locked: false,
                    created_at: "2026-03-01T00:00:00.000Z",
                  },
                ],
                error: null,
              }),
            }),
            eq: () => ({
              maybeSingle: async () => ({ data: { id: "season-1" }, error: null }),
            }),
          }),
          update: () => ({
            eq: async () => ({ error: null }),
          }),
        };
      }
      if (table === "leaderboard_scores") {
        return {
          select: () => ({
            order: () => ({
              limit: async () => ({
                data: [
                  {
                    id: "score-1",
                    user_id: "user-1",
                    player_name: "player-one",
                    game_type: "SNAKE",
                    score: 123,
                    status: "valid",
                    created_at: "2026-03-01T00:00:00.000Z",
                    season_id: "season-1",
                    moderated_at: null,
                    moderated_by: null,
                    moderation_reason: null,
                    moderation_note: null,
                  },
                ],
                error: null,
              }),
              eq: async () => ({
                data: [],
                error: null,
              }),
            }),
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: "score-1", status: "valid" },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: async () => ({ error: null }),
          }),
        };
      }
      if (table === "leaderboard_score_moderation_audit") {
        return {
          insert: async () => ({ error: null }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      };
    },
  }),
}));

describe("admin leaderboard moderation routes", () => {
  it("lists seasons", async () => {
    const { GET } = await import("@/app/api/admin/leaderboard/seasons/route");
    const response = await GET(new Request("http://localhost/api/admin/leaderboard/seasons"));
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.seasons[0].slug).toBe("s1-2026");
  });

  it("lists scores", async () => {
    const { GET } = await import("@/app/api/admin/leaderboard/scores/route");
    const response = await GET(new Request("http://localhost/api/admin/leaderboard/scores"));
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.scores[0].game_type).toBe("SNAKE");
  });

  it("updates score moderation status", async () => {
    const { PATCH } = await import("@/app/api/admin/leaderboard/scores/route");
    const response = await PATCH(
      new Request("http://localhost/api/admin/leaderboard/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoreId: "score-1", status: "removed", reason: "suspicious" }),
      }),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.newStatus).toBe("removed");
  });
});
