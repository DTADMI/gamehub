import { describe, expect, it } from "vitest";

import { getGame, isGameLaunchable, listGames } from "@gamehub/game-platform/metadata/games";

describe("games manifest", () => {
  it("lists at least one enabled game", () => {
    const enabled = listGames().filter((g) => g.enabled !== false);
    expect(enabled.length).toBeGreaterThan(0);
  });

  it("all 6 upcoming games are now playable", () => {
    const enabled = listGames().filter((g) => g.enabled !== false);
    const upcoming = ["tetris", "knitzy", "block-blast", "chrono-shift", "elemental-conflux", "quantum-architect"];
    for (const slug of upcoming) {
      const game = getGame(slug);
      expect(game, `game "${slug}" should exist`).toBeDefined();
      expect(isGameLaunchable(game!), `game "${slug}" should be launchable`).toBe(true);
    }
    expect(enabled.length).toBeGreaterThanOrEqual(6);
  });
});
