import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
  redis: {
    ping: vi.fn().mockResolvedValue("PONG"),
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    from: () => ({
      select: () => ({
        limit: async () => ({ error: null }),
      }),
    }),
  }),
}));

describe("GET /api/health", () => {
  it("returns ok payload when dependencies are healthy", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.redis).toBe("ok");
    expect(body.checks.supabase).toBe("ok");
  });
});
