"use client";
import { effects, type EngineCtx,ensureCtx } from "@games/pointclick-engine/engine";
import {
  createSequenceState,
  pressSeq as pressSequenceKey,
  type SequenceState,
} from "@games/pointclick-engine/puzzles/sequence";
import React from "react";

export type LocksPuzzleProps = {
  lang: "en" | "fr";
  ctx: EngineCtx;
  setCtx: React.Dispatch<React.SetStateAction<EngineCtx>>;
};

/**
 * E3 — Nature Locks: press symbols in the correct sequence
 * (water, sunlight, soil) to unlock a nature-themed door.
 */
export function LocksPuzzle({ lang, ctx, setCtx }: LocksPuzzleProps) {
  const [locksSeq, setLocksSeq] = React.useState<SequenceState>(() =>
    createSequenceState(["water", "sunlight", "soil"], { lives: 3 }),
  );

  const solved = locksSeq.solved || !!ctx.flags?.["locks.solved"];

  return (
    <div className="mb-4 rounded-md border p-3">
      <h3 className="mb-2 font-semibold text-green-200">
        {lang === "fr" ? "Serrures de la nature" : "Nature Locks"}
      </h3>
      <p className="mb-2 text-sm text-gray-300">
        {lang === "fr"
          ? "Appuyez sur les symboles dans le bon ordre pour ouvrir la serrure."
          : "Press the symbols in the correct order to unlock the door."}
      </p>
      <div className="flex gap-2 mb-3">
        {[
          { key: "water", label: lang === "fr" ? "\uD83D\uDCA7 Eau" : "\uD83D\uDCA7 Water" },
          { key: "sunlight", label: lang === "fr" ? "\u2600\uFE0F Soleil" : "\u2600\uFE0F Sunlight" },
          { key: "soil", label: lang === "fr" ? "\uD83C\uDF31 Sol" : "\uD83C\uDF31 Soil" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className="bg-muted hover:bg-muted/80 min-h-[44px] rounded border border-green-600 px-4 py-2 text-green-200"
            onClick={() => {
              const next = pressSequenceKey(locksSeq, key);
              setLocksSeq(next);
              if (next.solved) {
                setCtx((c) => effects.setFlag("locks.solved", true)(ensureCtx(c)));
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-300 mb-3">
        {lang === "fr" ? "\u00C9tape : " : "Step: "}
        <span className="font-mono">
          [{locksSeq.input.map((t) =>
            t === "water" ? (lang === "fr" ? "Eau" : "Water")
            : t === "sunlight" ? (lang === "fr" ? "Soleil" : "Sun")
            : (lang === "fr" ? "Sol" : "Soil")
          ).join(", ") || "..."}]
        </span>
        <span className="ml-2 text-xs">{locksSeq.input.length} / {locksSeq.target.length}</span>
      </div>
      {solved && (
        <p className="mt-2 font-bold text-emerald-400">
          {lang === "fr" ? "Les serrures s'ouvrent en cascade !" : "The locks click open in sequence!"}
        </p>
      )}
      {locksSeq.mistakes > 0 && !solved && (
        <p className="text-amber-400 text-sm">
          {lang === "fr" ? `Erreurs : ${locksSeq.mistakes}` : `Mistakes: ${locksSeq.mistakes}`}
        </p>
      )}
      <button
        className="mt-2 min-h-[32px] rounded border px-3 py-1 text-sm text-gray-300"
        onClick={() => setLocksSeq(createSequenceState(["water", "sunlight", "soil"], { lives: 3 }))}
      >
        {lang === "fr" ? "R\u00E9initialiser" : "Reset"}
      </button>
    </div>
  );
}