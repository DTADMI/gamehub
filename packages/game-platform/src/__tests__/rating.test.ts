import { describe, expect, it } from "vitest";

import { aggregateRating, percentileRank } from "../lib/rating";

describe("percentileRank", () => {
  it("renvoie null sur une population vide", () => {
    expect(percentileRank(10, [], "desc")).toBeNull();
  });

  it("renvoie null quand la population est sous l'effectif minimal", () => {
    expect(percentileRank(10, [1, 2, 3, 4], "desc")).toBeNull();
    expect(percentileRank(10, [1, 2, 3, 4], "desc", { minPopulation: 2 })).not.toBeNull();
  });

  it("renvoie null sur une valeur non finie", () => {
    expect(percentileRank(Number.NaN, [1, 2, 3, 4, 5], "desc")).toBeNull();
    expect(percentileRank(Number.POSITIVE_INFINITY, [1, 2, 3, 4, 5], "desc")).toBeNull();
  });

  it("direction desc : la meilleure valeur atteint 100", () => {
    expect(percentileRank(50, [10, 20, 30, 40, 50], "desc")).toBe(100);
  });

  it("direction desc : la pire valeur de la population reste au-dessus de 0", () => {
    // 10 >= 10 seulement -> 1/5
    expect(percentileRank(10, [10, 20, 30, 40, 50], "desc")).toBe(20);
  });

  it("direction desc : une valeur sous toute la population tombe a 0", () => {
    expect(percentileRank(1, [10, 20, 30, 40, 50], "desc")).toBe(0);
  });

  it("direction asc : la valeur la plus basse atteint 100", () => {
    expect(percentileRank(5, [5, 10, 15, 20, 25], "asc")).toBe(100);
  });

  it("direction asc : une valeur haute est mal classee", () => {
    expect(percentileRank(25, [5, 10, 15, 20, 25], "asc")).toBe(20);
  });

  it("les ex aequo partagent le meme percentile", () => {
    const population = [10, 20, 20, 30, 40];
    const a = percentileRank(20, population, "desc");
    const b = percentileRank(20, population, "desc");
    expect(a).toBe(b);
    // 20 >= 10, 20, 20 -> 3/5
    expect(a).toBe(60);
  });

  it("une valeur tres au-dessus du maximum atteint quand meme 100", () => {
    expect(percentileRank(9999, [1, 2, 3, 4, 5], "desc")).toBe(100);
  });

  it("ignore les valeurs non finies de la population", () => {
    const withNoise = [10, Number.NaN, 20, 30, 40, 50, Number.POSITIVE_INFINITY];
    // 5 valeurs finies, la meilleure -> 5/5
    expect(percentileRank(50, withNoise, "desc")).toBe(100);
  });
});

describe("aggregateRating", () => {
  it("renvoie null sans aucun percentile", () => {
    expect(aggregateRating([])).toBeNull();
    expect(aggregateRating([Number.NaN])).toBeNull();
  });

  it("moyenne les N meilleurs percentiles", () => {
    // Top 3 = 100, 80, 60 -> 80
    expect(aggregateRating([100, 80, 60, 40, 20])).toBe(80);
  });

  it("avec moins de jeux que topN, moyenne ce qui existe", () => {
    expect(aggregateRating([90, 30])).toBe(60);
  });

  it("topN personnalise", () => {
    expect(aggregateRating([100, 80, 60], { topN: 1 })).toBe(100);
    expect(aggregateRating([100, 80, 60], { topN: 2 })).toBe(90);
  });
});
