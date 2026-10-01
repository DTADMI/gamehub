import { describe, it, expect } from "vitest";

import {
  checkPatternMatch,
  checkWordMatch,
  evaluatePipeNetwork,
  generateMaze,
  shuffleArray,
  type PipeConnection,
} from "../src/index";

function pipe(
  overrides: Partial<PipeConnection> & Pick<PipeConnection, "row" | "col">
): PipeConnection {
  return {
    id: `${overrides.row},${overrides.col}`,
    type: "straight",
    rotation: 0,
    connections: [],
    ...overrides,
  };
}

describe("evaluatePipeNetwork", () => {
  it("rejects an empty network", () => {
    expect(evaluatePipeNetwork([])).toBe(false);
  });

  it("rejects a network without two ends", () => {
    expect(evaluatePipeNetwork([pipe({ row: 0, col: 0, type: "end", rotation: 90 })])).toBe(false);
  });

  it("accepts two connected ends", () => {
    const network = [
      pipe({ row: 0, col: 0, type: "end", rotation: 90 }),
      pipe({ row: 0, col: 1, type: "end", rotation: 270 }),
    ];
    expect(evaluatePipeNetwork(network)).toBe(true);
  });

  it("accepts a chain through a rotated straight pipe", () => {
    const network = [
      pipe({ row: 0, col: 0, type: "end", rotation: 90 }),
      pipe({ row: 0, col: 1, type: "straight", rotation: 90 }),
      pipe({ row: 0, col: 2, type: "end", rotation: 270 }),
    ];
    expect(evaluatePipeNetwork(network)).toBe(true);
  });

  it("rejects disconnected ends", () => {
    const network = [
      pipe({ row: 0, col: 0, type: "end", rotation: 0 }),
      pipe({ row: 5, col: 5, type: "end", rotation: 0 }),
    ];
    expect(evaluatePipeNetwork(network)).toBe(false);
  });

  it("rejects a chain interrupted by a badly rotated pipe", () => {
    const network = [
      pipe({ row: 0, col: 0, type: "end", rotation: 90 }),
      pipe({ row: 0, col: 1, type: "straight", rotation: 0 }),
      pipe({ row: 0, col: 2, type: "end", rotation: 270 }),
    ];
    expect(evaluatePipeNetwork(network)).toBe(false);
  });
});

describe("checkPatternMatch", () => {
  it("returns 1 for identical grids", () => {
    expect(checkPatternMatch([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(1);
  });

  it("returns the matched fraction", () => {
    expect(checkPatternMatch([[1, 2], [3, 4]], [[1, 0], [0, 4]])).toBe(0.5);
  });

  it("returns 0 on shape mismatch or empty input", () => {
    expect(checkPatternMatch([[1, 2]], [[1, 2], [3, 4]])).toBe(0);
    expect(checkPatternMatch([], [[1]])).toBe(0);
  });
});

describe("generateMaze", () => {
  it("builds a grid of the requested size", () => {
    const maze = generateMaze(4, 5);
    expect(maze).toHaveLength(4);
    expect(maze[0]).toHaveLength(5);
    expect(maze[3][4]).toMatchObject({ row: 3, col: 4 });
  });

  it("carves at least one passage in a non-trivial maze", () => {
    const maze = generateMaze(3, 3);
    const hasOpening = maze.some((row) =>
      row.some((cell) => !cell.top || !cell.right || !cell.bottom || !cell.left)
    );
    expect(hasOpening).toBe(true);
  });
});

describe("checkWordMatch", () => {
  it("matches ignoring case and surrounding spaces", () => {
    expect(checkWordMatch("  Kyoto ", "kyoto")).toBe(true);
  });

  it("rejects empty input and different words", () => {
    expect(checkWordMatch("", "kyoto")).toBe(false);
    expect(checkWordMatch("kyoto", "osaka")).toBe(false);
  });
});

describe("shuffleArray", () => {
  it("keeps the same elements without mutating the input", () => {
    const input = [1, 2, 3, 4];
    const output = shuffleArray(input);
    expect(output).toHaveLength(4);
    expect([...output].sort()).toEqual([1, 2, 3, 4]);
    expect(input).toEqual([1, 2, 3, 4]);
  });
});
