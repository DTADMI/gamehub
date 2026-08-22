"use client";

import { t } from "@/lib/i18n";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const GRID_ROWS = 6;
const GRID_COLS = 6;
const CELL_SIZE = 2;
const RECORD_MAX = 12;
const CLONE_LOOP_DELAY = 2.0;

type TileType = "floor" | "wall" | "timegate" | "switch" | "bridge" | "playerExit" | "cloneExit";

interface Tile {
  row: number;
  col: number;
  type: TileType;
  switchId?: number;
  bridgeOrientation?: "h" | "v";
  active?: boolean;
}

interface SwitchDef {
  id: number;
  row: number;
  col: number;
  bridgeRow: number;
  bridgeCol: number;
}

interface PuzzleLevel {
  name: string;
  grid: TileType[][];
  switches: SwitchDef[];
  playerStart: [number, number];
  cloneStart: [number, number];
  timegateCell: [number, number];
}

function createGrid(rows: number, cols: number, fill: TileType = "floor"): TileType[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

const PUZZLE_LEVELS: PuzzleLevel[] = [
  {
    name: "First Loop",
    grid: (() => {
      const g = createGrid(GRID_ROWS, GRID_COLS, "floor");
      g[0][3] = "timegate";
      g[5][2] = "playerExit";
      g[5][5] = "cloneExit";
      g[2][0] = "wall"; g[2][1] = "wall"; g[2][2] = "wall";
      g[2][4] = "wall"; g[2][5] = "wall";
      return g;
    })(),
    switches: [],
    playerStart: [0, 0],
    cloneStart: [0, 0],
    timegateCell: [0, 3],
  },
  {
    name: "Switch Relay",
    grid: (() => {
      const g = createGrid(GRID_ROWS, GRID_COLS, "floor");
      g[0][2] = "timegate";
      g[1][1] = "wall"; g[1][3] = "wall";
      g[3][0] = "switch";
      g[4][2] = "bridge";
      g[5][0] = "playerExit";
      g[5][5] = "cloneExit";
      g[3][4] = "wall"; g[3][5] = "wall";
      return g;
    })(),
    switches: [{ id: 0, row: 3, col: 0, bridgeRow: 4, bridgeCol: 2 }],
    playerStart: [0, 0],
    cloneStart: [0, 0],
    timegateCell: [0, 2],
  },
  {
    name: "Temporal Key",
    grid: (() => {
      const g = createGrid(GRID_ROWS, GRID_COLS, "floor");
      g[0][4] = "timegate";
      g[1][0] = "wall"; g[1][1] = "wall"; g[1][2] = "wall"; g[1][3] = "wall";
      g[1][5] = "wall";
      g[2][2] = "switch";
      g[3][0] = "bridge";
      g[3][5] = "bridge";
      g[4][2] = "switch";
      g[5][0] = "playerExit";
      g[5][5] = "cloneExit";
      g[0][1] = "wall";
      return g;
    })(),
    switches: [
      { id: 0, row: 2, col: 2, bridgeRow: 3, bridgeCol: 0 },
      { id: 1, row: 4, col: 2, bridgeRow: 3, bridgeCol: 5 },
    ],
    playerStart: [0, 0],
    cloneStart: [0, 0],
    timegateCell: [0, 4],
  },
];

function cellToWorld(row: number, col: number): [number, number] {
  return [
    col * CELL_SIZE - ((GRID_COLS - 1) * CELL_SIZE) / 2,
    row * CELL_SIZE - ((GRID_ROWS - 1) * CELL_SIZE) / 2,
  ];
}

type MoveRecord = { row: number; col: number };

interface CloneData {
  recording: boolean;
  recordedMoves: MoveRecord[];
  currentMoveIdx: number;
  loopTimer: number;
  paused: boolean;
  position: { row: number; col: number };
  reachedExit: boolean;
}

function puzzleGridToTiles(level: PuzzleLevel): Tile[][] {
  return level.grid.map((row, r) =>
    row.map((type, c) => ({
      row: r,
      col: c,
      type,
      switchId: level.switches.find((s) => s.row === r && s.col === c)?.id,
      active: false,
    })),
  );
}

function TimeCloneScene({
  tiles,
  playerPosRef,
  targetPosRef,
  clonePosRef,
  cloneVisible,
  cloneGhostAlpha,
  timegateCell,
  playerExitCell,
  cloneExitCell,
}: {
  tiles: Tile[][];
  playerPosRef: React.MutableRefObject<{ x: number; z: number }>;
  targetPosRef: React.MutableRefObject<{ x: number; z: number }>;
  clonePosRef: React.MutableRefObject<{ x: number; z: number }>;
  cloneVisible: boolean;
  cloneGhostAlpha: number;
  timegateCell: [number, number];
  playerExitCell: [number, number];
  cloneExitCell: [number, number];
}) {
  const playerRef = useRef<THREE.Object3D | null>(null);
  const cloneRef = useRef<THREE.Object3D | null>(null);

  useFrame((_, delta) => {
    if (playerRef.current) {
      const lerpFactor = 1 - Math.exp(-12 * delta);
      playerPosRef.current.x += (targetPosRef.current.x - playerPosRef.current.x) * lerpFactor;
      playerPosRef.current.z += (targetPosRef.current.z - playerPosRef.current.z) * lerpFactor;
      playerRef.current.position.x = playerPosRef.current.x;
      playerRef.current.position.z = playerPosRef.current.z;
    }
    if (cloneRef.current) {
      cloneRef.current.position.x = clonePosRef.current.x;
      cloneRef.current.position.z = clonePosRef.current.z;
    }
  });

  const wallColor = "#334466";
  const floorColor = "#1a1a2e";

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 4]} intensity={1.0} castShadow />
      <pointLight position={[0, 4, 0]} intensity={10} color="#4488ff" distance={15} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[GRID_COLS * CELL_SIZE + 2, GRID_ROWS * CELL_SIZE + 2]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {tiles.flat().map((tile) => {
        const [wx, wz] = cellToWorld(tile.row, tile.col);
        if (tile.type === "wall") {
          return (
            <mesh key={`w-${tile.row}-${tile.col}`} position={[wx, 0.5, wz]} castShadow receiveShadow>
              <boxGeometry args={[CELL_SIZE * 0.9, 1, CELL_SIZE * 0.9]} />
              <meshStandardMaterial color={wallColor} roughness={0.6} metalness={0.3} />
            </mesh>
          );
        }
        if (tile.type === "bridge" && tile.active) {
          return (
            <mesh key={`br-${tile.row}-${tile.col}`} position={[wx, 0.15, wz]} receiveShadow>
              <boxGeometry args={[CELL_SIZE * 0.85, 0.1, CELL_SIZE * 0.85]} />
              <meshStandardMaterial color="#558866" emissive="#336633" emissiveIntensity={0.3} roughness={0.4} />
            </mesh>
          );
        }
        if (tile.type === "switch") {
          const color = tile.active ? "#44cc44" : "#884444";
          return (
            <mesh key={`sw-${tile.row}-${tile.col}`} position={[wx, 0.08, wz]} receiveShadow>
              <boxGeometry args={[CELL_SIZE * 0.7, 0.08, CELL_SIZE * 0.7]} />
              <meshStandardMaterial color={color} emissive={tile.active ? "#44cc44" : "#884444"} emissiveIntensity={0.4} roughness={0.3} />
            </mesh>
          );
        }
        if (tile.type === "timegate") {
          return (
            <mesh key={`tg-${tile.row}-${tile.col}`} position={[wx, 0.12, wz]}>
              <ringGeometry args={[0.45, 0.55, 32]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.8} side={THREE.DoubleSide} />
            </mesh>
          );
        }
        return null;
      })}

      <mesh position={[cellToWorld(0, 0)[0], 0.02, cellToWorld(0, 0)[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE]} />
        <meshStandardMaterial color="#222244" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {tiles.flat().map((tile) => {
        const [wx, wz] = cellToWorld(tile.row, tile.col);
        if (tile.row === timegateCell[0] && tile.col === timegateCell[1]) {
          return (
            <mesh key={`tg-ring-${tile.row}-${tile.col}`} position={[wx, 0.6, wz]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.45, 0.08, 16, 32]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.6} roughness={0.2} metalness={0.3} />
            </mesh>
          );
        }
        return null;
      })}

      <mesh position={[cellToWorld(playerExitCell[0], playerExitCell[1])[0], 0.4, cellToWorld(playerExitCell[0], playerExitCell[1])[1]]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff44" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>

      <mesh position={[cellToWorld(cloneExitCell[0], cloneExitCell[1])[0], 0.4, cellToWorld(cloneExitCell[0], cloneExitCell[1])[1]]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ff88ff" emissive="#ff44ff" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>

      <mesh ref={playerRef} position={[playerPosRef.current.x, 0.5, playerPosRef.current.z]} castShadow>
        <boxGeometry args={[0.55, 0.8, 0.55]} />
        <meshStandardMaterial color="#00ccff" emissive="#004466" emissiveIntensity={0.5} roughness={0.3} metalness={0.5} />
      </mesh>

      {cloneVisible && (
        <mesh ref={cloneRef} position={[clonePosRef.current.x, 0.5, clonePosRef.current.z]}>
          <boxGeometry args={[0.5, 0.75, 0.5]} />
          <meshStandardMaterial
            color="#ff88ff"
            emissive="#440044"
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.3}
            transparent
            opacity={cloneGhostAlpha}
          />
        </mesh>
      )}
    </group>
  );
}

export default function TimeClonePuzzleGame({
  onScoreUpdate,
  onGameOver,
}: {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, won: boolean) => void;
}) {
  const [levelIdx, setLevelIdx] = useState(0);
  const level = PUZZLE_LEVELS[levelIdx];
  const [tiles, setTiles] = useState<Tile[][]>(() => puzzleGridToTiles(level));
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [_recordingActive, setRecordingActive] = useState(false);
  const [clonePhase, setClonePhase] = useState<"none" | "recording" | "playing">("none");
  const [cloneGhostAlpha, setCloneGhostAlpha] = useState(0.5);
  const [currentStepLabel, setCurrentStepLabel] = useState("");

  const gridPosRef = useRef({ row: level.playerStart[0], col: level.playerStart[1] });
  const targetPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const playerPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const clonePosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const isMovingRef = useRef(false);
  const cloneRef = useRef<CloneData>({
    recording: false,
    recordedMoves: [],
    currentMoveIdx: 0,
    loopTimer: 0,
    paused: false,
    position: { row: level.cloneStart[0], col: level.cloneStart[1] },
    reachedExit: false,
  });
  const recordingCountRef = useRef(0);
  const playerAtExitRef = useRef(false);
  const cloneAtExitRef = useRef(false);

  const [initX, initZ] = cellToWorld(level.playerStart[0], level.playerStart[1]);
  if (targetPosRef.current.x === 0 && targetPosRef.current.z === 0) {
    targetPosRef.current = { x: initX, z: initZ };
    playerPosRef.current = { x: initX, z: initZ };
    clonePosRef.current = { x: cellToWorld(level.cloneStart[0], level.cloneStart[1])[0], z: cellToWorld(level.cloneStart[0], level.cloneStart[1])[1] };
  }

  const isWalkable = useCallback(
    (row: number, col: number): boolean => {
      if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) { return false; }
      const tile = tiles[row][col];
      if (tile.type === "wall") { return false; }
      if (tile.type === "bridge" && !tile.active) { return false; }
      return true;
    },
    [tiles],
  );

  useEffect(() => {
    setTiles(puzzleGridToTiles(level));
    gridPosRef.current = { row: level.playerStart[0], col: level.playerStart[1] };
    const [x, z] = cellToWorld(level.playerStart[0], level.playerStart[1]);
    targetPosRef.current = { x, z };
    playerPosRef.current = { x, z };
    clonePosRef.current = { x: cellToWorld(level.cloneStart[0], level.cloneStart[1])[0], z: cellToWorld(level.cloneStart[0], level.cloneStart[1])[1] };
    isMovingRef.current = false;
    cloneRef.current = {
      recording: false,
      recordedMoves: [],
      currentMoveIdx: 0,
      loopTimer: 0,
      paused: false,
      position: { row: level.cloneStart[0], col: level.cloneStart[1] },
      reachedExit: false,
    };
    recordingCountRef.current = 0;
    playerAtExitRef.current = false;
    cloneAtExitRef.current = false;
    setRecordingActive(false);
    setClonePhase("none");
    setGameWon(false);
    setCloneGhostAlpha(0.5);
    setCurrentStepLabel("");
  }, [levelIdx, level]);

  const handleSwitchToggle = useCallback(
    (tile: Tile) => {
      if (tile.type !== "switch" || tile.switchId === undefined) { return; }
      const swDef = level.switches.find((s) => s.id === tile.switchId);
      if (!swDef) { return; }

      setTiles((prev) => {
        const next = prev.map((r) => r.map((t) => ({ ...t })));
        const bridge = next[swDef.bridgeRow]?.[swDef.bridgeCol];
        if (bridge && bridge.type === "bridge") {
          const newActive = !bridge.active;
          bridge.active = newActive;
          if (next[swDef.row]?.[swDef.col]) {
            next[swDef.row][swDef.col].active = newActive;
          }
        }
        return next;
      });
    },
    [level.switches],
  );

  const playExR = level.grid.findIndex((r) => r.includes("playerExit"));
  const playExC = level.grid[playExR]?.indexOf("playerExit") ?? 0;
  const cloneExR = level.grid.findIndex((r) => r.includes("cloneExit"));
  const cloneExC = level.grid[cloneExR]?.indexOf("cloneExit") ?? 0;

  const checkWinCondition = useCallback(
    (playerRow: number, playerCol: number, cloneRow: number, cloneCol: number) => {
      const pExit = tiles[playExR]?.[playExC];
      const cExit = tiles[cloneExR]?.[cloneExC];
      if (!pExit || !cExit) { return; }
      const pOnExit = playerRow === pExit.row && playerCol === pExit.col;
      const cOnExit = cloneRow === cExit.row && cloneCol === cExit.col;

      if (pOnExit && cOnExit && !gameWon) {
        setGameWon(true);
        const levelBonus = (levelIdx + 1) * 500;
        setScore((s) => s + levelBonus + recordingCountRef.current * 50);
        onGameOver?.(score + levelBonus + recordingCountRef.current * 50, true);
      }
    },
    [tiles, gameWon, levelIdx, score, playExR, playExC, cloneExR, cloneExC, onGameOver],
  );

  const tryMove = useCallback(
    (dr: number, dc: number) => {
      if (gameWon || isMovingRef.current) { return; }

      const { row, col } = gridPosRef.current;
      const newRow = row + dr;
      const newCol = col + dc;

      if (!isWalkable(newRow, newCol)) { return; }

      gridPosRef.current = { row: newRow, col: newCol };
      const [tx, tz] = cellToWorld(newRow, newCol);
      targetPosRef.current = { x: tx, z: tz };
      isMovingRef.current = true;

      const currentTile = tiles[newRow][newCol];

      if (clonePhase === "none" && currentTile.type === "timegate") {
        setClonePhase("recording");
        setRecordingActive(true);
        cloneRef.current.recording = true;
        cloneRef.current.recordedMoves = [];
        cloneRef.current.currentMoveIdx = 0;
        cloneRef.current.position = { row: newRow, col: newCol };
        recordingCountRef.current = 0;
        setCurrentStepLabel(t("timeclone.recording"));
        onScoreUpdate?.(score + 100);
        setScore((s) => s + 100);
        return;
      }

      if (clonePhase === "recording" && cloneRef.current.recording) {
        if (recordingCountRef.current < RECORD_MAX) {
          cloneRef.current.recordedMoves.push({ row: newRow, col: newCol });
          recordingCountRef.current++;
          setCurrentStepLabel(`${t("timeclone.recording")} (${recordingCountRef.current}/${RECORD_MAX})`);
        }
        if (recordingCountRef.current >= RECORD_MAX || currentTile.type === "switch") {
          cloneRef.current.recording = false;
          setRecordingActive(false);
          setClonePhase("playing");
          cloneRef.current.currentMoveIdx = 0;
          cloneRef.current.loopTimer = CLONE_LOOP_DELAY;
          cloneRef.current.position = { row: cloneRef.current.recordedMoves[0]?.row ?? newRow, col: cloneRef.current.recordedMoves[0]?.col ?? newCol };
          setCurrentStepLabel(t("timeclone.cloneActive"));
          onScoreUpdate?.(score + 50);
          setScore((s) => s + 50);
          return;
        }
      }

      if (currentTile.type === "switch") {
        handleSwitchToggle(currentTile);
      }

      playerAtExitRef.current = newRow === playExR && newCol === playExC;
    },
    [isWalkable, clonePhase, gameWon, handleSwitchToggle, score, playExR, playExC, onScoreUpdate, tiles],
  );

  const resetLevel = useCallback(() => {
    const lvl = PUZZLE_LEVELS[levelIdx];
    setTiles(puzzleGridToTiles(lvl));
    gridPosRef.current = { row: lvl.playerStart[0], col: lvl.playerStart[1] };
    const [x, z] = cellToWorld(lvl.playerStart[0], lvl.playerStart[1]);
    targetPosRef.current = { x, z };
    playerPosRef.current = { x, z };
    clonePosRef.current = { x: cellToWorld(lvl.cloneStart[0], lvl.cloneStart[1])[0], z: cellToWorld(lvl.cloneStart[0], lvl.cloneStart[1])[1] };
    cloneRef.current = {
      recording: false,
      recordedMoves: [],
      currentMoveIdx: 0,
      loopTimer: 0,
      paused: false,
      position: { row: lvl.cloneStart[0], col: lvl.cloneStart[1] },
      reachedExit: false,
    };
    recordingCountRef.current = 0;
    playerAtExitRef.current = false;
    cloneAtExitRef.current = false;
    setRecordingActive(false);
    setClonePhase("none");
    setGameWon(false);
    setCloneGhostAlpha(0.5);
    setCurrentStepLabel("");
    isMovingRef.current = false;
  }, [levelIdx]);

  const nextLevel = useCallback(() => {
    const next = (levelIdx + 1) % PUZZLE_LEVELS.length;
    setLevelIdx(next);
  }, [levelIdx]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameWon) { return; }
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") { e.preventDefault(); tryMove(-1, 0); }
      else if (key === "s" || key === "arrowdown") { e.preventDefault(); tryMove(1, 0); }
      else if (key === "a" || key === "arrowleft") { e.preventDefault(); tryMove(0, -1); }
      else if (key === "d" || key === "arrowright") { e.preventDefault(); tryMove(0, 1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tryMove, gameWon]);

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

        const tile = tiles[row]?.[col];
        if (tile && tile.type === "switch") {
          handleSwitchToggle(tile);
        }

        checkWinCondition(
          row, col,
          cloneRef.current.position.row, cloneRef.current.position.col,
        );
      }
    }, 50);

    return () => clearInterval(interval);
  }, [tiles, handleSwitchToggle, checkWinCondition]);

  useEffect(() => {
    const cloneInterval = setInterval(() => {
      const cd = cloneRef.current;
      if (clonePhase !== "playing") { return; }
      if (cd.paused) { return; }

      if (cd.loopTimer > 0) {
        cd.loopTimer -= 0.05;
        setCloneGhostAlpha(0.3 + Math.sin(Date.now() * 0.008) * 0.2);
        return;
      }

      if (cd.recordedMoves.length === 0) { return; }

      const move = cd.recordedMoves[cd.currentMoveIdx];
      cd.position = move;
      const [cx, cz] = cellToWorld(move.row, move.col);
      clonePosRef.current = { x: cx, z: cz };

      const cloneTile = tiles[move.row]?.[move.col];
      if (cloneTile && cloneTile.type === "switch") {
        handleSwitchToggle(cloneTile);
      }

      cd.currentMoveIdx++;
      if (cd.currentMoveIdx >= cd.recordedMoves.length) {
        cd.currentMoveIdx = 0;
        cd.loopTimer = CLONE_LOOP_DELAY;
      }

      setCloneGhostAlpha(0.6);
      forceRender((r) => r + 1);
    }, 350);

    return () => clearInterval(cloneInterval);
  }, [clonePhase, tiles, handleSwitchToggle]);

  const [, forceRender] = useState(0);

  const [_pExitWX, _pExitWZ] = cellToWorld(playExR, playExC);
  const [_cExitWX, _cExitWZ] = cellToWorld(cloneExR, cloneExC);

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
        camera={{ position: [8, 10, 10], fov: 45, near: 0.1, far: 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true }}
      >
        <TimeCloneScene
          tiles={tiles}
          playerPosRef={playerPosRef}
          targetPosRef={targetPosRef}
          clonePosRef={clonePosRef}
          cloneVisible={clonePhase === "recording" || clonePhase === "playing"}
          cloneGhostAlpha={cloneGhostAlpha}
          timegateCell={level.timegateCell}
          playerExitCell={[playExR, playExC]}
          cloneExitCell={[cloneExR, cloneExC]}
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
          {t("timeclone.title")} — {level.name}
        </div>
        <div>
          {t("timeclone.score")}: <span style={{ color: "#00ff88" }}>{score}</span>
        </div>
        <div>
          {t("timeclone.level")}: <span style={{ color: "#ffaa00" }}>{levelIdx + 1}/{PUZZLE_LEVELS.length}</span>
        </div>
        <div>
          {t("timeclone.phase")}:{" "}
          <span style={{ color: clonePhase === "recording" ? "#ffaa00" : clonePhase === "playing" ? "#ff88ff" : "#8899bb" }}>
            {clonePhase === "none" ? t("timeclone.explore") : clonePhase === "recording" ? t("timeclone.recording") : t("timeclone.cloneActive")}
          </span>
        </div>
        {currentStepLabel && (
          <div style={{ color: "#aaccff", marginTop: 2, fontSize: 12 }}>{currentStepLabel}</div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(10,10,30,0.7)",
          border: "1px solid #334466",
          borderRadius: 6,
          padding: "6px 12px",
          color: "#8899bb",
          fontSize: 11,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div><span style={{ color: "#00ccff" }}>&#9632;</span> {t("timeclone.you")}</div>
        <div><span style={{ color: "#ff88ff" }}>&#9632;</span> {t("timeclone.clone")}</div>
        <div><span style={{ color: "#00ff88" }}>&#9679;</span> {t("timeclone.yourExit")}</div>
        <div><span style={{ color: "#ff44ff" }}>&#9679;</span> {t("timeclone.cloneExit")}</div>
        <div><span style={{ color: "#ffaa00" }}>&#9711;</span> {t("timeclone.timegate")}</div>
        <div><span style={{ color: "#44cc44" }}>&#9633;</span> {t("timeclone.switch")}</div>
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
        {t("timeclone.controls")}
      </div>

      {gameWon && (
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
          <div style={{ color: "#00ff88", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            {t("timeclone.win")}
          </div>
          <div style={{ color: "#c0d0ff", fontSize: 16, marginBottom: 8 }}>
            {t("timeclone.finalScore")}: {score}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={resetLevel}
              style={{
                background: "#334466", color: "#c0d0ff", border: "1px solid #5588cc",
                borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer", fontFamily: "system-ui, sans-serif",
              }}
            >
              {t("timeclone.retry")}
            </button>
            {levelIdx + 1 < PUZZLE_LEVELS.length && (
              <button
                onClick={nextLevel}
                style={{
                  background: "#448844", color: "#d0ffd0", border: "1px solid #66cc66",
                  borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer", fontFamily: "system-ui, sans-serif",
                }}
              >
                {t("timeclone.nextLevel")}
              </button>
            )}
            {levelIdx + 1 >= PUZZLE_LEVELS.length && (
              <button
                onClick={() => setLevelIdx(0)}
                style={{
                  background: "#448844", color: "#d0ffd0", border: "1px solid #66cc66",
                  borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer", fontFamily: "system-ui, sans-serif",
                }}
              >
                {t("timeclone.playAgain")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
