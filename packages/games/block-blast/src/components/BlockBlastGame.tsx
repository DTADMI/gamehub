"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type PieceName = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

interface PieceDef {
  name: PieceName;
  shape: [number, number][];
  color: string;
}

const PIECES: Record<PieceName, PieceDef> = {
  I: { name: "I", shape: [[0,0],[0,1],[0,2],[0,3]], color: "#00d4d4" },
  J: { name: "J", shape: [[0,0],[1,0],[1,1],[1,2]], color: "#2563eb" },
  L: { name: "L", shape: [[0,2],[1,0],[1,1],[1,2]], color: "#ea580c" },
  O: { name: "O", shape: [[0,0],[0,1],[1,0],[1,1]], color: "#eab308" },
  S: { name: "S", shape: [[0,1],[0,2],[1,0],[1,1]], color: "#16a34a" },
  T: { name: "T", shape: [[0,1],[1,0],[1,1],[1,2]], color: "#9333ea" },
  Z: { name: "Z", shape: [[0,0],[0,1],[1,1],[1,2]], color: "#dc2626" },
};

const PIECE_NAMES: PieceName[] = ["I", "J", "L", "O", "S", "T", "Z"];
const GRID_SIZE = 8;
const HIGH_SCORE_KEY = "block-blast-high-score";

function randomPiece(): PieceDef {
  return PIECES[PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)]];
}

function generatePieces(count: number): PieceDef[] {
  return Array.from({ length: count }, () => randomPiece());
}

type Cell = string | null;

function createEmptyGrid(): Cell[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array<Cell>(GRID_SIZE).fill(null),
  );
}

function canPlace(
  grid: Cell[][],
  piece: PieceDef,
  anchorRow: number,
  anchorCol: number,
): boolean {
  for (const [r, c] of piece.shape) {
    const gr = anchorRow + r;
    const gc = anchorCol + c;
    if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
    if (grid[gr][gc] !== null) return false;
  }
  return true;
}

function placePiece(
  grid: Cell[][],
  piece: PieceDef,
  anchorRow: number,
  anchorCol: number,
): Cell[][] {
  const newGrid = grid.map((row) => [...row]);
  for (const [r, c] of piece.shape) {
    newGrid[anchorRow + r][anchorCol + c] = piece.color;
  }
  return newGrid;
}

function getClearedLines(grid: Cell[][]): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((cell) => cell !== null)) rows.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid.every((row) => row[c] !== null)) cols.push(c);
  }
  return { rows, cols };
}

function clearLines(
  grid: Cell[][],
  rows: number[],
  cols: number[],
): Cell[][] {
  const newGrid = grid.map((row) => [...row]);
  const colSet = new Set(cols);
  const rowSet = new Set(rows);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (rowSet.has(r) || colSet.has(c)) {
        newGrid[r][c] = null;
      }
    }
  }
  return newGrid;
}

function hasAnyValidPlacement(grid: Cell[][], pieces: PieceDef[]): boolean {
  for (const piece of pieces) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlace(grid, piece, r, c)) return true;
      }
    }
  }
  return false;
}

function PiecePreview({
  piece,
  selected,
  onClick,
}: {
  piece: PieceDef;
  selected: boolean;
  onClick: () => void;
}) {
  const maxR = Math.max(...piece.shape.map(([r]) => r));
  const maxC = Math.max(...piece.shape.map(([, c]) => c));
  const rows = maxR + 1;
  const cols = maxC + 1;
  const filled = Array.from({ length: rows }, () => Array(cols).fill(false));
  for (const [r, c] of piece.shape) {
    filled[r][c] = true;
  }

  return (
    <button
      onClick={onClick}
      className={`rounded-lg border-2 p-2.5 transition-all ${
        selected
          ? "border-yellow-400 bg-gray-700 scale-110 shadow-lg shadow-yellow-400/20"
          : "border-gray-600 bg-gray-800 hover:border-gray-400"
      }`}
      aria-label={`Select ${piece.name} piece`}
    >
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1.15rem)`,
          gridTemplateRows: `repeat(${rows}, 1.15rem)`,
        }}
      >
        {filled.map((row, r) =>
          row.map((isFilled, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: "1.15rem",
                height: "1.15rem",
                backgroundColor: isFilled ? piece.color : "transparent",
                borderRadius: isFilled ? "2px" : undefined,
                boxShadow: isFilled
                  ? "inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.3)"
                  : undefined,
              }}
            />
          )),
        )}
      </div>
    </button>
  );
}

export const BlockBlastGame: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid);
  const [pieces, setPieces] = useState<PieceDef[]>(() => generatePieces(3));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [justCleared, setJustCleared] = useState(false);
  const [comboCount, setComboCount] = useState(0);

  const selectedPiece = selectedIdx !== null ? pieces[selectedIdx] : null;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!Number.isNaN(val) && val > 0) setHighScore(val);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(score));
      } catch {
        /* localStorage unavailable */
      }
    }
  }, [score, highScore]);

  const newGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setPieces(generatePieces(3));
    setSelectedIdx(null);
    setHoverPos(null);
    setScore(0);
    setGameOver(false);
    setClearingCells(new Set());
    setClearing(false);
    setJustCleared(false);
    setComboCount(0);
  }, []);

  const selectPiece = useCallback(
    (idx: number) => {
      if (clearing) return;
      setSelectedIdx((prev) => (prev === idx ? null : idx));
    },
    [clearing],
  );

  const onCellClick = useCallback(
    (row: number, col: number) => {
      if (gameOver || clearing || selectedIdx === null || !selectedPiece)
        return;
      if (!canPlace(grid, selectedPiece, row, col)) return;

      const newGrid = placePiece(grid, selectedPiece, row, col);
      const { rows, cols } = getClearedLines(newGrid);
      const totalCleared = rows.length + cols.length;

      if (totalCleared > 0) {
        setClearing(true);
        const clearedCells = new Set<string>();
        const rowSet = new Set(rows);
        const colSet = new Set(cols);
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (rowSet.has(r) || colSet.has(c)) {
              clearedCells.add(`${r}-${c}`);
            }
          }
        }
        setClearingCells(clearedCells);
        setGrid(newGrid);

        setTimeout(() => {
          const clearedGrid = clearLines(
            newGrid,
            rows,
            cols,
          );
          setGrid(clearedGrid);
          setClearingCells(new Set());
          setClearing(false);

          const basePoints = totalCleared * 10;
          const comboBonus =
            totalCleared > 1 ? (totalCleared - 1) * 5 : 0;
          const newScore = score + basePoints + comboBonus;
          setScore(newScore);
          setComboCount(totalCleared);
          setJustCleared(true);
          setTimeout(() => setJustCleared(false), 1200);

          const newPieces = [...pieces];
          newPieces[selectedIdx] = randomPiece();
          setPieces(newPieces);
          setSelectedIdx(null);
          setHoverPos(null);

          if (!hasAnyValidPlacement(clearedGrid, newPieces)) {
            setGameOver(true);
          }
        }, 350);
      } else {
        setGrid(newGrid);
        setJustCleared(false);

        const newPieces = [...pieces];
        newPieces[selectedIdx] = randomPiece();
        setPieces(newPieces);
        setSelectedIdx(null);
        setHoverPos(null);

        if (!hasAnyValidPlacement(newGrid, newPieces)) {
          setGameOver(true);
        }
      }
    },
    [
      grid,
      pieces,
      selectedIdx,
      selectedPiece,
      score,
      gameOver,
      clearing,
    ],
  );

  const onCellHover = useCallback(
    (row: number, col: number) => {
      if (!selectedPiece || clearing) {
        setHoverPos(null);
        return;
      }
      setHoverPos({ r: row, c: col });
    },
    [selectedPiece, clearing],
  );

  const onCellLeave = useCallback(() => {
    setHoverPos(null);
  }, []);

  const previewCells = useMemo(() => {
    if (!selectedPiece || !hoverPos) return new Set<string>();
    const set = new Set<string>();
    for (const [r, c] of selectedPiece.shape) {
      const gr = hoverPos.r + r;
      const gc = hoverPos.c + c;
      if (gr >= 0 && gr < GRID_SIZE && gc >= 0 && gc < GRID_SIZE) {
        set.add(`${gr}-${gc}`);
      }
    }
    return set;
  }, [selectedPiece, hoverPos]);

  const validPreview = useMemo(() => {
    if (!selectedPiece || !hoverPos) return false;
    return canPlace(grid, selectedPiece, hoverPos.r, hoverPos.c);
  }, [grid, selectedPiece, hoverPos]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Score
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {score}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Best
          </div>
          <div className="text-2xl font-bold text-yellow-400 tabular-nums">
            {highScore}
          </div>
        </div>
      </div>

      {justCleared && comboCount > 0 && (
        <div className="text-sm font-bold text-yellow-400 animate-bounce">
          {comboCount > 1
            ? `${comboCount} lines cleared!`
            : "Line cleared!"}
        </div>
      )}

      <div className="relative">
        <div
          className="grid overflow-hidden rounded border-2 border-gray-600 bg-gray-900"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(2.4rem, 2.8rem))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(2.4rem, 2.8rem))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r}-${c}`;
              const isClearing = clearingCells.has(key);
              const isPreview = previewCells.has(key);

              let tileBg: string | undefined;
              if (isClearing) {
                tileBg = undefined;
              } else if (cell) {
                tileBg = cell;
              } else if (isPreview && validPreview) {
                tileBg = undefined;
              } else if (isPreview && !validPreview) {
                tileBg = undefined;
              } else {
                tileBg = undefined;
              }

              return (
                <div
                  key={key}
                  data-testid={`cell-${r}-${c}`}
                  onClick={() => onCellClick(r, c)}
                  onMouseEnter={() => onCellHover(r, c)}
                  onMouseLeave={onCellLeave}
                  className={`transition-all duration-100 ${
                    isClearing
                      ? "animate-pulse bg-white/90 scale-90 rounded-sm"
                      : cell
                        ? ""
                        : isPreview && validPreview
                          ? "bg-white/25"
                          : isPreview && !validPreview
                            ? "bg-red-500/30"
                            : "bg-gray-800"
                  }`}
                  style={{
                    backgroundColor: tileBg,
                    width: "100%",
                    aspectRatio: "1",
                    cursor: selectedPiece ? "pointer" : "default",
                    boxShadow:
                      cell && !isClearing
                        ? "inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 2px rgba(255,255,255,0.12), inset 0 -1px 2px rgba(0,0,0,0.35)"
                        : undefined,
                    borderRadius: cell && !isClearing ? "3px" : undefined,
                  }}
                />
              );
            }),
          )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded bg-black/75 backdrop-blur-sm">
            <div className="mb-1 text-3xl font-bold text-white">
              Game Over
            </div>
            <div className="mb-0.5 text-lg text-gray-300">
              Score: {score}
            </div>
            <div className="mb-3 text-sm text-yellow-400">
              Best: {highScore}
            </div>
            <button
              onClick={newGame}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          Pieces
        </span>
        {pieces.map((piece, idx) => (
          <PiecePreview
            key={idx}
            piece={piece}
            selected={selectedIdx === idx}
            onClick={() => selectPiece(idx)}
          />
        ))}
      </div>

      <button
        onClick={newGame}
        className="rounded bg-gray-700 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-600"
      >
        New Game
      </button>
    </div>
  );
};

export default React.memo(BlockBlastGame);
