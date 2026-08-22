"use client";
import React from "react";
import { MatchingPuzzle, type MatchPair } from "@games/pointclick-engine";
import { effects, ensureCtx, type EngineCtx } from "@games/pointclick-engine/engine";

export type FilingLogicPuzzleProps = {
  lang: "en" | "fr";
  ctx: EngineCtx;
  setCtx: React.Dispatch<React.SetStateAction<EngineCtx>>;
};

const FILING_TARGETS: Record<string, string> = {
  doll: "a",
  car: "b",
  puzzle: "c",
};

const filingPairs: MatchPair[] = [
  { left: "doll", right: "a", leftLabel: "Porcelain Doll", rightLabel: "Cabinet A (Dolls)" },
  { left: "car", right: "b", leftLabel: "Wind-up Car", rightLabel: "Cabinet B (Vehicles)" },
  { left: "puzzle", right: "c", leftLabel: "Jigsaw Puzzle", rightLabel: "Cabinet C (Puzzles)" },
];

/**
 * E2 — Filing Logic: sort toys into the correct filing cabinets (A/B/C).
 * Uses the shared MatchingPuzzle component.
 */
export function FilingLogicPuzzle({ lang, ctx, setCtx }: FilingLogicPuzzleProps) {
  const filingSolved = !!ctx.flags?.["filing.solved"];

  return (
    <div className="mb-4 rounded-md border p-3">
      <h3 className="mb-2 font-semibold">
        {lang === "fr" ? "Logique de classement" : "Filing Logic"}
      </h3>
      <p className="mb-2 text-sm">
        {lang === "fr"
          ? "Classez chaque jouet dans le bon classeur selon les indices."
          : "Sort each toy into the correct cabinet based on the clues."}
      </p>
      <p className="mb-2 text-xs opacity-60">
        {lang === "fr"
          ? "Les poup\u00E9es vont dans le classeur A, les voitures dans B, les puzzles dans C."
          : "Dolls go to Cabinet A, cars to Cabinet B, puzzles to Cabinet C."}
      </p>

      <MatchingPuzzle
        pairs={filingPairs}
        onSolved={() => {
          setCtx((c) => effects.setFlag("filing.solved", true)(ensureCtx(c)));
        }}
        leftTitle={lang === "fr" ? "Jouets \u00E0 classer" : "Toys to sort"}
        rightTitle={lang === "fr" ? "Classeurs" : "Cabinets"}
        solvedMessage={
          lang === "fr"
            ? "Tous les jouets sont bien class\u00E9s ! La cl\u00E9 du classeur tourne."
            : "All toys sorted correctly! The filing-cabinet key turns."
        }
        resetLabel={lang === "fr" ? "R\u00E9initialiser" : "Reset"}
      />

      {filingSolved && (
        <p className="mt-2 font-bold text-emerald-600">
          {lang === "fr"
            ? "Tous les jouets sont bien class\u00E9s ! La cl\u00E9 du classeur tourne."
            : "All toys sorted correctly! The filing-cabinet key turns."}
        </p>
      )}
    </div>
  );
}