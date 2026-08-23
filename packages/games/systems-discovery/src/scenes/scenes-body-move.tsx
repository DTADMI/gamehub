/* eslint-disable react-hooks/rules-of-hooks */
// Auto-generated scene group — extracted from index.tsx monolith
// See scripts/split-systems-discovery.mjs
import React from "react";
import { t } from "@/lib/i18n";
import type { Scene } from "@games/pointclick-engine";

import { HomeostasisMeter, PostGameCTA, createPipesState, evaluatePipes, createSequenceState, pressSequenceKey, setTileRotation, toggleValve } from "./_imports";
import type { PipesState, SequenceState } from "./_imports";
export function buildBodyMoveScenes(): Scene[] {
  return [
  {
    id: "SD_BOD_MOVE_INTRO",
    title: t("sysdisc.bod.move.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.bod.move.intro.p1")}</p>
        <div className="flex gap-2">
          <button
            className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
            onClick={() => {
              setFlag("bod.move.intro.seen", true);
              go("BM1");
            }}
          >
            {t("sysdisc.bod.move.intro.cta")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("bod.move.intro.seen", true);
              go("BM1");
            }}
          >
            {t("sysdisc.bod.move.intro.skip")}
          </button>
        </div>
      </div>
    ),
  },

  {
    id: "BM1",
    title: t("sysdisc.bod.move.bm1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.move.bm1.prompt")}</p>
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
              onClick={() => go("BM2")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "BM2",
    title: t("sysdisc.bod.move.bm2.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.move.bm2.prompt")}</p>
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
              onClick={() => go("BM3")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "BM3",
    title: t("sysdisc.bod.move.bm3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.move.bm3.prompt")}</p>
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
              onClick={() => go("BOD_MOVE_WRAP")}
            >
              {t("sysdisc.bod.common.reveal")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "BOD_MOVE_WRAP",
    title: t("sysdisc.bod.move.outro.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["bod.badges.careAlly"]) {
        setFlag("bod.badges.careAlly", true);
      }
      if (!flags["bod.badges.move"]) {
        setFlag("bod.badges.move", true);
      }
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.move.outro.p1")}</p>
          <div className="mb-2">
            <HomeostasisMeter value={Number(flags["bod.meter"] ?? 60)} />
          </div>
          <ul className="mb-3 ml-6 list-disc">
            <li>Care Ally badge: {String(flags["bod.badges.careAlly"])}</li>
            <li>Move badge: {String(flags["bod.badges.move"])}</li>
          </ul>
          <div className="flex gap-2">
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("bod.move.outro.seen", true);
                go("BM1");
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
  // --- Signal sub-pack ---,
  ];
}