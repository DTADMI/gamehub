"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { t } from "@/lib/i18n";

type CellData = {
  top: boolean;
  bottom: boolean;
  right: boolean;
  left: boolean;
};

type Wall = { row: number; col: number; dir: "h" | "v" };

const COLS = 5;
const ROWS = 5;
const CELL_SIZE = 2;
const TOTAL_CRYSTALS = 5;
const MAX_REWINDS = 3;
const REWIND_STEPS = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMaze(rows: number, cols: number): CellData[][] {
  const grid: CellData[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      bottom: true,
      right: true,
      left: true,
    })),
  );

  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  function carve(r: number, c: number) {
    visited[r][c] = true;
    const dirs = shuffle([
      { dr: -1, dc: 0, wall: "top" as const, opp: "bottom" as const },
      { dr: 1, dc: 0, wall: "bottom" as const, opp: "top" as const },
      { dr: 0, dc: -1, wall: "left" as const, opp: "right" as const },
      { dr: 0, dc: 1, wall: "right" as const, opp: "left" as const },
    ]);

    for (const d of dirs) {
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        grid[r][c][d.wall] = false;
        grid[nr][nc][d.opp] = false;
        carve(nr, nc);
      }
    }
  }

  carve(0, 0);
  return grid;
}

function cellToWorld(row: number, col: number): [number, number] {
  return [
    col * CELL_SIZE - ((COLS - 1) * CELL_SIZE) / 2,
    row * CELL_SIZE - ((ROWS - 1) * CELL_SIZE) / 2,
  ];
}

function getMazeWalls(maze: CellData[][]): Wall[] {
  const walls: Wall[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = maze[r][c];
      if (cell.top && r === 0) { walls.push({ row: r - 1, col: c, dir: "h" }); }
      if (cell.bottom && r < ROWS - 1) { walls.push({ row: r, col: c, dir: "h" }); }
      if (cell.bottom && r === ROWS - 1) { walls.push({ row: ROWS - 1, col: c, dir: "h" }); }
      if (cell.left && c === 0) { walls.push({ row: r, col: c - 1, dir: "v" }); }
      if (cell.right && c < COLS - 1) { walls.push({ row: r, col: c, dir: "v" }); }
      if (cell.right && c === COLS - 1) { walls.push({ row: r, col: COLS - 1, dir: "v" }); }
    }
  }

  return walls;
}

type Collectible = { row: number; col: number; id: number };

type RotationTile = { row: number; col: number; used: boolean };

const ROTATION_SECTION_SIZE = 3;

function spawnCrystals(
  playerRow: number,
  playerCol: number,
  count: number,
): Collectible[] {
  const crystals: Collectible[] = [];
  const allCells: { row: number; col: number }[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r !== playerRow || c !== playerCol) {
        allCells.push({ row: r, col: c });
      }
    }
  }

  for (let i = 0; i < count && allCells.length > 0; i++) {
    const idx = Math.floor(Math.random() * allCells.length);
    const cell = allCells.splice(idx, 1)[0];
    crystals.push({ row: cell.row, col: cell.col, id: i });
  }

  return crystals;
}

function spawnRotationTile(): RotationTile {
  const allCells: { row: number; col: number }[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!(r === 0 && c === 0) && !(r === ROWS - 1 && c === COLS - 1)) {
        allCells.push({ row: r, col: c });
      }
    }
  }

  const idx = Math.floor(Math.random() * allCells.length);
  const cell = allCells[idx];
  return { row: cell.row, col: cell.col, used: false };
}

function rotateMazeSection(maze: CellData[][], centerRow: number, centerCol: number): CellData[][] {
  const halfSize = Math.floor(ROTATION_SECTION_SIZE / 2);
  const startRow = Math.max(0, centerRow - halfSize);
  const startCol = Math.max(0, centerCol - halfSize);
  const endRow = Math.min(ROWS - 1, centerRow + halfSize);
  const endCol = Math.min(COLS - 1, centerCol + halfSize);

  return maze.map((row, r) =>
    row.map((cell, c) => {
      if (r >= startRow && r <= endRow && c >= startCol && c <= endCol) {
        const original = maze[r][c];
        return {
          top: original.left,
          right: original.top,
          bottom: original.right,
          left: original.bottom,
        };
      }
      return { ...cell };
    }),
  );
}

type MoveRecord = { row: number; col: number };

interface RewindAnim {
  active: boolean;
  steps: MoveRecord[];
  stepIndex: number;
  timer: number;
}

function MazeScene({
  playerPosRef,
  targetPosRef,
  maze,
  shiftedWalls,
  crystals,
  collectedCrystalIds,
  rewindAnimRef,
  onRewindComplete,
  rotationTile,
}: {
  playerPosRef: React.MutableRefObject<{ x: number; z: number }>;
  targetPosRef: React.MutableRefObject<{ x: number; z: number }>;
  maze: CellData[][];
  shiftedWalls: Set<string>;
  crystals: Collectible[];
  collectedCrystalIds: Set<number>;
  rewindAnimRef: React.MutableRefObject<RewindAnim>;
  onRewindComplete: () => void;
  rotationTile: RotationTile | null;
}) {
  const playerRef = useRef<THREE.Object3D | null>(null);

  const wallKey = (w: Wall) =>
    `${w.dir}-${w.row}-${w.col}`;

  const mazeWalls = useMemo(() => getMazeWalls(maze), [maze]);

  const visibleWalls = useMemo(() => {
    return mazeWalls.filter((w) => !shiftedWalls.has(wallKey(w)));
  }, [mazeWalls, shiftedWalls]);

  useFrame((_, delta) => {
    if (playerRef.current) {
      const lerpFactor = 1 - Math.exp(-10 * delta);
      playerPosRef.current.x += (targetPosRef.current.x - playerPosRef.current.x) * lerpFactor;
      playerPosRef.current.z += (targetPosRef.current.z - playerPosRef.current.z) * lerpFactor;
      playerRef.current.position.x = playerPosRef.current.x;
      playerRef.current.position.z = playerPosRef.current.z;
    }

    if (rewindAnimRef.current.active) {
      rewindAnimRef.current.timer -= delta;
      if (rewindAnimRef.current.timer <= 0) {
        if (rewindAnimRef.current.stepIndex > 0) {
          rewindAnimRef.current.stepIndex--;
          const step = rewindAnimRef.current.steps[rewindAnimRef.current.stepIndex];
          const [tx, tz] = cellToWorld(step.row, step.col);
          targetPosRef.current.x = tx;
          targetPosRef.current.z = tz;
          rewindAnimRef.current.timer = 0.18;
        } else {
          rewindAnimRef.current.active = false;
          rewindAnimRef.current.steps = [];
          onRewindComplete();
        }
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 3, 0]} intensity={15} color="#4488ff" distance={12} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[COLS * CELL_SIZE + 2, ROWS * CELL_SIZE + 2]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <gridHelper
        args={[COLS * CELL_SIZE + 2, COLS + 1, "#2a2a4a", "#2a2a4a"]}
        position={[0, 0.005, 0]}
      />

      {visibleWalls.map((w, _i) => {
        const key = wallKey(w);
        const isShifted = shiftedWalls.has(key);
        const [cx, cz] = cellToWorld(
          w.dir === "h" ? w.row : w.row,
          w.dir === "h" ? w.col : w.col,
        );

        let pos: [number, number, number];
        let size: [number, number, number];
        if (w.dir === "h") {
          pos = [cx, 0.5, cz + CELL_SIZE / 2];
          size = [CELL_SIZE, 1, 0.15];
        } else {
          pos = [cx + CELL_SIZE / 2, 0.5, cz];
          size = [0.15, 1, CELL_SIZE];
        }

        return (
          <mesh key={key} position={pos} castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial
              color={isShifted ? "#664444" : "#334466"}
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>
        );
      })}

      {crystals.map((c) => {
        if (collectedCrystalIds.has(c.id)) { return null; }
        const [x, z] = cellToWorld(c.row, c.col);
        return (
          <mesh key={`crystal-${c.id}`} position={[x, 0.6, z]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff44"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      <mesh ref={playerRef} position={[playerPosRef.current.x, 0.5, playerPosRef.current.z]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#004466"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      <mesh position={[cellToWorld(0, 0)[0], 0.4, cellToWorld(0, 0)[1]]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>

      <mesh
        position={[cellToWorld(ROWS - 1, COLS - 1)[0], 0.4, cellToWorld(ROWS - 1, COLS - 1)[1]]}
      >
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff0000"
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {rotationTile && !rotationTile.used && (
        <mesh
          position={[
            cellToWorld(rotationTile.row, rotationTile.col)[0],
            0.06,
            cellToWorld(rotationTile.row, rotationTile.col)[1],
          ]}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.06, 3]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffaa00"
            emissiveIntensity={0.7}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
      )}
    </group>
  );
}

export default function ChronoShiftGame({
  onScoreUpdate,
  onGameOver,
}: {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, won: boolean) => void;
}) {
  const [score, setScore] = useState(0);
  const [rewindsRemaining, setRewindsRemaining] = useState(MAX_REWINDS);
  const [crystalsCollected, setCrystalsCollected] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [rewindActive, setRewindActive] = useState(false);
  const [lastDirection, setLastDirection] = useState("south");
  const [shiftedKeys, setShiftedKeys] = useState<Set<string>>(new Set());
  const [rotationTile, setRotationTile] = useState<RotationTile>(() => spawnRotationTile());
  const [paradoxCount, setParadoxCount] = useState(0);
  const [paradoxFlash, setParadoxFlash] = useState(false);
  const [shakeActive, setShakeActive] = useState(false);

  const [maze, setMaze] = useState(() => generateMaze(ROWS, COLS));
  const [crystals, setCrystals] = useState(() => spawnCrystals(0, 0, TOTAL_CRYSTALS));
  const gridPosRef = useRef({ row: 0, col: 0 });
  const targetPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const playerPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const moveHistoryRef = useRef<MoveRecord[]>([]);
  const isMovingRef = useRef(false);
  const collectedCrystalIdsRef = useRef<Set<number>>(new Set());
  const rewindAnimRef = useRef<RewindAnim>({
    active: false,
    steps: [],
    stepIndex: 0,
    timer: 0,
  });

  const [initX, initZ] = cellToWorld(0, 0);
  if (targetPosRef.current.x === 0 && targetPosRef.current.z === 0) {
    targetPosRef.current = { x: initX, z: initZ };
    playerPosRef.current = { x: initX, z: initZ };
  }

  const canMoveTo = useCallback(
    (row: number, col: number, fromRow: number, fromCol: number): boolean => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) { return false; }
      const cell = maze;

      const dr = row - fromRow;
      const dc = col - fromCol;

      if (dr === -1) {
        const key = `h-${row}-${fromCol}`;
        return !cell[fromRow][fromCol].top || shiftedKeys.has(key);
      }
      if (dr === 1) {
        const key = `h-${fromRow}-${col}`;
        return !cell[fromRow][fromCol].bottom || shiftedKeys.has(key);
      }
      if (dc === -1) {
        const key = `v-${fromRow}-${col}`;
        return !cell[fromRow][fromCol].left || shiftedKeys.has(key);
      }
      if (dc === 1) {
        const key = `v-${fromRow}-${fromCol}`;
        return !cell[fromRow][fromCol].right || shiftedKeys.has(key);
      }

      return true;
    },
    [maze, shiftedKeys],
  );

  const tryMove = useCallback(
    (dr: number, dc: number, dirName: string) => {
      if (rewindActive || gameOver || gameWon || isMovingRef.current) { return; }

      const { row, col } = gridPosRef.current;
      const newRow = row + dr;
      const newCol = col + dc;

      if (!canMoveTo(newRow, newCol, row, col)) { return; }

      setLastDirection(dirName);

      moveHistoryRef.current.push({ row, col });
      if (moveHistoryRef.current.length > 50) {
        moveHistoryRef.current = moveHistoryRef.current.slice(-50);
      }

      gridPosRef.current = { row: newRow, col: newCol };
      const [tx, tz] = cellToWorld(newRow, newCol);
      targetPosRef.current = { x: tx, z: tz };
      isMovingRef.current = true;
    },
    [canMoveTo, rewindActive, gameOver, gameWon],
  );

  const handleRewind = useCallback(() => {
    if (rewindActive || rewindsRemaining <= 0 || gameOver || gameWon) { return; }
    if (moveHistoryRef.current.length === 0) { return; }

    const steps = moveHistoryRef.current.slice(-REWIND_STEPS);
    if (steps.length === 0) { return; }

    setRewindsRemaining((r) => r - 1);
    setRewindActive(true);

    moveHistoryRef.current = moveHistoryRef.current.slice(
      0,
      moveHistoryRef.current.length - steps.length,
    );

    const reversedSteps = steps.reverse();
    rewindAnimRef.current = {
      active: true,
      steps: [{ row: gridPosRef.current.row, col: gridPosRef.current.col }, ...reversedSteps],
      stepIndex: reversedSteps.length,
      timer: 0,
    };
  }, [rewindActive, rewindsRemaining, gameOver, gameWon]);

  const handleWallShift = useCallback(() => {
    if (rewindActive || rewindsRemaining <= 0 || gameOver || gameWon) { return; }

    const { row, col } = gridPosRef.current;
    const dirMap: Record<string, { dr: number; dc: number }> = {
      north: { dr: -1, dc: 0 },
      south: { dr: 1, dc: 0 },
      west: { dr: 0, dc: -1 },
      east: { dr: 0, dc: 1 },
    };

    const delta = dirMap[lastDirection] || { dr: 0, dc: 1 };
    const targetRow = row + delta.dr;
    const targetCol = col + delta.dc;

    if (targetRow < 0 || targetRow >= ROWS || targetCol < 0 || targetCol >= COLS) { return; }

    let wallKeyStr: string | null = null;
    const cell = maze;

    if (delta.dr === -1 && cell[row][col].top) {
      wallKeyStr = `h-${targetRow}-${col}`;
    } else if (delta.dr === 1 && cell[row][col].bottom) {
      wallKeyStr = `h-${row}-${col}`;
    } else if (delta.dc === -1 && cell[row][col].left) {
      wallKeyStr = `v-${row}-${targetCol}`;
    } else if (delta.dc === 1 && cell[row][col].right) {
      wallKeyStr = `v-${row}-${col}`;
    }

    if (!wallKeyStr || shiftedKeys.has(wallKeyStr)) { return; }

    setRewindsRemaining((r) => r - 1);

    setShiftedKeys((prev) => {
      const next = new Set(prev);
      next.add(wallKeyStr!);
      return next;
    });
  }, [rewindActive, rewindsRemaining, lastDirection, maze, shiftedKeys, gameOver, gameWon]);

  const handleCollectCrystal = useCallback(
    (id: number) => {
      if (collectedCrystalIdsRef.current.has(id)) { return; }
      collectedCrystalIdsRef.current.add(id);

      const newCollected = collectedCrystalIdsRef.current.size;
      setCrystalsCollected(newCollected);
      setScore((s) => s + 100);

      if (newCollected >= TOTAL_CRYSTALS) {
        setGameWon(true);
        setGameOver(true);
        const timeBonus = Math.max(0, rewindsRemaining * 50);
        setScore((s) => s + timeBonus);
      }
    },
    [rewindsRemaining],
  );

  useEffect(() => {
    onScoreUpdate?.(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    if (gameOver) {
      onGameOver?.(score, gameWon);
    }
  }, [gameOver, onGameOver, gameWon, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === "r") { handleRewind(); }
      if (key === "e") { handleWallShift(); }

      if (key === "w" || key === "arrowup") { tryMove(-1, 0, "north"); }
      else if (key === "s" || key === "arrowdown") { tryMove(1, 0, "south"); }
      else if (key === "a" || key === "arrowleft") { tryMove(0, -1, "west"); }
      else if (key === "d" || key === "arrowright") { tryMove(0, 1, "east"); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tryMove, handleRewind, handleWallShift]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMovingRef.current) { return; }

      const { row, col } = gridPosRef.current;
      const [twx, twz] = cellToWorld(row, col);
      const dx = twx - playerPosRef.current.x;
      const dz = twz - playerPosRef.current.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.15) {
        isMovingRef.current = false;
        playerPosRef.current.x = twx;
        playerPosRef.current.z = twz;

        for (const c of crystals) {
          if (c.row === row && c.col === col && !collectedCrystalIdsRef.current.has(c.id)) {
            handleCollectCrystal(c.id);
          }
        }

        if (
          rotationTile &&
          !rotationTile.used &&
          row === rotationTile.row &&
          col === rotationTile.col
        ) {
          const newMaze = rotateMazeSection(maze, rotationTile.row, rotationTile.col);
          setMaze(newMaze);
          setRotationTile({ ...rotationTile, used: true });
          setShakeActive(true);
          setTimeout(() => { setShakeActive(false); }, 300);
        }

        if (row === 0 && col === 0 && collectedCrystalIdsRef.current.size > 0 && !gameWon) {
          const newCount = paradoxCount + 1;
          setParadoxCount(newCount);
          setParadoxFlash(true);
          setTimeout(() => { setParadoxFlash(false); }, 500);
          if (newCount >= 3) {
            setScore((s) => s + 500);
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [crystals, handleCollectCrystal, rotationTile, maze, paradoxCount, gameWon]);

  const resetGame = useCallback(() => {
    const newMaze = generateMaze(ROWS, COLS);

    setMaze(newMaze);

    const newCrystals = spawnCrystals(0, 0, TOTAL_CRYSTALS);
    setCrystals(newCrystals);

    const [x, z] = cellToWorld(0, 0);
    gridPosRef.current = { row: 0, col: 0 };
    targetPosRef.current = { x, z };
    playerPosRef.current = { x, z };
    moveHistoryRef.current = [];
    isMovingRef.current = false;
    collectedCrystalIdsRef.current = new Set();
    rewindAnimRef.current = { active: false, steps: [], stepIndex: 0, timer: 0 };
    setScore(0);
    setRewindsRemaining(MAX_REWINDS);
    setCrystalsCollected(0);
    setGameOver(false);
    setGameWon(false);
    setRewindActive(false);
    setShiftedKeys(new Set());
    setLastDirection("south");
    setRotationTile(spawnRotationTile());
    setParadoxCount(0);
    setParadoxFlash(false);
    setShakeActive(false);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        background: "#0a0a1a",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Canvas
        camera={{ position: [6, 10, 10], fov: 50, near: 0.1, far: 50 }}
        style={{
          position: "absolute",
          inset: 0,
          transform: shakeActive
            ? `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 8}px)`
            : "none",
          transition: shakeActive ? "none" : "transform 0.15s ease-out",
        }}
        gl={{ antialias: true }}
      >
        <MazeScene
          playerPosRef={playerPosRef}
          targetPosRef={targetPosRef}
          maze={maze}
          shiftedWalls={shiftedKeys}
          crystals={crystals}
          collectedCrystalIds={collectedCrystalIdsRef.current}
          rewindAnimRef={rewindAnimRef}
          onRewindComplete={() => {
            const firstStep = rewindAnimRef.current.steps[0];
            if (firstStep) {
              gridPosRef.current = { row: firstStep.row, col: firstStep.col };
              const [x, z] = cellToWorld(firstStep.row, firstStep.col);
              targetPosRef.current = { x, z };
            }
            setRewindActive(false);
          }}
          rotationTile={rotationTile}
        />
      </Canvas>

      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(10,10,30,0.85)",
          border: "1px solid #334466",
          borderRadius: 8,
          padding: "12px 16px",
          color: "#c0d0ff",
          fontSize: 14,
          lineHeight: 1.6,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          {t("chronoshift.title")}
        </div>
        <div>
          {t("chronoshift.score")}: <span style={{ color: "#00ff88" }}>{score}</span>
        </div>
        <div>
          {t("chronoshift.rewinds")}:{" "}
          <span style={{ color: rewindsRemaining > 0 ? "#ffaa00" : "#ff4444" }}>
            {rewindsRemaining}
          </span>
        </div>
        <div>
          {t("chronoshift.crystals")}:{" "}
          <span style={{ color: "#00ff88" }}>
            {crystalsCollected}/{TOTAL_CRYSTALS}
          </span>
        </div>
        {paradoxCount > 0 && (
          <div>
            Paradoxes:{" "}
            <span style={{ color: paradoxCount >= 3 ? "#ff00ff" : "#cc88ff" }}>
              {paradoxCount}
            </span>
          </div>
        )}
        {rewindActive && (
          <div style={{ color: "#ffaa00", marginTop: 4 }}>{t("chronoshift.rewinding")}</div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,10,30,0.8)",
          border: "1px solid #334466",
          borderRadius: 8,
          padding: "8px 16px",
          color: "#8899bb",
          fontSize: 12,
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {t("chronoshift.controls")}
      </div>

      {paradoxFlash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(128, 0, 255, 0.25)",
            pointerEvents: "none",
            zIndex: 15,
            transition: "opacity 0.3s ease-out",
          }}
        />
      )}

      {gameOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5,5,20,0.85)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              color: gameWon ? "#00ff88" : "#ff6644",
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
              {gameWon ? t("chronoshift.win") : t("chronoshift.lose")}
          </div>
          <div style={{ color: "#c0d0ff", fontSize: 18, marginBottom: 24 }}>
            {t("chronoshift.finalScore")}: {score}
          </div>
          <div style={{ color: "#8899bb", fontSize: 14, marginBottom: 24 }}>
            Crystals: {crystalsCollected}/{TOTAL_CRYSTALS} &nbsp;|&nbsp;
            Rewinds used: {MAX_REWINDS - rewindsRemaining}
          </div>
          <button
            onClick={resetGame}
            style={{
              background: "#334466",
              color: "#c0d0ff",
              border: "1px solid #5588cc",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 16,
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {t("chronoshift.playAgain")}
          </button>
        </div>
      )}
    </div>
  );
}
