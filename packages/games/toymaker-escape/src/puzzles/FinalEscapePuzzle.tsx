"use client";
import React from "react";
import {
  createSequenceState,
  pressSeq as pressSequenceKey,
  type SequenceState,
} from "@games/pointclick-engine/puzzles/sequence";

export type FinalEscapePuzzleProps = {
  lang: "en" | "fr";
  finalEscape: SequenceState;
  setFinalEscape: React.Dispatch<React.SetStateAction<SequenceState>>;
  onSolved: () => void;
};

/**
 * E3 — Final Escape Sequence: turn dials in correct order (left, left, right).
 * After solving, the final lock opens and the game is won.
 */
export function FinalEscapePuzzle({
  lang,
  finalEscape,
  setFinalEscape,
  onSolved,
}: FinalEscapePuzzleProps) {
  return (
    <div className="mb-4 rounded-md border p-3" style={{
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    }}>
      <h3 className="mb-2 font-semibold text-blue-200">
        {lang === "fr" ? "Le Verrou final" : "The Final Lock"}
      </h3>
      <p className="mb-2 text-sm text-gray-300">
        {lang === "fr"
          ? "Tournez les molettes dans le bon ordre : gauche, gauche, droite. La voix du fabricant r\u00E9sonne doucement."
          : "Turn the dials in the correct sequence: left, left, right. The toymaker's voice resonates softly."}
      </p>
      <div className="flex gap-2 mb-3">
        <button
          className="bg-muted hover:bg-muted/80 min-h-[44px] min-w-[80px] rounded border border-blue-600 px-4 py-2 text-blue-200"
          onClick={() => {
            const next = pressSequenceKey(finalEscape, "left");
            setFinalEscape(next);
            if (next.solved) onSolved();
          }}
        >
          {lang === "fr" ? "Gauche" : "Turn Left"}
        </button>
        <button
          className="bg-muted hover:bg-muted/80 min-h-[44px] min-w-[80px] rounded border border-blue-600 px-4 py-2 text-blue-200"
          onClick={() => {
            const next = pressSequenceKey(finalEscape, "right");
            setFinalEscape(next);
            if (next.solved) onSolved();
          }}
        >
          {lang === "fr" ? "Droite" : "Turn Right"}
        </button>
      </div>
      <div className="text-sm text-gray-300 mb-3">
        {lang === "fr" ? "\u00C9tape : " : "Step: "}
        <span className="font-mono">
          [{finalEscape.input.map((t) => t === "left" ? (lang === "fr" ? "G" : "L") : (lang === "fr" ? "D" : "R")).join(", ") || "..."}]
        </span>
        <span className="ml-2 text-xs">{finalEscape.input.length} / {finalEscape.target.length}</span>
      </div>
      {finalEscape.solved && (
        <p className="mt-2 font-bold text-emerald-400">
          {lang === "fr"
            ? "Le verrou final s'ouvre. La porte s'ouvre sur la lumi\u00E8re du matin. Vous \u00EAtes libre."
            : "The final lock clicks open. The door swings wide to morning light. You're free."}
        </p>
      )}
      {finalEscape.mistakes > 0 && !finalEscape.solved && (
        <p className="text-amber-400 text-sm">
          {lang === "fr" ? `Erreurs : ${finalEscape.mistakes}` : `Mistakes: ${finalEscape.mistakes}`}
        </p>
      )}
    </div>
  );
}