/* eslint-disable react-hooks/rules-of-hooks */
// Auto-generated scene group — extracted from index.tsx monolith
// See scripts/split-systems-discovery.mjs
import React from "react";
import { t, getLocale } from "@/lib/i18n";
import type { Scene } from "@games/pointclick-engine";

import { HomeostasisMeter, PostGameCTA, createPipesState, evaluatePipes, createSequenceState, pressSequenceKey, setTileRotation, toggleValve } from "./_imports";
import type { PipesState, SequenceState } from "./_imports";
export function buildOceanScenes(): Scene[] {
  return [
  {
    id: "SD_OCEAN_INTRO",
    title: t("sysdisc.ocean.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.ocean.intro.p1")}</p>
        <p className="mb-4 opacity-80">{t("sysdisc.ocean.intro.p2")}</p>
        <div className="flex gap-2">
          <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2" onClick={() => { setFlag("ocean.intro.seen", true); go("O1"); }}>{t("sysdisc.ocean.intro.cta")}</button>
          <button className="min-h-[44px] rounded border px-3 py-2" onClick={() => { setFlag("ocean.intro.seen", true); go("O1"); }}>{t("sysdisc.ocean.intro.skip")}</button>
        </div>
      </div>
    ),
  },

  {
    id: "O1",
    title: t("sysdisc.ocean.o1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const ZONE_TARGETS: Record<string, string> = {
        coral: "sunlit", plankton: "sunlit", lanternfish: "twilight",
        anglerfish: "midnight", tubeworm: "abyss", giantsquid: "midnight",
      };
      const creatures = ["coral", "plankton", "lanternfish", "anglerfish", "tubeworm", "giantsquid"];
      const zones = ["sunlit", "twilight", "midnight", "abyss"];
      const [sel, setSel] = React.useState<string | null>(null);
      const [m, setM] = React.useState<Record<string, string>>({});
      const allDone = Object.keys(m).length === creatures.length && creatures.every((c) => m[c] === ZONE_TARGETS[c]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.ocean.o1.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">{t("sysdisc.ocean.o1.hint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">{t("sysdisc.ocean.o1.title")} — Creatures</p>
              <div className="flex flex-col gap-2">
                {creatures.map((c) => (
                  <button key={c} className={`min-h-[44px] rounded border-2 px-3 py-2 text-left ${m[c] ? "border-green-400 bg-green-100" : sel === c ? "border-blue-400 bg-blue-100" : "border-gray-300 bg-white"}`}
                    disabled={!!m[c]} onClick={() => setSel(sel === c ? null : c)}>
                    {t(`sysdisc.ocean.o1.creatures.${c}`)}{m[c] && <span className="ml-2 text-green-600">→ {t(`sysdisc.ocean.o1.zones.${m[c]}`)}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Zones</p>
              <div className="flex flex-col gap-2">
                {zones.map((z) => (
                  <button key={z} className={`min-h-[44px] rounded border-2 px-3 py-2 text-left ${Object.values(m).includes(z) ? "border-green-400 bg-green-100" : "border-gray-300 bg-white hover:border-blue-400"}`}
                    disabled={!sel || Object.values(m).includes(z)}
                    onClick={() => { if (sel && ZONE_TARGETS[sel] === z) { const next = { ...m, [sel]: z }; setM(next); setSel(null); if (Object.keys(next).length === creatures.length && creatures.every((c2) => next[c2] === ZONE_TARGETS[c2])) { setFlag("ocean.o1.solved", true); } } else { setSel(null); } }}>
                    {t(`sysdisc.ocean.o1.zones.${z}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm">Sorted: {Object.keys(m).length} / {creatures.length}</div>
          {allDone && <p className="mt-2 font-bold text-emerald-600">{t("sysdisc.ocean.o1.sorted")}</p>}
          <button className="mt-2 min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => { setM({}); setSel(null); }}>{t("sysdisc.ocean.o1.reset")}</button>
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!allDone && !flags["ocean.o1.solved"]} onClick={() => go("O2")}>{t("sysdisc.ocean.o1.continue")}</button>
          </div>
        </div>
      );
    },
  },

  {
    id: "O2",
    title: t("sysdisc.ocean.o2.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const solved = Boolean(flags["ocean.o2.solved"]);
      const [pipes, setPipes] = React.useState<PipesState>(() =>
        createPipesState(5, 1, [
          { type: "straight", rotation: 0, source: true },
          { type: "valve", rotation: 0, open: false },
          { type: "straight", rotation: 0 },
          { type: "valve", rotation: 0, open: false },
          { type: "straight", rotation: 0, sink: true },
        ]),
      );
      const rotateTile = (x: number) => {
        const nr = ((pipes.grid[x].rotation + 90) % 360) as 0|90|180|270;
        const next = evaluatePipes(setTileRotation(pipes, x, 0, nr));
        setPipes(next);
        if (next.solved) {setFlag("ocean.o2.solved", true);}
      };
      const currentLabels = ["Gulf Stream", "Kuroshio", "Antarctic", "California", "North Atlantic"];
      return (
        <div>
          <p className="mb-2">{t("sysdisc.ocean.o2.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">{t("sysdisc.ocean.o2.hint")}</p>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {pipes.grid.map((tile, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-300">{currentLabels[i]}</span>
                <div className="flex gap-1">
                  <button className="min-h-[36px] min-w-[36px] rounded border border-blue-800 bg-slate-800 text-xs text-white" onClick={() => rotateTile(i)}>{t("sysdisc.ocean.o2.rotate")}</button>
                  {tile.type === "valve" && (
                    <button className={`min-h-[36px] min-w-[36px] rounded border text-xs text-white ${tile.open ? "bg-emerald-600 border-emerald-400" : "bg-red-700 border-red-400"}`}
                      onClick={() => { const next = evaluatePipes(toggleValve(pipes, i, 0, !tile.open)); setPipes(next); if (next.solved) {setFlag("ocean.o2.solved", true);} }}>
                      {tile.open ? "ON" : "OFF"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {(solved || pipes.solved) && <p className="mb-2 text-center font-bold text-green-400">{t("sysdisc.ocean.o2.solved")}</p>}
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!solved && !pipes.solved} onClick={() => go("O3")}>{t("sysdisc.ocean.o2.continue")}</button>
          </div>
        </div>
      );
    },
  },

  {
    id: "O3",
    title: t("sysdisc.ocean.o3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const SIGNAL_TARGETS: Record<string, string> = {
        humpback: "whale", bottlenose: "dolphin", pistol: "shrimp", anglerfish: "bioglow",
      };
      const creatures = ["humpback", "bottlenose", "pistol", "anglerfish"];
      const signals = ["whale", "dolphin", "shrimp", "bioglow"];
      const [sel, setSel] = React.useState<string | null>(null);
      const [m, setM] = React.useState<Record<string, string>>({});
      const allDone = Object.keys(m).length === creatures.length && creatures.every((c) => m[c] === SIGNAL_TARGETS[c]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.ocean.o3.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">{t("sysdisc.ocean.o3.hint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Creatures</p>
              <div className="flex flex-col gap-2">
                {creatures.map((c) => (
                  <button key={c} className={`min-h-[44px] rounded border-2 px-3 py-2 ${m[c] ? "border-green-400 bg-green-100" : sel === c ? "border-blue-400 bg-blue-100" : "border-gray-300 bg-white"}`}
                    disabled={!!m[c]} onClick={() => setSel(sel === c ? null : c)}>
                    {t(`sysdisc.ocean.o3.creatureLabels.${c}`)}{m[c] && <span className="ml-2 text-green-600">→ {t(`sysdisc.ocean.o3.signals.${m[c]}`)}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Signals</p>
              <div className="flex flex-col gap-2">
                {signals.map((s) => (
                  <button key={s} className={`min-h-[44px] rounded border-2 px-3 py-2 ${Object.values(m).includes(s) ? "border-green-400 bg-green-100" : "border-gray-300 bg-white hover:border-blue-400"}`}
                    disabled={!sel || Object.values(m).includes(s)}
                    onClick={() => { if (sel && SIGNAL_TARGETS[sel] === s) { const next = { ...m, [sel]: s }; setM(next); setSel(null); if (Object.keys(next).length === creatures.length && creatures.every((c2) => next[c2] === SIGNAL_TARGETS[c2])) { setFlag("ocean.o3.solved", true); } } else { setSel(null); } }}>
                    {t(`sysdisc.ocean.o3.signals.${s}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm">{t("sysdisc.ocean.o3.matched")}: {Object.keys(m).length} / {creatures.length}</div>
          {allDone && <p className="mt-2 font-bold text-emerald-600">{t("sysdisc.ocean.o3.solved")}</p>}
          <button className="mt-2 min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => { setM({}); setSel(null); }}>{t("sysdisc.ocean.o3.reset")}</button>
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!allDone && !flags["ocean.o3.solved"]} onClick={() => go("OCEAN_WRAP")}>{t("sysdisc.bod.common.reveal")}</button>
          </div>
        </div>
      );
    },
  },

  {
    id: "OCEAN_WRAP",
    title: t("sysdisc.ocean.wrap.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["ocean.badgeOceanographer"]) { setFlag("ocean.badgeOceanographer", true); }
      return (
        <div>
          <p className="mb-2">{t("sysdisc.ocean.wrap.done")}</p>
          <p className="mb-2 text-sm font-bold text-amber-600">{t("sysdisc.ocean.wrap.badge")}</p>
          <div className="mt-3 flex gap-2">
            <button className="min-h-[44px] rounded border px-3 py-2" onClick={() => go("SD_OCEAN_OUTRO")}>{t("sysdisc.ocean.outro.title")}</button>
            <button className="min-h-[44px] rounded border px-3 py-2" onClick={() => go("WRAP")}>{t("sysdisc.bod.common.home")}</button>
          </div>
        </div>
      );
    },
  },

  {
    id: "SD_OCEAN_OUTRO",
    title: t("sysdisc.ocean.outro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.ocean.outro.p1")}</p>
        <div className="flex gap-2">
          <button className="min-h-[44px] rounded border px-3 py-2" onClick={() => { setFlag("ocean.outro.seen", true); go("O1"); }}>{t("sysdisc.ocean.outro.replay")}</button>
          <button className="min-h-[44px] rounded border px-3 py-2" onClick={() => { setFlag("ocean.outro.seen", true); go("WRAP"); }}>{t("sysdisc.ocean.outro.home")}</button>
        </div>
        <div className="mt-4">
          <PostGameCTA
            gameSlug="systems-discovery"
            completed
            onReplay={() => go("SD_OCEAN_INTRO")}
            nextGameSlug="toymaker-escape"
            nextGameTitle={getLocale() === "fr" ? "Évasion du Fabricant" : "Toymaker Escape"}
            lang={getLocale() as "en" | "fr"}
          />
        </div>
      </div>
    ),
  },
  ];
}