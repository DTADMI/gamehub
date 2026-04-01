import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/feature-flags-store", () => ({
  readPersistedFlags: vi.fn().mockResolvedValue({
    sdBodEnabled: true,
    sdBodBreath: true,
    sdBodFuel: true,
    sdBodMove: true,
    sdBodSignal: true,
    sdBodGrow: true,
    ui: {
      allowPlayUpcomingLocal: false,
      enhancedGameCards: true,
      enhancedCarousel: true,
      shimmerSkeletons: true,
      animatedHero: true,
      postGameAuthCTA: true,
    },
    auth: {
      leaderboardGuestTeaser: true,
      postGameCTAFrequency: "occasional",
      requireEmailVerification: false,
      magicLinkLogin: false,
    },
    games: { socialShare: false },
    experimental: { realtimeMultiplayer: false, threeJsGames: false },
  }),
  upsertFlag: vi.fn().mockResolvedValue({ persisted: true }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminUser: vi.fn().mockResolvedValue({
    user: { id: "u1", email: "owner@test.dev" },
    isAdmin: true,
    role: "owner",
  }),
}));

describe("admin feature flags route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns flags for authorized admin", async () => {
    const { GET } = await import("@/app/api/admin/feature-flags/route");
    const response = await GET(new Request("http://localhost/api/admin/feature-flags"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.role).toBe("owner");
    expect(json.flags.ui.enhancedGameCards).toBe(true);
  });

  it("updates a known flag path", async () => {
    const { PATCH } = await import("@/app/api/admin/feature-flags/route");
    const response = await PATCH(
      new Request("http://localhost/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "ui.enhancedCarousel", value: false }),
      }),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
  });
});
