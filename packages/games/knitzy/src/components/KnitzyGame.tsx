"use client";

import { soundManager } from "@gamehub/game-platform";
import React, { useCallback, useEffect, useRef, useState } from "react";

const GRID_CONFIGS = [
  { label: "4x4", cols: 4, rows: 4, colors: 3 },
  { label: "6x6", cols: 6, rows: 6, colors: 3 },
  { label: "8x6", cols: 8, rows: 6, colors: 4 },
  { label: "12x12", cols: 12, rows: 12, colors: 4 },
  { label: "16x16", cols: 16, rows: 16, colors: 5 },
] as const;

const BASE_CELL = 32;
const MIN_CELL = 14;
const GAP = 20;
const HUD_H = 80;

const PALETTES: Record<number, string[]> = {
  3: ["#ef4444", "#22c55e", "#3b82f6"],
  4: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"],
  5: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"],
};

const CB_PALETTES: Record<number, string[]> = {
  3: ["#e66101", "#5e3c99", "#fdb863"],
  4: ["#e66101", "#5e3c99", "#fdb863", "#b2abd2"],
  5: ["#e66101", "#5e3c99", "#fdb863", "#b2abd2", "#018571"],
};

const SYMBOLS = ["\u2605", "\u25B2", "\u25C6", "\u25CF", "\u25A0"];

const LS_DIFFICULTY = "knitzy:difficultyIdx";
const LS_COLORBLIND = "knitzy:colorblind";
const LS_BEST_PREFIX = "knitzy:bestMs:";
const LS_UNLOCKED = "knitzy:unlocked";

type Grid = number[][];
type GridConfig = (typeof GRID_CONFIGS)[number];

function makeTarget(conf: GridConfig, colorCount: number): Grid {
  const { cols, rows } = conf;
  const g: Grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < Math.ceil(cols / 2); x++) {
      g[y][x] = Math.floor(Math.random() * colorCount);
      g[y][cols - 1 - x] = g[y][x];
    }
  }
  return g;
}

function emptyGrid(conf: GridConfig): Grid {
  return Array.from({ length: conf.rows }, () => Array(conf.cols).fill(-1));
}

function progress(target: Grid, work: Grid): number {
  let ok = 0;
  const rows = target.length;
  if (rows === 0) {return 100;}
  const cols = target[0].length;
  const total = rows * cols;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (work[y]?.[x] >= 0 && work[y][x] === target[y][x]) {ok++;}
    }
  }
  return total > 0 ? Math.round((ok / total) * 100) : 100;
}

function copyGrid(g: Grid): Grid {
  return g.map((r) => r.slice());
}

function computeCellSize(conf: GridConfig): number {
  if (typeof window === "undefined") {return BASE_CELL;}
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxBoardW = Math.floor((vw - GAP * 4) / 2);
  const maxBoardH = vh - GAP * 4 - HUD_H;
  const fromW = Math.floor(maxBoardW / conf.cols);
  const fromH = Math.floor(maxBoardH / conf.rows);
  return Math.max(MIN_CELL, Math.min(BASE_CELL, fromW, fromH));
}

export const KnitzyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const paintRef = useRef(false);
  const startTsRef = useRef(Date.now());
  const levelRef = useRef(0);
  const targetRef = useRef<Grid>([]);
  const colorRef = useRef(0);
  const dprRef = useRef(1);
  const cellSizeRef = useRef(BASE_CELL);

  const [difficultyIdx, setDifficultyIdx] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_DIFFICULTY);
      if (saved !== null) {
        const n = parseInt(saved, 10);
        if (!isNaN(n) && n >= 0 && n < GRID_CONFIGS.length) {return n;}
      }
    } catch {}
    return 1;
  });
  const conf = GRID_CONFIGS[difficultyIdx];

  const [target, setTarget] = useState<Grid>(() => {
    const c = GRID_CONFIGS[difficultyIdx];
    const g = makeTarget(c, c.colors);
    targetRef.current = g;
    return g;
  });
  const [work, setWork] = useState<Grid>(() => emptyGrid(conf));
  const [color, setColor] = useState(0);
  const [pct, setPct] = useState(0);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [colorBlind, setColorBlind] = useState(() => {
    try { return localStorage.getItem(LS_COLORBLIND) === "true"; } catch { return false; }
  });
  const [unlocked, setUnlocked] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_UNLOCKED);
      if (saved !== null) {
        const n = parseInt(saved, 10);
        if (!isNaN(n) && n >= 0) {return n;}
      }
    } catch {}
    return 0;
  });

  const colors = colorBlind ? CB_PALETTES[conf.colors] : PALETTES[conf.colors];

  useEffect(() => { colorRef.current = color; }, [color]);

  useEffect(() => {
    try {
      const key = LS_BEST_PREFIX + difficultyIdx;
      const ms = parseInt(localStorage.getItem(key) || "0", 10);
      if (!isNaN(ms) && ms > 0) {setBestMs(ms);}
      else {setBestMs(null);}
    } catch {}
  }, [difficultyIdx]);

  useEffect(() => {
    startTsRef.current = Date.now();
    setElapsedMs(0);
    setComboStreak(0);
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTsRef.current);
    }, 500);
    return () => clearInterval(interval);
     
  }, [target]);

  useEffect(() => {
    const updateRect = () => {
      const c = canvasRef.current;
      if (c) {
        const r = c.getBoundingClientRect();
        rectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
      }
      cellSizeRef.current = computeCellSize(GRID_CONFIGS[difficultyIdx]);
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [difficultyIdx]);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) {return;}
    const ctx = c.getContext("2d");
    if (!ctx) {return;}
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    dprRef.current = dpr;
    const cellSize = computeCellSize(conf);
    cellSizeRef.current = cellSize;
    const { cols, rows } = conf;
    const boardW = cols * cellSize;
    const boardH = rows * cellSize;
    const w = boardW * 2 + GAP * 3;
    const h = boardH + GAP * 2 + HUD_H;

    if (c.width !== Math.floor(w * dpr) || c.height !== Math.floor(h * dpr)) {
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, w, h);

    const colorsArr = colors;
    const isCB = colorBlind;

    const drawBoard = (gx: number, gy: number, grid: Grid, showEmpty: boolean, isWork: boolean) => {
      ctx.fillStyle = "#111827";
      ctx.fillRect(gx - GAP / 2, gy - GAP / 2, boardW + GAP, boardH + GAP);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const val = grid[y]?.[x] ?? -1;
          const px = gx + x * cellSize;
          const py = gy + y * cellSize;

          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px, py, cellSize, cellSize);

          if (val >= 0) {
            ctx.fillStyle = colorsArr[val % colorsArr.length];
            ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);

            if (isCB) {
              ctx.fillStyle = "#ffffff";
              ctx.font = `bold ${Math.max(9, Math.floor(cellSize * 0.45))}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(SYMBOLS[val % SYMBOLS.length], px + cellSize / 2, py + cellSize / 2);
            }
          } else if (showEmpty) {
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
          }

          if (isWork && hoverCell && hoverCell.x === x && hoverCell.y === y) {
            ctx.strokeStyle = "rgba(255,255,255,0.55)";
            ctx.lineWidth = Math.max(1, Math.floor(cellSize / 16));
            ctx.strokeRect(px, py, cellSize, cellSize);
            ctx.lineWidth = 1;
          }
        }
      }

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(gx + x * cellSize, gy);
        ctx.lineTo(gx + x * cellSize, gy + boardH);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(gx, gy + y * cellSize);
        ctx.lineTo(gx + boardW, gy + y * cellSize);
        ctx.stroke();
      }
    };

    const leftX = GAP;
    const topY = GAP + 20;
    drawBoard(leftX, topY, target, false, false);
    drawBoard(leftX + boardW + GAP, topY, work, true, true);

    ctx.fillStyle = "white";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Target", leftX, GAP + 14);
    ctx.fillText("Your Work", leftX + boardW + GAP, GAP + 14);

    const hudY = topY + boardH + GAP + 4;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(`Progress: ${pct}%`, GAP, hudY + 14);
    ctx.fillText(`Time: ${(elapsedMs / 1000).toFixed(1)}s`, GAP + 130, hudY + 14);
    if (bestMs !== null && bestMs > 0) {
      ctx.fillText(`Best: ${(bestMs / 1000).toFixed(1)}s`, GAP + 260, hudY + 14);
    }
    if (comboStreak > 0) {
      ctx.fillStyle = comboStreak >= 5 ? "#fbbf24" : "rgba(255,255,255,0.85)";
      ctx.fillText(`Combo: ${comboStreak}`, GAP, hudY + 36);
    }

    const palY = GAP;
    let palX = leftX + boardW + GAP;
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("Palette", palX, palY + 10);
    for (let i = 0; i < colorsArr.length; i++) {
      const sz = 22;
      const pad = 5;
      const x = palX + i * (sz + pad);
      const y = palY + 16;
      ctx.fillStyle = colorsArr[i];
      ctx.fillRect(x, y, sz, sz);
      ctx.strokeStyle = i === colorRef.current ? "white" : "rgba(255,255,255,0.35)";
      ctx.lineWidth = i === colorRef.current ? 2 : 1;
      ctx.strokeRect(x, y, sz, sz);

      if (isCB) {
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.max(8, Math.floor(sz * 0.45))}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(SYMBOLS[i], x + sz / 2, y + sz / 2);
      }
    }
  }, [target, work, pct, elapsedMs, bestMs, comboStreak, hoverCell, colorBlind, conf, colors]);

  useEffect(() => { draw(); }, [draw]);

  const getGridCell = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const c = canvasRef.current;
    if (!c) {return null;}
    const rect = rectRef.current;
    const { cols, rows } = conf;
    const cellSize = cellSizeRef.current;
    const boardW = cols * cellSize;
    const leftX = GAP;
    const topY = GAP + 20;
    const workX = leftX + boardW + GAP;
    const workY = topY;
    const x = Math.floor((clientX - rect.left - workX) / cellSize);
    const y = Math.floor((clientY - rect.top - workY) / cellSize);
    if (x < 0 || y < 0 || x >= cols || y >= rows) {return null;}
    return { x, y };
  };

  const paintCell = useCallback((cell: { x: number; y: number }) => {
    const curTarget = targetRef.current;
    const curColor = colorRef.current;
    setWork((prev) => {
      const next = copyGrid(prev);
      const prevVal = prev[cell.y]?.[cell.x] ?? -1;
      next[cell.y][cell.x] = curColor;
      const targetVal = curTarget[cell.y]?.[cell.x] ?? -1;
      const wasCorrect = prevVal >= 0 && prevVal === targetVal;
      const nowCorrect = curColor === targetVal;
      if (!wasCorrect && nowCorrect) {
        setComboStreak((s) => s + 1);
      } else if (wasCorrect && !nowCorrect) {
        setComboStreak(0);
      } else if (!wasCorrect && !nowCorrect) {
        setComboStreak(0);
      }
      return next;
    });
  }, []);

  const onPointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    paintRef.current = true;
    const cell = getGridCell(e.clientX, e.clientY);
    if (cell) {
      paintCell(cell);
      soundManager.playSound("click", 0.5);
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    const cell = getGridCell(e.clientX, e.clientY);
    setHoverCell(cell);
    if (paintRef.current && cell) {
      paintCell(cell);
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    paintRef.current = false;
  };

  const onPointerLeave: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    paintRef.current = false;
    setHoverCell(null);
  };

  useEffect(() => {
    const p = progress(target, work);
    setPct(p);
    if (p >= 100) {
      const ms = Date.now() - startTsRef.current;
      const key = LS_BEST_PREFIX + difficultyIdx;
      try {
        const best = parseInt(localStorage.getItem(key) || "0", 10);
        if (isNaN(best) || best === 0 || ms < best) {
          localStorage.setItem(key, String(ms));
          setBestMs(ms);
        }
      } catch {}
      soundManager.playSound("levelComplete", 0.8);
      // Dispatch game:complete for GameShell PostGameCTA
      window.dispatchEvent(
        new CustomEvent("game:complete", { detail: { score: ms } })
      );
      window.dispatchEvent(
        new CustomEvent("knitzy:gameover", { detail: { score: ms } })
      );
      window.dispatchEvent(
        new CustomEvent("game:gameover", { detail: { score: ms } })
      );
      if (difficultyIdx + 1 < GRID_CONFIGS.length && unlocked < difficultyIdx + 1) {
        const nextUnlocked = difficultyIdx + 1;
        setUnlocked(nextUnlocked);
        try { localStorage.setItem(LS_UNLOCKED, String(nextUnlocked)); } catch {}
      }
      levelRef.current += 1;
    }
  }, [target, work, difficultyIdx, unlocked]);

  const reset = useCallback(() => {
    const c = GRID_CONFIGS[difficultyIdx];
    const t = makeTarget(c, c.colors);
    targetRef.current = t;
    setTarget(t);
    setWork(emptyGrid(c));
    setPct(0);
    setComboStreak(0);
    setColor(0);
    startTsRef.current = Date.now();
    setElapsedMs(0);
  }, [difficultyIdx]);

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (idx > unlocked) {return;}
    setDifficultyIdx(idx);
    try { localStorage.setItem(LS_DIFFICULTY, String(idx)); } catch {}
    const c = GRID_CONFIGS[idx];
    const t = makeTarget(c, c.colors);
    targetRef.current = t;
    setTarget(t);
    setWork(emptyGrid(c));
    setPct(0);
    setComboStreak(0);
    setColor(0);
    startTsRef.current = Date.now();
    setElapsedMs(0);
  };

  const toggleColorBlind = () => {
    setColorBlind((prev) => {
      const next = !prev;
      try { localStorage.setItem(LS_COLORBLIND, String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        data-testid="knitzy-canvas"
        className="rounded-lg border border-gray-700 shadow-lg"
        style={{ touchAction: "none", willChange: "transform", transform: "translateZ(0)" }}
        aria-label={`Knitzy. Progress ${pct} percent.`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Color:</span>
          {colors.map((c, i) => (
            <button
              key={i}
              onClick={() => setColor(i)}
              className={`h-6 w-6 rounded ${i === color ? "ring-2 ring-white" : "ring-1 ring-gray-500"}`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${i + 1}`}
            >
              {colorBlind && (
                <span className="flex items-center justify-center text-[10px] text-white font-bold leading-none">
                  {SYMBOLS[i]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Size:</span>
          <input
            type="range"
            min={0}
            max={GRID_CONFIGS.length - 1}
            value={difficultyIdx}
            onChange={handleDifficultyChange}
            className="w-24 h-1.5"
            aria-label="Grid difficulty"
          />
          <span className="text-xs text-gray-300 w-10">{conf.label}</span>
        </div>
        <button
          onClick={toggleColorBlind}
          className={`rounded px-2 py-1 text-xs border ${
            colorBlind
              ? "bg-purple-700 border-purple-500 text-white"
              : "bg-gray-700 border-gray-600 text-gray-300"
          }`}
          aria-label="Toggle color-blind mode"
        >
          {colorBlind ? "CB On" : "CB Off"}
        </button>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-sm"
        >
          New Pattern
        </button>
      </div>
      <div className="mt-1 text-[10px] text-gray-500">
        Level {levelRef.current + 1} &middot; {unlocked + 1}/{GRID_CONFIGS.length}
      </div>
      <div aria-live="polite" className="sr-only">
        Progress {pct} percent.
      </div>
    </div>
  );
};

export default React.memo(KnitzyGame);
