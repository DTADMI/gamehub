import { describe, expect, it } from "vitest";

import { getGame, isGameLaunchable, listGames } from "@gamehub/game-platform/metadata/games";

describe("games manifest", () => {
  it("lists at least one enabled game", () => {
    const enabled = listGames().filter((g) => g.enabled !== false);
    expect(enabled.length).toBeGreaterThan(0);
  });

  it("marks impl:none entries as non-launchable", () => {
    const tetris = getGame("tetris");
    expect(tetris).toBeDefined();
    expect(isGameLaunchable(tetris!)).toBe(false);
  });
});
