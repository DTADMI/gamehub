"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const GRID_SIZE = 5;
const TILE_SIZE = 1;
const TILE_HEIGHT = 0.3;

type ElementType = "fire" | "water";

interface TileData {
  x: number;
  z: number;
  height: number;
  hasFireBarrier: boolean;
  hasIceBlock: boolean;
  isFireGoal: boolean;
  isWaterGoal: boolean;
}

interface Character {
  x: number;
  z: number;
  type: ElementType;
}

function buildLevel1(): TileData[][] {
  const grid: TileData[][] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    grid[x] = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      grid[x][z] = { x, z, height: 0, hasFireBarrier: false, hasIceBlock: false, isFireGoal: false, isWaterGoal: false };
    }
  }

  grid[2][1].height = 1;
  grid[2][2].height = 1;
  grid[2][3].height = 1;
  grid[1][2].height = 1;

  grid[1][1].hasFireBarrier = true;
  grid[3][3].hasFireBarrier = true;
  grid[1][3].hasIceBlock = true;

  grid[0][4].isFireGoal = true;
  grid[4][0].isWaterGoal = true;

  return grid;
}

function buildLevel2(): TileData[][] {
  const grid: TileData[][] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    grid[x] = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      grid[x][z] = { x, z, height: 0, hasFireBarrier: false, hasIceBlock: false, isFireGoal: false, isWaterGoal: false };
    }
  }

  grid[0][2].height = 1;
  grid[1][2].height = 1;
  grid[2][2].height = 1;
  grid[3][2].height = 1;
  grid[4][2].height = 1;

  grid[4][1].height = 2;
  grid[4][3].height = 2;

  grid[1][0].hasFireBarrier = true;
  grid[1][1].hasFireBarrier = true;
  grid[3][0].hasIceBlock = true;
  grid[3][1].hasIceBlock = true;
  grid[1][4].hasIceBlock = true;
  grid[3][4].hasFireBarrier = true;
  grid[4][2].hasFireBarrier = true;

  grid[0][4].isFireGoal = true;
  grid[4][4].isWaterGoal = true;

  return grid;
}

function buildLevel3(): TileData[][] {
  const grid: TileData[][] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    grid[x] = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      grid[x][z] = { x, z, height: 0, hasFireBarrier: false, hasIceBlock: false, isFireGoal: false, isWaterGoal: false };
    }
  }

  grid[0][1].height = 1;
  grid[1][1].height = 1;
  grid[2][1].height = 1;
  grid[3][1].height = 1;
  grid[4][1].height = 1;
  grid[0][3].height = 1;
  grid[1][3].height = 1;
  grid[2][3].height = 1;
  grid[3][3].height = 1;
  grid[4][3].height = 1;

  grid[2][0].height = 1;
  grid[2][2].height = 2;
  grid[2][4].height = 1;

  grid[0][1].hasFireBarrier = true;
  grid[1][1].hasIceBlock = true;
  grid[3][1].hasIceBlock = true;
  grid[0][3].hasIceBlock = true;
  grid[3][3].hasFireBarrier = true;
  grid[4][3].hasFireBarrier = true;
  grid[2][2].hasFireBarrier = true;

  grid[4][0].isFireGoal = true;
  grid[0][4].isWaterGoal = true;

  return grid;
}

const LEVELS = [buildLevel1, buildLevel2, buildLevel3];

function PlatformTile({ tile, gridCenter }: { tile: TileData; gridCenter: number }) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT;

  let color: string;
  switch (tile.height) {
    case 0: color = "#4a7c59"; break;
    case 1: color = "#6b8e23"; break;
    case 2: color = "#8fbc8f"; break;
    default: color = "#4a7c59"; break;
  }

  return (
    <group position={[posX, y / 2, posZ]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[TILE_SIZE * 0.95, y + 0.05, TILE_SIZE * 0.95]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, y / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
        <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function FireBarrier({ tile, gridCenter }: { tile: TileData; gridCenter: number }) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT + 0.4;

  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.05;
    }
  });

  return (
    <mesh ref={ref} position={[posX, y, posZ]} castShadow>
      <boxGeometry args={[0.5, 0.6, 0.5]} />
      <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.6} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function IceBlock({ tile, gridCenter }: { tile: TileData; gridCenter: number }) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT + 0.35;

  return (
    <mesh position={[posX, y, posZ]} castShadow>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#88ccff" emissive="#4488cc" emissiveIntensity={0.2} roughness={0.1} metalness={0.3} transparent opacity={0.85} />
    </mesh>
  );
}

function GoalRing({ tile, gridCenter, type }: { tile: TileData; gridCenter: number; type: ElementType }) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT + 0.9;

  const color = type === "fire" ? "#ff8800" : "#3388ff";
  const emissive = type === "fire" ? "#ff4400" : "#1144cc";

  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 1.2;
      ref.current.position.y = y + Math.sin(Date.now() * 0.003) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={[posX, y, posZ]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.35, 0.08, 16, 32]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} roughness={0.3} metalness={0.5} />
    </mesh>
  );
}

function CharacterModel({ x, z, type, gridCenter }: { x: number; z: number; type: ElementType; gridCenter: number }) {
  const posX = x - gridCenter;
  const posZ = z - gridCenter;
  const y = 1.0;

  const color = type === "fire" ? "#ff6633" : "#3388ff";
  const emissive = type === "fire" ? "#ff3300" : "#1144cc";

  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 1.5;
      ref.current.position.y = y + Math.sin(Date.now() * 0.004) * 0.12;
    }
  });

  return (
    <group ref={ref} position={[posX, y, posZ]}>
      <mesh castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.25, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ParticleSteam({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 15;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 1] = Math.random() * 1.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.y += delta * 0.5;
      const mat = ref.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 0.8);
    }
  });

  return (
    <points ref={ref} position={position}>
      <primitive object={geometry} />
      <pointsMaterial color="#aaddff" size={0.08} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

function ParticleSpark({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 12;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 1] = Math.random() * 1.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.y += delta * 0.6;
      const mat = ref.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 0.9);
    }
  });

  return (
    <points ref={ref} position={position}>
      <primitive object={geometry} />
      <pointsMaterial color="#ff8844" size={0.08} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={1.2} color="#ddeeff" />
      <directionalLight position={[8, 12, 4]} intensity={2.5} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <directionalLight position={[-4, 6, -4]} intensity={0.6} />
      <pointLight position={[0, 6, 0]} intensity={0.4} color="#ffeedd" />
    </>
  );
}

interface EffectsState {
  id: number;
  type: "steam" | "spark";
  position: [number, number, number];
}

interface CharacterState {
  x: number;
  z: number;
  type: ElementType;
}

export function ElementalConfluxGame() {
  const [level, setLevel] = useState(0);
  const [grid, setGrid] = useState<TileData[][]>(() => LEVELS[0]());
  const [fireChar, setFireChar] = useState<CharacterState>({ x: 0, z: 0, type: "fire" });
  const [waterChar, setWaterChar] = useState<CharacterState>({ x: 0, z: 4, type: "water" });
  const [activeChar, setActiveChar] = useState<ElementType>("fire");
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fireReachedGoal, setFireReachedGoal] = useState(false);
  const [waterReachedGoal, setWaterReachedGoal] = useState(false);
  const [effects, setEffects] = useState<EffectsState[]>([]);
  const effectIdRef = useRef(0);

  const addEffect = useCallback((type: "steam" | "spark", pos: [number, number, number]) => {
    const id = ++effectIdRef.current;
    setEffects((prev) => [...prev, { id, type, position: pos }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 1500);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!isComplete) {
        setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 500);
    return () => clearInterval(iv);
  }, [startTime, isComplete]);

  const gridCenter = (GRID_SIZE - 1) / 2;

  const checkGoalReached = useCallback(
    (x: number, z: number, type: ElementType) => {
      const tile = grid[x]?.[z];
      if (!tile) return false;
      if (type === "fire") return tile.isFireGoal;
      return tile.isWaterGoal;
    },
    [grid],
  );

  const isBlocked = useCallback(
    (x: number, z: number, movingChar: ElementType) => {
      const tile = grid[x]?.[z];
      if (!tile) return true;
      if (movingChar === "water" && tile.hasFireBarrier) return true;
      if (movingChar === "fire" && tile.hasIceBlock) return true;
      return false;
    },
    [grid],
  );

  const canStepHeight = useCallback(
    (fromX: number, fromZ: number, toX: number, toZ: number) => {
      const fromH = grid[fromX]?.[fromZ]?.height ?? 0;
      const toH = grid[toX]?.[toZ]?.height ?? 0;
      return Math.abs(toH - fromH) <= 1;
    },
    [grid],
  );

  const moveCharacter = useCallback(
    (dx: number, dz: number) => {
      const char = activeChar === "fire" ? fireChar : waterChar;
      const nx = char.x + dx;
      const nz = char.z + dz;

      if (nx < 0 || nx >= GRID_SIZE || nz < 0 || nz >= GRID_SIZE) return;
      if (!canStepHeight(char.x, char.z, nx, nz)) return;
      if (isBlocked(nx, nz, activeChar)) return;

      const otherChar = activeChar === "fire" ? waterChar : fireChar;
      if (otherChar.x === nx && otherChar.z === nz) return;

      setMoves((m) => m + 1);

      if (activeChar === "fire") {
        const newFire = { ...fireChar, x: nx, z: nz };
        setFireChar(newFire);
        if (checkGoalReached(nx, nz, "fire")) {
          setFireReachedGoal(true);
        }
      } else {
        const newWater = { ...waterChar, x: nx, z: nz };
        setWaterChar(newWater);
        if (checkGoalReached(nx, nz, "water")) {
          setWaterReachedGoal(true);
        }
      }
    },
    [activeChar, fireChar, waterChar, canStepHeight, isBlocked, checkGoalReached],
  );

  const activateAbility = useCallback(() => {
    const char = activeChar === "fire" ? fireChar : waterChar;
    const positions = [
      [char.x - 1, char.z],
      [char.x + 1, char.z],
      [char.x, char.z - 1],
      [char.x, char.z + 1],
      [char.x, char.z],
    ] as const;

    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const tileHeight = grid[char.x]?.[char.z]?.height ?? 0;
    const effectY = tileHeight * TILE_HEIGHT + 0.6;

    if (activeChar === "fire") {
      let melted = false;
      const newGrid = grid.map((row) =>
        row.map((t) => {
          const match = positions.some(([px, pz]) => px === t.x && pz === t.z);
          if (match && t.hasIceBlock) {
            melted = true;
            return { ...t, hasIceBlock: false };
          }
          return t;
        }),
      );
      if (melted) {
        setGrid(newGrid);
        addEffect("steam", [gx, effectY, gz]);
        setMoves((m) => m + 1);
      }
    } else {
      let doused = false;
      const newGrid = grid.map((row) =>
        row.map((t) => {
          const match = positions.some(([px, pz]) => px === t.x && pz === t.z);
          if (match && t.hasFireBarrier) {
            doused = true;
            return { ...t, hasFireBarrier: false };
          }
          return t;
        }),
      );
      if (doused) {
        setGrid(newGrid);
        addEffect("spark", [gx, effectY, gz]);
        setMoves((m) => m + 1);
      }
    }
  }, [activeChar, fireChar, waterChar, grid, gridCenter, addEffect]);

  useEffect(() => {
    if (fireReachedGoal && waterReachedGoal && !isComplete) {
      setIsComplete(true);
    }
  }, [fireReachedGoal, waterReachedGoal, isComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isComplete) return;

      switch (e.key) {
        case "Tab":
        case "1":
          e.preventDefault();
          setActiveChar("fire");
          break;
        case "2":
          e.preventDefault();
          setActiveChar("water");
          break;
        case "w":
        case "W":
        case "ArrowUp":
          e.preventDefault();
          moveCharacter(0, -1);
          break;
        case "s":
        case "S":
        case "ArrowDown":
          e.preventDefault();
          moveCharacter(0, 1);
          break;
        case "a":
        case "A":
        case "ArrowLeft":
          e.preventDefault();
          moveCharacter(-1, 0);
          break;
        case "d":
        case "D":
        case "ArrowRight":
          e.preventDefault();
          moveCharacter(1, 0);
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (activeChar === "fire") activateAbility();
          break;
        case "q":
        case "Q":
          e.preventDefault();
          if (activeChar === "water") activateAbility();
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveCharacter, activateAbility, activeChar, isComplete]);

  const restartLevel = useCallback(() => {
    setGrid(LEVELS[level]());
    setFireChar({ x: 0, z: 0, type: "fire" });
    setWaterChar({ x: 0, z: 4, type: "water" });
    setActiveChar("fire");
    setMoves(0);
    setIsComplete(false);
    setFireReachedGoal(false);
    setWaterReachedGoal(false);
    setEffects([]);
  }, [level]);

  const nextLevel = useCallback(() => {
    if (level + 1 >= LEVELS.length) {
      setLevel(0);
      setGrid(LEVELS[0]());
    } else {
      const next = level + 1;
      setLevel(next);
      setGrid(LEVELS[next]());
    }
    setFireChar({ x: 0, z: 0, type: "fire" });
    setWaterChar({ x: 0, z: 4, type: "water" });
    setActiveChar("fire");
    setMoves(0);
    setIsComplete(false);
    setFireReachedGoal(false);
    setWaterReachedGoal(false);
    setEffects([]);
  }, [level]);

  const score = useMemo(() => {
    const timeScore = Math.max(0, 300 - elapsedSec) * 10;
    const moveScore = Math.max(0, 200 - moves) * 5;
    return timeScore + moveScore + (fireReachedGoal ? 500 : 0) + (waterReachedGoal ? 500 : 0);
  }, [elapsedSec, moves, fireReachedGoal, waterReachedGoal]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#1a1a2e" }}>
      <Canvas
        shadows
        camera={{ position: [6, 8, 6], fov: 45, near: 0.1, far: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <SceneLights />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          target={[0, 0.5, 0]}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={4}
          maxDistance={14}
        />

        <group position={[0, 0, 0]}>
          {grid.flat().map((tile) => (
            <PlatformTile key={`tile-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />
          ))}
          {grid.flat().map((tile) => {
            if (tile.hasFireBarrier) {
              return <FireBarrier key={`fb-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;
            }
            return null;
          })}
          {grid.flat().map((tile) => {
            if (tile.hasIceBlock) {
              return <IceBlock key={`ib-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;
            }
            return null;
          })}
          {grid.flat().map((tile) => {
            if (tile.isFireGoal) {
              return <GoalRing key={`fg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="fire" />;
            }
            return null;
          })}
          {grid.flat().map((tile) => {
            if (tile.isWaterGoal) {
              return <GoalRing key={`wg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="water" />;
            }
            return null;
          })}
          <CharacterModel x={fireChar.x} z={fireChar.z} type="fire" gridCenter={gridCenter} />
          <CharacterModel x={waterChar.x} z={waterChar.z} type="water" gridCenter={gridCenter} />
          {effects.map((e) =>
            e.type === "steam" ? (
              <ParticleSteam key={e.id} position={e.position} />
            ) : (
              <ParticleSpark key={e.id} position={e.position} />
            ),
          )}
        </group>
      </Canvas>

      {/* HUD */}
      <div style={{
        position: "absolute", top: 10, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 20,
        fontFamily: "monospace", color: "white", pointerEvents: "none", zIndex: 10,
      }}>
        <div style={{
          background: "rgba(0,0,0,0.6)", padding: "6px 18px", borderRadius: 8,
          border: activeChar === "fire" ? "2px solid #ff6633" : "2px solid transparent",
        }}>
          <span style={{ color: "#ff6633", fontWeight: "bold" }}>1</span> Fire
          {activeChar === "fire" && <span style={{ marginLeft: 6, fontSize: 11 }}>&#9664; active</span>}
        </div>
        <div style={{
          background: "rgba(0,0,0,0.6)", padding: "6px 18px", borderRadius: 8,
          border: activeChar === "water" ? "2px solid #3388ff" : "2px solid transparent",
        }}>
          <span style={{ color: "#3388ff", fontWeight: "bold" }}>2</span> Water
          {activeChar === "water" && <span style={{ marginLeft: 6, fontSize: 11 }}>&#9664; active</span>}
        </div>
        <div style={{ background: "rgba(0,0,0,0.6)", padding: "6px 18px", borderRadius: 8 }}>
          <span style={{ color: "#ffaa33" }}><b>F</b> Melt Ice</span>
        </div>
        <div style={{ background: "rgba(0,0,0,0.6)", padding: "6px 18px", borderRadius: 8 }}>
          <span style={{ color: "#66aaff" }}><b>Q</b> Douse Fire</span>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 10, left: 10,
        fontFamily: "monospace", fontSize: 12, color: "white",
        background: "rgba(0,0,0,0.5)", padding: "6px 12px", borderRadius: 6,
        pointerEvents: "none", zIndex: 10,
      }}>
        WASD/Arrows: Move | Tab/1/2: Switch | F: Fire | Q: Water
      </div>

      <div style={{
        position: "absolute", bottom: 10, right: 10,
        fontFamily: "monospace", fontSize: 12, color: "white",
        background: "rgba(0,0,0,0.5)", padding: "6px 12px", borderRadius: 6,
        pointerEvents: "none", zIndex: 10,
      }}>
        Level {level + 1} | Moves: {moves} | Time: {elapsedSec}s
      </div>

      {isComplete && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.7)", zIndex: 20,
        }}>
          <div style={{
            background: "rgba(30,30,50,0.95)", padding: "30px 50px", borderRadius: 16,
            textAlign: "center", color: "white", fontFamily: "monospace",
            border: "2px solid #66cc66",
          }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 28, color: "#66cc66" }}>Level Complete!</h2>
            <p style={{ margin: "4px 0", fontSize: 16 }}>Fire: <span style={{ color: "#ff6633" }}>{fireReachedGoal ? "Rescued" : "Not rescued"}</span></p>
            <p style={{ margin: "4px 0", fontSize: 16 }}>Water: <span style={{ color: "#3388ff" }}>{waterReachedGoal ? "Rescued" : "Not rescued"}</span></p>
            <p style={{ margin: "4px 0", fontSize: 16 }}>Time: {elapsedSec}s | Moves: {moves}</p>
            <p style={{ margin: "8px 0", fontSize: 20, fontWeight: "bold", color: "#ffcc00" }}>Score: {score}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button
                onClick={restartLevel}
                style={{
                  padding: "8px 20px", fontSize: 14, fontFamily: "monospace",
                  background: "#555", color: "white", border: "none", borderRadius: 6,
                  cursor: "pointer", pointerEvents: "auto",
                }}
              >
                Restart
              </button>
              {level + 1 < LEVELS.length && (
                <button
                  onClick={nextLevel}
                  style={{
                    padding: "8px 20px", fontSize: 14, fontFamily: "monospace",
                    background: "#3388ff", color: "white", border: "none", borderRadius: 6,
                    cursor: "pointer", pointerEvents: "auto",
                  }}
                >
                  Next Level
                </button>
              )}
              {level + 1 >= LEVELS.length && (
                <button
                  onClick={nextLevel}
                  style={{
                    padding: "8px 20px", fontSize: 14, fontFamily: "monospace",
                    background: "#66cc66", color: "white", border: "none", borderRadius: 6,
                    cursor: "pointer", pointerEvents: "auto",
                  }}
                >
                  Play Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goal status indicators */}
      <div style={{
        position: "absolute", top: 60, right: 10, display: "flex", flexDirection: "column", gap: 6,
        fontFamily: "monospace", fontSize: 12, color: "white", zIndex: 10,
        pointerEvents: "none",
      }}>
        <div style={{ background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#ff6633" }}>Fire Goal:</span>
          <span style={{ color: fireReachedGoal ? "#66cc66" : "#ff4444" }}>{fireReachedGoal ? "Reached" : "Pending"}</span>
        </div>
        <div style={{ background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#3388ff" }}>Water Goal:</span>
          <span style={{ color: waterReachedGoal ? "#66cc66" : "#ff4444" }}>{waterReachedGoal ? "Reached" : "Pending"}</span>
        </div>
      </div>
    </div>
  );
}
