"use client";
/* eslint-disable react-hooks/rules-of-hooks */
import HomeostasisMeter from "@gamehub/game-platform/components/sysdisc/HomeostasisMeter";
import { soundManager } from "@gamehub/game-platform/lib/sound";
import { Scene, SceneController } from "@games/pointclick-engine";
import {
  createPipesState,
  evaluatePipes,
  type PipesState,
  setTileRotation,
  toggleValve,
} from "@games/pointclick-engine/puzzles/pipes";
import {
  createSequenceState,
  pressSeq as pressSequenceKey,
  type SequenceState,
} from "@games/pointclick-engine/puzzles/sequence";
import React from "react";

import { t } from "@/lib/i18n";

import { BreathPuzzle } from "./puzzles/BreathPuzzle";
import { FuelMatchingPuzzle } from "./puzzles/FuelMatchingPuzzle";
import { OrbitsPuzzle } from "./puzzles/OrbitsPuzzle";

const scenes: Scene[] = [
  {
    id: "SD_INTRO",
    title: t("sysdisc.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.intro.p1")}</p>
        <p className="mb-4 opacity-80">{t("sysdisc.intro.p2")}</p>
        <div className="flex gap-2">
          <button
            className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
            onClick={() => {
              setFlag("intro.seen", true);
              go("B1");
            }}
          >
            {t("sysdisc.intro.cta")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("intro.seen", true);
              go("B1");
            }}
          >
            {t("sysdisc.intro.skip")}
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "B1",
    title: t("sysdisc.b1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const gentle = Boolean(flags["gentle"]);
      const s1 = Boolean(flags["b1.kitchen"]);
      const s2 = Boolean(flags["b1.compost"]);
      const s3 = Boolean(flags["b1.soil"]);
      const s4 = Boolean(flags["b1.herbs"]);
      const canCompost = s1;
      const canSoil = s1 && s2;
      const canHerbs = s1 && s2 && s3;
      const done = s1 && s2 && s3 && s4;
      return (
        <div>
          <p className="mb-2">{t("sysdisc.b1.prompt")}</p>
          {gentle && <p className="mb-2 text-sm opacity-80">{t("sysdisc.b1.hint")}</p>}
          <div role="group" aria-label="Loop steps" className="flex flex-wrap gap-2">
            <button
              className={`min-h-[44px] rounded border px-3 py-2 ${s1 ? "bg-amber-100" : "bg-background"}`}
              aria-pressed={s1}
              onClick={() => setFlag("b1.kitchen", true)}
            >
              {t("sysdisc.b1.steps.kitchen")}
            </button>
            <button
              disabled={!canCompost}
              className={`min-h-[44px] rounded border px-3 py-2 ${s2 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
              aria-pressed={s2}
              onClick={() => setFlag("b1.compost", true)}
            >
              {t("sysdisc.b1.steps.compost")}
            </button>
            <button
              disabled={!canSoil}
              className={`min-h-[44px] rounded border px-3 py-2 ${s3 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
              aria-pressed={s3}
              onClick={() => setFlag("b1.soil", true)}
            >
              {t("sysdisc.b1.steps.soil")}
            </button>
            <button
              disabled={!canHerbs}
              className={`min-h-[44px] rounded border px-3 py-2 ${s4 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
              aria-pressed={s4}
              onClick={() => setFlag("b1.herbs", true)}
            >
              {t("sysdisc.b1.steps.herbs")}
            </button>
          </div>
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50"
              disabled={!done}
              onClick={() => {
                setFlag("b1.route", "loop-ok");
                go("B2");
              }}
            >
              {t("sysdisc.b1.continue")}
            </button>
          </div>
        </div>
      );
    },
  },
  {
    id: "B2",
    title: t("sysdisc.b2.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p>{t("sysdisc.b2.prompt")}</p>
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Route plan">
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("b2.plan", "bus-first");
              go("B3");
            }}
          >
            {t("sysdisc.b2.busFirst")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("b2.plan", "bike-first");
              go("B3");
            }}
          >
            {t("sysdisc.b2.bikeFirst")}
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "B3",
    title: t("sysdisc.b3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const hint = Boolean(flags["b3.hints"]);
      const a = Boolean(flags["b3.banana"]);
      const b = Boolean(flags["b3.bottle"]);
      const c = Boolean(flags["b3.paper"]);
      const solved = a && b && c;
      return (
        <div>
          <p className="mb-2">{t("sysdisc.b3.prompt")}</p>
          <div className="mb-2">
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              aria-pressed={hint}
              onClick={() => setFlag("b3.hints", !hint)}
            >
              {hint ? t("sysdisc.b3.hintsOn") : t("sysdisc.b3.hintsOff")}
            </button>
          </div>
          {hint && <p className="text-sm opacity-80">{t("sysdisc.b3.hintDetail")}</p>}
          <div role="group" aria-label="Sort items" className="flex items-center gap-2">
            <button
              className={`min-h-[44px] rounded border px-3 py-2 ${a ? "bg-amber-100" : "bg-background"}`}
              aria-pressed={a}
              onClick={() => setFlag("b3.banana", !a)}
            >
              {t("sysdisc.b3.items.banana")}
            </button>
            <button
              className={`min-h-[44px] rounded border px-3 py-2 ${b ? "bg-amber-100" : "bg-background"}`}
              aria-pressed={b}
              onClick={() => setFlag("b3.bottle", !b)}
            >
              {t("sysdisc.b3.items.bottle")}
            </button>
            <button
              className={`min-h-[44px] rounded border px-3 py-2 ${c ? "bg-amber-100" : "bg-background"}`}
              aria-pressed={c}
              onClick={() => setFlag("b3.paper", !c)}
            >
              {t("sysdisc.b3.items.paper")}
            </button>
          </div>
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50"
              disabled={!solved}
              onClick={() => {
                setFlag("b3.result", hint ? "sorted" : "sorted-nohints");
                go("WRAP");
              }}
            >
              {t("sysdisc.b3.reveal")}
            </button>
          </div>
        </div>
      );
    },
  },
  {
    id: "WRAP",
    title: t("sysdisc.wrap.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["ep.badgeApplied"]) {
        setFlag("ep.badgeSystemsScout", true);
        setFlag("ep.badgeApplied", true);
        setFlag("saveVersion", 1);
      }
      return (
        <div>
          <p>{t("sysdisc.wrap.done")}</p>
          <div className="my-2">
            <img
              src="/assets/sysdisc/badge_systems_scout.svg"
              alt="Systems Scout badge"
              className="h-12 w-12"
            />
          </div>
          <ul className="ml-6 list-disc">
            <li>
              {t("sysdisc.wrap.b1")}: {String(flags["b1.route"])}
            </li>
            <li>
              {t("sysdisc.wrap.b2")}: {String(flags["b2.plan"])}
            </li>
            <li>
              {t("sysdisc.wrap.b3")}: {String(flags["b3.result"])}
            </li>
            <li>Badge: {String(flags["ep.badgeSystemsScout"])}</li>
          </ul>
          <div className="mt-3">
            <button
              className="bg-secondary text-secondary-foreground min-h-[44px] rounded px-4 py-2"
              onClick={() => go("SD_OUTRO")}
            >
              View outro
            </button>
          </div>
        </div>
      );
    },
  },
  {
    id: "SD_OUTRO",
    title: t("sysdisc.outro.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      return (
        <div>
          <p className="mb-2">{t("sysdisc.outro.p1")}</p>
          <div className="mb-3">
            <div className="font-medium">{t("sysdisc.outro.recap")}:</div>
            <ul className="ml-6 list-disc">
              <li>B1: {String(flags["b1.route"])}</li>
              <li>B2: {String(flags["b2.plan"])}</li>
              <li>B3: {String(flags["b3.result"])}</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("outro.seen", true);
                go("B1");
              }}
            >
              {t("sysdisc.outro.replay")}
            </button>
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("outro.seen", true);
                const cur = String(flags["b2.plan"] ?? "bus-first");
                setFlag("b2.plan", cur === "bus-first" ? "bike-first" : "bus-first");
                go("B2");
              }}
            >
              {t("sysdisc.outro.altPlan")}
            </button>
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("outro.seen", true);
                setFlag("b3.hints", !flags["b3.hints"]);
              }}
            >
              {t("sysdisc.outro.toggleHints")}
            </button>
          </div>
        </div>
      );
    },
  },
  // --- Space Pack ---
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
      </div>
    ),
  },
  // --- Body Systems (BOD) scaffolds: Breath sub-pack ---
  {
    id: "SD_BOD_BREATH_INTRO",
    title: t("sysdisc.bod.breath.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.bod.breath.intro.p1")}</p>
        <div className="flex gap-2">
          <button
            className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
            onClick={() => {
              setFlag("bod.breath.intro.seen", true);
              go("BB1");
            }}
          >
            {t("sysdisc.bod.breath.intro.cta")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("bod.breath.intro.seen", true);
              go("BB1");
            }}
          >
            {t("sysdisc.bod.breath.intro.skip")}
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "BB1",
    title: t("sysdisc.bod.breath.bb1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const solved = Boolean(flags["bod.breath.puzzleSolved"]);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.breath.bb1.prompt")}</p>

          <BreathPuzzle onSolved={() => setFlag("bod.breath.puzzleSolved", true)} />

          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2" role="group" aria-label="Balance nudges">
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
              onClick={() => go("BB2")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BB2",
    title: t("sysdisc.bod.breath.bb2.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.breath.bb2.prompt")}</p>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2" role="group" aria-label="Balance nudges">
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
              onClick={() => go("BB3")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BB3",
    title: t("sysdisc.bod.breath.bb3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.breath.bb3.prompt")}</p>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2" role="group" aria-label="Balance nudges">
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
              onClick={() => go("BOD_BREATH_WRAP")}
            >
              {t("sysdisc.bod.common.reveal")}
            </button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BOD_BREATH_WRAP",
    title: t("sysdisc.bod.breath.outro.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["bod.badges.careAlly"]) {
        setFlag("bod.badges.careAlly", true);
        setFlag("bod.badges.breath", true);
      }
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.breath.outro.p1")}</p>
          <div className="mb-2">
            <HomeostasisMeter value={Number(flags["bod.meter"] ?? 60)} />
          </div>
          <ul className="mb-3 ml-6 list-disc">
            <li>Care Ally badge: {String(flags["bod.badges.careAlly"])}</li>
            <li>Breath badge: {String(flags["bod.badges.breath"])}</li>
          </ul>
          <div className="flex gap-2">
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("bod.breath.outro.seen", true);
                go("BB1");
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
  // --- Body Systems (BOD) scaffolds: Fuel sub-pack ---
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
  // --- Move sub-pack ---
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
  // --- Signal sub-pack ---
  {
    id: "SD_BOD_SIGNAL_INTRO",
    title: t("sysdisc.bod.signal.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.bod.signal.intro.p1")}</p>
        <div className="flex gap-2">
          <button
            className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
            onClick={() => {
              setFlag("bod.signal.intro.seen", true);
              go("BSD1");
            }}
          >
            {t("sysdisc.bod.signal.intro.cta")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("bod.signal.intro.seen", true);
              go("BSD1");
            }}
          >
            {t("sysdisc.bod.signal.intro.skip")}
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "BSD1",
    title: t("sysdisc.bod.signal.bsd1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      const [seq, setSeq] = React.useState<SequenceState>(() =>
        createSequenceState(["sight", "smell", "touch"], { lives: 5 }),
      );
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.signal.bsd1.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">Activate senses in order: sight, smell, touch.</p>
          <div className="flex gap-2 mb-3">
            {[
              { key: "sight", label: "Sight", emoji: "👁" },
              { key: "smell", label: "Smell", emoji: "👃" },
              { key: "touch", label: "Touch", emoji: "✋" },
            ].map(({ key, label, emoji }) => (
              <button
                key={key}
                className="bg-muted hover:bg-muted/80 min-h-[44px] min-w-[80px] rounded border px-4 py-2"
                onClick={() => {
                  const next = pressSequenceKey(seq, key);
                  setSeq(next);
                  if (next.solved) {setFlag("bod.signal.bsd1.solved", true);}
                }}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter + 2))}>Nudge +</button>
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter - 2))}>Nudge -</button>
          </div>
          <div className="mt-2 text-sm">
            Progress: {seq.input.length} / {seq.target.length}
            {flags["bod.signal.bsd1.solved"] && <span className="ml-2 text-green-500">✓</span>}
          </div>
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!flags["bod.signal.bsd1.solved"]} onClick={() => go("BSD2")}>{t("sysdisc.bod.common.continue")}</button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BSD2",
    title: t("sysdisc.bod.signal.bsd2.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      const THREAT_TARGETS: Record<string, string> = { bacteria: "antibody", virus: "tcell", toxin: "liver" };
      const threats = ["bacteria", "virus", "toxin"];
      const defenses = ["antibody", "tcell", "liver"];
      const [selected, setSelected] = React.useState<string | null>(null);
      const [matched, setMatched] = React.useState<Record<string, string>>({});
      const allDone = Object.keys(matched).length === threats.length && threats.every((t) => matched[t] === THREAT_TARGETS[t]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.signal.bsd2.prompt")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Threats</p>
              <div className="flex flex-col gap-2">
                {threats.map((t) => (
                  <button key={t} className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${matched[t] ? "border-green-400 bg-green-100" : selected === t ? "border-red-400 bg-red-100" : "border-gray-300 bg-white"}`}
                    disabled={!!matched[t]} onClick={() => setSelected(selected === t ? null : t)}>
                    {t}
                    {matched[t] && <span className="ml-2 text-green-600">→ {matched[t]}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Defenses</p>
              <div className="flex flex-col gap-2">
                {defenses.map((d) => (
                  <button key={d} className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${Object.values(matched).includes(d) ? "border-green-400 bg-green-100" : "border-gray-300 bg-white hover:border-blue-400"}`}
                    disabled={!selected || Object.values(matched).includes(d)}
                    onClick={() => { if (selected && THREAT_TARGETS[selected] === d) { const next = { ...matched, [selected]: d }; setMatched(next); setSelected(null); if (Object.keys(next).length === threats.length && threats.every((t2) => next[t2] === THREAT_TARGETS[t2])) { setFlag("bod.signal.bsd2.solved", true); } } else { setSelected(null); } }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter + 2))}>Nudge +</button>
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter - 2))}>Nudge -</button>
          </div>
          {(allDone || flags["bod.signal.bsd2.solved"]) && <p className="mt-2 font-bold text-emerald-600">Defenses activated!</p>}
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!allDone && !flags["bod.signal.bsd2.solved"]} onClick={() => go("BSD3")}>{t("sysdisc.bod.common.continue")}</button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BSD3",
    title: t("sysdisc.bod.signal.bsd3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      const [pipes, setPipes] = React.useState<PipesState>(() =>
        createPipesState(3, 1, [
          { type: "straight", rotation: 0, source: true },
          { type: "valve", rotation: 0, open: false },
          { type: "straight", rotation: 0, sink: true },
        ]),
      );
      const rotateTile = (x: number) => {
        const nr = ((pipes.grid[x].rotation + 90) % 360) as 0|90|180|270;
        const next = evaluatePipes(setTileRotation(pipes, x, 0, nr));
        setPipes(next);
        if (next.solved) {setFlag("bod.signal.bsd3.solved", true);}
      };
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.signal.bsd3.prompt")}</p>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button className="flex h-16 w-16 items-center justify-center rounded border-2 border-amber-300 bg-white" onClick={() => rotateTile(0)}>{pipes.grid[0].rotation * 90}°</button>
            <button className={`flex h-16 w-16 items-center justify-center rounded border-2 border-amber-300 ${pipes.grid[1].open ? "bg-amber-200" : "bg-white"}`} onClick={() => { const next = evaluatePipes(toggleValve(pipes, 1, 0, !pipes.grid[1].open)); setPipes(next); if (next.solved) {setFlag("bod.signal.bsd3.solved", true);} }}>{pipes.grid[1].open ? "OPEN" : "CLOSED"}</button>
            <button className="flex h-16 w-16 items-center justify-center rounded border-2 border-amber-300 bg-white" onClick={() => rotateTile(2)}>{pipes.grid[2].rotation * 90}°</button>
          </div>
          {pipes.solved && <p className="mb-2 text-center font-bold text-green-600">Signal connected!</p>}
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter + 2))}>Nudge +</button>
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter - 2))}>Nudge -</button>
          </div>
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!flags["bod.signal.bsd3.solved"]} onClick={() => go("BOD_SIGNAL_WRAP")}>{t("sysdisc.bod.common.reveal")}</button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BOD_SIGNAL_WRAP",
    title: t("sysdisc.bod.signal.outro.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["bod.badges.careAlly"]) {
        setFlag("bod.badges.careAlly", true);
      }
      if (!flags["bod.badges.signal"]) {
        setFlag("bod.badges.signal", true);
      }
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.signal.outro.p1")}</p>
          <div className="mb-2">
            <HomeostasisMeter value={Number(flags["bod.meter"] ?? 60)} />
          </div>
          <ul className="mb-3 ml-6 list-disc">
            <li>Care Ally badge: {String(flags["bod.badges.careAlly"])}</li>
            <li>Signal & Defend badge: {String(flags["bod.badges.signal"])}</li>
          </ul>
          <div className="flex gap-2">
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("bod.signal.outro.seen", true);
                go("BSD1");
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
  // --- Grow sub-pack ---
  {
    id: "SD_BOD_GROW_INTRO",
    title: t("sysdisc.bod.grow.intro.title") as string,
    render: ({ go, setFlag }) => (
      <div>
        <p className="mb-2">{t("sysdisc.bod.grow.intro.p1")}</p>
        <div className="flex gap-2">
          <button
            className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
            onClick={() => {
              setFlag("bod.grow.intro.seen", true);
              go("BG1");
            }}
          >
            {t("sysdisc.bod.grow.intro.cta")}
          </button>
          <button
            className="min-h-[44px] rounded border px-3 py-2"
            onClick={() => {
              setFlag("bod.grow.intro.seen", true);
              go("BG1");
            }}
          >
            {t("sysdisc.bod.grow.intro.skip")}
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "BG1",
    title: t("sysdisc.bod.grow.bg1.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      const STAGES = ["interphase", "prophase", "metaphase", "anaphase", "telophase"];
      const [stageIdx, setStageIdx] = React.useState(0);
      const [completed, setCompleted] = React.useState(false);
      const advance = () => {
        const next = stageIdx + 1;
        if (next >= STAGES.length) {
          setCompleted(true);
          setFlag("bod.grow.bg1.solved", true);
        } else {
          setStageIdx(next);
        }
      };
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.grow.bg1.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">Click through the stages of cell division in order.</p>
          <div className="mb-3 rounded border p-3">
            <p className="mb-2 text-center text-lg font-mono">{STAGES[stageIdx]}</p>
            <div className="flex justify-center">
              <button className="bg-emerald-600 text-white min-h-[44px] rounded px-4 py-2" onClick={advance}>
                {completed ? "Complete!" : stageIdx < STAGES.length - 1 ? "Next Stage" : "Complete Mitosis"}
              </button>
            </div>
          </div>
          {completed && <p className="mb-2 font-bold text-green-600">Cell division complete!</p>}
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter + 2))}>Nudge +</button>
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter - 2))}>Nudge -</button>
          </div>
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!flags["bod.grow.bg1.solved"]} onClick={() => go("BG2")}>{t("sysdisc.bod.common.continue")}</button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BG2",
    title: t("sysdisc.bod.grow.bg2.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      const CELL_TARGETS: Record<string, string> = { neuron: "signal", muscle: "contract", skin: "protect" };
      const cells = ["neuron", "muscle", "skin"];
      const functions = ["signal", "contract", "protect"];
      const [sel, setSel] = React.useState<string | null>(null);
      const [m, setM] = React.useState<Record<string, string>>({});
      const allDone = Object.keys(m).length === cells.length && cells.every((c) => m[c] === CELL_TARGETS[c]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.grow.bg2.prompt")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Cell Types</p>
              <div className="flex flex-col gap-2">
                {cells.map((c) => (
                  <button key={c} className={`min-h-[44px] rounded border-2 px-4 py-2 ${m[c] ? "border-green-400 bg-green-100" : sel === c ? "border-blue-400 bg-blue-100" : "border-gray-300 bg-white"}`}
                    disabled={!!m[c]} onClick={() => setSel(sel === c ? null : c)}>{c}{m[c] && <span className="ml-2 text-green-600">→ {m[c]}</span>}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">Functions</p>
              <div className="flex flex-col gap-2">
                {functions.map((f) => (
                  <button key={f} className={`min-h-[44px] rounded border-2 px-4 py-2 ${Object.values(m).includes(f) ? "border-green-400 bg-green-100" : "border-gray-300 bg-white hover:border-blue-400"}`}
                    disabled={!sel || Object.values(m).includes(f)}
                    onClick={() => { if (sel && CELL_TARGETS[sel] === f) { const next = { ...m, [sel]: f }; setM(next); setSel(null); if (Object.keys(next).length === cells.length && cells.every((c2) => next[c2] === CELL_TARGETS[c2])) { setFlag("bod.grow.bg2.solved", true); } } else { setSel(null); } }}>{f}</button>
                ))}
              </div>
            </div>
          </div>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter + 2))}>Nudge +</button>
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter - 2))}>Nudge -</button>
          </div>
          {allDone && <p className="mt-2 font-bold text-green-600">All cells differentiated!</p>}
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!allDone && !flags["bod.grow.bg2.solved"]} onClick={() => go("BG3")}>{t("sysdisc.bod.common.continue")}</button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BG3",
    title: t("sysdisc.bod.grow.bg3.title") as string,
    render: ({ go, setFlag, state }) => {
      const flags = state.ctx.flags;
      const meter = Number(flags["bod.meter"] ?? 60);
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      const [seq, setSeq] = React.useState<SequenceState>(() =>
        createSequenceState(["infant", "child", "teen", "adult"], { lives: 5 }),
      );
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.grow.bg3.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">Arrange the life stages in order: infant, child, teen, adult.</p>
          <div className="flex gap-2 mb-3">
            {[
              { key: "infant", label: "Infant" },
              { key: "child", label: "Child" },
              { key: "teen", label: "Teen" },
              { key: "adult", label: "Adult" },
            ].map(({ key, label }) => (
              <button key={key} className="bg-muted hover:bg-muted/80 min-h-[44px] rounded border px-4 py-2"
                onClick={() => { const next = pressSequenceKey(seq, key); setSeq(next); if (next.solved) {setFlag("bod.grow.bg3.solved", true);} }}>{label}</button>
            ))}
          </div>
          <HomeostasisMeter value={meter} />
          <div className="mt-2 flex gap-2">
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter + 2))}>Nudge +</button>
            <button className="min-h-[32px] rounded border px-2 py-1 text-sm" onClick={() => setFlag("bod.meter", clamp(meter - 2))}>Nudge -</button>
          </div>
          <div className="mt-2 text-sm">Progress: {seq.input.length} / {seq.target.length}</div>
          <div className="mt-3">
            <button className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50" disabled={!flags["bod.grow.bg3.solved"]} onClick={() => go("BOD_GROW_WRAP")}>{t("sysdisc.bod.common.reveal")}</button>
          </div>
        </div>
      );
    },
  },
  {
    id: "BOD_GROW_WRAP",
    title: t("sysdisc.bod.grow.outro.title") as string,
    render: ({ state, setFlag, go }) => {
      const flags = state.ctx.flags;
      if (!flags["bod.badges.careAlly"]) {
        setFlag("bod.badges.careAlly", true);
      }
      if (!flags["bod.badges.grow"]) {
        setFlag("bod.badges.grow", true);
      }
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.grow.outro.p1")}</p>
          <div className="mb-2">
            <HomeostasisMeter value={Number(flags["bod.meter"] ?? 60)} />
          </div>
          <ul className="mb-3 ml-6 list-disc">
            <li>Care Ally badge: {String(flags["bod.badges.careAlly"])}</li>
            <li>Grow badge: {String(flags["bod.badges.grow"])}</li>
          </ul>
          <div className="flex gap-2">
            <button
              className="min-h-[44px] rounded border px-3 py-2"
              onClick={() => {
                setFlag("bod.grow.outro.seen", true);
                go("BG1");
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
  // --- Ocean Pack ---
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
      </div>
    ),
  },
];

export function SystemsDiscoveryGame() {
  React.useEffect(() => {
    if (typeof soundManager.registerSound === "function") {
      soundManager.registerSound("sysdisc-bg", "/sounds/sysdisc-ambient.mp3", true);
      soundManager.registerSound("sysdisc-click", "/sounds/click.mp3");
      soundManager.registerSound("sysdisc-solved", "/sounds/level-complete.mp3");
      soundManager.registerSound("sysdisc-ocean", "/sounds/sysdisc-ocean-ambient.mp3", true);
      soundManager.registerSound("sysdisc-space", "/sounds/sysdisc-space-ambient.mp3", true);
    }
  }, []);

  let initialScene: string = "SD_INTRO";
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const pack = params.get("pack");
    switch (pack) {
      case "breath":
        initialScene = "SD_BOD_BREATH_INTRO";
        break;
      case "fuel":
        initialScene = "SD_BOD_FUEL_INTRO";
        break;
      case "move":
        initialScene = "SD_BOD_MOVE_INTRO";
        break;
      case "signal":
        initialScene = "SD_BOD_SIGNAL_INTRO";
        break;
      case "grow":
        initialScene = "SD_BOD_GROW_INTRO";
        break;
      case "space":
        initialScene = "SD_SPACE_INTRO";
        break;
      case "ocean":
        initialScene = "SD_OCEAN_INTRO";
        break;
    }
  }
  const initial = {
    scene: initialScene,
    flags: {
      "bod.meter": 60,
      "bod.toggles.deeper": false,
    },
    inventory: [] as string[],
  };
  return <SceneController scenes={scenes} initial={initial} saveKey="sysdisc:save:v1" />;
}

export default SystemsDiscoveryGame;
