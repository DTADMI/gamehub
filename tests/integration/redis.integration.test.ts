import { describe, expect, it } from "vitest";

import { redis } from "@/lib/redis";

describe("redis adapter", () => {
  it("supports ping/get/set roundtrip", async () => {
    const pong = await redis.ping();
    expect(String(pong).toUpperCase()).toContain("PONG");

    await redis.set("test:integration:redis", { ok: true });
    const value = await redis.get<{ ok: boolean }>("test:integration:redis");
    expect(value?.ok).toBe(true);

    await redis.del("test:integration:redis");
  });
});
