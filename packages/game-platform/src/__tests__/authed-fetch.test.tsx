// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

// B2 (gamehub): safety net for the network lib before the B1 monolith refactor.
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { accessToken: "tok-123" }, status: "authenticated" }),
}));

import { useAuthedFetch } from "../lib/authed-fetch";

type FetchMock = ReturnType<typeof vi.fn>;

function lastInit(mock: FetchMock): RequestInit {
  return mock.mock.calls[0]?.[1] as RequestInit;
}

describe("useAuthedFetch", () => {
  const realFetch = globalThis.fetch;
  const mockFetch = vi.fn(async () => new Response("{}", { status: 200 }));

  beforeEach(() => {
    globalThis.fetch = mockFetch as unknown as typeof fetch;
    mockFetch.mockClear();
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("injects the bearer token by default", async () => {
    const { result } = renderHook(() => useAuthedFetch());
    await result.current("/api/x");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const headers = lastInit(mockFetch).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok-123");
  });

  it("skips the Authorization header when auth is false", async () => {
    const { result } = renderHook(() => useAuthedFetch());
    await result.current("/api/x", { auth: false });
    const headers = lastInit(mockFetch).headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("serializes an object body as JSON and sets the content type", async () => {
    const { result } = renderHook(() => useAuthedFetch());
    await result.current("/api/x", { method: "POST", body: { a: 1 } as unknown as BodyInit });
    const init = lastInit(mockFetch);
    expect((init.headers as Headers).get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });
});
