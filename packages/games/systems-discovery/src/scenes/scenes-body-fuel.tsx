 
// Auto-generated scene group — extracted from index.tsx monolith
// See scripts/split-systems-discovery.mjs
import type { Scene } from "@games/pointclick-engine";
import React from "react";

import { t } from "@/lib/i18n";

import { FuelMatchingPuzzle } from "../puzzles/FuelMatchingPuzzle";
import type { PipesState, SequenceState } from "./_imports";
import { createPipesState, createSequenceState, evaluatePipes, HomeostasisMeter, PostGameCTA, pressSequenceKey, setTileRotation, toggleValve } from "./_imports";
export function buildBodyFuelScenes(): Scene[] {
  return [
  {
    id: "SD_BOD_FUEL_INTRO",
    title: t("sysdisc.bod.fuel.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.bod.fuel.intro.p1")}</p>
        <div className="flex gap-2">
          <button
            className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
            onClick={() => {
              setFlag("bod.fuel.intro.seen", true);
              go("BF1");
            }}
          >
            {t("sysdisc.bod.fuel.intro.cta")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("bod.fuel.intro.seen", true);
              go("BF1");
            }}
          >
            {t("sysdisc.bod.fuel.intro.skip")}
          </button>
        </div>
      </div>
    ),
  },

  {
    id: "BF1",
    title: t("sysdisc.bod.fuel.bf1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const solved = Boolean(flags["bod.fuel.puzzleSolved"]);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.fuel.bf1.prompt")}</p>

          <FuelMatchingPuzzle onSolved={() => setFlag("bod.fuel.puzzleSolved", true)} />

          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              onClick={() => setFlag("bod.meter", clamp(meter + 2))}
            >
              Nudge +
            </button>
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              onClick={() => setFlag("bod.meter", clamp(meter - 2))}
            >
              Nudge -
            </button>
          </div>
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50"
              disabled={!solved}
              onClick={() => go("BF2")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "BF2",
    title: t("sysdisc.bod.fuel.bf2.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.fuel.bf2.prompt")}</p>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              onClick={() => setFlag("bod.meter", clamp(meter + 2))}
            >
              Nudge +
            </button>
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              onClick={() => setFlag("bod.meter", clamp(meter - 2))}
            >
              Nudge -
            </button>
          </div>
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
              onClick={() => go("BF3")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "BF3",
    title: t("sysdisc.bod.fuel.bf3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.fuel.bf3.prompt")}</p>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              onClick={() => setFlag("bod.meter", clamp(meter + 2))}
            >
              Nudge +
            </button>
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              onClick={() => setFlag("bod.meter", clamp(meter - 2))}
            >
              Nudge -
            </button>
          </div>
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
              onClick={() => go("BOD_FUEL_WRAP")}
            >
              {t("sysdisc.bod.common.reveal")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "BOD_FUEL_WRAP",
    title: t("sysdisc.bod.fuel.outro.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["bod.badges.careAlly"]) {
        setFlag("bod.badges.careAlly", true);
      }
      if (!flags["bod.badges.fuel"]) {
        setFlag("bod.badges.fuel", true);
      }
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.fuel.outro.p1")}</p>
          <div className="mb-2">
            <HomeostasisMeter value={Number(flags["bod.meter"] ?? 60)} />
          </div>
          <ul className="mb-3 ml-6 list-disc">
            <li>Care Ally badge: {String(flags["bod.badges.careAlly"])}</li>
            <li>Fuel badge: {String(flags["bod.badges.fuel"])}</li>
          </ul>
          <div className="flex gap-2">
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("bod.fuel.outro.seen", true);
                go("BF1");
              }}
            >
              {t("sysdisc.bod.common.replay")}
            </button>
            <button className="min-h-[44px] rounded border px-3 py-2" onClick={() => go("WRAP")}>
              {t("sysdisc.bod.common.home")}
            </button>
          </div>
        </div>
      );
    },
  },
  // --- Move sub-pack ---,
  ];
}