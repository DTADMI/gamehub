/**
 * BreakoutBoard — Brick grid construction utilities.
 * Extracted from BreakoutGame.tsx (M-3 refactor).
 */

export const BRICK_ROW_COUNT = 5;
export const BRICK_HEIGHT = 18;
export const BRICK_PADDING = 8;
export const BRICK_OFFSET_TOP = 40;

export const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];

export type Brick = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  health: number;
};

export type BrickLayout = {
  cols: number;
  brickWidth: number;
  offsetLeft: number;
  padding: number;
};

/**
 * Compute a centered, responsive brick layout based on logical canvas width.
 */
export function computeBrickLayout(canvasW: number): BrickLayout {
  const minCols = 8;
  const maxCols = 12;
  const margin = 24; // left/right margin inside canvas
  const padding = BRICK_PADDING;

  let best: BrickLayout | null = null;
  for (let cols = maxCols; cols >= minCols; cols--) {
    const totalPadding = (cols - 1) * padding;
    const available = canvasW - 2 * margin - totalPadding;
    const brickWidth = Math.floor(available / cols);
    if (brickWidth >= 36) {
      const gridW = cols * brickWidth + totalPadding;
      const offsetLeft = Math.floor((canvasW - gridW) / 2);
      best = { cols, brickWidth, offsetLeft, padding };
      break;
    }
  }
  if (!best) {
    // Fallback: use minCols with whatever width fits, still centered
    const cols = minCols;
    const totalPadding = (cols - 1) * padding;
    const available = canvasW - 2 * 16 - totalPadding;
    const brickWidth = Math.max(28, Math.floor(available / cols));
    const gridW = cols * brickWidth + totalPadding;
    const offsetLeft = Math.floor((canvasW - gridW) / 2);
    best = { cols, brickWidth, offsetLeft, padding };
  }
  return best;
}

/**
 * Pure brick factory — builds a level's brick grid.
 */
export function buildBricks(
  lvl: number,
  layout: BrickLayout = computeBrickLayout(640),
): Brick[][] {
  const newBricks: Brick[][] = [];
  for (let c = 0; c < layout.cols; c++) {
    newBricks[c] = [] as Brick[];
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      const brickX = c * (layout.brickWidth + layout.padding) + layout.offsetLeft;
      const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
      const colorIndex = Math.floor(Math.random() * COLORS.length);
      const basePoints = (BRICK_ROW_COUNT - r) * 10 * Math.max(1, lvl);
      const toughChance = Math.min(0.1 + (Math.max(1, lvl) - 2) * 0.04, 0.28);
      const isTough = lvl >= 2 && Math.random() < toughChance;
      const health = isTough ? 2 : 1;
      const points = isTough ? basePoints * 2 : basePoints;
      newBricks[c][r] = {
        x: brickX,
        y: brickY,
        width: layout.brickWidth,
        height: BRICK_HEIGHT,
        color: isTough ? "#ea580c" : COLORS[colorIndex],
        points,
        health,
      } as Brick;
    }
  }
  return newBricks;
}