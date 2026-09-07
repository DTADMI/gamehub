/* eslint-disable react-hooks/rules-of-hooks */
// Auto-generated scene group — extracted from index.tsx monolith
// See scripts/split-systems-discovery.mjs
import type { Scene } from "@games/pointclick-engine";
import React from "react";

import { getLocale,t } from "@/lib/i18n";

import { OrbitsPuzzle } from "../puzzles/OrbitsPuzzle";
import type { PipesState, SequenceState } from "./_imports";
import { createPipesState, createSequenceState, evaluatePipes, HomeostasisMeter, PostGameCTA, pressSequenceKey, setTileRotation, toggleValve } from "./_imports";
export function buildSpaceScenes(): Scene[] {
  return [
  {
    id: "SD_SPACE_INTRO",
    title: t("sysdisc.space.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.space.intro.p1")}</p>
        <p className="mb-4 opacity-80">{t("sysdisc.space.intro.p2")}</p>
        <div className="flex gap-2">
          <button
            className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
            onClick={() => {
              setFlag("space.intro.seen", true);
              go("S1");
            }}
          >
            {t("sysdisc.space.intro.cta")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("space.intro.seen", true);
              go("S1");
            }}
          >
            {t("sysdisc.space.intro.skip")}
          </button>
        </div>
      </div>
    ),
  },

  {
    id: "S1",
    title: t("sysdisc.space.s1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const gentle = Boolean(flags["gentle"]);
      const solved = Boolean(flags["space.s1.solved"]);
      return (
        <div>
          <OrbitsPuzzle
            gentle={gentle}
            onSolved={() => setFlag("space.s1.solved", true)}
          />
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50"
              disabled={!solved}
              onClick={() => go("S2")}
            >
              {t("sysdisc.space.s1.continue")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "S2",
    title: t("sysdisc.space.s2.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const solved = Boolean(flags["space.s2.solved"]);
      const [selected, setSelected] = React.useState<string | null>(null);
      const [matched, setMatched] = React.useState<Record<string, string>>({});
      const SAT_TARGETS: Record<string, string> = {
        geo: "stationary",
        polar: "scan",
        leo: "low",
      };
      const sats = ["geo", "polar", "leo"];
      const orbits = ["stationary", "scan", "low"];
      const satLabels: Record<string, string> = {
        geo: "Geostationary (GEO)", polar: "Polar Orbiter", leo: "LEO Constellation",
      };
      const orbitLabels: Record<string, string> = {
        stationary: "Fixed above equator", scan: "Covers entire planet", low: "Fast, low-altitude path",
      };
      const allDone = Object.keys(matched).length === sats.length &&
        sats.every((p) => matched[p] === SAT_TARGETS[p]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.space.s2.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">
            Match each satellite type to its orbital characteristic.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Satellite Types</p>
              <div className="flex flex-col gap-2">
                {sats.map((p) => (
                  <button
                    key={p}
                    className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${
                      matched[p]
                        ? "border-green-400 bg-green-100"
                        : selected === p
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-300 bg-white"
                    }`}
                    disabled={!!matched[p]}
                    onClick={() => setSelected(selected === p ? null : p)}
                  >
                    {satLabels[p]}
                    {matched[p] && (
                      <span className="ml-2 text-green-600">→ {orbitLabels[matched[p]]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Orbital Characteristic</p>
              <div className="flex flex-col gap-2">
                {orbits.map((s) => (
                  <button
                    key={s}
                    className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${
                      Object.values(matched).includes(s)
                        ? "border-green-400 bg-green-100"
                        : "border-gray-300 bg-white hover:border-blue-400"
                    }`}
                    disabled={!selected || Object.values(matched).includes(s)}
                    onClick={() => {
                      if (selected && !matched[selected]) {
                        const next = { ...matched, [selected]: s };
                        setMatched(next);
                        setSelected(null);
                        if (
                          Object.keys(next).length === sats.length &&
                          sats.every((p2) => next[p2] === SAT_TARGETS[p2])
                        ) {
                          setFlag("space.s2.solved", true);
                        }
                      }
                    }}
                  >
                    {orbitLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm">
            Matched: {Object.keys(matched).length} / {sats.length}
          </div>
          {(solved || allDone) && (
            <p className="mt-2 font-bold text-emerald-600">
              All satellites matched! Understanding orbital mechanics unlocks navigation.
            </p>
          )}
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50"
              disabled={!solved && !allDone}
              onClick={() => go("S3")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "S3",
    title: t("sysdisc.space.s3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const solved = Boolean(flags["space.s3.solved"]);
      const [sorted, setSorted] = React.useState<Record<string, string>>({});
      const DEEP_TARGETS: Record<string, string> = {
        proxima: "exoplanet",
        andromeda: "galaxy",
        orion: "nebula",
        sagittarius: "blackhole",
      };
      const objects = ["proxima", "andromeda", "orion", "sagittarius"];
      const objLabels: Record<string, string> = {
        proxima: "Proxima Centauri b", andromeda: "Andromeda Galaxy",
        orion: "Orion Nebula", sagittarius: "Sagittarius A*",
      };
      const catLabels: Record<string, string> = {
        exoplanet: "Exoplanet", galaxy: "Galaxy", nebula: "Nebula", blackhole: "Black Hole",
      };
      const allDone = Object.keys(sorted).length === objects.length &&
        objects.every((p) => sorted[p] === DEEP_TARGETS[p]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.space.s3.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">
            Classify each deep-space object by type.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Deep-Space Objects</p>
              <div className="flex flex-col gap-2">
                {objects.map((p) => (
                  <div key={p} className={`min-h-[44px] rounded border-2 px-4 py-2 flex items-center justify-between ${sorted[p] ? "border-green-400 bg-green-100" : "border-gray-300 bg-white"}`}>
                    <span>{objLabels[p]}</span>
                    {!sorted[p] && (
                      <div className="flex gap-1">
                        {["exoplanet", "galaxy", "nebula", "blackhole"].map((cat) => (
                          <button key={cat} className="min-h-[32px] rounded bg-indigo-500 px-2 py-1 text-xs text-white"
                            onClick={() => {
                              const next = { ...sorted, [p]: cat };
                              setSorted(next);
                              if (Object.keys(next).length === objects.length && objects.every((p2) => next[p2] === DEEP_TARGETS[p2])) {
                                setFlag("space.s3.solved", true);
                              }
                            }}>
                            {catLabels[cat]}
                          </button>
                        ))}
                      </div>
                    )}
                    {sorted[p] && (
                      <span className="text-xs font-bold text-emerald-600">{catLabels[sorted[p]]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {(solved || allDone) && (
            <p className="mt-2 font-bold text-emerald-600">
              All objects classified! You understand the types of bodies in deep space.
            </p>
          )}
          <div className="mt-2">
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setSorted({})}>Reset</button>
          </div>
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50"
              disabled={!solved && !allDone} onClick={() => go("SPACE_WRAP")}>
              {t("sysdisc.bod.common.reveal")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "SPACE_WRAP",
    title: t("sysdisc.space.wrap.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["space.badgeAstronomer"]) {
        setFlag("space.badgeAstronomer", true);
      }
      return (
        <div>
          <p className="mb-2">{t("sysdisc.space.wrap.done")}</p>
          <p className="mb-2 text-sm font-bold text-amber-600">
            {t("sysdisc.space.wrap.badge")}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => go("SD_SPACE_OUTRO")}
            >
              {t("sysdisc.space.outro.title")}
            </button>
            <button className="min-h-[44px] rounded border px-3 py-2" onClick={() => go("WRAP")}>
              {t("sysdisc.bod.common.home")}
            </button>
          </div>
        </div>
      );
    },
  },

  {
    id: "SD_SPACE_OUTRO",
    title: t("sysdisc.space.outro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.space.outro.p1")}</p>
        <div className="flex gap-2">
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("space.outro.seen", true);
              go("S1");
            }}
          >
            {t("sysdisc.space.outro.replay")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("space.outro.seen", true);
              go("WRAP");
            }}
          >
            {t("sysdisc.space.outro.home")}
          </button>
        </div>
        <div className="mt-4">
          <PostGameCTA
            gameSlug="systems-discovery"
            completed
            onReplay={() => go("SD_SPACE_INTRO")}
            nextGameSlug="toymaker-escape"
            nextGameTitle={getLocale() === "fr" ? "Évasion du Fabricant" : "Toymaker Escape"}
            lang={getLocale() as "en" | "fr"}
          />
        </div>
      </div>
    ),
  },
  // --- Body Systems (BOD) scaffolds: Breath sub-pack ---,
  ];
}