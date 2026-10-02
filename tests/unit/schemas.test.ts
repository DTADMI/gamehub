// Tests des schemas de validation (lib/schemas.ts) : ils gardent les entrees des
// routes API (score, classement, reglages). Une borne oubliee laisse passer une
// valeur aberrante jusqu a la base ; ces tests verrouillent les bornes.
import { describe, expect, it } from "vitest";

import {
  featureFlagSchema,
  gameScoreSchema,
  gameSettingsSchema,
  leaderboardQuerySchema,
} from "../../lib/schemas";

describe("gameScoreSchema", () => {
  it("accepte un score entier non negatif", () => {
    expect(gameScoreSchema.safeParse({ gameType: "SNAKE", score: 0 }).success).toBe(true);
  });

  it("refuse un gameType vide", () => {
    expect(gameScoreSchema.safeParse({ gameType: "", score: 1 }).success).toBe(false);
  });

  it("refuse un gameType trop long", () => {
    expect(gameScoreSchema.safeParse({ gameType: "x".repeat(65), score: 1 }).success).toBe(false);
  });

  it("refuse un score negatif ou non entier", () => {
    expect(gameScoreSchema.safeParse({ gameType: "SNAKE", score: -1 }).success).toBe(false);
    expect(gameScoreSchema.safeParse({ gameType: "SNAKE", score: 1.5 }).success).toBe(false);
  });
});

describe("leaderboardQuerySchema", () => {
  it("convertit limit en nombre", () => {
    const parsed = leaderboardQuerySchema.parse({ limit: "25" });
    expect(parsed.limit).toBe(25);
  });

  it("refuse une limite superieure a 100", () => {
    expect(leaderboardQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });

  it("accepte un objet vide (parametres optionnels)", () => {
    expect(leaderboardQuerySchema.safeParse({}).success).toBe(true);
  });
});

describe("gameSettingsSchema", () => {
  it("borne le volume entre 0 et 1", () => {
    expect(gameSettingsSchema.safeParse({ volume: 0.5 }).success).toBe(true);
    expect(gameSettingsSchema.safeParse({ volume: 1.5 }).success).toBe(false);
  });

  it("refuse une difficulte inconnue", () => {
    expect(gameSettingsSchema.safeParse({ difficulty: "insane" }).success).toBe(false);
  });
});

describe("featureFlagSchema", () => {
  it("accepte un booleen ou une chaine", () => {
    expect(featureFlagSchema.safeParse({ path: "flag", value: true }).success).toBe(true);
    expect(featureFlagSchema.safeParse({ path: "flag", value: "on" }).success).toBe(true);
  });

  it("refuse un nombre", () => {
    expect(featureFlagSchema.safeParse({ path: "flag", value: 3 }).success).toBe(false);
  });
});
