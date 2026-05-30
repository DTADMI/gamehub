"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PieceName = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
type PowerUpType = "bomb" | "rocket";
type Cell = string | null;

interface PieceDef {
  name: PieceName | PowerUpType;
  shape: [number, number][];
  color: string;
  powerUp?: PowerUpType;
}

interface HistoryEntry {
  grid: Cell[][];
  pieces: PieceDef[];
  score: number;
  comboCount: number;
  placedIdx: number;
  normalPieceCount: number;
  nextBombAt: number;
  nextRocketAt: number;
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
const MAX_HISTORY = 10;
const BOMB_INTERVAL = 5;
const ROCKET_INTERVAL = 8;

function createBombPiece(): PieceDef {
  return {
    name: "bomb",
    shape: [[0,1],[1,0],[1,1],[1,2],[2,1]],
    color: "#ff6ec7",
    powerUp: "bomb",
  };
}

function createRocketPiece(): PieceDef {
  const horizontal = Math.random() < 0.5;
  return {
    name: "rocket",
    shape: horizontal
      ? [[0,0],[0,1],[0,2],[0,3]]
      : [[0,0],[1,0],[2,0],[3,0]],
    color: "#ff8c00",
    powerUp: "rocket",
  };
}

function getComboMultiplier(count: number): number {
  if (count >= 8) return 5;
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 2) return 2;
  return 1;
}

function createEmptyGrid(): Cell[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array<Cell>(GRID_SIZE).fill(null),
  );
}

function randomPiece(): PieceDef {
  return PIECES[PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)]];
}

function generatePieces(count: number): PieceDef[] {
  return Array.from({ length: count }, () => randomPiece());
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

function getBombClearCells(
  anchorRow: number,
  anchorCol: number,
): [number, number][] {
  const cells: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const gr = anchorRow + dr;
      const gc = anchorCol + dc;
      if (gr >= 0 && gr < GRID_SIZE && gc >= 0 && gc < GRID_SIZE) {
        cells.push([gr, gc]);
      }
    }
  }
  return cells;
}

function clearBombArea(
  grid: Cell[][],
  anchorRow: number,
  anchorCol: number,
): Cell[][] {
  const newGrid = grid.map((row) => [...row]);
  const cells = getBombClearCells(anchorRow, anchorCol);
  for (const [r, c] of cells) {
    newGrid[r][c] = null;
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

function isPieceNormal(piece: PieceDef): boolean {
  return !piece.powerUp;
}

function getPieceLabel(piece: PieceDef): string {
  if (piece.powerUp === "bomb") return "Bomb";
  if (piece.powerUp === "rocket") return "Rocket";
  return piece.name;
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

  const isPowerUp = !!piece.powerUp;

  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg border-2 p-2.5 transition-all ${
        selected
          ? "border-yellow-400 bg-gray-700 scale-110 shadow-lg shadow-yellow-400/20"
          : isPowerUp
            ? "border-purple-500 bg-gray-800/70 hover:border-purple-400"
            : "border-gray-600 bg-gray-800 hover:border-gray-400"
      }`}
      aria-label={`Select ${getPieceLabel(piece)} piece`}
      style={isPowerUp ? {
        boxShadow: selected
          ? "0 0 20px rgba(168, 85, 247, 0.6)"
          : "0 0 12px rgba(168, 85, 247, 0.35)",
        animation: "powerup-pulse 2s ease-in-out infinite",
      } : undefined}
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
                  ? isPowerUp
                    ? "inset 0 0 6px rgba(255,255,255,0.4), 0 0 4px rgba(168,85,247,0.5)"
                    : "inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.3)"
                  : undefined,
                animation: isPowerUp && isFilled
                  ? "rainbow-hue 3s linear infinite"
                  : undefined,
              }}
            />
          )),
        )}
      </div>
      {isPowerUp && (
        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-purple-300">
          {piece.powerUp === "bomb" ? "Bomb" : "Rocket"}
        </div>
      )}
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
  const [clearedLinesCount, setClearedLinesCount] = useState(0);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [normalPieceCount, setNormalPieceCount] = useState(0);
  const [nextBombAt, setNextBombAt] = useState(BOMB_INTERVAL);
  const [nextRocketAt, setNextRocketAt] = useState(ROCKET_INTERVAL);
  const [scoreAnimValue, setScoreAnimValue] = useState(0);
  const [scoreAnimVisible, setScoreAnimVisible] = useState(false);
  const [comboAnim, setComboAnim] = useState<"none" | "up" | "reset">("none");

  const clearingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justClearedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const clearTimeouts = useCallback(() => {
    if (clearingTimeoutRef.current) {
      clearTimeout(clearingTimeoutRef.current);
      clearingTimeoutRef.current = null;
    }
    if (justClearedTimeoutRef.current) {
      clearTimeout(justClearedTimeoutRef.current);
      justClearedTimeoutRef.current = null;
    }
    if (scoreAnimTimeoutRef.current) {
      clearTimeout(scoreAnimTimeoutRef.current);
      scoreAnimTimeoutRef.current = null;
    }
    if (comboAnimTimeoutRef.current) {
      clearTimeout(comboAnimTimeoutRef.current);
      comboAnimTimeoutRef.current = null;
    }
  }, []);

  const newGame = useCallback(() => {
    clearTimeouts();
    setGrid(createEmptyGrid());
    setPieces(generatePieces(3));
    setSelectedIdx(null);
    setHoverPos(null);
    setScore(0);
    setGameOver(false);
    setClearingCells(new Set());
    setClearing(false);
    setJustCleared(false);
    setClearedLinesCount(0);
    setHistory([]);
    setComboCount(0);
    setNormalPieceCount(0);
    setNextBombAt(BOMB_INTERVAL);
    setNextRocketAt(ROCKET_INTERVAL);
    setScoreAnimVisible(false);
    setScoreAnimValue(0);
    setComboAnim("none");
  }, [clearTimeouts]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || clearing || gameOver) return;
    clearTimeouts();
    const entry = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setGrid(entry.grid.map((r) => [...r]));
    setPieces(entry.pieces.map((p) => ({ ...p, shape: [...p.shape] as [number, number][] })));
    setScore(entry.score);
    setComboCount(entry.comboCount);
    setNormalPieceCount(entry.normalPieceCount);
    setNextBombAt(entry.nextBombAt);
    setNextRocketAt(entry.nextRocketAt);
    setSelectedIdx(null);
    setHoverPos(null);
    setClearingCells(new Set());
    setClearing(false);
    setJustCleared(false);
    setClearedLinesCount(0);
    setScoreAnimVisible(false);
  }, [history, clearing, gameOver, clearTimeouts]);

  const handleUndoRef = useRef(handleUndo);
  handleUndoRef.current = handleUndo;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleUndoRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const selectPiece = useCallback(
    (idx: number) => {
      if (clearing || gameOver) return;
      setSelectedIdx((prev) => (prev === idx ? null : idx));
    },
    [clearing, gameOver],
  );

  const showScoreAnimation = useCallback((value: number) => {
    setScoreAnimValue(value);
    setScoreAnimVisible(true);
    if (scoreAnimTimeoutRef.current) clearTimeout(scoreAnimTimeoutRef.current);
    scoreAnimTimeoutRef.current = setTimeout(() => {
      setScoreAnimVisible(false);
    }, 1000);
  }, []);

  const onCellClick = useCallback(
    (row: number, col: number) => {
      if (gameOver || clearing || selectedIdx === null || !selectedPiece) return;
      if (!canPlace(grid, selectedPiece, row, col)) return;

      const histEntry: HistoryEntry = {
        grid: grid.map((r) => [...r]),
        pieces: pieces.map((p) => ({ ...p, shape: [...p.shape] as [number, number][] })),
        score,
        comboCount,
        placedIdx: selectedIdx,
        normalPieceCount,
        nextBombAt,
        nextRocketAt,
      };

      const newGrid = placePiece(grid, selectedPiece, row, col);
      const isBomb = selectedPiece.powerUp === "bomb";
      const isRocket = selectedPiece.powerUp === "rocket";

      let clearingCellSet = new Set<string>();
      let linesToClear: { rows: number[]; cols: number[] } = { rows: [], cols: [] };
      let totalCleared = 0;

      if (isBomb) {
        const bombCells = getBombClearCells(row, col);
        for (const [r, c] of bombCells) {
          clearingCellSet.add(`${r}-${c}`);
        }
        totalCleared = bombCells.length;
      } else if (isRocket) {
        const dr = selectedPiece.shape[selectedPiece.shape.length - 1][0] - selectedPiece.shape[0][0];
        const dc = selectedPiece.shape[selectedPiece.shape.length - 1][1] - selectedPiece.shape[0][1];
        if (dc > dr) {
          const r = row + selectedPiece.shape[0][0];
          for (let c = 0; c < GRID_SIZE; c++) {
            clearingCellSet.add(`${r}-${c}`);
          }
          linesToClear = { rows: [r], cols: [] };
          totalCleared = 1;
        } else {
          const c = col + selectedPiece.shape[0][1];
          for (let r = 0; r < GRID_SIZE; r++) {
            clearingCellSet.add(`${r}-${c}`);
          }
          linesToClear = { rows: [], cols: [c] };
          totalCleared = 1;
        }
      } else {
        const cleared = getClearedLines(newGrid);
        linesToClear = cleared;
        totalCleared = cleared.rows.length + cleared.cols.length;
        if (totalCleared > 0) {
          const rowSet = new Set(cleared.rows);
          const colSet = new Set(cleared.cols);
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              if (rowSet.has(r) || colSet.has(c)) {
                clearingCellSet.add(`${r}-${c}`);
              }
            }
          }
        }
      }

      if (totalCleared > 0) {
        setClearing(true);
        setClearingCells(clearingCellSet);
        setGrid(newGrid);

        clearingTimeoutRef.current = setTimeout(() => {
          let clearedGrid: Cell[][];
          if (isBomb) {
            clearedGrid = clearBombArea(newGrid, row, col);
          } else {
            clearedGrid = clearLines(newGrid, linesToClear.rows, linesToClear.cols);
          }

          setGrid(clearedGrid);
          setClearingCells(new Set());
          setClearing(false);

          const newComboCount = comboCount + 1;
          const multiplier = getComboMultiplier(newComboCount);
          const basePoints = totalCleared * 10;
          const extraBonus = totalCleared > 1 ? (totalCleared - 1) * 5 : 0;
          const gainedPoints = (basePoints + extraBonus) * multiplier;
          const newScore = score + gainedPoints;
          setScore(newScore);
          setComboCount(newComboCount);

          setClearedLinesCount(totalCleared);
          setJustCleared(true);
          justClearedTimeoutRef.current = setTimeout(() => setJustCleared(false), 1200);

          setComboAnim("up");
          if (comboAnimTimeoutRef.current) clearTimeout(comboAnimTimeoutRef.current);
          comboAnimTimeoutRef.current = setTimeout(() => setComboAnim("none"), 600);

          showScoreAnimation(gainedPoints);

          const wasNormal = isPieceNormal(selectedPiece);
          let replacement: PieceDef;
          if (wasNormal) {
            const newNormalCount = normalPieceCount + 1;
            setNormalPieceCount(newNormalCount);
            if (newNormalCount >= nextBombAt) {
              replacement = createBombPiece();
              setNextBombAt((prev) => prev + BOMB_INTERVAL);
            } else if (newNormalCount >= nextRocketAt) {
              replacement = createRocketPiece();
              setNextRocketAt((prev) => prev + ROCKET_INTERVAL);
            } else {
              replacement = randomPiece();
            }
          } else {
            if (normalPieceCount >= nextBombAt) {
              replacement = createBombPiece();
              setNextBombAt((prev) => prev + BOMB_INTERVAL);
            } else if (normalPieceCount >= nextRocketAt) {
              replacement = createRocketPiece();
              setNextRocketAt((prev) => prev + ROCKET_INTERVAL);
            } else {
              replacement = randomPiece();
            }
          }

          const newPieces = [...pieces];
          newPieces[selectedIdx] = replacement;
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
        setComboCount(0);
        setClearedLinesCount(0);

        setComboAnim("reset");
        if (comboAnimTimeoutRef.current) clearTimeout(comboAnimTimeoutRef.current);
        comboAnimTimeoutRef.current = setTimeout(() => setComboAnim("none"), 600);

        const wasNormal = isPieceNormal(selectedPiece);
        let replacement: PieceDef;
        if (wasNormal) {
          const newNormalCount = normalPieceCount + 1;
          setNormalPieceCount(newNormalCount);
          if (newNormalCount >= nextBombAt) {
            replacement = createBombPiece();
            setNextBombAt((prev) => prev + BOMB_INTERVAL);
          } else if (newNormalCount >= nextRocketAt) {
            replacement = createRocketPiece();
            setNextRocketAt((prev) => prev + ROCKET_INTERVAL);
          } else {
            replacement = randomPiece();
          }
        } else {
          if (normalPieceCount >= nextBombAt) {
            replacement = createBombPiece();
            setNextBombAt((prev) => prev + BOMB_INTERVAL);
          } else if (normalPieceCount >= nextRocketAt) {
            replacement = createRocketPiece();
            setNextRocketAt((prev) => prev + ROCKET_INTERVAL);
          } else {
            replacement = randomPiece();
          }
        }

        const newPieces = [...pieces];
        newPieces[selectedIdx] = replacement;
        setPieces(newPieces);
        setSelectedIdx(null);
        setHoverPos(null);

        if (!hasAnyValidPlacement(newGrid, newPieces)) {
          setGameOver(true);
        }
      }

      setHistory((h) => {
        const updated = [...h, histEntry];
        return updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated;
      });
    },
    [
      grid, pieces, selectedIdx, selectedPiece, score, comboCount,
      gameOver, clearing, normalPieceCount, nextBombAt, nextRocketAt,
      showScoreAnimation,
    ],
  );

  const onCellHover = useCallback(
    (row: number, col: number) => {
      if (!selectedPiece || clearing || gameOver) {
        setHoverPos(null);
        return;
      }
      setHoverPos({ r: row, c: col });
    },
    [selectedPiece, clearing, gameOver],
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

  const canUndo = history.length > 0 && !clearing && !gameOver;
  const comboMultiplier = getComboMultiplier(comboCount);
  const bombCount = pieces.filter((p) => p.powerUp === "bomb").length;
  const rocketCount = pieces.filter((p) => p.powerUp === "rocket").length;

  return (
    <div className="flex flex-col items-center gap-3 select-none" style={{ touchAction: "manipulation" }}>
      <style>{`
        @keyframes rainbow-hue {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes powerup-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 20px rgba(168,85,247,0.7); }
        }
        @keyframes combo-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes combo-fade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.7); }
        }
        @keyframes score-float {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(1.2); }
        }
      `}</style>

      <div className="flex gap-6 text-center items-start">
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
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Combo
          </div>
          <div
            className="text-2xl font-bold tabular-nums"
            style={{
              color: comboMultiplier >= 3 ? "#f59e0b" : comboMultiplier >= 2 ? "#a78bfa" : "#9ca3af",
              animation: comboAnim === "up" ? "combo-pop 0.4s ease-out" : comboAnim === "reset" ? "combo-fade 0.5s ease-out forwards" : undefined,
            }}
          >
            {comboCount > 0 ? `${comboMultiplier}x` : "-"}
          </div>
          {comboCount > 0 && (
            <div className="text-[10px] text-gray-500 tabular-nums">
              {comboCount} streak
            </div>
          )}
        </div>
      </div>

      {justCleared && clearedLinesCount > 0 && (
        <div className="text-sm font-bold text-yellow-400 animate-bounce">
          {clearedLinesCount > 1
            ? `${clearedLinesCount} lines cleared!`
            : "Line cleared!"}
        </div>
      )}

      <div className="relative">
        {scoreAnimVisible && (
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-lg font-bold text-green-400 pointer-events-none"
            style={{ animation: "score-float 1s ease-out forwards" }}
          >
            +{scoreAnimValue}
          </div>
        )}

        <div
          className="grid overflow-hidden rounded border-2 border-gray-600 bg-gray-900"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(2.6rem, 3rem))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(2.6rem, 3rem))`,
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
                  onTouchStart={() => {
                    onCellHover(r, c);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onCellClick(r, c);
                  }}
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

      <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3">
        <span className="text-xs uppercase tracking-wider text-gray-400 mr-1">
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

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
              canUndo
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            }`}
            aria-label="Undo last placement"
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>

          <button
            onClick={newGame}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-600"
          >
            New Game
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {bombCount > 0 && (
            <span className="flex items-center gap-1 rounded bg-purple-900/50 px-2 py-0.5 text-purple-300"
              title="Bomb pieces available"
            >
              <span
                className="inline-block w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: "#ff6ec7",
                  animation: "rainbow-hue 3s linear infinite",
                }}
              />
              Bomb x{bombCount}
            </span>
          )}
          {rocketCount > 0 && (
            <span className="flex items-center gap-1 rounded bg-orange-900/50 px-2 py-0.5 text-orange-300"
              title="Rocket pieces available"
            >
              <span
                className="inline-block w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: "#ff8c00",
                  animation: "rainbow-hue 3s linear infinite",
                }}
              />
              Rocket x{rocketCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BlockBlastGame);
