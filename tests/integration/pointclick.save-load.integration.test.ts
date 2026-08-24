/**
 * T-2: Integration tests for save/load across all 3 point-and-click games.
 *
 * Covers:
 *  - Save state serialization/deserialization (per game)
 *  - Version migration (forward-only)
 *  - Cross-session recovery (simulate page reload)
 *  - Corrupted save handling
 *  - Multi-game save isolation
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  loadWithMigrations,
  SAVE_KEYS,
  versionedLoad,
  versionedSave,
} from "@games/pointclick-engine/core/Persistence";

// ─── Save state shapes mirroring each game's actual save format ───

interface SysdiscSaveV1 {
  sceneId: string;
  flags: Record<string, unknown>;
  inventory: string[];
}

interface RodSaveV1 {
  sceneId: string;
  ctx: {
    flags: Record<string, unknown>;
    inventory: string[];
  };
}

interface TmeSaveV1 {
  sceneId: string;
  flags: Record<string, unknown>;
  inventory: string[];
}

// ─── Helpers ───

function seedSave(key: string, v: number, data: unknown) {
  localStorage.setItem(key, JSON.stringify({ v, data }));
}

function getRaw(key: string): string | null {
  return localStorage.getItem(key);
}

// ─── Tests ───

describe("Save/load integration — all point-and-click games", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Systems Discovery (uses SAVE_KEYS.sysdisc) ──

  describe("Systems Discovery (sysdisc:save:v1)", () => {
    const KEY = SAVE_KEYS.sysdisc;

    it("serializes and deserializes save state", () => {
      const data: SysdiscSaveV1 = {
        sceneId: "SD_BOD_BREATH_INTRO",
        flags: { "bod.meter": 72, "bod.toggles.deeper": true, gentle: true },
        inventory: ["oxygen_mask", "medkit"],
      };
      const ok = versionedSave(KEY, 1, data);
      expect(ok).toBe(true);

      // Simulate page reload — read raw localStorage
      const raw = getRaw(KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.v).toBe(1);
      expect(parsed.data.sceneId).toBe("SD_BOD_BREATH_INTRO");
      expect(parsed.data.flags["bod.meter"]).toBe(72);
      expect(parsed.data.inventory).toEqual(["oxygen_mask", "medkit"]);
    });

    it("restores save after simulated page reload", () => {
      // Session 1: save
      versionedSave(KEY, 1, {
        sceneId: "SD_SPACE_OUTRO",
        flags: { "bod.meter": 40 },
        inventory: ["star_chart"],
      });

      // Session 2: reload (read from localStorage)
      const payload = versionedLoad<SysdiscSaveV1>(KEY);
      expect(payload).not.toBeNull();
      expect(payload!.v).toBe(1);
      expect(payload!.data.sceneId).toBe("SD_SPACE_OUTRO");
      expect(payload!.data.flags["bod.meter"]).toBe(40);
      expect(payload!.data.inventory).toEqual(["star_chart"]);
    });

    it("handles missing save gracefully", () => {
      const payload = versionedLoad<SysdiscSaveV1>(KEY);
      expect(payload).toBeNull();
    });

    it("handles corrupted JSON gracefully", () => {
      localStorage.setItem(KEY, "not-valid-json{{{");
      const payload = versionedLoad<SysdiscSaveV1>(KEY);
      // versionedLoad should catch the parse error and return null
      expect(payload).toBeNull();
      // Should also clear the corrupted key
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it("migrates from v0 to v1", () => {
      seedSave(KEY, 0, { sceneId: "OLD_SCENE", score: "42" });
      const migrated = loadWithMigrations<SysdiscSaveV1>(KEY, 1, {
        0: (old: { sceneId: string; score: string }) => ({
          sceneId: old.sceneId,
          flags: { score: parseInt(old.score, 10) || 0 },
          inventory: [],
        }),
      });
      expect(migrated).not.toBeNull();
      expect(migrated!.sceneId).toBe("OLD_SCENE");
      expect(migrated!.flags.score).toBe(42);
      expect(migrated!.inventory).toEqual([]);

      // Should be persisted at target version
      const stored = JSON.parse(getRaw(KEY)!);
      expect(stored.v).toBe(1);
    });

    it("returns null when migration path is incomplete", () => {
      seedSave(KEY, 0, { sceneId: "S" });
      const migrated = loadWithMigrations(KEY, 3, {
        1: (old: unknown) => ({ ...(old as object), step1: true }),
      });
      expect(migrated).toBeNull();
    });
  });

  // ── Rite of Discovery (uses SAVE_KEYS.rod) ──

  describe("Rite of Discovery (rod:save:v1)", () => {
    const KEY = SAVE_KEYS.rod;

    it("serializes and deserializes save state", () => {
      const data: RodSaveV1 = {
        sceneId: "C1",
        ctx: {
          flags: { "letter.A": true, "letter.T": true, gentle: false },
          inventory: ["rune_stone", "ancient_scroll"],
        },
      };
      const ok = versionedSave(KEY, 1, data);
      expect(ok).toBe(true);

      const payload = versionedLoad<RodSaveV1>(KEY);
      expect(payload).not.toBeNull();
      expect(payload!.data.sceneId).toBe("C1");
      expect(payload!.data.ctx.flags["letter.A"]).toBe(true);
      expect(payload!.data.ctx.flags["letter.T"]).toBe(true);
      expect(payload!.data.ctx.inventory).toContain("rune_stone");
    });

    it("restores after page reload", () => {
      versionedSave(KEY, 1, {
        sceneId: "OUTRO",
        ctx: { flags: { completed: true }, inventory: ["golden_rune"] },
      });

      const payload = versionedLoad<RodSaveV1>(KEY);
      expect(payload!.data.sceneId).toBe("OUTRO");
      expect(payload!.data.ctx.flags.completed).toBe(true);
    });

    it("handles missing save", () => {
      expect(versionedLoad(KEY)).toBeNull();
    });
  });

  // ── Toymaker Escape (uses "tme:save:v1") ──

  describe("Toymaker Escape (tme:save:v1)", () => {
    const KEY = SAVE_KEYS.tme;

    it("serializes and deserializes save state", () => {
      const data: TmeSaveV1 = {
        sceneId: "E1_START",
        flags: {
          "gears.solved": true,
          "pipes.solved": false,
          "latch.revealed": false,
        },
        inventory: ["gear_A", "gear_B"],
      };
      const ok = versionedSave(KEY, 1, data);
      expect(ok).toBe(true);

      const payload = versionedLoad<TmeSaveV1>(KEY);
      expect(payload).not.toBeNull();
      expect(payload!.data.sceneId).toBe("E1_START");
      expect(payload!.data.flags["gears.solved"]).toBe(true);
      expect(payload!.data.flags["pipes.solved"]).toBe(false);
      expect(payload!.data.inventory).toEqual(["gear_A", "gear_B"]);
    });

    it("restores after page reload", () => {
      versionedSave(KEY, 1, {
        sceneId: "E3_WRAP",
        flags: { "escape.complete": true },
        inventory: [],
      });

      const payload = versionedLoad<TmeSaveV1>(KEY);
      expect(payload!.data.sceneId).toBe("E3_WRAP");
      expect(payload!.data.flags["escape.complete"]).toBe(true);
    });
  });

  // ── Cross-game isolation ──

  describe("multi-game save isolation", () => {
    it("does not mix saves across games", () => {
      versionedSave(SAVE_KEYS.sysdisc, 1, {
        sceneId: "SD_INTRO",
        flags: {},
        inventory: ["sysdisc_item"],
      });
      versionedSave(SAVE_KEYS.rod, 1, {
        sceneId: "C1",
        ctx: { flags: {}, inventory: ["rod_item"] },
      });
      versionedSave(SAVE_KEYS.tme, 1, {
        sceneId: "INTRO",
        flags: {},
        inventory: ["tme_item"],
      });

      const sysdisc = versionedLoad<SysdiscSaveV1>(SAVE_KEYS.sysdisc);
      const rod = versionedLoad<RodSaveV1>(SAVE_KEYS.rod);
      const tme = versionedLoad<TmeSaveV1>(SAVE_KEYS.tme);

      expect(sysdisc!.data.sceneId).toBe("SD_INTRO");
      expect(sysdisc!.data.inventory).toEqual(["sysdisc_item"]);

      expect(rod!.data.sceneId).toBe("C1");
      expect(rod!.data.ctx.inventory).toEqual(["rod_item"]);

      expect(tme!.data.sceneId).toBe("INTRO");
      expect(tme!.data.inventory).toEqual(["tme_item"]);
    });
  });

  // ── Global Settings ──

  describe("global settings (gh:settings:v1)", () => {
    const KEY = SAVE_KEYS.settings;

    it("saves and loads settings", () => {
      versionedSave(KEY, 1, {
        language: "fr",
        reducedMotion: true,
        volume: 0.5,
      });

      const payload = versionedLoad(KEY);
      expect(payload).not.toBeNull();
      expect(payload!.data.language).toBe("fr");
      expect(payload!.data.reducedMotion).toBe(true);
      expect(payload!.data.volume).toBe(0.5);
    });
  });
});