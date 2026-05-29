"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { t } from "@gamehub/game-platform/lib/i18n";

type PlatformState = "superposed" | "solid" | "void";
type KeyColor = "red" | "blue" | "green";

interface PlatformDef {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  solidBias?: number;
  entangledWith?: number;
}

interface GateDef {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: KeyColor;
}

interface KeyDef {
  id: number;
  position: [number, number, number];
  color: KeyColor;
}

interface LevelDef {
  name: string;
  platforms: PlatformDef[];
  gates: GateDef[];
  keys: KeyDef[];
  start: [number, number, number];
  goal: [number, number, number];
}

const LEVELS: LevelDef[] = [
  {
    name: "Entanglement 101",
    platforms: [
      { id: 1, position: [0, 1.5, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [3.5, 2.0, 0], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3 },
      { id: 3, position: [6, 2.0, 0], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3, entangledWith: 2 },
      { id: 4, position: [8.5, 2.5, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 5, position: [8.5, 2.5, 3.5], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 6, position: [6, 2.5, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 7, position: [3, 2.0, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 8, position: [0, 2.0, 5], size: [3, 0.3, 3], color: "#81c784" },
      { id: 9, position: [0, 2.5, 8], size: [3, 0.3, 3], color: "#ce93d8" },
    ],
    gates: [
      { id: 1, position: [6, 2.3, 5], size: [0.3, 1.5, 2], color: "red" },
    ],
    keys: [
      { id: 1, position: [8.5, 2.9, 3.5], color: "red" },
    ],
    start: [0, 2.0, -3],
    goal: [0, 3.0, 10],
  },
  {
    name: "Biased Observer",
    platforms: [
      { id: 1, position: [-5, 1.5, -4], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [-2, 1.5, -2], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 3, position: [1, 2.0, -2], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.8 },
      { id: 4, position: [4, 2.5, -2], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 5, position: [7, 2.5, 0], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 6, position: [7, 3.0, 3], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.2, entangledWith: 5 },
      { id: 7, position: [5, 2.5, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 8, position: [2, 2.0, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 9, position: [-1, 2.0, 5], size: [3, 0.3, 3], color: "#81c784" },
      { id: 10, position: [-4, 2.5, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 11, position: [-4, 2.5, 2], size: [2, 0.3, 2], color: "#ce93d8", solidBias: 0.7 },
      { id: 12, position: [1, 2.5, 2], size: [2, 0.3, 2], color: "#ce93d8", solidBias: 0.7, entangledWith: 11 },
      { id: 13, position: [4, 2.0, -4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 14, position: [6, 3.5, -4], size: [2, 0.3, 2], color: "#ffab40" },
      { id: 15, position: [6, 3.5, -1], size: [2, 0.3, 2], color: "#ce93d8", solidBias: 0.6 },
    ],
    gates: [
      { id: 1, position: [1, 2.2, 2], size: [2, 1.5, 0.3], color: "blue" },
      { id: 2, position: [4, 2.2, -2], size: [0.3, 1.5, 2], color: "green" },
    ],
    keys: [
      { id: 1, position: [-5, 1.9, -4], color: "blue" },
      { id: 2, position: [6, 3.9, -4], color: "green" },
    ],
    start: [-6, 2.0, -6],
    goal: [8, 4.0, -1],
  },
  {
    name: "Quantum Keymaster",
    platforms: [
      { id: 1, position: [-7, 1.5, -6], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [-4, 1.5, -4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 3, position: [-1, 2.0, -4], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.75 },
      { id: 4, position: [2, 2.0, -3], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 5, position: [5, 2.5, -3], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 6, position: [8, 2.5, -1], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.2, entangledWith: 5 },
      { id: 7, position: [8, 3.0, 2], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 8, position: [6, 3.0, 4], size: [2, 0.3, 2], color: "#81c784" },
      { id: 9, position: [3, 2.5, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 10, position: [0, 2.5, 6], size: [2, 0.3, 2], color: "#81c784" },
      { id: 11, position: [-3, 2.0, 6], size: [3, 0.3, 3], color: "#81c784" },
      { id: 12, position: [-6, 2.5, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 13, position: [-6, 2.5, 2], size: [2, 0.3, 2], color: "#ce93d8", solidBias: 0.8 },
      { id: 14, position: [8, 3.5, 5], size: [3, 0.3, 3], color: "#ce93d8" },
      { id: 15, position: [-3, 2.0, 2], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 16, position: [0, 3.0, 2], size: [2, 0.3, 2], color: "#ce93d8", solidBias: 0.6, entangledWith: 15 },
      { id: 17, position: [4, 2.0, 0], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 18, position: [8, 3.5, 8], size: [2, 0.3, 2], color: "#ffab40" },
    ],
    gates: [
      { id: 1, position: [6, 3.3, 4], size: [2, 1.5, 0.3], color: "red" },
      { id: 2, position: [0, 2.3, 6], size: [0.3, 1.5, 2], color: "blue" },
      { id: 3, position: [4, 2.3, 0], size: [2, 1.5, 0.3], color: "green" },
    ],
    keys: [
      { id: 1, position: [-7, 1.9, -6], color: "red" },
      { id: 2, position: [8, 2.9, -1], color: "blue" },
      { id: 3, position: [5, 2.9, -3], color: "green" },
    ],
    start: [-8, 2.0, -8],
    goal: [9, 4.0, 9],
  },
];

const MOVE_SPEED = 7;
const GRAVITY = 18;
const OBSERVE_RANGE = 6;
const RESPAWN_Y = -25;
const GOAL_RADIUS = 1.2;
const OBSERVE_COOLDOWN = 0.4;

interface PlatformRuntime extends PlatformDef {
  state: PlatformState;
  observeFlash: number;
}

interface GateRuntime {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: KeyColor;
  locked: boolean;
}

interface KeyRuntime {
  id: number;
  position: [number, number, number];
  color: KeyColor;
  collected: boolean;
}

function Starfield() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35 + 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffffff" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function PlatformMesh({ platform }: { platform: PlatformRuntime }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    if (platform.observeFlash > 0) {
      platform.observeFlash -= delta * 3;
      matRef.current.emissive.set("#ffffff");
      matRef.current.emissiveIntensity = platform.observeFlash * 2;
      if (platform.observeFlash <= 0) platform.observeFlash = 0;
    }
    if (platform.state === "superposed") {
      const t = performance.now() * 0.001;
      const opacity = 0.25 + Math.sin(t * 2 + platform.id) * 0.15;
      matRef.current.opacity = opacity;
      matRef.current.transparent = true;
      matRef.current.emissive.set(platform.color);
      matRef.current.emissiveIntensity = Math.max(0, platform.observeFlash > 0 ? platform.observeFlash * 2 : 0.3 + Math.sin(t * 3 + platform.id * 0.7) * 0.1);
      meshRef.current.visible = true;
    } else if (platform.state === "solid") {
      matRef.current.opacity = 1;
      matRef.current.transparent = false;
      matRef.current.emissiveIntensity = platform.observeFlash > 0 ? platform.observeFlash * 2 : 0.1;
      meshRef.current.visible = true;
    } else {
      meshRef.current.visible = false;
    }
  });

  return (
    <Box ref={meshRef} args={platform.size} position={platform.position} castShadow receiveShadow>
      <meshStandardMaterial ref={matRef} color={platform.color} roughness={0.4} metalness={0.3} transparent opacity={0.3} />
    </Box>
  );
}

function GateWall({ gate }: { gate: GateRuntime }) {
  if (!gate.locked) return null;
  const colorMap: Record<KeyColor, string> = { red: "#ff4444", blue: "#4488ff", green: "#44cc44" };
  return (
    <Box position={gate.position} args={gate.size}>
      <meshStandardMaterial color={colorMap[gate.color]} roughness={0.5} metalness={0.2} transparent opacity={0.7} emissive={colorMap[gate.color]} emissiveIntensity={0.3} />
    </Box>
  );
}

function KeyOrb({ keyDef }: { keyDef: KeyRuntime }) {
  const colorMap: Record<KeyColor, string> = { red: "#ff4444", blue: "#4488ff", green: "#44cc44" };
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current && !keyDef.collected) {
      ref.current.rotation.y += delta * 2;
      ref.current.position.y = keyDef.position[1] + Math.sin(Date.now() * 0.004) * 0.2;
    }
  });
  if (keyDef.collected) return null;
  return (
    <Sphere ref={ref} args={[0.3, 32, 32]} position={keyDef.position}>
      <meshStandardMaterial color={colorMap[keyDef.color]} emissive={colorMap[keyDef.color]} emissiveIntensity={0.8} roughness={0.2} metalness={0.3} />
    </Sphere>
  );
}

function PlayerSphere({ position }: { position: React.MutableRefObject<THREE.Vector3> }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => { if (ref.current) ref.current.position.copy(position.current); });
  return (
    <Sphere ref={ref} args={[0.35, 32, 32]}>
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} roughness={0.1} metalness={0.0} />
    </Sphere>
  );
}

function GoalSphere({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.5;
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.7;
      glowRef.current.scale.setScalar(1 + Math.sin(performance.now() * 0.003) * 0.15);
    }
  });
  return (
    <group position={position}>
      <Sphere ref={ref} args={[0.4, 32, 32]}>
        <meshStandardMaterial color="#ffd700" emissive="#ffa000" emissiveIntensity={1.0} roughness={0.2} metalness={0.8} />
      </Sphere>
      <Sphere ref={glowRef} args={[0.55, 32, 32]}>
        <meshBasicMaterial color="#ffd700" transparent opacity={0.18} />
      </Sphere>
    </group>
  );
}

function CameraFollower({ target }: { target: React.MutableRefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  useFrame(() => {
    const p = target.current;
    const desired = new THREE.Vector3(p.x + 8, p.y + 10, p.z + 8);
    camera.position.lerp(desired, 0.04);
    camera.lookAt(p.x, p.y + 0.5, p.z);
  });
  return null;
}

function EntanglementLine({ p1, p2, color }: { p1: [number, number, number]; p2: [number, number, number]; color: string }) {
  const points = useMemo(() => [new THREE.Vector3(...p1), new THREE.Vector3(...p2)], [p1, p2]);
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array([...p1, ...p2]), 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.4} />
    </line>
  );
}

function GameScene({
  level,
  onScoreUpdate,
  onObservationsUpdate,
  onLevelComplete,
  onReset,
  onGameComplete,
}: {
  level: number;
  onScoreUpdate: (delta: number) => void;
  onObservationsUpdate: () => void;
  onLevelComplete: (lvl: number) => void;
  onReset: () => void;
  onGameComplete: () => void;
}) {
  const levelDef = LEVELS[level];
  const [platforms, setPlatforms] = useState<PlatformRuntime[]>(() =>
    levelDef.platforms.map((p) => ({ ...p, state: "superposed" as PlatformState, observeFlash: 0 })),
  );
  const [gates, setGates] = useState<GateRuntime[]>(() =>
    levelDef.gates.map((g) => ({ ...g, locked: true })),
  );
  const [keys, setKeys] = useState<KeyRuntime[]>(() =>
    levelDef.keys.map((k) => ({ ...k, collected: false })),
  );
  const [collectedKeys, setCollectedKeys] = useState<Set<KeyColor>>(new Set());

  const playerPos = useRef(new THREE.Vector3(...levelDef.start));
  const playerVel = useRef(new THREE.Vector3(0, 0, 0));
  const keysRef = useRef<Set<string>>(new Set());
  const observeCooldown = useRef(0);
  const platformsRef = useRef(platforms);
  const gatesRef = useRef(gates);
  const keysStateRef = useRef(keys);
  const collectedKeysRef = useRef(collectedKeys);
  const levelRef = useRef(level);
  const goalPos = useMemo(() => new THREE.Vector3(...levelDef.goal), [level]);
  const [, forceRender] = useState(0);

  useEffect(() => { platformsRef.current = platforms; }, [platforms]);
  useEffect(() => { gatesRef.current = gates; }, [gates]);
  useEffect(() => { keysStateRef.current = keys; }, [keys]);
  useEffect(() => { collectedKeysRef.current = collectedKeys; }, [collectedKeys]);
  useEffect(() => { levelRef.current = level; }, [level]);

  useEffect(() => {
    const def = LEVELS[level];
    setPlatforms(def.platforms.map((p) => ({ ...p, state: "superposed" as PlatformState, observeFlash: 0 })));
    setGates(def.gates.map((g) => ({ ...g, locked: true })));
    setKeys(def.keys.map((k) => ({ ...k, collected: false })));
    setCollectedKeys(new Set());
    playerPos.current.set(...def.start);
    playerVel.current.set(0, 0, 0);
    observeCooldown.current = 0;
  }, [level]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    const onSpace = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (observeCooldown.current <= 0) {
          handleObserve();
          observeCooldown.current = OBSERVE_COOLDOWN;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onSpace);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onSpace);
    };
  }, []);

  const handleObserve = useCallback(() => {
    const p = playerPos.current;
    const plats = platformsRef.current;

    let nearest: PlatformRuntime | null = null;
    let minDist = Infinity;

    for (const plat of plats) {
      if (plat.state !== "superposed") continue;
      const dx = p.x - plat.position[0];
      const dy = p.y - plat.position[1];
      const dz = p.z - plat.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < minDist && dist < OBSERVE_RANGE) {
        minDist = dist;
        nearest = plat;
      }
    }

    if (!nearest) return;

    const bias = nearest.solidBias ?? 0.5;
    const collapsed = Math.random() < bias ? "solid" : "void";
    const newState = collapsed as PlatformState;

    setPlatforms((prev) => {
      let updated = prev.map((plat) => {
        if (plat.id === nearest!.id) {
          return { ...plat, state: newState, observeFlash: 1.0 };
        }
        if (nearest!.entangledWith !== undefined && plat.id === nearest!.entangledWith) {
          return { ...plat, state: newState, observeFlash: 0.8 };
        }
        return plat;
      });
      return updated;
    });

    onObservationsUpdate();
  }, [onObservationsUpdate]);

  const collectKey = useCallback((keyId: number, color: KeyColor) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, collected: true } : k)),
    );
    setCollectedKeys((prev) => {
      const next = new Set(prev);
      next.add(color);
      return next;
    });
    setGates((prev) =>
      prev.map((g) => (g.color === color ? { ...g, locked: false } : g)),
    );
    onScoreUpdate(250);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    observeCooldown.current = Math.max(0, observeCooldown.current - dt);

    const p = playerPos.current;
    const v = playerVel.current;
    const plats = platformsRef.current;
    const gts = gatesRef.current;
    const kst = keysStateRef.current;

    const k = keysRef.current;
    let inputX = 0;
    let inputZ = 0;
    if (k.has("w") || k.has("arrowup")) inputZ -= 1;
    if (k.has("s") || k.has("arrowdown")) inputZ += 1;
    if (k.has("a") || k.has("arrowleft")) inputX -= 1;
    if (k.has("d") || k.has("arrowright")) inputX += 1;

    if (inputX !== 0 && inputZ !== 0) {
      const mag = 1 / Math.SQRT2;
      inputX *= mag;
      inputZ *= mag;
    }

    let grounded = false;

    for (const plat of plats) {
      if (plat.state !== "solid") continue;
      const [px, py, pz] = plat.position;
      const [sx, , sz] = plat.size;
      const top = py + plat.size[1] / 2;
      const halfW = sx / 2;
      const halfD = sz / 2;
      if (
        p.x >= px - halfW + 0.35 && p.x <= px + halfW - 0.35 &&
        p.z >= pz - halfD + 0.35 && p.z <= pz + halfD - 0.35
      ) {
        if (p.y <= top + 0.05 && p.y >= top - 1.5) {
          p.y = top;
          v.y = 0;
          grounded = true;
          break;
        }
      }
    }

    for (const g of gts) {
      if (!g.locked) continue;
      const [gx, gy, gz] = g.position;
      const [gsx, gsy, gsz] = g.size;
      const halfW = gsx / 2 + 0.35;
      const halfH = gsy / 2 + 0.35;
      const halfD = gsz / 2 + 0.35;
      if (
        p.x >= gx - halfW && p.x <= gx + halfW &&
        p.y >= gy - halfH && p.y <= gy + halfH &&
        p.z >= gz - halfD && p.z <= gz + halfD
      ) {
        if (inputX > 0) p.x = gx - halfW;
        else if (inputX < 0) p.x = gx + halfW;
        if (inputZ > 0) p.z = gz - halfD;
        else if (inputZ < 0) p.z = gz + halfD;
        v.x = 0;
        v.z = 0;
      }
    }

    for (const key of kst) {
      if (key.collected) continue;
      const dx = p.x - key.position[0];
      const dy = p.y - key.position[1];
      const dz = p.z - key.position[2];
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.0) {
        collectKey(key.id, key.color);
      }
    }

    const speed = grounded ? MOVE_SPEED : MOVE_SPEED * 0.6;
    v.x = inputX * speed;
    v.z = inputZ * speed;
    if (!grounded) v.y -= GRAVITY * dt;

    p.x += v.x * dt;
    p.y += v.y * dt;
    p.z += v.z * dt;

    if (p.y < RESPAWN_Y) {
      p.set(...LEVELS[levelRef.current].start);
      v.set(0, 0, 0);
      onReset();
    }

    const dxg = p.x - goalPos.x;
    const dyg = p.y - goalPos.y;
    const dzg = p.z - goalPos.z;
    if (Math.sqrt(dxg * dxg + dyg * dyg + dzg * dzg) < GOAL_RADIUS) {
      if (levelRef.current < LEVELS.length - 1) {
        onLevelComplete(levelRef.current);
      } else {
        onGameComplete();
      }
    }

    forceRender((r) => r + 1);
  });

  const entangledPairs = levelDef.platforms
    .filter((p) => p.entangledWith !== undefined)
    .map((p) => {
      const other = levelDef.platforms.find((o) => o.id === p.entangledWith);
      return other ? [p, other] as [PlatformDef, PlatformDef] : null;
    })
    .filter((pair): pair is [PlatformDef, PlatformDef] => pair !== null && pair[0].id < pair[1].id);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 12, 0]} intensity={0.4} color="#4488ff" />
      <Starfield />
      {platforms.map((plat) => (
        <PlatformMesh key={plat.id} platform={plat} />
      ))}
      {gates.map((g) => (
        <GateWall key={`gate-${g.id}`} gate={g} />
      ))}
      {keys.map((k) => (
        <KeyOrb key={`key-${k.id}`} keyDef={k} />
      ))}
      {entangledPairs.map(([a, b]) => (
        <EntanglementLine key={`el-${a.id}-${b.id}`} p1={a.position} p2={b.position} color="#ff8888" />
      ))}
      <PlayerSphere position={playerPos} />
      <GoalSphere position={levelDef.goal} />
      <CameraFollower target={playerPos} />
    </>
  );
}

export default function QuantumArchitectGame() {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [observations, setObservations] = useState(0);
  const [gamePhase, setGamePhase] = useState<"title" | "playing" | "win">("title");
  const [nearPlatformBias, setNearPlatformBias] = useState<string>("-");

  const handleStart = useCallback(() => {
    setLevel(0); setScore(0); setObservations(0); setGamePhase("playing");
    setNearPlatformBias("-");
  }, []);

  const handleScoreUpdate = useCallback((delta: number) => {
    setScore((s) => s + delta);
  }, []);

  const handleObservationsUpdate = useCallback(() => {
    setObservations((o) => o + 1);
  }, []);

  const handleLevelComplete = useCallback(
    (completedLevel: number) => {
      const levelBonus = (completedLevel + 1) * 1200;
      const efficiency = Math.max(0, 600 - observations * 15);
      setScore((s) => s + levelBonus + efficiency);
      setLevel((l) => l + 1);
      setObservations(0);
      setNearPlatformBias("-");
    },
    [observations],
  );

  const handleGameComplete = useCallback(() => {
    setScore((s) => s + 2500);
    setGamePhase("win");
  }, []);

  const handleReset = useCallback(() => {}, [] as never[]);

  const levelDef = LEVELS[level];

  return (
    <div className="relative flex h-[80vh] w-full flex-col items-center bg-black">
      <Canvas
        className="h-full w-full"
        camera={{ position: [12, 14, 12], fov: 55, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0a0a1a"]} />
        {gamePhase === "playing" ? (
          <GameScene
            key={level}
            level={level}
            onScoreUpdate={handleScoreUpdate}
            onObservationsUpdate={handleObservationsUpdate}
            onLevelComplete={handleLevelComplete}
            onReset={handleReset}
            onGameComplete={handleGameComplete}
          />
        ) : (
          <>
            <ambientLight intensity={0.4} />
            <Starfield />
          </>
        )}
      </Canvas>

      <div className="pointer-events-none absolute left-0 top-0 z-10 flex w-full justify-between p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
          <div className="text-sm font-bold text-blue-300">{t("quantumarchitect.score")}: {score}</div>
          <div className="text-xs text-gray-400">
            {t("quantumarchitect.level")} {level + 1}/{LEVELS.length}{" "}
            {gamePhase === "playing" ? `— ${LEVELS[level].name}` : ""}
          </div>
        </div>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
          <div className="text-sm font-bold text-purple-300">{t("quantumarchitect.observations")}: {observations}</div>
          <div className="text-xs text-gray-400">
            {t("quantumarchitect.quantumProb")} {nearPlatformBias !== "-" ? nearPlatformBias : "—"}
          </div>
        </div>
        {gamePhase === "playing" && (
          <div className="rounded-lg bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
            <div className="text-sm font-bold text-yellow-300">{t("quantumarchitect.keys")}: {levelDef.gates.filter((g) => levelDef.keys.every((k) => true)).length}</div>
          </div>
        )}
      </div>

      {gamePhase === "title" && (
        <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
          <h1 className="mb-2 text-4xl font-bold text-cyan-300">{t("quantumarchitect.title")}</h1>
          <p className="mb-6 max-w-md text-center text-gray-300">
            {t("quantumarchitect.subtitle")}
          </p>
          <div className="mb-4 text-sm text-gray-400">
            <div>WASD / Arrows — Move</div>
            <div>Space — Observe (collapse nearest platform)</div>
            <div>Collect colored keys to unlock matching gates</div>
            <div>Entangled platforms: observing one affects both</div>
          </div>
          <button
            onClick={handleStart}
            className="rounded-lg bg-cyan-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-cyan-500"
          >
            {t("quantumarchitect.begin")}
          </button>
        </div>
      )}

      {gamePhase === "win" && (
        <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
          <h1 className="mb-2 text-4xl font-bold text-yellow-300">{t("quantumarchitect.win")}</h1>
          <p className="mb-2 text-xl text-gray-300">{t("quantumarchitect.finalScore")}: {score}</p>
          <p className="mb-6 text-sm text-gray-400">{t("quantumarchitect.totalObs")}: {observations}</p>
          <button
            onClick={handleStart}
            className="rounded-lg bg-cyan-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-cyan-500"
          >
            {t("quantumarchitect.newExperiment")}
          </button>
        </div>
      )}

      {gamePhase === "playing" && (
        <>
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-center text-xs text-gray-400 backdrop-blur-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
            {t("quantumarchitect.controls")}
          </div>
          <div className="pointer-events-none absolute bottom-12 right-4 z-10 rounded-lg bg-black/50 px-3 py-2 text-xs backdrop-blur-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
            {levelDef.platforms.filter((p) => p.solidBias !== undefined).map((p) => (
              <div key={p.id} className="text-gray-400">
                <span style={{ color: p.color }}>P{p.id}</span> {t("quantumarchitect.bias")}: {((p.solidBias ?? 0.5) * 100).toFixed(0)}%
                {p.entangledWith !== undefined && <span className="text-red-400"> ({t("quantumarchitect.entangled")}: P{p.entangledWith})</span>}
              </div>
            ))}
            {levelDef.gates.map((g) => (
              <div key={g.id} className="text-gray-400">
                <span style={{ color: g.color }}>Gate {g.id}</span>: {t("quantumarchitect.gateLocked")}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
