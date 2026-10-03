import { describe, expect, it } from "vitest";

import {
  createSeededRng,
  decodeReplay,
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
