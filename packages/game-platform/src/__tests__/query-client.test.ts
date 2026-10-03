import { describe, it, expect } from "vitest";
import { platformQueryClient } from "../lib/query-client";

// B2 (gamehub): the network lib modules need a safety net before the monolith
// refactor (B1). query-client is the shared React Query client; its defaults are
// a contract (60s stale, 10min gc, no refetch on focus, one retry). React Query
// v5 keeps the config behind getDefaultOptions(), not a public field.
describe("platformQueryClient defaults", () => {
  it("keeps the documented platform defaults", () => {
    const client = platformQueryClient as unknown as {
      getDefaultOptions: () => {
        queries?: { staleTime?: number; gcTime?: number; refetchOnWindowFocus?: boolean; retry?: number };
      };
    };
    const queries = client.getDefaultOptions().queries ?? {};
    expect(queries.staleTime).toBe(60_000);
    expect(queries.gcTime).toBe(10 * 60_000);
    expect(queries.refetchOnWindowFocus).toBe(false);
    expect(queries.retry).toBe(1);
  });
});
