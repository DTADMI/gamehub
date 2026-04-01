import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/feature-flags-store", () => ({
  readFlagAudit: vi.fn().mockResolvedValue([
    {
      id: "a1",
      flag_path: "ui.enhancedCarousel",
      old_value: true,
      new_value: false,
      actor_user_id: "u1",
      actor_role: "owner",
      request_ip: "127.0.0.1",
      user_agent: "vitest",
      created_at: "2026-04-01T00:00:00.000Z",
    },
  ]),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminUser: vi.fn().mockResolvedValue({
    user: { id: "u1", email: "owner@test.dev" },
    isAdmin: true,
    role: "owner",
  }),
}));

describe("admin feature flag audit route", () => {
  it("returns JSON audit rows", async () => {
    const { GET } = await import("@/app/api/admin/feature-flags/audit/route");
    const response = await GET(new Request("http://localhost/api/admin/feature-flags/audit?limit=10"));
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(json.audit)).toBe(true);
    expect(json.audit[0].flag_path).toBe("ui.enhancedCarousel");
  });

  it("exports csv when requested", async () => {
    const { GET } = await import("@/app/api/admin/feature-flags/audit/route");
    const response = await GET(
      new Request("http://localhost/api/admin/feature-flags/audit?format=csv&limit=10"),
    );
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(text).toContain("flag_path");
    expect(text).toContain("ui.enhancedCarousel");
  });
});
