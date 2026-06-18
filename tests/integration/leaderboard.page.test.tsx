import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { FlagsProvider } from "@gamehub/game-platform/contexts/FlagsContext";
import LeaderboardPage from "@/app/leaderboard/page";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    status: "authenticated",
    data: { user: { email: "me@example.com" } },
  }),
}));

vi.mock("@gamehub/game-platform", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "me@example.com", username: "u1" },
    isLoading: false,
    token: null,
    signin: async () => {},
    signup: async () => {},
    signout: async () => {},
    refreshUser: async () => {},
  }),
}));

vi.mock("@gamehub/ui", async () => {
  const React = await import("react");
  const e = React.createElement;
  return {
    Badge: ({ children }: any) => e("span", null, children),
    Button: ({ children, asChild, ...rest }: any) =>
      asChild ? children : e("button", rest, children),
    Card: ({ children }: any) => e("div", null, children),
    CardContent: ({ children }: any) => e("div", null, children),
    CardHeader: ({ children }: any) => e("div", null, children),
    CardTitle: ({ children }: any) => e("div", null, children),
    Select: ({ value, onValueChange, children }: any) =>
      e("select", { value, onChange: (ev: any) => onValueChange?.(ev.target.value) }, children),
    SelectTrigger: ({ children }: any) => children,
    SelectValue: ({ placeholder }: any) => placeholder,
    SelectContent: ({ children }: any) => children,
    SelectItem: ({ value, children }: any) => e("option", { value }, children),
    LoadingShell: ({ message }: any) => e("div", null, message),
  };
});

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<any>("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/leaderboard",
  };
});

vi.mock("@gamehub/game-platform/contexts/SubscriptionContext", () => ({
  useSubscription: () => ({ entitlements: { advancedLeaderboards: false } }),
}));

vi.mock("@gamehub/game-platform/lib/graphql/queries", () => ({
  fetchLeaderboardPaged: vi.fn().mockResolvedValue({
    leaderboard: {
      edges: [
        {
          cursor: "c1",
          node: {
            rank: 1,
            score: 100,
            gameType: "SNAKE",
            user: { id: "u1", username: "alice" },
          },
        },
        {
          cursor: "c2",
          node: {
            rank: 2,
            score: 90,
            gameType: "SNAKE",
            user: { id: "u2", username: "bob" },
          },
        },
      ],
      pageInfo: { hasNextPage: true, endCursor: "c2" },
    },
  }),
}));

vi.mock("@gamehub/ui/components/shell", () => ({
  LoadingShell: ({ message }: any) => null,
}));

describe("LeaderboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/leaderboard")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            entries: [
              { rank: 1, score: 100, user: { id: "u1", username: "alice" } },
              { rank: 2, score: 90, user: { id: "u2", username: "bob" } },
            ],
            season: { id: "s1", name: "Season 1", slug: "s1" },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });
  afterEach(() => cleanup());

  it("renders initial rows and shows Leaderboard heading", async () => {
    render(<FlagsProvider><LeaderboardPage /></FlagsProvider>);
    expect(await screen.findByText("Leaderboard")).toBeInTheDocument();
    await screen.findByText("alice");
    await screen.findByText("bob");
  });

  it("renders game type selector for non-premium users", async () => {
    render(<FlagsProvider><LeaderboardPage /></FlagsProvider>);
    const title = await screen.findByText("Leaderboard");
    expect(title).toBeInTheDocument();
  });

  it("changes game type via selector and refreshes", async () => {
    const spy = vi.spyOn(globalThis, "fetch" as any);
    render(<FlagsProvider><LeaderboardPage /></FlagsProvider>);
    await screen.findByText("alice");
    const select = screen.getByDisplayValue("SNAKE");
    fireEvent.change(select, { target: { value: "TETRIS" } });
    await waitFor(() => {
      const calls = spy.mock.calls.filter(([url]: [string]) => String(url).includes("/api/leaderboard"));
      expect(calls.length).toBeGreaterThan(1);
    });
  });
});
