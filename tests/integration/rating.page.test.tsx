// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated", data: { user: { email: "me@example.com" } } }),
}));

const authState = vi.hoisted(() => ({ user: { id: "u1", username: "u1" } as unknown }));

vi.mock("@gamehub/game-platform", () => ({
  useAuth: () => ({ user: authState.user, isLoading: false }),
}));

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: "en" }),
}));

vi.mock("@gamehub/ui", async () => {
  const React = await import("react");
  const e = React.createElement;
  return {
    Badge: ({ children }: any) => e("span", null, children),
    Button: ({ children, asChild, ...rest }: any) => (asChild ? children : e("button", rest, children)),
    Card: ({ children }: any) => e("div", null, children),
    CardContent: ({ children }: any) => e("div", null, children),
    CardHeader: ({ children }: any) => e("div", null, children),
    CardTitle: ({ children }: any) => e("div", null, children),
  };
});

import CrossGameRatingPage from "@/app/leaderboard/rating/page";

const realFetch = globalThis.fetch;

function mockFetch(payload: unknown, ok = true) {
  globalThis.fetch = vi.fn(async () => ({
    ok,
    status: ok ? 200 : 500,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

afterEach(() => {
  cleanup();
  globalThis.fetch = realFetch;
});

beforeEach(() => {
  authState.user = { id: "u1", username: "u1" };
});

describe("cross-game rating page (B4)", () => {
  it("affiche la note agregee et les percentiles par jeu", async () => {
    mockFetch({
      aggregate: 75,
      games: [
        { gameType: "SNAKE", score: 250, percentile: 90, direction: "desc" },
        { gameType: "MEMORY", score: 18, percentile: 60, direction: "asc" },
      ],
    });
    render(<CrossGameRatingPage />);

    await waitFor(() => expect(screen.getByText("75")).toBeTruthy());
    expect(screen.getByText("Snake")).toBeTruthy();
    expect(screen.getByText("Memory")).toBeTruthy();
    expect(screen.getByText("rating.percentile 90")).toBeTruthy();
  });

  it("affiche l'etat vide quand aucun jeu n'est note", async () => {
    mockFetch({ aggregate: null, games: [] });
    render(<CrossGameRatingPage />);

    await waitFor(() => expect(screen.getByText("rating.noScores")).toBeTruthy());
    // La note affiche un tiret, pas un chiffre invente.
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("affiche une erreur quand l'API echoue", async () => {
    mockFetch({}, false);
    render(<CrossGameRatingPage />);

    await waitFor(() => expect(screen.getByText("rating.error")).toBeTruthy());
  });

  it("invite a se connecter sans utilisateur", async () => {
    authState.user = null;
    mockFetch({ aggregate: null, games: [] });
    render(<CrossGameRatingPage />);

    expect(screen.getByText("rating.signIn")).toBeTruthy();
  });
});
