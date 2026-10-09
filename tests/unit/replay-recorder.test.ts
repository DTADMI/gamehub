// Enregistreur de replay (B9, phase 2).
//
// Ce que ce fichier surveille : un replay n'est rejouable que si les entrees sont
// monotones, non vides et sans doublons inutiles. Chaque refus de l'enregistreur
// est donc teste, et le message d'echec doit rester exploitable.
import { describe, expect, it } from "vitest";

import {
  decodeReplay,
  inputAt,
  isReplay,
  ReplayRecorder,
  REPLAY_FORMAT_VERSION,
} from "../../packages/game-platform/src/lib/replay";

const base = { gameId: "memory", seed: 7, startedAt: "2026-10-08T00:00:00.000Z" };

describe("ReplayRecorder (B9)", () => {
  it("enregistre des entrees et produit un replay valide", () => {
    const rec = new ReplayRecorder(base);
    expect(rec.record(0, { left: true })).toBe(true);
    expect(rec.record(120, { left: false })).toBe(true);
    const replay = rec.build();
    expect(isReplay(replay)).toBe(true);
    expect(replay.frames).toHaveLength(2);
    expect(replay.header.version).toBe(REPLAY_FORMAT_VERSION);
    expect(replay.header.gameId).toBe("memory");
    expect(replay.header.seed).toBe(7);
  });

  it("refuse une entree vide et le compte", () => {
    const rec = new ReplayRecorder(base);
    expect(rec.record(0, {})).toBe(false);
    expect(rec.frameCount).toBe(0);
    expect(rec.stats.droppedEmpty).toBe(1);
  });

  it("refuse un horodatage qui recule (rejeu non monotone impossible)", () => {
    const rec = new ReplayRecorder(base);
    rec.record(100, { a: true });
    expect(rec.record(50, { b: true })).toBe(false);
    expect(rec.stats.droppedOutOfOrder).toBe(1);
    expect(rec.build().frames.map((f) => f.t)).toEqual([100]);
  });

  it("refuse un horodatage non fini", () => {
    const rec = new ReplayRecorder(base);
    expect(rec.record(Number.NaN, { a: true })).toBe(false);
    expect(rec.record(Number.POSITIVE_INFINITY, { a: true })).toBe(false);
    expect(rec.stats.droppedOutOfOrder).toBe(2);
  });

  it("accepte deux entrees differentes au meme instant", () => {
    const rec = new ReplayRecorder(base);
    expect(rec.record(10, { up: true })).toBe(true);
    expect(rec.record(10, { left: true })).toBe(true);
    expect(rec.frameCount).toBe(2);
  });

  it("coalesce un maintien identique dans la fenetre, sans toucher au debut", () => {
    const rec = new ReplayRecorder({ ...base, coalesceWithinMs: 200 });
    rec.record(0, { left: true });
    // Un maintien produit la meme entree toutes les 16 ms : aucune trame ajoutee.
    for (let t = 16; t < 200; t += 16) expect(rec.record(t, { left: true })).toBe(false);
    // La trame doit garder t = 0 : c'est le DEBUT de l'entree, pas sa fin.
    expect(rec.build().frames).toEqual([{ t: 0, input: { left: true } }]);
    expect(rec.stats.coalesced).toBeGreaterThan(5);
  });

  it("n'ecrase pas le debut quand la coalescence reprend apres un changement", () => {
    const rec = new ReplayRecorder({ ...base, coalesceWithinMs: 200 });
    rec.record(0, { left: true });
    rec.record(100, { left: false });
    expect(rec.record(120, { left: false })).toBe(false);
    expect(rec.build().frames).toEqual([
      { t: 0, input: { left: true } },
      { t: 100, input: { left: false } },
    ]);
  });

  it("ne coalesce pas deux entrees differentes, meme tres proches", () => {
    const rec = new ReplayRecorder({ ...base, coalesceWithinMs: 200 });
    rec.record(0, { left: true });
    expect(rec.record(10, { right: true })).toBe(true);
    expect(rec.frameCount).toBe(2);
  });

  it("coalesce par valeur, pas par reference", () => {
    const rec = new ReplayRecorder({ ...base, coalesceWithinMs: 200 });
    rec.record(0, { keys: { left: true } });
    expect(rec.record(10, { keys: { left: true } })).toBe(false);
    expect(rec.record(20, { keys: { left: false } })).toBe(true);
  });

  it("build() fige le replay : un enregistrement ulterieur ne le modifie plus", () => {
    const rec = new ReplayRecorder(base);
    rec.record(0, { a: 1 });
    const snapshot = rec.build();
    const inputRef = snapshot.frames[0]!.input;
    rec.record(10, { b: 2 });
    // Ni la liste, ni l'objet d'entree deja produit ne doivent bouger.
    expect(snapshot.frames).toHaveLength(1);
    expect(inputRef).toEqual({ a: 1 });
  });

  it("encode() produit un texte que decodeReplay accepte", () => {
    const rec = new ReplayRecorder(base);
    rec.record(0, { jump: true });
    const decoded = decodeReplay(rec.encode());
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.replay.frames).toHaveLength(1);
  });

  it("inputAt renvoie l'entree active, et null avant la premiere trame", () => {
    const rec = new ReplayRecorder(base);
    rec.record(100, { left: true });
    rec.record(300, { left: false });
    const frames = rec.build().frames;
    expect(inputAt(frames, 0)).toBeNull();
    expect(inputAt(frames, 99)).toBeNull();
    expect(inputAt(frames, 100)).toEqual({ left: true });
    expect(inputAt(frames, 299)).toEqual({ left: true });
    expect(inputAt(frames, 300)).toEqual({ left: false });
    expect(inputAt(frames, 99_999)).toEqual({ left: false });
  });
});
