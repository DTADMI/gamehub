"use client";
import HomeostasisMeter from "@gamehub/game-platform/components/sysdisc/HomeostasisMeter";
import { t } from "@gamehub/game-platform/lib/i18n";
import { Scene, SceneController } from "@games/pointclick-engine";
import {
  createPipesState,
  evaluatePipes,
  type PipesState,
  setTileRotation,
  toggleValve,
} from "@games/pointclick-engine/puzzles/pipes";
import React, { useState } from "react";

const BreathPuzzle: React.FC<{ onSolved: () => void }> = ({ onSolved }) => {
  const [state, setState] = useState<PipesState>(() =>
    createPipesState(3, 1, [
      { type: "straight", rotation: 0, source: true },
      { type: "valve", rotation: 0, open: false },
      { type: "straight", rotation: 0, sink: true },
    ]),
  );

  const rotate = (x: number, y: number) => {
    const nextRotation = ((state.grid[y * state.width + x].rotation + 90) % 360) as
      | 0
      | 90
      | 180
      | 270;
    const next = evaluatePipes(setTileRotation(state, x, y, nextRotation));
    setState(next);
    if (next.solved) {
      onSolved();
    }
  };

  const toggle = (x: number, y: number) => {
    const next = evaluatePipes(toggleValve(state, x, y, !state.grid[y * state.width + x].open));
    setState(next);
    if (next.solved) {
      onSolved();
    }
  };

  return (
    <div className="mb-4 rounded-lg bg-blue-50 p-4">
      <p className="mb-2 text-sm font-medium text-blue-800">Oxygen Flow Simulation</p>
      <div className="flex items-center justify-center gap-4">
        <button
          className="flex h-16 w-16 items-center justify-center rounded border-2 border-blue-300 bg-white"
          onClick={() => rotate(0, 0)}
        >
          {state.grid[0].rotation * 90}°
        </button>
        <button
          className={`flex h-16 w-16 items-center justify-center rounded border-2 border-blue-300 ${state.grid[1].open ? "bg-blue-200" : "bg-white"}`}
          onClick={() => toggle(1, 0)}
        >
          {state.grid[1].open ? "OPEN" : "CLOSED"}
        </button>
        <button
          className="flex h-16 w-16 items-center justify-center rounded border-2 border-blue-300 bg-white"
          onClick={() => rotate(2, 0)}
        >
          {state.grid[2].rotation * 90}°
        </button>
      </div>
      {state.solved && (
        <p className="mt-2 text-center font-bold text-green-600">Oxygen Flow Restored!</p>
      )}
    </div>
  );
};

const NUTRIENT_TARGETS: Record<string, string> = {
  pasta: "glucose",
  chicken: "protein",
  avocado: "fats",
};

const FuelMatchingPuzzle: React.FC<{ onSolved: () => void }> = ({ onSolved }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});

  const foods = ["pasta", "chicken", "avocado"];
  const nutrients = ["glucose", "protein", "fats"];

  const handleFoodClick = (food: string) => {
    if (matched[food]) return;
    setSelected(food);
  };

  const handleNutrientClick = (nutrient: string) => {
    if (!selected || matched[selected]) return;
    if (NUTRIENT_TARGETS[selected] === nutrient) {
      const next = { ...matched, [selected]: nutrient };
      setMatched(next);
      setSelected(null);
      if (Object.keys(next).length === foods.length) {
        onSolved();
      }
    } else {
      setSelected(null);
    }
  };

  const foodKeys = Object.keys(NUTRIENT_TARGETS);

  return (
    <div className="mb-4 rounded-lg bg-amber-50 p-4">
      <p className="mb-2 text-sm font-medium text-amber-800">{t("sysdisc.bod.fuel.bf1.prompt")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-amber-700">{t("sysdisc.bod.fuel.bf1.title")} — Foods</p>
          <div className="flex flex-col gap-2">
            {foods.map((food) => (
              <button
                key={food}
                className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${
                  matched[food]
                    ? "border-green-400 bg-green-100"
                    : selected === food
                      ? "border-amber-500 bg-amber-100"
                      : "border-amber-200 bg-white"
                }`}
                onClick={() => handleFoodClick(food)}
                disabled={!!matched[food]}
              >
                {t(`sysdisc.bod.fuel.bf1.foods.${food}`)}
                {matched[food] && (
                  <span className="ml-2 text-green-600">→ {t(`sysdisc.bod.fuel.bf1.nutrients.${matched[food]}`)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-amber-700">Nutrients</p>
          <div className="flex flex-col gap-2">
            {nutrients.map((nutrient) => (
              <button
                key={nutrient}
                className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${
                  Object.values(matched).includes(nutrient)
                    ? "border-green-400 bg-green-100"
                    : "border-amber-200 bg-white"
                }`}
                onClick={() => handleNutrientClick(nutrient)}
                disabled={Object.values(matched).includes(nutrient)}
              >
                {t(`sysdisc.bod.fuel.bf1.nutrients.${nutrient}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {Object.keys(matched).length === foodKeys.length && (
        <p className="mt-2 text-center font-bold text-green-600">{t("sysdisc.bod.fuel.bf1.solved")}</p>
      )}
    </div>
  );
};

const OrbitsPuzzle: React.FC<{ onSolved: () => void; gentle?: boolean }> = ({ onSolved, gentle }) => {
  const [orbits, setOrbits] = React.useState<PipesState>(() =>
    createPipesState(5, 1, [
      { type: "straight", rotation: 0, source: true },
      { type: "valve", rotation: 0, open: false },
      { type: "straight", rotation: 0 },
      { type: "valve", rotation: 0, open: false },
      { type: "straight", rotation: 0, sink: true },
    ]),
  );

  const rotateTile = (x: number) => {
    const nextRotation = ((orbits.grid[x].rotation + 90) % 360) as 0 | 90 | 180 | 270;
    const next = evaluatePipes(setTileRotation(orbits, x, 0, nextRotation));
    setOrbits(next);
    if (next.solved) onSolved();
  };
  const toggleValveTile = (x: number) => {
    const tile = orbits.grid[x];
    if (tile.type !== "valve") return;
    const next = evaluatePipes(toggleValve(orbits, x, 0, !tile.open));
    setOrbits(next);
    if (next.solved) onSolved();
  };
  const bodyLabels = [t("sysdisc.space.s1.bodies.sun"), t("sysdisc.space.s1.bodies.mercury"), t("sysdisc.space.s1.bodies.venus"), t("sysdisc.space.s1.bodies.earth"), t("sysdisc.space.s1.bodies.mars")];
  const bodyIcons = ["\u2600\uFE0F", "\uD83E\uDE90", "\uD83C\uDF10", "\uD83C\uDF0D", "\uD83D\uDD34"];

  return (
    <div className="mb-4 rounded-lg bg-slate-900 p-4">
      <p className="mb-2 text-sm font-medium text-yellow-300">{t("sysdisc.space.s1.prompt")}</p>
      {gentle && (
        <p className="mb-2 text-sm text-gray-400">{t("sysdisc.space.s1.hint")}</p>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {orbits.grid.map((tile, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-300">{bodyLabels[i]}</span>
            <span className="text-lg">{bodyIcons[i]}</span>
            <div className="flex gap-1">
              <button
                className="min-h-[36px] min-w-[36px] rounded border border-gray-600 bg-slate-800 text-xs text-white"
                onClick={() => rotateTile(i)}
                aria-label={`Rotate ${bodyLabels[i]} tile`}
              >
                {t("sysdisc.space.s1.rotate")}
              </button>
              {tile.type === "valve" && (
                <button
                  className={`min-h-[36px] min-w-[36px] rounded border text-xs text-white ${tile.open ? "bg-emerald-600 border-emerald-400" : "bg-red-700 border-red-400"}`}
                  onClick={() => toggleValveTile(i)}
                >
                  {tile.open ? "ON" : "OFF"}
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">{tile.rotation * 90}°</span>
          </div>
        ))}
      </div>
      {orbits.solved && (
        <p className="mb-2 text-center font-bold text-green-400">
          {t("sysdisc.space.s1.solved")}
        </p>
      )}
      {orbits.errors && orbits.errors.length > 0 && (
        <ul className="mb-2 list-disc pl-5 text-sm text-amber-400">
          {orbits.errors.map((e, i2) => (
            <li key={i2}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
      const SHADOW_TARGETS: Record<string, string> = {
        mercury: "small",
        earth: "medium",
        jupiter: "large",
      };
      const planets = ["mercury", "earth", "jupiter"];
      const shadows = ["small", "medium", "large"];
      const shadowIcons: Record<string, string> = { small: "●", medium: "◉", large: "⊙" };
      const allDone = Object.keys(matched).length === planets.length &&
        planets.every((p) => matched[p] === SHADOW_TARGETS[p]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.space.s2.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">
            {t("sysdisc.space.s2.hint")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">{t("sysdisc.space.s2.planets")}</p>
              <div className="flex flex-col gap-2">
                {planets.map((p) => (
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
                    {t(`sysdisc.space.s2.planetLabels.${p}`)}
                    {matched[p] && (
                      <span className="ml-2 text-green-600">→ {shadowIcons[matched[p]]} {t(`sysdisc.space.s2.shadowLabels.${matched[p]}`)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">{t("sysdisc.space.s2.shadows")}</p>
              <div className="flex flex-col gap-2">
                {shadows.map((s) => (
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
                          Object.keys(next).length === planets.length &&
                          planets.every((p2) => next[p2] === SHADOW_TARGETS[p2])
                        ) {
                          setFlag("space.s2.solved", true);
                        }
                      }
                    }}
                  >
                    {shadowIcons[s]} {t(`sysdisc.space.s2.shadowLabels.${s}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm">
            {t("sysdisc.space.s2.matched")}: {Object.keys(matched).length} / {planets.length}
          </div>
          {(solved || allDone) && (
            <p className="mt-2 font-bold text-emerald-600">
              {t("sysdisc.space.s2.solved")}
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
      const HABITABLE_TARGETS: Record<string, string> = {
        earth: "habitable",
        mars: "habitable",
        jupiter: "notHabitable",
        venus: "notHabitable",
      };
      const planets = ["earth", "mars", "jupiter", "venus"];
      const allDone = Object.keys(sorted).length === planets.length &&
        planets.every((p) => sorted[p] === HABITABLE_TARGETS[p]);
      return (
        <div>
          <p className="mb-2">{t("sysdisc.space.s3.prompt")}</p>
          <p className="mb-2 text-xs opacity-60">{t("sysdisc.space.s3.hint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium opacity-70">{t("sysdisc.space.s3.planets")}</p>
              <div className="flex flex-col gap-2">
                {planets.map((p) => (
                  <div
                    key={p}
                    className={`min-h-[44px] rounded border-2 px-4 py-2 flex items-center justify-between ${
                      sorted[p]
                        ? "border-green-400 bg-green-100"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <span>{t(`sysdisc.space.s3.planetLabels.${p}`)}</span>
                    {!sorted[p] && (
                      <div className="flex gap-1">
                        <button
                          className="min-h-[32px] rounded bg-emerald-500 px-3 py-1 text-xs text-white"
                          onClick={() => {
                            const next = { ...sorted, [p]: "habitable" };
                            setSorted(next);
                            if (
                              Object.keys(next).length === planets.length &&
                              planets.every((p2) => next[p2] === HABITABLE_TARGETS[p2])
                            ) {
                              setFlag("space.s3.solved", true);
                            }
                          }}
                        >
                          {t("sysdisc.space.s3.habitable")}
                        </button>
                        <button
                          className="min-h-[32px] rounded bg-red-500 px-3 py-1 text-xs text-white"
                          onClick={() => {
                            const next = { ...sorted, [p]: "notHabitable" };
                            setSorted(next);
                            if (
                              Object.keys(next).length === planets.length &&
                              planets.every((p2) => next[p2] === HABITABLE_TARGETS[p2])
                            ) {
                              setFlag("space.s3.solved", true);
                            }
                          }}
                        >
                          {t("sysdisc.space.s3.notHabitable")}
                        </button>
                      </div>
                    )}
                    {sorted[p] && (
                      <span className={`text-xs font-bold ${sorted[p] === "habitable" ? "text-emerald-600" : "text-red-600"}`}>
                        {t(`sysdisc.space.s3.${sorted[p]}Short`)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="mb-2 text-xs font-medium opacity-70">{t("sysdisc.space.s3.status")}</p>
              <div className="text-sm opacity-70">
                {planets.filter((p) => sorted[p] === "habitable").length > 0 && (
                  <p className="mb-2 text-emerald-600">
                    {t("sysdisc.space.s3.habitableLabel")}: {planets.filter((p) => sorted[p] === "habitable").map((p) => t(`sysdisc.space.s3.planetLabels.${p}`)).join(", ")}
                  </p>
                )}
                {planets.filter((p) => sorted[p] === "notHabitable").length > 0 && (
                  <p className="text-red-600">
                    {t("sysdisc.space.s3.notHabitableLabel")}: {planets.filter((p) => sorted[p] === "notHabitable").map((p) => t(`sysdisc.space.s3.planetLabels.${p}`)).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
          {(solved || allDone) && (
            <p className="mt-2 font-bold text-emerald-600">
              {t("sysdisc.space.s3.solved")}
            </p>
          )}
          <div className="mt-2">
            <button
              className="min-h-[32px] rounded border px-2 py-1 text-sm"
              onClick={() => setSorted({})}
            >
              {t("sysdisc.space.s3.reset")}
            </button>
          </div>
          <div className="mt-3">
            <button
              className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2 disabled:opacity-50"
              disabled={!solved && !allDone}
              onClick={() => go("SPACE_WRAP")}
            >
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
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.signal.bsd1.prompt")}</p>
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
              onClick={() => go("BSD2")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
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
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.signal.bsd2.prompt")}</p>
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
              onClick={() => go("BSD3")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
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
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.signal.bsd3.prompt")}</p>
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
              onClick={() => go("BOD_SIGNAL_WRAP")}
            >
              {t("sysdisc.bod.common.reveal")}
            </button>
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
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.grow.bg1.prompt")}</p>
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
              onClick={() => go("BG2")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
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
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.grow.bg2.prompt")}</p>
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
              onClick={() => go("BG3")}
            >
              {t("sysdisc.bod.common.continue")}
            </button>
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
      return (
        <div>
          <p className="mb-2">{t("sysdisc.bod.grow.bg3.prompt")}</p>
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
              onClick={() => go("BOD_GROW_WRAP")}
            >
              {t("sysdisc.bod.common.reveal")}
            </button>
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
];

export function SystemsDiscoveryGame() {
  // Extend initial save model with BOD defaults; existing saves remain compatible
  // Support deep-links from catalog: /games/systems-discovery?pack=<sub>
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
