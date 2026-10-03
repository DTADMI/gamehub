import { describe, expect, it } from "vitest";

import {
  createSeededRng,
  decodeReplay,
  seededShuffle,
  encodeReplay,
  isReplay,
  REPLAY_FORMAT_VERSION,
  type Replay,
} from "../../packages/game-platform/src/lib/replay";

const replay: Replay = {
  header: {
    version: REPLAY_FORMAT_VERSION,
    gameId: "snake",
    seed: 42,
    startedAt: "2026-10-02T12:00:00.000Z",
  },
  frames: [
    { t: 0, input: { key: "ArrowRight" } },
    { t: 120, input: { key: "ArrowDown" } },
  ],
};

describe("createSeededRng", () => {
  it("produit la meme suite pour la meme graine", () => {
    const a = createSeededRng(123);
    const b = createSeededRng(123);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produit une suite differente pour une autre graine", () => {
    const a = createSeededRng(1)();
    const b = createSeededRng(2)();
    expect(a).not.toBe(b);
  });

  it("reste dans l intervalle [0, 1)", () => {
    const rng = createSeededRng(7);
    for (let i = 0; i < 20; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("encodeReplay / decodeReplay", () => {
  it("fait un aller-retour fidele", () => {
    const decoded = decodeReplay(encodeReplay(replay));
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.replay).toEqual(replay);
  });

  it("refuse un JSON invalide", () => {
    expect(decodeReplay("pas du json")).toEqual({ ok: false, reason: "bad_format" });
  });

  it("refuse une structure incomplete", () => {
    expect(decodeReplay(JSON.stringify({ header: { version: 1 }, frames: [] }))).toEqual({
      ok: false,
      reason: "bad_format",
    });
  });

  it("refuse une version differente du format", () => {
    const other = { ...replay, header: { ...replay.header, version: 99 } };
    expect(decodeReplay(JSON.stringify(other))).toEqual({ ok: false, reason: "version_mismatch" });
  });
});

describe("isReplay", () => {
  it("accepte un replay valide et rejette le reste", () => {
    expect(isReplay(replay)).toBe(true);
    expect(isReplay(null)).toBe(false);
    expect(isReplay({ header: {}, frames: [{}] })).toBe(false);
  });
});

describe("seededShuffle", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  it("la meme graine donne le meme ordre", () => {
    expect(seededShuffle(items, 42)).toEqual(seededShuffle(items, 42));
  });

  it("des graines differentes donnent des ordres differents", () => {
    expect(seededShuffle(items, 1)).not.toEqual(seededShuffle(items, 2));
  });

  it("renvoie une permutation de la source", () => {
    const shuffled = seededShuffle(items, 7);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
  });

  it("ne mute pas la source", () => {
    const source = [...items];
    seededShuffle(items, 3);
    expect(items).toEqual(source);
  });

  it("gere un tableau vide ou d'un seul element", () => {
    expect(seededShuffle([], 1)).toEqual([]);
    expect(seededShuffle(["a"], 1)).toEqual(["a"]);
  });
});
