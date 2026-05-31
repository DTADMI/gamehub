export type PipeConnection = {
  id: string;
  type: "straight" | "corner" | "cross" | "end";
  rotation: 0 | 90 | 180 | 270;
  row: number;
  col: number;
  connections: ("top" | "right" | "bottom" | "left")[];
};

export type Grid = number[][];

export type MazeCell = {
  row: number;
  col: number;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export type Cell = {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited?: boolean;
};

function getOpposite(dir: "top" | "right" | "bottom" | "left"): "top" | "right" | "bottom" | "left" {
  const map: Record<string, "top" | "right" | "bottom" | "left"> = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  };
  return map[dir];
}

function getDirectionOffset(
  dir: "top" | "right" | "bottom" | "left",
): { dr: number; dc: number } {
  switch (dir) {
    case "top": return { dr: -1, dc: 0 };
    case "right": return { dr: 0, dc: 1 };
    case "bottom": return { dr: 1, dc: 0 };
    case "left": return { dr: 0, dc: -1 };
  }
}

function pipeConnectsInDirection(
  pipe: PipeConnection,
  dir: "top" | "right" | "bottom" | "left",
): boolean {
  const offsetMap: Record<"top" | "right" | "bottom" | "left", number> = {
    top: 0,
    right: 90,
    bottom: 180,
    left: 270,
  };

  const typeDirs: Record<string, number[]> = {
    straight: [0, 180],
    corner: [0, 90],
    cross: [0, 90, 180, 270],
    end: [0],
  };

  const baseDirs = typeDirs[pipe.type];
  const neededAngle = offsetMap[dir];
  const rotation = pipe.rotation;

  for (const base of baseDirs) {
    const effective = (base + rotation) % 360;
    if (effective === neededAngle) {return true;}
  }
  return false;
}

export function evaluatePipeNetwork(pipeConnections: PipeConnection[]): boolean {
  if (pipeConnections.length === 0) {return false;}

  const grid = new Map<string, PipeConnection>();
  for (const pipe of pipeConnections) {
    grid.set(`${pipe.row},${pipe.col}`, pipe);
  }

  const starts = pipeConnections.filter((p) => p.type === "end");
  if (starts.length < 2) {return false;}

  const visited = new Set<string>();
  const queue: PipeConnection[] = [starts[0]];
  visited.add(`${starts[0].row},${starts[0].col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dirs: ("top" | "right" | "bottom" | "left")[] = ["top", "right", "bottom", "left"];

    for (const dir of dirs) {
      if (!pipeConnectsInDirection(current, dir)) {continue;}
      const { dr, dc } = getDirectionOffset(dir);
      const nr = current.row + dr;
      const nc = current.col + dc;
      const key = `${nr},${nc}`;

      if (visited.has(key)) {continue;}
      const neighbor = grid.get(key);
      if (!neighbor) {continue;}
      if (!pipeConnectsInDirection(neighbor, getOpposite(dir))) {continue;}

      visited.add(key);
      queue.push(neighbor);
    }
  }

  for (const pipe of pipeConnections) {
    if (!visited.has(`${pipe.row},${pipe.col}`)) {return false;}
  }
  return true;
}

export function checkPatternMatch(grid: Grid, target: Grid): number {
  if (grid.length === 0 || target.length === 0) {return 0;}
  if (grid.length !== target.length || grid[0].length !== target[0].length) {return 0;}

  let matches = 0;
  let total = 0;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      total++;
      if (grid[r][c] === target[r][c]) {matches++;}
    }
  }

  return total > 0 ? matches / total : 0;
}

export function generateMaze(rows: number, cols: number): MazeCell[][] {
  const maze: MazeCell[][] = [];
  for (let r = 0; r < rows; r++) {
    maze[r] = [];
    for (let c = 0; c < cols; c++) {
      maze[r][c] = {
        row: r,
        col: c,
        top: true,
        right: true,
        bottom: true,
        left: true,
      };
    }
  }

  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack: { row: number; col: number }[] = [];

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const start = { row: 0, col: 0 };
  visited[start.row][start.col] = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const dirs = shuffle(["top", "right", "bottom", "left"]) as ("top" | "right" | "bottom" | "left")[];

    let moved = false;
    for (const dir of dirs) {
      const { dr, dc } = getDirectionOffset(dir);
      const nr = current.row + dr;
      const nc = current.col + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {continue;}
      if (visited[nr][nc]) {continue;}

      visited[nr][nc] = true;
      maze[current.row][current.col][dir] = false;
      maze[nr][nc][getOpposite(dir)] = false;
      stack.push({ row: nr, col: nc });
      moved = true;
      break;
    }

    if (!moved) {stack.pop();}
  }

  return maze;
}

export function checkWordMatch(word: string, target: string): boolean {
  if (!word || !target) {return false;}
  return word.toLowerCase().trim() === target.toLowerCase().trim();
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
