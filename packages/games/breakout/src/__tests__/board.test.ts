import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BRICK_HEIGHT,
  BRICK_PADDING,
  BRICK_ROW_COUNT,
  COLORS,
  buildBricks,
  computeBrickLayout,
} from "../components/BreakoutBoard";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("computeBrickLayout (caracterisation)", () => {
  it("reste dans les bornes de colonnes et de largeur", () => {
    const layout = computeBrickLayout(640);
    expect(layout.cols).toBeGreaterThanOrEqual(8);
    expect(layout.cols).toBeLessThanOrEqual(12);
    expect(layout.brickWidth).toBeGreaterThanOrEqual(36);
    expect(layout.padding).toBe(BRICK_PADDING);
  });

  it("centre la grille dans la toile", () => {
    const layout = computeBrickLayout(800);
    const gridW = layout.cols * layout.brickWidth + (layout.cols - 1) * layout.padding;
    // Groupe centre : offsetLeft = floor((canvasW - gridW) / 2)
    expect(layout.offsetLeft).toBe(Math.floor((800 - gridW) / 2));
    expect(layout.offsetLeft).toBeGreaterThanOrEqual(0);
    expect(gridW).toBeLessThanOrEqual(800);
  });

  it("retombe sur 8 colonnes pour une toile tres etroite", () => {
    const layout = computeBrickLayout(200);
    expect(layout.cols).toBe(8);
    expect(layout.brickWidth).toBeGreaterThanOrEqual(28);
  });

  it("ne descend jamais sous 8 colonnes quand la largeur grandit", () => {
    for (const width of [320, 480, 640, 1024, 1440]) {
      const layout = computeBrickLayout(width);
      expect(layout.cols, `largeur ${width}`).toBeGreaterThanOrEqual(8);
      expect(layout.cols, `largeur ${width}`).toBeLessThanOrEqual(12);
    }
  });
});

describe("buildBricks (caracterisation)", () => {
  it("produit une grille de la taille du layout", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const layout = computeBrickLayout(640);
    const grid = buildBricks(1, layout);
    expect(grid.length).toBe(layout.cols);
    for (const column of grid) {
      expect(column.length).toBe(BRICK_ROW_COUNT);
    }
  });

  it("place chaque brique selon la formule de position", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const layout = computeBrickLayout(640);
    const grid = buildBricks(3, layout);
    for (let c = 0; c < layout.cols; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brick = grid[c][r];
        expect(brick.x).toBe(c * (layout.brickWidth + layout.padding) + layout.offsetLeft);
        expect(brick.y).toBe(r * (BRICK_HEIGHT + BRICK_PADDING) + 40);
        expect(brick.width).toBe(layout.brickWidth);
        expect(brick.height).toBe(BRICK_HEIGHT);
      }
    }
  });

  it("calcule les points par rangee et par niveau (brique normale)", () => {
    // random = 1 - epsilon : jamais de brique solide, couleur stable.
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    const grid = buildBricks(4, computeBrickLayout(640));
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      const brick = grid[0][r];
      expect(brick.points).toBe((BRICK_ROW_COUNT - r) * 10 * 4);
      expect(brick.health).toBe(1);
      expect(COLORS).toContain(brick.color);
    }
  });

  it("le niveau 1 ne produit jamais de brique solide", () => {
    // random = 0 forcerait une brique solide des le niveau 2 ; au niveau 1 non.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const grid = buildBricks(1, computeBrickLayout(640));
    for (const column of grid) {
      for (const brick of column) {
        expect(brick.health).toBe(1);
      }
    }
  });

  it("une brique solide double les points et porte la couleur dediee", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // isTough = true des le niveau 2
    const grid = buildBricks(2, computeBrickLayout(640));
    const brick = grid[0][0];
    expect(brick.health).toBe(2);
    expect(brick.points).toBe((BRICK_ROW_COUNT - 0) * 10 * 2 * 2);
    expect(brick.color).toBe("#ea580c");
  });
});
