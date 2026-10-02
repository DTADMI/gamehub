import { describe, expect, it } from "vitest";

import {
  ACHIEVEMENTS,
  achievementStatsFromGameStats,
  evaluateAchievements,
  mergeUnlocked,
  type AchievementStats,
} from "../lib/achievements";

const base: AchievementStats = {
  gamesPlayed: 0,
  distinctGames: 0,
  coopSessions: 0,
  sharedCreations: 0,
  helpedOthers: 0,
};

describe("evaluateAchievements", () => {
  it("aucun succes sans activite", () => {
    expect(evaluateAchievements(base)).toEqual([]);
  });

  it("debloque first_game des la premiere partie", () => {
    expect(evaluateAchievements({ ...base, gamesPlayed: 1 })).toContain("first_game");
  });

  it("debloque explorer a 5 jeux distincts", () => {
    expect(evaluateAchievements({ ...base, distinctGames: 5 })).toContain("explorer");
    expect(evaluateAchievements({ ...base, distinctGames: 4 })).not.toContain("explorer");
  });

  it("debloque les succes sociaux", () => {
    const stats = { ...base, coopSessions: 3, helpedOthers: 1, sharedCreations: 1 };
    expect(evaluateAchievements(stats)).toEqual(
      expect.arrayContaining(["collaborator", "generous", "creator"]),
    );
  });

  it("veteran demande 25 parties", () => {
    expect(evaluateAchievements({ ...base, gamesPlayed: 25 })).toContain("veteran");
  });
});

describe("mergeUnlocked", () => {
  it("ne perd jamais un succes deja debloque", () => {
    const known = mergeUnlocked([], { ...base, gamesPlayed: 1 });
    expect(known).toContain("first_game");
    // Les statistiques repartent de zero : le succes est conserve.
    expect(mergeUnlocked(known, base)).toContain("first_game");
  });

  it("preserve l'ordre de definition", () => {
    const merged = mergeUnlocked([], { ...base, gamesPlayed: 25, distinctGames: 5 });
    const order = ACHIEVEMENTS.map((a) => a.id).filter((id) => merged.includes(id));
    expect(merged).toEqual(order);
  });
});

describe("achievementStatsFromGameStats", () => {
  it("projette les statistiques d'une partie", () => {
    expect(achievementStatsFromGameStats({ totalPlays: 0, highScore: 0 })).toEqual({
      gamesPlayed: 0,
      distinctGames: 0,
      coopSessions: 0,
      sharedCreations: 0,
      helpedOthers: 0,
    });
    const stats = achievementStatsFromGameStats({ totalPlays: 3, highScore: 500 });
    expect(stats.gamesPlayed).toBe(3);
    expect(stats.distinctGames).toBe(1);
  });

  it("debloque les succes de progression lies aux parties", () => {
    const first = mergeUnlocked([], achievementStatsFromGameStats({ totalPlays: 1, highScore: 0 }));
    expect(first).toContain("first_game");
    const veteran = mergeUnlocked([], achievementStatsFromGameStats({ totalPlays: 25, highScore: 0 }));
    expect(veteran).toContain("veteran");
  });
});
