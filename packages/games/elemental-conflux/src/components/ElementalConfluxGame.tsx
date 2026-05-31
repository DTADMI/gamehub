"use client";

import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PUZZLE_GRID_SIZE = 6;
const BOSS_GRID_SIZE = 8;
const TILE_SIZE = 1;
const TILE_HEIGHT = 0.3;
const BOSS_MAX_HP = 100;
const BOSS_TIME_LIMIT = 120;
const BOSS_PHASE2_HP = 50;
const BOSS_PHASE3_HP = 25;

const KONAMI_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"];
const STORAGE_KEY_PREFIX = "elemental-conflux-editor-";
const EDITOR_GRID_SIZE = 6;

type ElementType = "fire" | "water" | "earth" | "air";
type GameScreen = "menu" | "playing" | "boss" | "editor" | "complete";
type GameMode = "single" | "coop";
type BossPhase = 1 | 2 | 3;
type BossAttackType = "fireBeam" | "iceShards" | "earthTremor" | "airVortex";

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

interface BossAttack {
  type: BossAttackType;
  tiles: { x: number; z: number }[];
  remainingFrames: number;
}

interface BossState {
  phase: BossPhase;
  hp: number;
  maxHp: number;
  shieldActive: boolean;
  activatedCrystals: ElementType[];
  glowingTiles: { x: number; z: number }[];
  activeAttack: BossAttack | null;
  attackCooldown: number;
  barrierTiles: { x: number; z: number }[];
  timeLimit: number;
  elapsedBossTime: number;
}

interface EffectsState {
  id: number;
  type: "steam" | "spark" | "mud" | "tornado";
  position: [number, number, number];
  color: string;
}

function emptyGrid(size: number): TileData[][] {
  const grid: TileData[][] = [];
  for (let x = 0; x < size; x++) {
    grid[x] = [];
    for (let z = 0; z < size; z++) {
      grid[x][z] = {
        x, z, height: 0, maxHeight: 2,
        hasFireBarrier: false, hasIceBlock: false, hasPushBlock: false,
        hasHiddenPlatform: false, hiddenRevealed: false,
        isMud: false, isFireGoal: false, isWaterGoal: false,
        isEarthGoal: false, isAirGoal: false,
      };
    }
  }
  return grid;
}

function buildPuzzle1(): TileData[][] {
  const grid = emptyGrid(PUZZLE_GRID_SIZE);
  for (let x = 0; x < PUZZLE_GRID_SIZE; x++) {grid[2][x].height = 1;}
  grid[3][2].hasPushBlock = true;
  grid[3][4].hasFireBarrier = true;
  grid[1][3].hasIceBlock = true;
  grid[2][0].isEarthGoal = true;
  grid[2][5].isAirGoal = true;
  grid[5][2].isFireGoal = true;
  grid[5][5].isWaterGoal = true;
  return grid;
}

function buildPuzzle2(): TileData[][] {
  const grid = emptyGrid(PUZZLE_GRID_SIZE);
  for (let x = 0; x < PUZZLE_GRID_SIZE; x++) { grid[1][x].height = 1; grid[3][x].height = 1; }
  grid[2][1].height = 0; grid[2][4].height = 0;
  grid[4][2].hasPushBlock = true; grid[4][3].hasPushBlock = true;
  grid[0][1].hasFireBarrier = true; grid[0][3].hasIceBlock = true; grid[5][2].hasFireBarrier = true;
  grid[2][0].hasHiddenPlatform = true; grid[2][5].hasHiddenPlatform = true;
  grid[0][4].isFireGoal = true; grid[5][0].isWaterGoal = true;
  grid[1][0].isEarthGoal = true; grid[3][5].isAirGoal = true;
  return grid;
}

function buildPuzzle3(): TileData[][] {
  const grid = emptyGrid(PUZZLE_GRID_SIZE);
  for (let x = 0; x < PUZZLE_GRID_SIZE; x++) { if (x !== 2) {grid[x][2].height = 1;} }
  grid[5][2].height = 1;
  for (let z = 0; z < PUZZLE_GRID_SIZE; z++) { if (z !== 2) {grid[2][z].height = 1;} }
  grid[0][3].hasPushBlock = true; grid[3][0].hasPushBlock = true; grid[4][5].hasPushBlock = true;
  grid[1][1].hasFireBarrier = true; grid[1][3].hasIceBlock = true;
  grid[3][1].hasIceBlock = true; grid[4][4].hasFireBarrier = true;
  grid[2][0].hasHiddenPlatform = true; grid[2][5].hasHiddenPlatform = true; grid[5][1].hasHiddenPlatform = true;
  grid[5][3].isFireGoal = true; grid[0][0].isWaterGoal = true;
  grid[5][0].isEarthGoal = true; grid[0][5].isAirGoal = true;
  return grid;
}

function buildBossGrid(): TileData[][] {
  const grid = emptyGrid(BOSS_GRID_SIZE);
  for (let x = 3; x <= 4; x++) {for (let z = 3; z <= 4; z++) {grid[x][z].height = 1;}}
  return grid;
}

const PUZZLE_LEVELS = [buildPuzzle1, buildPuzzle2, buildPuzzle3];

const ELEMENT_COLORS: Record<ElementType, { main: string; emissive: string }> = {
  fire: { main: "#ff6633", emissive: "#ff3300" },
  water: { main: "#3388ff", emissive: "#1144cc" },
  earth: { main: "#44cc44", emissive: "#228822" },
  air: { main: "#ccccff", emissive: "#8888cc" },
};
const PLAYER_NAMES: Record<ElementType, string> = {
  fire: "Player 1", water: "Player 2", earth: "Player 3", air: "Player 4",
};
const PLAYER_COLORS: Record<ElementType, string> = {
  fire: "#ff4444", water: "#4488ff", earth: "#44cc44", air: "#eeeeff",
};

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
  useFrame(() => {
    if (ref.current) {ref.current.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.05;}
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
  if (!tile.hiddenRevealed) {return null;}
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
  const { main, emissive } = ELEMENT_COLORS[type];
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

function CharacterModel({ x, z, type, isActive, gridCenter, showNameTag }: { x: number; z: number; type: ElementType; isActive: boolean; gridCenter: number; showNameTag?: boolean }) {
  const posX = x - gridCenter;
  const posZ = z - gridCenter;
  const tileY = 1.0;
  const { main, emissive } = ELEMENT_COLORS[type];
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
      {showNameTag && (
        <Text position={[0, 0.7, 0]} fontSize={0.18} color={PLAYER_COLORS[type]} anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
          {PLAYER_NAMES[type]}
        </Text>
      )}
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

function BossCrystal({ gridCenter, bossState }: { gridCenter: number; bossState: BossState }) {
  const ref = useRef<THREE.Mesh>(null);
  const crystalY = 0.5;
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      ref.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });
  const color = bossState.shieldActive ? "#88bbff" : "#ff8844";
  const emissiveColor = bossState.shieldActive ? "#4488ff" : "#ff4400";
  return (
    <mesh ref={ref} position={[0, crystalY, 0]} castShadow>
      <octahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={bossState.shieldActive ? 0.8 : 0.5} roughness={0.2} metalness={0.6} transparent opacity={0.9} />
    </mesh>
  );
}

function ActivationCrystal({ x, z, element, gridCenter, activated }: { x: number; z: number; element: ElementType; gridCenter: number; activated: boolean }) {
  const posX = x - gridCenter;
  const posZ = z - gridCenter;
  const y = 0.6;
  const { main, emissive } = ELEMENT_COLORS[element];
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {ref.current.position.y = y + Math.sin(Date.now() * 0.003) * 0.08;}
  });
  if (activated) {return null;}
  return (
    <mesh ref={ref} position={[posX, y, posZ]} castShadow>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color={main} emissive={emissive} emissiveIntensity={0.6} roughness={0.3} metalness={0.3} transparent opacity={0.85} />
    </mesh>
  );
}

function GlowingTile({ x, z, gridCenter }: { x: number; z: number; gridCenter: number }) {
  const posX = x - gridCenter;
  const posZ = z - gridCenter;
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.scale.x = 1 + Math.sin(Date.now() * 0.005) * 0.15;
      ref.current.scale.z = 1 + Math.sin(Date.now() * 0.005) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={[posX, 0.05, posZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.7, 0.7]} />
      <meshStandardMaterial color="#ffdd44" emissive="#ffaa00" emissiveIntensity={0.8} transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function BossAttackBeam({ gridCenter }: { gridCenter: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {ref.current.position.x = Math.sin(Date.now() * 0.002) * 4;}
  });
  return (
    <mesh ref={ref} position={[0, 0.3, 0]}>
      <boxGeometry args={[8, 0.1, 0.4]} />
      <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.9} transparent opacity={0.6} />
    </mesh>
  );
}

function BossAttackTileIndicator({ tiles, gridCenter, color }: { tiles: { x: number; z: number }[]; gridCenter: number; color: string }) {
  return (
    <>
      {tiles.map((t, i) => (
        <mesh key={`atk-${i}`} position={[t.x - gridCenter, 0.05, t.z - gridCenter]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function BossBarrier({ x, z, gridCenter }: { x: number; z: number; gridCenter: number }) {
  return (
    <mesh position={[x - gridCenter, 0.5, z - gridCenter]} castShadow>
      <boxGeometry args={[0.3, 0.8, 0.3]} />
      <meshStandardMaterial color="#8844aa" emissive="#6622aa" emissiveIntensity={0.4} roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

function CameraController({ gridCenter, gridSize }: { gridCenter: number; gridSize: number }) {
  const { camera } = useThree();
  useEffect(() => {
    const dist = gridSize * 1.3;
    camera.position.set(dist * 0.8, dist * 0.9, dist * 0.8);
    camera.lookAt(0, 0.5, 0);
  }, [camera, gridSize]);
  return null;
}

function PuzzleScene({ grid, chars, activeChar, effects, gridCenter, showNameTags, isBoss, bossState }: {
  grid: TileData[][]; chars: Record<ElementType, Character>; activeChar: ElementType;
  effects: EffectsState[]; gridCenter: number; showNameTags: boolean; isBoss?: boolean; bossState?: BossState;
}) {
  return (
    <group position={[0, 0, 0]}>
      {grid.flat().map((tile) => (
        <PlatformTile key={`tile-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />
      ))}
      {grid.flat().map((tile) => {
        if (tile.hasHiddenPlatform) {return <HiddenPlatform key={`hp-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;}
        return null;
      })}
      {grid.flat().map((tile) => {
        if (tile.hasFireBarrier) {return <FireBarrier key={`fb-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;}
        if (tile.hasIceBlock) {return <IceBlock key={`ib-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;}
        if (tile.hasPushBlock) {return <PushBlock key={`pb-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} />;}
        return null;
      })}
      {grid.flat().map((tile) => {
        if (tile.isFireGoal) {return <GoalRing key={`fg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="fire" />;}
        if (tile.isWaterGoal) {return <GoalRing key={`wg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="water" />;}
        if (tile.isEarthGoal) {return <GoalRing key={`eg-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="earth" />;}
        if (tile.isAirGoal) {return <GoalRing key={`ag-${tile.x}-${tile.z}`} tile={tile} gridCenter={gridCenter} type="air" />;}
        return null;
      })}
      {isBoss && bossState && (
        <>
          <BossCrystal gridCenter={gridCenter} bossState={bossState} />
          {bossState.activatedCrystals.length < 4 && (
            <>
              {!bossState.activatedCrystals.includes("fire") && <ActivationCrystal x={2} z={2} element="fire" gridCenter={gridCenter} activated={false} />}
              {!bossState.activatedCrystals.includes("water") && <ActivationCrystal x={5} z={2} element="water" gridCenter={gridCenter} activated={false} />}
              {!bossState.activatedCrystals.includes("earth") && <ActivationCrystal x={2} z={5} element="earth" gridCenter={gridCenter} activated={false} />}
              {!bossState.activatedCrystals.includes("air") && <ActivationCrystal x={5} z={5} element="air" gridCenter={gridCenter} activated={false} />}
            </>
          )}
          {bossState.glowingTiles.map((gt, i) => <GlowingTile key={`glow-${i}`} x={gt.x} z={gt.z} gridCenter={gridCenter} />)}
          {bossState.barrierTiles.map((bt, i) => <BossBarrier key={`bb-${i}`} x={bt.x} z={bt.z} gridCenter={gridCenter} />)}
          {bossState.activeAttack?.type === "fireBeam" && <BossAttackBeam gridCenter={gridCenter} />}
          {bossState.activeAttack?.type === "iceShards" && <BossAttackTileIndicator tiles={bossState.activeAttack.tiles} gridCenter={gridCenter} color="#88ccff" />}
          {bossState.activeAttack?.type === "earthTremor" && <BossAttackTileIndicator tiles={bossState.activeAttack.tiles} gridCenter={gridCenter} color="#886633" />}
          {bossState.activeAttack?.type === "airVortex" && <BossAttackTileIndicator tiles={bossState.activeAttack.tiles} gridCenter={gridCenter} color="#ccccff" />}
        </>
      )}
      {(Object.keys(chars) as ElementType[]).map((k) => (
        <CharacterModel key={`char-${k}`} x={chars[k].x} z={chars[k].z} type={k} isActive={activeChar === k} gridCenter={gridCenter} showNameTag={showNameTags} />
      ))}
      {effects.map((e) => <ParticleEffect key={e.id} position={e.position} color={e.color} type={e.type} />)}
    </group>
  );
}

function BossHUD({ bossState }: { bossState: BossState }) {
  const hpPct = Math.max(0, (bossState.hp / bossState.maxHp) * 100);
  const timeLeft = Math.max(0, bossState.timeLimit - bossState.elapsedBossTime);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const phaseLabel = `Phase ${bossState.phase}`;
  const shieldLabel = bossState.shieldActive ? " Shield: ON" : " Shield: OFF";
  return (
    <div style={{
      position: "absolute", top: 48, left: 8, right: 8,
      fontFamily: "system-ui, sans-serif", zIndex: 10, pointerEvents: "none",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 4px", color: "white", fontSize: 12,
      }}>
        <span style={{ color: "#ff8844", fontWeight: "bold" }}>Elemental Guardian</span>
        <span>{phaseLabel}{shieldLabel}</span>
        <span style={{ color: timeLeft < 30 ? "#ff4444" : "#ffffff" }}>{mins}:{secs.toString().padStart(2, "0")}</span>
      </div>
      <div style={{
        width: "100%", height: 14, background: "rgba(0,0,0,0.6)",
        borderRadius: 7, overflow: "hidden", position: "relative",
      }}>
        <div style={{
          width: `${hpPct}%`, height: "100%",
          background: bossState.shieldActive
            ? "linear-gradient(90deg, #4488ff, #88bbff)"
            : hpPct < 25 ? "linear-gradient(90deg, #ff4444, #ff8844)" : "linear-gradient(90deg, #44cc44, #88ff44)",
          transition: "width 0.3s ease", borderRadius: 7,
        }} />
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "white", fontWeight: "bold",
        }}>
          HP: {bossState.hp}/{bossState.maxHp}
        </div>
      </div>
    </div>
  );
}

function EditorTile({ tile, gridCenter, onClick, onRightClick, selected }: {
  tile: TileData; gridCenter: number; onClick: () => void; onRightClick: () => void; selected: boolean;
}) {
  const posX = tile.x - gridCenter;
  const posZ = tile.z - gridCenter;
  const y = tile.height * TILE_HEIGHT;
  let label = "";
  let labelColor = "#ffffff";
  if (tile.hasFireBarrier) { label = "FB"; labelColor = "#ff6600"; }
  else if (tile.hasIceBlock) { label = "IB"; labelColor = "#88ccff"; }
  else if (tile.hasPushBlock) { label = "PB"; labelColor = "#dddddd"; }
  else if (tile.hasHiddenPlatform) { label = "HP"; labelColor = "#88ccff"; }
  else if (tile.isFireGoal) { label = "FG"; labelColor = "#ff8800"; }
  else if (tile.isWaterGoal) { label = "WG"; labelColor = "#3388ff"; }
  else if (tile.isEarthGoal) { label = "EG"; labelColor = "#44cc44"; }
  else if (tile.isAirGoal) { label = "AG"; labelColor = "#eeeeff"; }
  return (
    <group position={[posX, y / 2, posZ]}>
      <mesh onClick={onClick} onContextMenu={(e) => { e.stopPropagation(); onRightClick(); }}>
        <boxGeometry args={[TILE_SIZE * 0.95, Math.max(y + 0.05, 0.05), TILE_SIZE * 0.95]} />
        <meshStandardMaterial color={selected ? "#ffff88" : "#556655"} emissive={selected ? "#ffff00" : "#000000"} emissiveIntensity={selected ? 0.5 : 0} wireframe={selected} transparent opacity={0.8} />
      </mesh>
      {label && <Text position={[0, 0.4, 0]} fontSize={0.2} color={labelColor} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">{label}</Text>}
      <Text position={[0, -0.2, 0]} fontSize={0.12} color="#aaa" anchorX="center" anchorY="top">h:{tile.height}</Text>
    </group>
  );
}

function LevelSelectMenu({ onStartLevel, onOpenEditor, onToggleMode, isCoop, editorUnlocked }: {
  onStartLevel: (index: number) => void; onOpenEditor: () => void;
  onToggleMode: () => void; isCoop: boolean; editorUnlocked: boolean;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a15 100%)",
      fontFamily: "system-ui, sans-serif", zIndex: 30,
    }}>
      <h1 style={{ color: "#88ccff", fontSize: 28, margin: "0 0 6px", textShadow: "0 0 20px rgba(100,150,255,0.4)" }}>
        Elemental Conflux
      </h1>
      <p style={{ color: "#7788aa", fontSize: 12, margin: "0 0 24px" }}>Guide the four elements to their goal rings</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {PUZZLE_LEVELS.map((_, i) => (
          <button key={i} onClick={() => onStartLevel(i)} style={{
            width: 70, height: 70, borderRadius: 12,
            background: "linear-gradient(135deg, #2a2a4a, #1a1a3a)",
            border: "2px solid #445577", color: "white",
            fontSize: 22, fontWeight: "bold", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#88aaff"; e.currentTarget.style.background = "linear-gradient(135deg, #3a3a5a, #2a2a4a)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#445577"; e.currentTarget.style.background = "linear-gradient(135deg, #2a2a4a, #1a1a3a)"; }}
          >
            <span>{i + 1}</span>
            <span style={{ fontSize: 9, color: "#7799bb" }}>Puzzle</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onToggleMode} style={{
          padding: "8px 18px", borderRadius: 8, fontSize: 13,
          background: isCoop ? "#44aa44" : "#555577",
          border: "none", color: "white", cursor: "pointer",
        }}>
          {isCoop ? "Multiplayer: ON" : "Multiplayer: OFF"}
        </button>
        {editorUnlocked && (
          <button onClick={onOpenEditor} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13,
            background: "#7755aa", border: "none", color: "white", cursor: "pointer",
          }}>
            Editor
          </button>
        )}
      </div>
    </div>
  );
}

function EditorPanel({ onSave, onLoad, onExport, onImport, onBack, onClear }: {
  onSave: () => void; onLoad: () => void; onExport: () => void;
  onImport: () => void; onBack: () => void; onClear: () => void;
}) {
  return (
    <div style={{
      position: "absolute", top: 8, right: 8,
      background: "rgba(20,20,40,0.92)", padding: "12px 16px",
      borderRadius: 10, fontFamily: "system-ui, sans-serif",
      color: "white", zIndex: 20, fontSize: 12, display: "flex",
      flexDirection: "column", gap: 6, minWidth: 150,
    }}>
      <div style={{ fontWeight: "bold", color: "#aa88ff", marginBottom: 4, fontSize: 14 }}>Puzzle Editor</div>
      <div style={{ color: "#8899bb", fontSize: 10 }}>Click: cycle tile | Right-click: remove</div>
      <div style={{ color: "#8899bb", fontSize: 10 }}>Wheel: adjust height</div>
      <hr style={{ border: "none", borderTop: "1px solid #334", margin: "4px 0" }} />
      <button onClick={onSave} style={ebtn("#4488ff")}>Save to localStorage</button>
      <button onClick={onLoad} style={ebtn("#44aa44")}>Load from localStorage</button>
      <button onClick={onExport} style={ebtn("#ff8844")}>Export (base64)</button>
      <button onClick={onImport} style={ebtn("#8844aa")}>Import (paste)</button>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={onClear} style={ebtn("#cc4444")}>Clear</button>
        <button onClick={onBack} style={ebtn("#555577")}>Back</button>
      </div>
    </div>
  );
}

const ebtn = (bg: string): React.CSSProperties => ({
  padding: "5px 12px", borderRadius: 6, fontSize: 11,
  background: bg, border: "none", color: "white", cursor: "pointer",
  fontFamily: "system-ui, sans-serif", textAlign: "left",
});

export function ElementalConfluxGame({
  onScoreUpdate,
  onGameOver,
}: {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}) {
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [level, setLevel] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [grid, setGrid] = useState<TileData[][]>(() => PUZZLE_LEVELS[0]());
  const [chars, setChars] = useState<Record<ElementType, Character>>({
    fire: { x: 0, z: 0, type: "fire" },
    water: { x: 0, z: 5, type: "water" },
    earth: { x: 5, z: 0, type: "earth" },
    air: { x: 5, z: 5, type: "air" },
  });
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

  const [editorUnlocked, setEditorUnlocked] = useState(false);
  const [konamiIdx, setKonamiIdx] = useState(0);
  const [editorGrid, setEditorGrid] = useState<TileData[][]>(() => emptyGrid(EDITOR_GRID_SIZE));
  const [editorSelected, setEditorSelected] = useState<{ x: number; z: number } | null>(null);

  const [bossState, setBossState] = useState<BossState>({
    phase: 1, hp: BOSS_MAX_HP, maxHp: BOSS_MAX_HP,
    shieldActive: true, activatedCrystals: [],
    glowingTiles: [], activeAttack: null,
    attackCooldown: 0, barrierTiles: [],
    timeLimit: BOSS_TIME_LIMIT, elapsedBossTime: 0,
  });
  const [bossComplete, setBossComplete] = useState(false);
  const [bossScore, setBossScore] = useState(0);
  const bossFrameCount = useRef(0);

  const currentGridSize = screen === "boss" ? BOSS_GRID_SIZE : PUZZLE_GRID_SIZE;
  const gridCenter = (currentGridSize - 1) / 2;

  const addEffect = useCallback((type: EffectsState["type"], color: string, pos: [number, number, number]) => {
    const id = ++effectIdRef.current;
    setEffects((prev) => [...prev, { id, type, position: pos, color }]);
    setTimeout(() => setEffects((prev) => prev.filter((e) => e.id !== id)), 2000);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!isComplete && screen === "playing") {setElapsedSec(Math.floor((Date.now() - startTime) / 1000));}
    }, 500);
    return () => clearInterval(iv);
  }, [startTime, isComplete, screen]);

  useEffect(() => {
    if (screen !== "boss") {return;}
    const iv = setInterval(() => {
      setBossState((prev) => ({ ...prev, elapsedBossTime: prev.elapsedBossTime + 1 }));
    }, 1000);
    return () => clearInterval(iv);
  }, [screen]);

  const isBossDefeated = bossState.hp <= 0;
  const isBossTimedOut = bossState.elapsedBossTime >= bossState.timeLimit;

  const checkGoalReached = useCallback((x: number, z: number, type: ElementType, g: TileData[][]) => {
    const tile = g[x]?.[z];
    if (!tile) {return false;}
    switch (type) {
      case "fire": return tile.isFireGoal;
      case "water": return tile.isWaterGoal;
      case "earth": return tile.isEarthGoal;
      case "air": return tile.isAirGoal;
    }
  }, []);

  const isBlocked = useCallback((x: number, z: number, movingChar: ElementType, g: TileData[][]) => {
    const tile = g[x]?.[z];
    if (!tile) {return true;}
    if (tile.isMud) {return true;}
    if (tile.hasPushBlock) {return true;}
    if (tile.hasHiddenPlatform && !tile.hiddenRevealed && tile.height === 0) {return true;}
    if (movingChar === "water" && tile.hasFireBarrier) {return true;}
    if (movingChar === "fire" && tile.hasIceBlock) {return true;}
    return false;
  }, []);

  const canStepHeight = useCallback((fromX: number, fromZ: number, toX: number, toZ: number, g: TileData[][]) => {
    const fromH = g[fromX]?.[fromZ]?.height ?? 0;
    const toH = g[toX]?.[toZ]?.height ?? 0;
    if (g[toX]?.[toZ]?.hasHiddenPlatform && !g[toX]?.[toZ]?.hiddenRevealed) {return true;}
    return Math.abs(toH - fromH) <= 1;
  }, []);

  const handleBossCrystalActivation = useCallback((charType: ElementType, newX: number, newZ: number) => {
    const crystalPositions: Record<ElementType, { x: number; z: number }> = {
      fire: { x: 2, z: 2 }, water: { x: 5, z: 2 },
      earth: { x: 2, z: 5 }, air: { x: 5, z: 5 },
    };
    const cp = crystalPositions[charType];
    if (newX === cp.x && newZ === cp.z) {
      setBossState((prev) => {
        if (prev.activatedCrystals.includes(charType) || !prev.shieldActive) {return prev;}
        const next = { ...prev, activatedCrystals: [...prev.activatedCrystals, charType] };
        if (next.activatedCrystals.length >= 4) {
          next.shieldActive = false;
          next.phase = 2;
        }
        return next;
      });
    }
  }, []);

  const handleBossGlowingTileDamage = useCallback((_charType: ElementType, newX: number, newZ: number) => {
    setBossState((prev) => {
      if (prev.shieldActive) {return prev;}
      const isGlowing = prev.glowingTiles.some((gt) => gt.x === newX && gt.z === newZ);
      if (!isGlowing) {return prev;}
      const dmg = prev.phase === 3 ? 3 : 5;
      const newHp = Math.max(0, prev.hp - dmg);
      let newPhase: BossPhase = prev.phase;
      if (newHp <= BOSS_PHASE3_HP && prev.phase < 3) {newPhase = 3;}
      return { ...prev, hp: newHp, phase: newPhase };
    });
  }, []);

  const moveCharByType = useCallback(
    (charType: ElementType, dx: number, dz: number, g: TileData[][], c: Record<ElementType, Character>, size: number, isBoss: boolean) => {
      const char = c[charType];
      const nx = char.x + dx;
      const nz = char.z + dz;
      if (nx < 0 || nx >= size || nz < 0 || nz >= size) {return { chars: c, goals: null as Record<ElementType, boolean> | null };}
      if (!canStepHeight(char.x, char.z, nx, nz, g)) {return { chars: c, goals: null };}
      if (isBlocked(nx, nz, charType, g)) {return { chars: c, goals: null };}
      if (isBoss && bossState.barrierTiles.some((bt) => bt.x === nx && bt.z === nz)) {return { chars: c, goals: null };}
      const others = (Object.keys(c) as ElementType[]).filter((k) => k !== charType);
      if (others.some((k) => c[k].x === nx && c[k].z === nz)) {return { chars: c, goals: null };}
      const nextChars = { ...c };
      nextChars[charType] = { ...nextChars[charType], x: nx, z: nz };
      const goalsHit = checkGoalReached(nx, nz, charType, g);
      if (goalsHit) {return { chars: nextChars, goals: { ...goalsReached, [charType]: true } };}
      return { chars: nextChars, goals: null };
    },
    [canStepHeight, isBlocked, bossState.barrierTiles, checkGoalReached, goalsReached],
  );

  const fullMoveCharByType = useCallback(
    (charType: ElementType, dx: number, dz: number) => {
      const size = screen === "boss" ? BOSS_GRID_SIZE : PUZZLE_GRID_SIZE;
      const isBoss = screen === "boss";
      const result = moveCharByType(charType, dx, dz, grid, chars, size, isBoss);
      if (result.chars !== chars) {
        setMoves((m) => m + 1);
        setChars(result.chars);
        if (result.goals) {setGoalsReached(result.goals);}
        if (isBoss) {
          handleBossCrystalActivation(charType, result.chars[charType].x, result.chars[charType].z);
          handleBossGlowingTileDamage(charType, result.chars[charType].x, result.chars[charType].z);
        }
      }
    },
    [moveCharByType, grid, chars, screen, handleBossCrystalActivation, handleBossGlowingTileDamage],
  );

  const moveCharacter = useCallback(
    (dx: number, dz: number) => {
      const char = chars[activeChar];
      const nx = char.x + dx;
      const nz = char.z + dz;
      if (nx < 0 || nx >= currentGridSize || nz < 0 || nz >= currentGridSize) {return;}
      if (!canStepHeight(char.x, char.z, nx, nz, grid)) {return;}
      if (isBlocked(nx, nz, activeChar, grid)) {return;}
      if (screen === "boss" && bossState.barrierTiles.some((bt) => bt.x === nx && bt.z === nz)) {return;}
      const others = (Object.keys(chars) as ElementType[]).filter((k) => k !== activeChar);
      if (others.some((k) => chars[k].x === nx && chars[k].z === nz)) {return;}
      setMoves((m) => m + 1);
      setChars((prev) => {
        const next = { ...prev };
        next[activeChar] = { ...next[activeChar], x: nx, z: nz };
        return next;
      });
      if (checkGoalReached(nx, nz, activeChar, grid)) {
        setGoalsReached((prev) => ({ ...prev, [activeChar]: true }));
      }
      if (screen === "boss") {
        handleBossCrystalActivation(activeChar, nx, nz);
        handleBossGlowingTileDamage(activeChar, nx, nz);
      }
    },
    [activeChar, chars, currentGridSize, canStepHeight, isBlocked, grid, checkGoalReached, screen, bossState.barrierTiles, handleBossCrystalActivation, handleBossGlowingTileDamage],
  );

  const getGridSize = useCallback(() => screen === "boss" ? BOSS_GRID_SIZE : PUZZLE_GRID_SIZE, [screen]);

  const activateEarth = useCallback(() => {
    const char = chars.earth;
    const gs = getGridSize();
    const adj = [[char.x - 1, char.z], [char.x + 1, char.z], [char.x, char.z - 1], [char.x, char.z + 1]];
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      let changed = false;
      for (const [ax, az] of adj) {
        if (ax < 0 || ax >= gs || az < 0 || az >= gs) {continue;}
        const tile = next[ax][az];
        if (tile.height < tile.maxHeight) { tile.height = Math.min(tile.height + 1, tile.maxHeight); changed = true; }
        else if (tile.height > 0) { tile.height = Math.max(0, tile.height - 1); changed = true; }
      }
      if (changed) { setMoves((m) => m + 1); addEffect("spark", "#44cc44", [gx, effectY, gz]); }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect, getGridSize]);

  const activateAir = useCallback(() => {
    const char = chars.air;
    const gs = getGridSize();
    const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;
    let pushed = false;
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      for (const [dx, dz] of dirs) {
        const tx = char.x + dx; const tz = char.z + dz;
        if (tx < 0 || tx >= gs || tz < 0 || tz >= gs) {continue;}
        if (!next[tx][tz].hasPushBlock) {continue;}
        const destX = tx + dx; const destZ = tz + dz;
        if (destX < 0 || destX >= gs || destZ < 0 || destZ >= gs) {continue;}
        const dt = next[destX][destZ];
        if (dt.hasFireBarrier || dt.hasIceBlock || dt.hasPushBlock) {continue;}
        if ((Object.keys(chars) as ElementType[]).some((k) => chars[k].x === destX && chars[k].z === destZ)) {continue;}
        next[tx][tz].hasPushBlock = false;
        next[destX][destZ].hasPushBlock = true;
        pushed = true;
        break;
      }
      if (pushed) { setMoves((m) => m + 1); addEffect("spark", "#ccccff", [gx, effectY, gz]); }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect, getGridSize]);

  const activateFire = useCallback(() => {
    const char = chars.fire;
    const gs = getGridSize();
    const pos: [number, number][] = [[char.x - 1, char.z], [char.x + 1, char.z], [char.x, char.z - 1], [char.x, char.z + 1], [char.x, char.z]];
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;
    let melted = false;
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      for (const [px, pz] of pos) {
        if (px < 0 || px >= gs || pz < 0 || pz >= gs) {continue;}
        if (next[px][pz].hasIceBlock) { next[px][pz].hasIceBlock = false; melted = true; }
      }
      if (melted) { setMoves((m) => m + 1); addEffect("steam", "#aaddff", [gx, effectY, gz]); }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect, getGridSize]);

  const activateWater = useCallback(() => {
    const char = chars.water;
    const gs = getGridSize();
    const pos: [number, number][] = [[char.x - 1, char.z], [char.x + 1, char.z], [char.x, char.z - 1], [char.x, char.z + 1], [char.x, char.z]];
    const gx = char.x - gridCenter;
    const gz = char.z - gridCenter;
    const effectY = (grid[char.x]?.[char.z]?.height ?? 0) * TILE_HEIGHT + 0.6;
    let doused = false;
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      for (const [px, pz] of pos) {
        if (px < 0 || px >= gs || pz < 0 || pz >= gs) {continue;}
        if (next[px][pz].hasFireBarrier) { next[px][pz].hasFireBarrier = false; doused = true; }
      }
      if (doused) { setMoves((m) => m + 1); addEffect("spark", "#ff8844", [gx, effectY, gz]); }
      return next;
    });
  }, [chars, grid, gridCenter, addEffect, getGridSize]);

  const checkCombinations = useCallback(
    (atX: number, atZ: number, _charType: ElementType) => {
      const gs = getGridSize();
      const nearby: Set<ElementType> = new Set();
      for (const k of Object.keys(chars) as ElementType[]) {
        const c = chars[k];
        if (Math.abs(c.x - atX) + Math.abs(c.z - atZ) <= 1) {nearby.add(k);}
      }
      const gx = atX - gridCenter;
      const gz = atZ - gridCenter;
      const effectY = (grid[atX]?.[atZ]?.height ?? 0) * TILE_HEIGHT + 0.8;

      if (nearby.has("fire") && nearby.has("air")) {
        setGrid((prev) => {
          const next = prev.map((r) => r.map((t) => ({ ...t })));
          if (atX >= 0 && atX < gs) {
            for (let zz = 0; zz < gs; zz++) {
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
              const tx = atX + dx; const tz = atZ + dz;
              if (tx < 0 || tx >= gs || tz < 0 || tz >= gs) {continue;}
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
              const tx = atX + dx; const tz = atZ + dz;
              if (tx < 0 || tx >= gs || tz < 0 || tz >= gs) {continue;}
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
    [chars, grid, gridCenter, addEffect, getGridSize],
  );

  const activateAbilityForType = useCallback((charType: ElementType) => {
    switch (charType) {
      case "fire": activateFire(); break;
      case "water": activateWater(); break;
      case "earth": activateEarth(); break;
      case "air": activateAir(); break;
    }
    checkCombinations(chars[charType].x, chars[charType].z, charType);
  }, [activateFire, activateWater, activateEarth, activateAir, checkCombinations, chars]);

  const activateAbility = useCallback(() => {
    switch (activeChar) {
      case "fire": activateFire(); break;
      case "water": activateWater(); break;
      case "earth": activateEarth(); break;
      case "air": activateAir(); break;
    }
    checkCombinations(chars[activeChar].x, chars[activeChar].z, activeChar);
  }, [activeChar, activateFire, activateWater, activateEarth, activateAir, checkCombinations, chars]);

  const allGoalsReached = goalsReached.fire && goalsReached.water && goalsReached.earth && goalsReached.air;

  useEffect(() => {
    if (allGoalsReached && !isComplete && screen === "playing") {
      setIsComplete(true);
    }
  }, [allGoalsReached, isComplete, screen]);

  const goToMenu = useCallback(() => {
    setScreen("menu");
    setIsComplete(false);
    setMoves(0);
    setElapsedSec(0);
    setEffects([]);
    setGoalsReached({ fire: false, water: false, earth: false, air: false });
  }, []);

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

  const startBoss = useCallback(() => {
    setGrid(buildBossGrid());
    setChars({
      fire: { x: 0, z: 0, type: "fire" },
      water: { x: 0, z: 7, type: "water" },
      earth: { x: 7, z: 0, type: "earth" },
      air: { x: 7, z: 7, type: "air" },
    });
    setActiveChar("fire");
    setMoves(0);
    setIsComplete(false);
    setGoalsReached({ fire: false, water: false, earth: false, air: false });
    setEffects([]);
    setBossState({
      phase: 1, hp: BOSS_MAX_HP, maxHp: BOSS_MAX_HP,
      shieldActive: true, activatedCrystals: [],
      glowingTiles: [], activeAttack: null,
      attackCooldown: 0, barrierTiles: [],
      timeLimit: BOSS_TIME_LIMIT, elapsedBossTime: 0,
    });
    setBossComplete(false);
    setBossScore(0);
    bossFrameCount.current = 0;
    setScreen("boss");
  }, []);

  const startLevel = useCallback((idx: number) => {
    setLevel(idx);
    setGrid(PUZZLE_LEVELS[idx]());
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
    setScreen("playing");
  }, []);

  const nextLevel = useCallback(() => {
    const next = level + 1;
    if (next >= PUZZLE_LEVELS.length) { startBoss(); return; }
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
  }, [level, startBoss]);

  const score = useMemo(() => {
    if (screen === "boss") {return bossScore;}
    const timeScore = Math.max(0, 300 - elapsedSec) * 10;
    const moveScore = Math.max(0, 300 - moves) * 5;
    const goals = Object.values(goalsReached).filter(Boolean).length;
    return timeScore + moveScore + goals * 500;
  }, [elapsedSec, moves, goalsReached, screen, bossScore]);

  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => { if (screen !== "boss") {onScoreUpdateRef.current?.(score);} }, [score, screen]);
  useEffect(() => { if (isComplete && screen === "playing") {onGameOverRef.current?.(score);} }, [isComplete, screen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (screen === "menu") {
      if (KONAMI_CODE.includes(e.key)) {
        const idx = konamiIdx;
        if (e.key === KONAMI_CODE[idx]) {
          const next = idx + 1;
          setKonamiIdx(next);
          if (next >= KONAMI_CODE.length) { setEditorUnlocked(true); setKonamiIdx(0); }
        } else { setKonamiIdx(0); }
      } else { setKonamiIdx(0); }
      return;
    }

    if (screen === "editor") {
      if (e.key === "Escape") { setScreen("menu"); }
      return;
    }

    if (screen === "boss" && (isBossDefeated || isBossTimedOut)) {return;}
    if (screen === "playing" && isComplete) {return;}

    if (gameMode === "single") {
      switch (e.key) {
        case "Tab": case "1": e.preventDefault(); setActiveChar("fire"); break;
        case "2": e.preventDefault(); setActiveChar("water"); break;
        case "3": e.preventDefault(); setActiveChar("earth"); break;
        case "4": e.preventDefault(); setActiveChar("air"); break;
        case "w": case "W": case "ArrowUp": e.preventDefault(); moveCharacter(0, -1); break;
        case "s": case "S": case "ArrowDown": e.preventDefault(); moveCharacter(0, 1); break;
        case "a": case "A": case "ArrowLeft": e.preventDefault(); moveCharacter(-1, 0); break;
        case "d": case "D": case "ArrowRight": e.preventDefault(); moveCharacter(1, 0); break;
        case "f": case "F": e.preventDefault(); if (activeChar === "fire") {activateAbility();} break;
        case "q": case "Q": e.preventDefault(); if (activeChar === "water") {activateAbility();} break;
        case "g": case "G": e.preventDefault(); if (activeChar === "earth") {activateAbility();} break;
        case " ": e.preventDefault(); if (activeChar === "air") {activateAbility();} break;
      }
    } else {
      switch (e.key) {
        case "w": case "W": e.preventDefault(); fullMoveCharByType("fire", 0, -1); break;
        case "s": case "S": e.preventDefault(); fullMoveCharByType("fire", 0, 1); break;
        case "a": case "A": e.preventDefault(); fullMoveCharByType("fire", -1, 0); break;
        case "d": case "D": e.preventDefault(); fullMoveCharByType("fire", 1, 0); break;
        case "f": case "F": e.preventDefault(); activateAbilityForType("fire"); break;
        case "ArrowUp": e.preventDefault(); fullMoveCharByType("water", 0, -1); break;
        case "ArrowDown": e.preventDefault(); fullMoveCharByType("water", 0, 1); break;
        case "ArrowLeft": e.preventDefault(); fullMoveCharByType("water", -1, 0); break;
        case "ArrowRight": e.preventDefault(); fullMoveCharByType("water", 1, 0); break;
        case "q": case "Q": e.preventDefault(); activateAbilityForType("water"); break;
        case "i": case "I": e.preventDefault(); fullMoveCharByType("earth", 0, -1); break;
        case "k": case "K": e.preventDefault(); fullMoveCharByType("earth", 0, 1); break;
        case "j": case "J": e.preventDefault(); fullMoveCharByType("earth", -1, 0); break;
        case "l": case "L": e.preventDefault(); fullMoveCharByType("earth", 1, 0); break;
        case "g": case "G": e.preventDefault(); activateAbilityForType("earth"); break;
        case "Numpad8": case "8": e.preventDefault(); fullMoveCharByType("air", 0, -1); break;
        case "Numpad2": case "2": e.preventDefault(); fullMoveCharByType("air", 0, 1); break;
        case "Numpad4": case "4": e.preventDefault(); fullMoveCharByType("air", -1, 0); break;
        case "Numpad6": case "6": e.preventDefault(); fullMoveCharByType("air", 1, 0); break;
        case "NumpadAdd": case "NumpadEnter": case " ": e.preventDefault(); activateAbilityForType("air"); break;
      }
    }
  }, [screen, konamiIdx, gameMode, activeChar, moveCharacter, activateAbility, activateAbilityForType, fullMoveCharByType, isComplete, isBossDefeated, isBossTimedOut]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (screen !== "boss" || isBossDefeated || isBossTimedOut) {return;}
    const iv = setInterval(() => {
      bossFrameCount.current += 1;
      setBossState((prev) => {
        if (prev.hp <= 0 || prev.elapsedBossTime >= prev.timeLimit) {return prev;}
        let attack = prev.activeAttack;
        let cooldown = prev.attackCooldown;
        let glowing = [...prev.glowingTiles];
        let barriers = [...prev.barrierTiles];

        if (attack) {
          if (attack.remainingFrames <= 1) { attack = null; cooldown = prev.phase === 3 ? 20 : prev.phase === 2 ? 35 : 50; }
          else { attack = { ...attack, remainingFrames: attack.remainingFrames - 1 }; }
        } else if (cooldown > 0) {
          cooldown -= 1;
        } else {
          const attacks: BossAttackType[] = ["fireBeam", "iceShards", "earthTremor", "airVortex"];
          const atkType = attacks[Math.floor(Math.random() * attacks.length)];
          const atkTiles: { x: number; z: number }[] = [];
          switch (atkType) {
            case "fireBeam": {
              const row = Math.floor(Math.random() * BOSS_GRID_SIZE);
              for (let x = 0; x < BOSS_GRID_SIZE; x++) {atkTiles.push({ x, z: row });}
              break;
            }
            case "iceShards": {
              const count = prev.phase === 3 ? 6 : 4;
              for (let i = 0; i < count; i++) {atkTiles.push({ x: Math.floor(Math.random() * BOSS_GRID_SIZE), z: Math.floor(Math.random() * BOSS_GRID_SIZE) });}
              break;
            }
            case "earthTremor": {
              const area = prev.phase === 3 ? 4 : 2;
              for (let i = 0; i < area; i++) {atkTiles.push({ x: Math.floor(Math.random() * BOSS_GRID_SIZE), z: Math.floor(Math.random() * BOSS_GRID_SIZE) });}
              break;
            }
            case "airVortex": {
              const cx = 3 + Math.floor(Math.random() * 2);
              const cz = 3 + Math.floor(Math.random() * 2);
              for (let dx = -1; dx <= 1; dx++) {for (let dz = -1; dz <= 1; dz++) {
                const tx = cx + dx; const tz = cz + dz;
                if (tx >= 0 && tx < BOSS_GRID_SIZE && tz >= 0 && tz < BOSS_GRID_SIZE && !(dx === 0 && dz === 0)) {atkTiles.push({ x: tx, z: tz });}
              }}
              break;
            }
          }
          attack = { type: atkType, tiles: atkTiles, remainingFrames: 30 };
          cooldown = 0;

          if ((!prev.shieldActive) && bossFrameCount.current % 10 === 0) {
            const glowCount = prev.phase === 3 ? 3 : 2;
            const newGlow: { x: number; z: number }[] = [];
            for (let i = 0; i < glowCount; i++) {
              let gx: number, gz: number, attempts = 0;
              do {
                gx = Math.floor(Math.random() * BOSS_GRID_SIZE);
                gz = Math.floor(Math.random() * BOSS_GRID_SIZE);
                attempts++;
              } while ((Math.abs(gx - 3.5) + Math.abs(gz - 3.5) <= 2 || newGlow.some((g) => g.x === gx && g.z === gz)) && attempts < 20);
              if (attempts < 20) {newGlow.push({ x: gx, z: gz });}
            }
            glowing = newGlow;
          }

          if (prev.phase === 3 && bossFrameCount.current % 5 === 0) {
            const bCount = Math.floor(Math.random() * 3) + 1;
            const newBarriers: { x: number; z: number }[] = [];
            for (let i = 0; i < bCount; i++) {
              let bx: number, bz: number, att = 0;
              do {
                bx = Math.floor(Math.random() * BOSS_GRID_SIZE);
                bz = Math.floor(Math.random() * BOSS_GRID_SIZE);
                att++;
              } while ((Math.abs(bx - 3.5) + Math.abs(bz - 3.5) <= 2 || barriers.some((b) => b.x === bx && b.z === bz) || newBarriers.some((b) => b.x === bx && b.z === bz)) && att < 20);
              if (att < 20) {newBarriers.push({ x: bx, z: bz });}
            }
            barriers = [...barriers, ...newBarriers];
          }
        }
        return { ...prev, activeAttack: attack, attackCooldown: cooldown, glowingTiles: glowing, barrierTiles: barriers };
      });
    }, 800);
    return () => clearInterval(iv);
  }, [screen, isBossDefeated, isBossTimedOut]);

  useEffect(() => {
    if (screen !== "boss") {return;}
    if (isBossDefeated) {
      const timeBonus = Math.max(0, bossState.timeLimit - bossState.elapsedBossTime) * 20;
      const hpBonus = bossState.hp * 5;
      const total = timeBonus + hpBonus + 2000;
      setBossScore(total);
      setBossComplete(true);
      onGameOverRef.current?.(total);
    }
  }, [isBossDefeated, screen, bossState]);

  const elemInfo: { key: ElementType; num: string; color: string; label: string; abilityLabel: string; abilityKey: string }[] = [
    { key: "fire", num: "1", color: "#ff6633", label: "Fire", abilityLabel: "Melt Ice", abilityKey: "F" },
    { key: "water", num: "2", color: "#3388ff", label: "Water", abilityLabel: "Douse Fire", abilityKey: "Q" },
    { key: "earth", num: "3", color: "#44cc44", label: "Earth", abilityLabel: "Raise/Lower", abilityKey: "G" },
    { key: "air", num: "4", color: "#ccccff", label: "Air", abilityLabel: "Push Block", abilityKey: "Space" },
  ];

  const handleEditorTileClick = useCallback((x: number, z: number) => {
    setEditorGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      const tile = next[x][z];
      const order: (keyof TileData)[] = [
        "hasFireBarrier", "hasIceBlock", "hasPushBlock", "hasHiddenPlatform",
        "isFireGoal", "isWaterGoal", "isEarthGoal", "isAirGoal",
      ];
      const cur = order.findIndex((p) => tile[p] === true);
      if (cur >= 0) {
        (tile as any)[order[cur]] = false;
        const nxt = (cur + 1) % (order.length + 1);
        if (nxt < order.length) {(tile as any)[order[nxt]] = true;}
      } else {
        tile.hasFireBarrier = true;
      }
      return next;
    });
    setEditorSelected({ x, z });
  }, []);

  const handleEditorTileRightClick = useCallback((x: number, z: number) => {
    setEditorGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      const tile = next[x][z];
      tile.hasFireBarrier = false; tile.hasIceBlock = false; tile.hasPushBlock = false;
      tile.hasHiddenPlatform = false; tile.isFireGoal = false; tile.isWaterGoal = false;
      tile.isEarthGoal = false; tile.isAirGoal = false;
      return next;
    });
  }, []);

  const handleEditorWheel = useCallback((x: number, z: number, dir: number) => {
    setEditorGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      const tile = next[x][z];
      tile.height = Math.max(0, Math.min(tile.maxHeight, tile.height + dir));
      return next;
    });
  }, []);

  const handleSaveEditor = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + "custom", JSON.stringify(editorGrid)); } catch { /* ignore */ }
  }, [editorGrid]);

  const handleLoadEditor = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + "custom");
      if (data) {setEditorGrid(JSON.parse(data) as TileData[][]);}
    } catch { /* ignore */ }
  }, []);

  const handleExportEditor = useCallback(() => {
    try {
      const json = JSON.stringify(editorGrid);
      const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1: string) => String.fromCharCode(parseInt(p1, 16))));
      navigator.clipboard?.writeText(b64);
    } catch { /* ignore */ }
  }, [editorGrid]);

  const handleImportEditor = useCallback(() => {
    const raw = prompt("Paste puzzle string:");
    if (!raw) {return;}
    try {
      const json = decodeURIComponent(Array.from(atob(raw), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
      setEditorGrid(JSON.parse(json) as TileData[][]);
    } catch { /* ignore */ }
  }, []);

  if (screen === "menu") {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative", background: "#1a1a2e" }}>
        <LevelSelectMenu
          onStartLevel={startLevel}
          onOpenEditor={() => { setEditorGrid(emptyGrid(EDITOR_GRID_SIZE)); setScreen("editor"); }}
          onToggleMode={() => setGameMode((m) => m === "single" ? "coop" : "single")}
          isCoop={gameMode === "coop"}
          editorUnlocked={editorUnlocked}
        />
      </div>
    );
  }

  if (screen === "editor") {
    const editorGC = (EDITOR_GRID_SIZE - 1) / 2;
    return (
      <div style={{ width: "100%", height: "100%", position: "relative", background: "#1a1a2e" }}
        onWheel={(e) => {
          if (editorSelected) {handleEditorWheel(editorSelected.x, editorSelected.z, e.deltaY > 0 ? -1 : 1);}
        }}
      >
        <Canvas shadows camera={{ position: [8, 9, 8], fov: 45, near: 0.1, far: 50 }} style={{ width: "100%", height: "100%" }}>
          <SceneLights />
          <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0.5, 0]} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} minDistance={4} maxDistance={16} />
          <group position={[0, 0, 0]}>
            {editorGrid.flat().map((tile) => (
              <EditorTile
                key={`et-${tile.x}-${tile.z}`}
                tile={tile}
                gridCenter={editorGC}
                onClick={() => handleEditorTileClick(tile.x, tile.z)}
                onRightClick={() => handleEditorTileRightClick(tile.x, tile.z)}
                selected={editorSelected?.x === tile.x && editorSelected?.z === tile.z}
              />
            ))}
          </group>
        </Canvas>
        <EditorPanel onSave={handleSaveEditor} onLoad={handleLoadEditor} onExport={handleExportEditor} onImport={handleImportEditor} onBack={() => setScreen("menu")} onClear={() => setEditorGrid(emptyGrid(EDITOR_GRID_SIZE))} />
      </div>
    );
  }

  const isBossScreen = screen === "boss";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#1a1a2e" }}>
      <Canvas
        shadows
        camera={{ position: isBossScreen ? [10, 11, 10] : [7, 8, 7], fov: 45, near: 0.1, far: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        {isBossScreen && <CameraController gridCenter={gridCenter} gridSize={BOSS_GRID_SIZE} />}
        <SceneLights />
        {!isBossScreen && <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0.5, 0]} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} minDistance={4} maxDistance={16} />}
        <PuzzleScene grid={grid} chars={chars} activeChar={activeChar} effects={effects} gridCenter={gridCenter} showNameTags={gameMode === "coop"} isBoss={isBossScreen} bossState={isBossScreen ? bossState : undefined} />
      </Canvas>

      {isBossScreen && <BossHUD bossState={bossState} />}

      {gameMode === "coop" && !isBossScreen && (
        <div style={{
          position: "absolute", top: 8, left: 8, right: 8,
          display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap",
          fontFamily: "system-ui, sans-serif", color: "white", zIndex: 10,
          pointerEvents: "none", fontSize: 10,
        }}>
          {(Object.keys(chars) as ElementType[]).map((k) => (
            <div key={k} style={{ background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 6, border: `1px solid ${PLAYER_COLORS[k]}` }}>
              <span style={{ color: PLAYER_COLORS[k], fontWeight: "bold" }}>{PLAYER_NAMES[k]}</span>
              <span style={{ marginLeft: 6, color: goalsReached[k] ? "#66cc66" : "#ff4444" }}>{goalsReached[k] ? "GOAL" : "..."}</span>
            </div>
          ))}
        </div>
      )}

      {!isBossScreen && !isComplete && gameMode === "single" && (
        <div style={{
          position: "absolute", top: 8, left: 0, right: 0,
          display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8,
          fontFamily: "system-ui, sans-serif", color: "white", pointerEvents: "none", zIndex: 10,
          padding: "0 8px",
        }}>
          {elemInfo.map((el) => (
            <div key={el.key} style={{
              background: "rgba(0,0,0,0.6)", padding: "5px 12px", borderRadius: 8,
              border: activeChar === el.key ? `2px solid ${el.color}` : "2px solid transparent", fontSize: 12,
            }}>
              <span style={{ color: el.color, fontWeight: "bold" }}>{el.num}</span>{" "}
              {el.label}
              <span style={{ marginLeft: 6, color: "#8899bb", fontSize: 10 }}>[{el.abilityKey}] {el.abilityLabel}</span>
              {activeChar === el.key && <span style={{ marginLeft: 4, fontSize: 10, color: el.color }}>&#9664;</span>}
            </div>
          ))}
        </div>
      )}

      {allGoalsReached && !isBossScreen && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)", zIndex: 20, fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            background: "rgba(30,30,50,0.95)", padding: "30px 40px", borderRadius: 16,
            textAlign: "center", color: "white", border: "2px solid #66cc66",
          }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 24, color: "#66cc66" }}>Level Complete!</h2>
            <p style={{ margin: "6px 0", fontSize: 13 }}>Time: {elapsedSec}s | Moves: {moves}</p>
            <p style={{ margin: "8px 0", fontSize: 18, fontWeight: "bold", color: "#ffcc00" }}>Score: {score}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button onClick={restartLevel} style={{ padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif", background: "#555", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Restart</button>
              {level + 1 < PUZZLE_LEVELS.length && (
                <button onClick={nextLevel} style={{ padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif", background: "#3388ff", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Next Level</button>
              )}
              {level + 1 >= PUZZLE_LEVELS.length && (
                <button onClick={nextLevel} style={{ padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif", background: "#ff8844", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Boss Battle</button>
              )}
              <button onClick={goToMenu} style={{ padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif", background: "#555577", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Menu</button>
            </div>
          </div>
        </div>
      )}

      {isBossScreen && (isBossDefeated || isBossTimedOut) && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)", zIndex: 20, fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            background: "rgba(30,30,50,0.95)", padding: "30px 40px", borderRadius: 16,
            textAlign: "center", color: "white",
            border: isBossDefeated ? "2px solid #ffcc00" : "2px solid #ff4444",
          }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 24, color: isBossDefeated ? "#ffcc00" : "#ff4444" }}>
              {isBossDefeated ? "Victory!" : "Time's Up!"}
            </h2>
            {isBossDefeated ? (
              <>
                <p style={{ margin: "6px 0", fontSize: 13 }}>The Elemental Guardian has been defeated!</p>
                <p style={{ margin: "8px 0", fontSize: 18, fontWeight: "bold", color: "#ffcc00" }}>Bonus Score: {bossScore}</p>
              </>
            ) : (
              <p style={{ margin: "6px 0", fontSize: 13 }}>The Guardian was too powerful... Try again!</p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button onClick={startBoss} style={{ padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif", background: "#ff8844", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Retry Boss</button>
              <button onClick={goToMenu} style={{ padding: "8px 20px", fontSize: 13, fontFamily: "system-ui, sans-serif", background: "#555577", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Menu</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: "absolute", bottom: isBossScreen ? 8 : 60, right: 8,
        display: "flex", flexDirection: "column", gap: 4,
        fontFamily: "system-ui, sans-serif", fontSize: 11, color: "white",
        zIndex: 10, pointerEvents: "none",
      }}>
        {!isBossScreen && elemInfo.map((el) => (
          <div key={el.key} style={{ background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: el.color, fontSize: 10, fontWeight: "bold" }}>{el.num}</span>
            <span style={{ color: goalsReached[el.key] ? "#66cc66" : "#ff4444" }}>{goalsReached[el.key] ? "REACHED" : "PENDING"}</span>
          </div>
        ))}
        <div style={{ background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 6, textAlign: "center" }}>
          {level + 1}/{PUZZLE_LEVELS.length}{isBossScreen ? " [BOSS]" : ""}
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 8, left: 8,
        fontFamily: "system-ui, sans-serif", fontSize: 11, color: "white",
        background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: 6,
        pointerEvents: "none", zIndex: 10,
      }}>
        {gameMode === "coop"
          ? "Co-op: WASD+F / Arrows+Q / IJKL+G / Numpad+Space"
          : "WASD/Arrows Move | 1-4 Switch | F/Q/G/Space Ability"
        }
      </div>
    </div>
  );
}
