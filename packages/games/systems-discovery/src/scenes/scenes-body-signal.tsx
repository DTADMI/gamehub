/* eslint-disable react-hooks/rules-of-hooks */
// Auto-generated scene group — extracted from index.tsx monolith
// See scripts/split-systems-discovery.mjs
import type { Scene } from "@games/pointclick-engine";
import React from "react";

import { t } from "@/lib/i18n";

import type { PipesState, SequenceState } from "./_imports";
import { createPipesState, createSequenceState, evaluatePipes, HomeostasisMeter, pressSequenceKey, setTileRotation, toggleValve } from "./_imports";
export function buildBodySignalScenes(): Scene[] {
  return [
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
  // --- Grow sub-pack ---,
  ];
}