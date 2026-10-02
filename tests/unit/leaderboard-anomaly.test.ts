import { describe, expect, it } from "vitest";

import { assessAnomaly, countRecentSubmissions } from "../../lib/leaderboard-anomaly";

const base = {
  score: 1000,
  maxScore: 2_000_000,
  previousBest: 900,
  recentSubmissions: 1,
  recentWindowSeconds: 600,
};

describe("assessAnomaly", () => {
  it("ne signale rien pour un score normal", () => {
    expect(assessAnomaly(base)).toEqual({ flagged: false, reasons: [] });
  });

  it("signale un score au plafond", () => {
    const result = assessAnomaly({ ...base, score: 2_000_000 });
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("perfect_score");
  });

  it("signale un saut implausible", () => {
    const result = assessAnomaly({ ...base, previousBest: 100, score: 1000 });
    expect(result.reasons).toContain("implausible_jump");
  });

  it("ne signale pas un saut normal sous le facteur", () => {
    const result = assessAnomaly({ ...base, previousBest: 900, score: 3000 });
    expect(result.reasons).not.toContain("implausible_jump");
  });

  it("signale une frequence elevee", () => {
    const result = assessAnomaly({ ...base, recentSubmissions: 25 });
    expect(result.reasons).toContain("high_frequency");
  });

  it("ignore le saut quand il n'y a pas de meilleur precedent", () => {
    const result = assessAnomaly({ ...base, previousBest: null, score: 1_000_000 });
    expect(result.reasons).not.toContain("implausible_jump");
  });
});

describe("countRecentSubmissions", () => {
  it("compte uniquement les soumissions dans la fenetre", () => {
    const now = Date.parse("2026-10-02T12:00:00Z");
    const timestamps = [
      "2026-10-02T11:55:00Z", // 5 min -> dans la fenetre
      "2026-10-02T11:30:00Z", // 30 min -> hors fenetre
      new Date("2026-10-02T11:59:00Z"), // 1 min -> dans la fenetre
    ];
    expect(countRecentSubmissions(timestamps, 600, now)).toBe(2);
  });
});
