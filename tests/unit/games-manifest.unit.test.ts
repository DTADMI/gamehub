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

  it("declare le sens du score pour les jeux mesures « au plus bas » (B4)", () => {
    // Sans cette declaration, le percentile inverserait le classement : un temps
    // long paraitrait meilleur qu'un temps court.
    expect(getGame("memory")?.scoreDirection).toBe("asc");
    expect(getGame("knitzy")?.scoreDirection).toBe("asc");
    // Un jeu de score cumulatif garde le defaut (plus haut = mieux).
    expect(getGame("snake")?.scoreDirection ?? "desc").toBe("desc");
  });
});
