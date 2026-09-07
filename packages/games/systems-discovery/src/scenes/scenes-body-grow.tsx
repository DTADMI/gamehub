/* eslint-disable react-hooks/rules-of-hooks */
// Auto-generated scene group — extracted from index.tsx monolith
// See scripts/split-systems-discovery.mjs
import type { Scene } from "@games/pointclick-engine";
import React from "react";

import { t } from "@/lib/i18n";

import type { SequenceState } from "./_imports";
import { createSequenceState, HomeostasisMeter, pressSequenceKey } from "./_imports";
export function buildBodyGrowScenes(): Scene[] {
  return [
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
  // --- Ocean Pack ---,
  ];
}