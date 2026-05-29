"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { t } from "@gamehub/game-platform/lib/i18n";

const GRID_SIZE = 6;
const TILE_SIZE = 1;
const TILE_HEIGHT = 0.3;

type ElementType = "fire" | "water" | "earth" | "air";

interface TileData {
  x: number;
  z: number;
  height: number;
  maxHeight: number;
  hasFireBarrier: boolean;
  hasIceBlock: boolean;
  hasPushBlock: boolean;
  hasHiddenPlatform: boolean;
  hiddenRevealed: boolean;
  isMud: boolean;
  isFireGoal: boolean;
  isWaterGoal: boolean;
  isEarthGoal: boolean;
  isAirGoal: boolean;
  pillarId?: number;
}

interface Character {
  x: number;
  z: number;
  type: ElementType;
}

function buildPuzzle1(): TileData[][] {
  const grid: TileData[][] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    grid[x] = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      grid[x][z] = {
        x, z, height: 0, maxHeight: 2,
        hasFireBarrier: false, hasIceBlock: false, hasPushBlock: false,
        hasHiddenPlatform: false, hiddenRevealed: false,
        isMud: false, isFireGoal: false, isWaterGoal: false,
        isEarthGoal: false, isAirGoal: false,
      };
    }
  }

  grid[2][0].height = 1; grid[2][1].height = 1; grid[2][2].height = 1;
  grid[2][3].height = 1; grid[2][4].height = 1; grid[2][5].height = 1;

  grid[3][2].hasPushBlock = true;
  grid[3][4].hasFireBarrier = true;
  grid[1][3].hasIceBlock = true;

  grid[0][0].height = 0; grid[0][1].height = 0; grid[0][2].height = 0;
  grid[2][0].isEarthGoal = true;
  grid[2][5].isAirGoal = true;

  grid[5][2].isFireGoal = true;
  grid[5][5].isWaterGoal = true;

  return grid;
}

function buildPuzzle2(): TileData[][] {
  const grid: TileData[][] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    grid[x] = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      grid[x][z] = {
        x, z, height: 0, maxHeight: 2,
        hasFireBarrier: false, hasIceBlock: false, hasPushBlock: false,
        hasHiddenPlatform: false, hiddenRevealed: false,
        isMud: false, isFireGoal: false, isWaterGoal: false,
        isEarthGoal: false, isAirGoal: false,
      };
    }
  }

  grid[1][0].height = 1; grid[1][1].height = 1; grid[1][2].height = 1;
  grid[1][3].height = 1; grid[1][4].height = 1; grid[1][5].height = 1;
  grid[3][0].height = 1; grid[3][1].height = 1; grid[3][2].height = 1;
  grid[3][3].height = 1; grid[3][4].height = 1; grid[3][5].height = 1;

  grid[2][1].height = 0;
  grid[2][4].height = 0;

  grid[4][2].hasPushBlock = true;
  grid[4][3].hasPushBlock = true;

  grid[0][1].hasFireBarrier = true;
  grid[0][3].hasIceBlock = true;
  grid[5][2].hasFireBarrier = true;

  grid[2][0].hasHiddenPlatform = true;
  grid[2][5].hasHiddenPlatform = true;

  grid[0][4].isFireGoal = true;
  grid[5][0].isWaterGoal = true;
  grid[1][0].isEarthGoal = true;
  grid[3][5].isAirGoal = true;

  return grid;
}

function buildPuzzle3(): TileData[][] {
  const grid: TileData[][] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    grid[x] = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      grid[x][z] = {
        x, z, height: 0, maxHeight: 2,
        hasFireBarrier: false, hasIceBlock: false, hasPushBlock: false,
        hasHiddenPlatform: false, hiddenRevealed: false,
        isMud: false, isFireGoal: false, isWaterGoal: false,
        isEarthGoal: false, isAirGoal: false,
      };
    }
  }

  grid[0][2].height = 1; grid[1][2].height = 1;
  grid[3][2].height = 1; grid[4][2].height = 1; grid[5][2].height = 1;

  grid[2][0].height = 1; grid[2][1].height = 1;
  grid[2][3].height = 1; grid[2][4].height = 1; grid[2][5].height = 1;

  grid[0][3].hasPushBlock = true;
  grid[3][0].hasPushBlock = true;
  grid[4][5].hasPushBlock = true;

  grid[1][1].hasFireBarrier = true;
  grid[1][3].hasIceBlock = true;
  grid[3][1].hasIceBlock = true;
  grid[4][4].hasFireBarrier = true;

  grid[2][0].hasHiddenPlatform = true;
  grid[2][5].hasHiddenPlatform = true;
  grid[5][1].hasHiddenPlatform = true;

  grid[5][3].isFireGoal = true;
  grid[0][0].isWaterGoal = true;
  grid[5][0].isEarthGoal = true;
  grid[0][5].isAirGoal = true;

  return grid;
}

const PUZZLE_LEVELS = [buildPuzzle1, buildPuzzle2, buildPuzzle3];

function PlatformTile({ tile, gridCenter }: { tile: TileData; gridCenter: number }) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT;

  let color: string;
  if (tile.isMud) {
    color = "#6b5b3a";
  } else {
    switch (tile.height) {
      case 0: color = "#4a7c59"; break;
      case 1: color = "#6b8e23"; break;
      case 2: color = "#8fbc8f"; break;
      default: color = "#a0c0a0"; break;
    }
  }

  return (
    <group position={[posX, y / 2, posZ]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[TILE_SIZE * 0.95, y + 0.05, TILE_SIZE * 0.95]} />
        <meshStandardMaterial color={color} roughness={tile.isMud ? 0.9 : 0.8} />
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

function PushBlock({ tile, gridCenter }: { tile: TileData; gridCenter: number }) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT + 0.3;
  return (
    <mesh position={[posX, y, posZ]} castShadow>
      <boxGeometry args={[0.6, 0.4, 0.6]} />
      <meshStandardMaterial color="#dddddd" roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

function HiddenPlatform({ tile, gridCenter }: { tile: TileData; gridCenter: number }) {
  if (!tile.hiddenRevealed) return null;
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT + 0.02;
  return (
    <mesh position={[posX, y, posZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
      <meshStandardMaterial color="#88ccff" emissive="#4488cc" emissiveIntensity={0.4} roughness={0.2} side={THREE.DoubleSide} transparent opacity={0.85} />
    </mesh>
  );
}

function GoalRing({ tile, gridCenter, type }: { tile: TileData; gridCenter: number; type: ElementType }) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT + 0.9;
  const colors: Record<ElementType, { main: string; emissive: string }> = {
    fire: { main: "#ff8800", emissive: "#ff4400" },
    water: { main: "#3388ff", emissive: "#1144cc" },
    earth: { main: "#44cc44", emissive: "#228822" },
    air: { main: "#eeeeff", emissive: "#8888cc" },
  };
  const { main, emissive } = colors[type];
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
      <meshStandardMaterial color={main} emissive={emissive} emissiveIntensity={0.5} roughness={0.3} metalness={0.5} />
    </mesh>
  );
}

function CharacterModel({ x, z, type, isActive, gridCenter }: { x: number; z: number; type: ElementType; isActive: boolean; gridCenter: number }) {
  const posX = x - gridCenter;
  const posZ = z - gridCenter;
  const tileY = 1.0;
  const colors: Record<ElementType, { main: string; emissive: string }> = {
    fire: { main: "#ff6633", emissive: "#ff3300" },
    water: { main: "#3388ff", emissive: "#1144cc" },
    earth: { main: "#44cc44", emissive: "#228822" },
    air: { main: "#ccccff", emissive: "#8888cc" },
  };
  const { main, emissive } = colors[type];
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 1.5;
      ref.current.position.y = tileY + Math.sin(Date.now() * 0.004) * 0.12;
    }
  });
  const scale = isActive ? 1.2 : 1.0;
  return (
    <group ref={ref} position={[posX, tileY, posZ]} scale={[scale, scale, scale]}>
      <mesh castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={main} emissive={emissive} emissiveIntensity={isActive ? 0.7 : 0.4} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.25, 16]} />
        <meshStandardMaterial color={main} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ParticleEffect({ position, color, type }: { position: [number, number, number]; color: string; type: string }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = type === "tornado" ? 25 : 15;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * (type === "tornado" ? 1.5 : 0.8);
      pos[i * 3 + 1] = Math.random() * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * (type === "tornado" ? 1.5 : 0.8);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [type]);
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
      <pointsMaterial color={color} size={0.08} transparent opacity={0.7} depthWrite={false} />
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
  type: "steam" | "spark" | "mud" | "tornado";
  position: [number, number, number];
  color: string;
}

export function ElementalConfluxGame({
  onScoreUpdate,
  onGameOver,
}: {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}) {
  const [level, setLevel] = useState(0);
  const [grid, setGrid] = useState<TileData[][]>(() => PUZZLE_LEVELS[0]());
  const [chars, setChars] = useState<Record<ElementType, Character>>(() => ({
    fire: { x: 0, z: 0, type: "fire" },
    water: { x: 0, z: 5, type: "water" },
    earth: { x: 5, z: 0, type: "earth" },
    air: { x: 5, z: 5, type: "air" },
  }));
  const [activeChar, setActiveChar] = useState<ElementType>("fire");
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [goalsReached, setGoalsReached] = useState<Record<ElementType, boolean>>({
    fire: false, water: false, earth: false, air: false,
  });
  const [effects, setEffects] = useState<EffectsState[]>([]);
  const effectIdRef = useRef(0);

  const addEffect = useCallback((type: EffectsState["type"], color: string, pos: [number, number, number]) => {
    const id = ++effectIdRef.current;
    setEffects((prev) => [...prev, { id, type, position: pos, color }]);
    setTimeout(() => setEffects((prev) => prev.filter((e) => e.id !== id)), 2000);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!isComplete) setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(iv);
  }, [startTime, isComplete]);

  const gridCenter = (GRID_SIZE - 1) / 2;

  const checkGoalReached = useCallback(
    (x: number, z: number, type: ElementType) => {
      const tile = grid[x]?.[z];
      if (!tile) return false;
      switch (type) {
        case "fire": return tile.isFireGoal;
        case "water": return tile.isWaterGoal;
        case "earth": return tile.isEarthGoal;
        case "air": return tile.isAirGoal;
      }
    },
    [grid],
  );

  const isBlocked = useCallback(
    (x: number, z: number, movingChar: ElementType): boolean => {
      const tile = grid[x]?.[z];
      if (!tile) return true;
      if (tile.isMud) return true;
      if (tile.hasPushBlock) return true;
      if (tile.hasHiddenPlatform && !tile.hiddenRevealed && tile.height === 0) return true;
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
      if (grid[toX]?.[toZ]?.hasHiddenPlatform && !grid[toX]?.[toZ]?.hiddenRevealed) return true;
      return Math.abs(toH - fromH) <= 1;
    },
    [grid],
  );

  const moveCharacter = useCallback(
    (dx: number, dz: number) => {
      const char = chars[activeChar];
      const nx = char.x + dx;
      const nz = char.z + dz;

      if (nx < 0 || nx >= GRID_SIZE || nz < 0 || nz >= GRID_SIZE) return;
      if (!canStepHeight(char.x, char.z, nx, nz)) return;
      if (isBlocked(nx, nz, activeChar)) return;

      const others = (Object.keys(chars) as ElementType[]).filter((k) => k !== activeChar);
      if (others.some((k) => chars[k].x === nx && chars[k].z === nz)) return;

      setMoves((m) => m + 1);

      setChars((prev) => {
        const next = { ...prev };
        next[activeChar] = { ...next[activeChar], x: nx, z: nz };
        return next;
      });

      if (checkGoalReached(nx, nz, activeChar)) {
        setGoalsReached((prev) => ({ ...prev, [activeChar]: true }));
      }
    },
    [activeChar, chars, canStepHeight, isBlocked, checkGoalReached],
  );

  const activateEarth = useCallback(() => {
    const char = chars.earth;
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;

    const adjacent = [
      [char.x - 1, char.z], [char.x + 1, char.z],
      [char.x, char.z - 1], [char.x, char.z + 1],
    ];

    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      let changed = false;
      for (const [ax, az] of adjacent) {
        if (ax < 0 || ax >= GRID_SIZE || az < 0 || az >= GRID_SIZE) continue;
        const tile = next[ax][az];
        if (tile.height < tile.maxHeight) {
          tile.height = Math.min(tile.height + 1, tile.maxHeight);
          changed = true;
        } else if (tile.height > 0) {
          tile.height = Math.max(0, tile.height - 1);
          changed = true;
        }
      }
      if (changed) {
        setMoves((m) => m + 1);
        addEffect("spark", "#44cc44", [gx, effectY, gz]);
      }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect]);

  const activateAir = useCallback(() => {
    const char = chars.air;
    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;

    let pushed = false;
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      for (const [dx, dz] of directions) {
        const tx = char.x + dx;
        const tz = char.z + dz;
        if (tx < 0 || tx >= GRID_SIZE || tz < 0 || tz >= GRID_SIZE) continue;
        if (!next[tx][tz].hasPushBlock) continue;

        const destX = tx + dx;
        const destZ = tz + dz;
        if (destX < 0 || destX >= GRID_SIZE || destZ < 0 || destZ >= GRID_SIZE) continue;
        const destTile = next[destX][destZ];
        if (destTile.hasFireBarrier || destTile.hasIceBlock || destTile.hasPushBlock) continue;
        const charThere = (Object.keys(chars) as ElementType[]).some((k) => chars[k].x === destX && chars[k].z === destZ);
        if (charThere) continue;

        next[tx][tz].hasPushBlock = false;
        next[destX][destZ].hasPushBlock = true;
        pushed = true;
        break;
      }
      if (pushed) {
        setMoves((m) => m + 1);
        addEffect("spark", "#ccccff", [gx, effectY, gz]);
      }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect]);

  const activateFire = useCallback(() => {
    const char = chars.fire;
    const positions = [
      [char.x - 1, char.z], [char.x + 1, char.z],
      [char.x, char.z - 1], [char.x, char.z + 1], [char.x, char.z],
    ];
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;

    let melted = false;
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      for (const [px, pz] of positions) {
        if (px < 0 || px >= GRID_SIZE || pz < 0 || pz >= GRID_SIZE) continue;
        if (next[px][pz].hasIceBlock) {
          next[px][pz].hasIceBlock = false;
          melted = true;
        }
      }
      if (melted) {
        setMoves((m) => m + 1);
        addEffect("steam", "#aaddff", [gx, effectY, gz]);
      }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect]);

  const activateWater = useCallback(() => {
    const char = chars.water;
    const positions = [
      [char.x - 1, char.z], [char.x + 1, char.z],
      [char.x, char.z - 1], [char.x, char.z + 1], [char.x, char.z],
    ];
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;

    let doused = false;
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      for (const [px, pz] of positions) {
        if (px < 0 || px >= GRID_SIZE || pz < 0 || pz >= GRID_SIZE) continue;
        if (next[px][pz].hasFireBarrier) {
          next[px][pz].hasFireBarrier = false;
          doused = true;
        }
      }
      if (doused) {
        setMoves((m) => m + 1);
        addEffect("spark", "#ff8844", [gx, effectY, gz]);
      }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect]);

  const checkCombinations = useCallback(
    (atX: number, atZ: number, _charType: ElementType) => {
      const nearby: Set<ElementType> = new Set();
      for (const k of Object.keys(chars) as ElementType[]) {
        const c = chars[k];
        if (Math.abs(c.x - atX) + Math.abs(c.z - atZ) <= 1) {
          nearby.add(k);
        }
      }

      const gx = atX - gridCenter;
      const gz = atZ - gridCenter;
      const effectY = (grid[atX]?.[atZ]?.height ?? 0) * TILE_HEIGHT + 0.8;

      if (nearby.has("fire") && nearby.has("air")) {
        setGrid((prev) => {
          const next = prev.map((r) => r.map((t) => ({ ...t })));
          if (atX >= 0 && atX < GRID_SIZE) {
            for (let zz = 0; zz < GRID_SIZE; zz++) {
              next[atX][zz].hasFireBarrier = false;
              next[atX][zz].hasIceBlock = false;
            }
          }
          addEffect("tornado", "#ff8844", [gx, effectY, gz]);
          setMoves((m) => m + 1);
          return next;
        });
      }

      if (nearby.has("water") && nearby.has("earth")) {
        setGrid((prev) => {
          const next = prev.map((r) => r.map((t) => ({ ...t })));
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              const tx = atX + dx;
              const tz = atZ + dz;
              if (tx < 0 || tx >= GRID_SIZE || tz < 0 || tz >= GRID_SIZE) continue;
              next[tx][tz].isMud = true;
            }
          }
          addEffect("mud", "#6b5b3a", [gx, effectY, gz]);
          setMoves((m) => m + 1);
          return next;
        });
      }

      if (nearby.has("fire") && nearby.has("water")) {
        setGrid((prev) => {
          const next = prev.map((r) => r.map((t) => ({ ...t })));
          for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
              const tx = atX + dx;
              const tz = atZ + dz;
              if (tx < 0 || tx >= GRID_SIZE || tz < 0 || tz >= GRID_SIZE) continue;
              if (next[tx][tz].hasHiddenPlatform) {
                next[tx][tz].hiddenRevealed = true;
                next[tx][tz].height = 1;
              }
            }
          }
          addEffect("steam", "#aaddff", [gx, effectY, gz]);
          setMoves((m) => m + 1);
          return next;
        });
      }
    },
    [chars, grid, gridCenter, addEffect],
  );

  const activateAbility = useCallback(() => {
    switch (activeChar) {
      case "fire": activateFire(); break;
      case "water": activateWater(); break;
      case "earth": activateEarth(); break;
      case "air": activateAir(); break;
    }

    const char = chars[activeChar];
    checkCombinations(char.x, char.z, activeChar);
  }, [activeChar, activateFire, activateWater, activateEarth, activateAir, checkCombinations, chars]);

  const allGoalsReached = goalsReached.fire && goalsReached.water && goalsReached.earth && goalsReached.air;

  useEffect(() => {
    if (allGoalsReached && !isComplete) {
      setIsComplete(true);
    }
  }, [allGoalsReached, isComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isComplete) return;
      const key = e.key;
      switch (key) {
        case "Tab": case "1":
          e.preventDefault(); setActiveChar("fire"); break;
        case "2":
          e.preventDefault(); setActiveChar("water"); break;
        case "3":
          e.preventDefault(); setActiveChar("earth"); break;
        case "4":
          e.preventDefault(); setActiveChar("air"); break;
        case "w": case "W": case "ArrowUp":
          e.preventDefault(); moveCharacter(0, -1); break;
        case "s": case "S": case "ArrowDown":
          e.preventDefault(); moveCharacter(0, 1); break;
        case "a": case "A": case "ArrowLeft":
          e.preventDefault(); moveCharacter(-1, 0); break;
        case "d": case "D": case "ArrowRight":
          e.preventDefault(); moveCharacter(1, 0); break;
        case "f": case "F":
          e.preventDefault(); if (activeChar === "fire") activateAbility(); break;
        case "q": case "Q":
          e.preventDefault(); if (activeChar === "water") activateAbility(); break;
        case "g": case "G":
          e.preventDefault(); if (activeChar === "earth") activateAbility(); break;
        case " ":
          e.preventDefault(); if (activeChar === "air") activateAbility(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveCharacter, activateAbility, activeChar, isComplete]);

  const restartLevel = useCallback(() => {
    setGrid(PUZZLE_LEVELS[level]());
    setChars({
      fire: { x: 0, z: 0, type: "fire" },
      water: { x: 0, z: 5, type: "water" },
      earth: { x: 5, z: 0, type: "earth" },
      air: { x: 5, z: 5, type: "air" },
    });
    setActiveChar("fire");
    setMoves(0);
    setIsComplete(false);
    setGoalsReached({ fire: false, water: false, earth: false, air: false });
    setEffects([]);
  }, [level]);

  const nextLevel = useCallback(() => {
    const next = (level + 1) % PUZZLE_LEVELS.length;
    setLevel(next);
    setGrid(PUZZLE_LEVELS[next]());
    setChars({
      fire: { x: 0, z: 0, type: "fire" },
      water: { x: 0, z: 5, type: "water" },
      earth: { x: 5, z: 0, type: "earth" },
      air: { x: 5, z: 5, type: "air" },
    });
    setActiveChar("fire");
    setMoves(0);
    setIsComplete(false);
    setGoalsReached({ fire: false, water: false, earth: false, air: false });
    setEffects([]);
  }, [level]);

  const score = useMemo(() => {
    const timeScore = Math.max(0, 300 - elapsedSec) * 10;
    const moveScore = Math.max(0, 300 - moves) * 5;
    const goals = Object.values(goalsReached).filter(Boolean).length;
    return timeScore + moveScore + goals * 500;
  }, [elapsedSec, moves, goalsReached]);

  useEffect(() => { onScoreUpdate?.(score); }, [score]);
  useEffect(() => { if (isComplete) onGameOver?.(score); }, [isComplete]);

  const elementInfo: { key: ElementType; num: string; color: string; label: string; abilityLabel: string; abilityKey: string }[] = [
    { key: "fire", num: "1", color: "#ff6633", label: "Fire", abilityLabel: "Melt Ice", abilityKey: "F" },
    { key: "water", num: "2", color: "#3388ff", label: "Water", abilityLabel: "Douse Fire", abilityKey: "Q" },
    { key: "earth", num: "3", color: "#44cc44", label: "Earth", abilityLabel: "Raise/Lower", abilityKey: "G" },
    { key: "air", num: "4", color: "#ccccff", label: "Air", abilityLabel: "Push Block", abilityKey: "Space" },
  ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#1a1a2e" }}>
      <Canvas
        shadows
        camera={{ position: [7, 8, 7], fov: 45, near: 0.1, far: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <SceneLights />
        <OrbitControls
          enableDamping dampingFactor={0.08}
          target={[0, 0.5, 0]}
          minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2}
          minDistance={4} maxDistance={16}
        />
        <group position={[0, 0, 0]}>
          {grid.flat().map((tile) => (
            <PlatformTile key={`tile-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />
          ))}
          {grid.flat().map((tile) => {
            if (tile.hasHiddenPlatform) return <HiddenPlatform key={`hp-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;
            return null;
          })}
          {grid.flat().map((tile) => {
            if (tile.hasFireBarrier) return <FireBarrier key={`fb-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;
            if (tile.hasIceBlock) return <IceBlock key={`ib-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;
            if (tile.hasPushBlock) return <PushBlock key={`pb-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;
            return null;
          })}
          {grid.flat().map((tile) => {
            if (tile.isFireGoal) return <GoalRing key={`fg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="fire" />;
            if (tile.isWaterGoal) return <GoalRing key={`wg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="water" />;
            if (tile.isEarthGoal) return <GoalRing key={`eg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="earth" />;
            if (tile.isAirGoal) return <GoalRing key={`ag-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="air" />;
            return null;
          })}
          {(Object.keys(chars) as ElementType[]).map((k) => (
            <CharacterModel key={`char-${k}`} x={chars[k].x} z={chars[k].z} type={k} isActive={activeChar === k} gridCenter={gridCenter} />
          ))}
          {effects.map((e) => (
            <ParticleEffect key={e.id} position={e.position} color={e.color} type={e.type} />
          ))}
        </group>
      </Canvas>

      <div style={{
        position: "absolute", top: 8, left: 0, right: 0,
        display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8,
        fontFamily: "system-ui, sans-serif", color: "white", pointerEvents: "none", zIndex: 10,
        padding: "0 8px",
      }}>
        {elementInfo.map((el) => (
          <div key={el.key} style={{
            background: "rgba(0,0,0,0.6)", padding: "5px 12px", borderRadius: 8,
            border: activeChar === el.key ? `2px solid ${el.color}` : "2px solid transparent",
            fontSize: 12,
          }}>
            <span style={{ color: el.color, fontWeight: "bold" }}>{el.num}</span>{" "}
            {el.label}
            <span style={{ marginLeft: 6, color: "#8899bb", fontSize: 10 }}>
              [{el.abilityKey}] {el.abilityLabel}
            </span>
            {activeChar === el.key && (
              <span style={{ marginLeft: 4, fontSize: 10, color: el.color }}>&#9664;</span>
            )}
          </div>
        ))}
      </div>

      {allGoalsReached && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)", zIndex: 20, fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            background: "rgba(30,30,50,0.95)", padding: "30px 40px", borderRadius: 16,
            textAlign: "center", color: "white", border: "2px solid #66cc66",
          }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 24, color: "#66cc66" }}>{t("elementalconflux.complete")}</h2>
            <p style={{ margin: "6px 0", fontSize: 13 }}>
              {t("elementalconflux.time")}: {elapsedSec}s | {t("elementalconflux.moves")}: {moves}
            </p>
            <p style={{ margin: "8px 0", fontSize: 18, fontWeight: "bold", color: "#ffcc00" }}>
              {t("elementalconflux.finalScore")}: {score}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button onClick={restartLevel} style={{
                padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif",
                background: "#555", color: "white", border: "none", borderRadius: 6, cursor: "pointer",
              }}>
                {t("elementalconflux.restart")}
              </button>
              {level + 1 < PUZZLE_LEVELS.length && (
                <button onClick={nextLevel} style={{
                  padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif",
                  background: "#3388ff", color: "white", border: "none", borderRadius: 6, cursor: "pointer",
                }}>
                  {t("elementalconflux.nextLevel")}
                </button>
              )}
              {level + 1 >= PUZZLE_LEVELS.length && (
                <button onClick={nextLevel} style={{
                  padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif",
                  background: "#66cc66", color: "white", border: "none", borderRadius: 6, cursor: "pointer",
                }}>
                  {t("elementalconflux.playAgain")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 60, right: 8, display: "flex", flexDirection: "column", gap: 4,
        fontFamily: "system-ui, sans-serif", fontSize: 11, color: "white", zIndex: 10, pointerEvents: "none",
      }}>
        {elementInfo.map((el) => (
          <div key={el.key} style={{ background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: el.color, fontSize: 10, fontWeight: "bold" }}>{el.num}</span>
            <span style={{ color: goalsReached[el.key] ? "#66cc66" : "#ff4444" }}>
              {goalsReached[el.key] ? t("elementalconflux.reached") : t("elementalconflux.pending")}
            </span>
          </div>
        ))}
        <div style={{ background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 6, textAlign: "center" }}>
          {t("elementalconflux.level")} {level + 1}/{PUZZLE_LEVELS.length}
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 8, left: 8,
        fontFamily: "system-ui, sans-serif", fontSize: 11, color: "white",
        background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: 6,
        pointerEvents: "none", zIndex: 10,
      }}>
        {t("elementalconflux.controls")}
      </div>
    </div>
  );
}
