"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, Sphere, Text } from "@react-three/drei";
import * as THREE from "three";

type PlatformState = "superposed" | "solid" | "void";

interface PlatformDef {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

interface LevelDef {
  name: string;
  platforms: PlatformDef[];
  start: [number, number, number];
  goal: [number, number, number];
}

const LEVELS: LevelDef[] = [
  {
    name: "Quantum Basics",
    platforms: [
      { id: 1, position: [0, 1.5, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [3, 1.5, 0], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 3, position: [5.5, 1.5, 0], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 4, position: [8, 2.0, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 5, position: [8, 2.0, 3], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 6, position: [8, 2.5, 6], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 7, position: [5, 2.5, 7], size: [2, 0.3, 2], color: "#81c784" },
      { id: 8, position: [2, 2.0, 7], size: [2, 0.3, 2], color: "#81c784" },
      { id: 9, position: [0, 2.0, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 10, position: [0, 1.5, 2.5], size: [2, 0.3, 2], color: "#81c784" },
    ],
    start: [0, 2.0, -2],
    goal: [0, 2.5, 8],
  },
  {
    name: "Entanglement",
    platforms: [
      { id: 1, position: [-4, 1.5, -4], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [-1, 1.5, -4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 3, position: [2, 2.0, -2], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 4, position: [5, 2.0, -1], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 5, position: [7, 2.5, 1], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 6, position: [7, 2.5, 4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 7, position: [5, 2.0, 6], size: [2, 0.3, 2], color: "#81c784" },
      { id: 8, position: [2, 2.0, 7], size: [2, 0.3, 2], color: "#81c784" },
      { id: 9, position: [-1, 2.5, 7], size: [3, 0.3, 3], color: "#81c784" },
      { id: 10, position: [-4, 2.5, 6], size: [2, 0.3, 2], color: "#81c784" },
      { id: 11, position: [-5, 2.0, 3], size: [2, 0.3, 2], color: "#81c784" },
      { id: 12, position: [-3, 1.5, 1], size: [2, 0.3, 2], color: "#81c784" },
      { id: 13, position: [0, 1.5, -1], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 14, position: [-5, 2.0, -1], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 15, position: [3, 1.5, 3], size: [2, 0.3, 2], color: "#ce93d8" },
    ],
    start: [-5, 2.0, -6],
    goal: [-5, 3.0, 8],
  },
  {
    name: "Wave Function Collapse",
    platforms: [
      { id: 1, position: [-6, 1.5, -6], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [-3, 1.5, -5], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 3, position: [0, 1.5, -4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 4, position: [3, 2.0, -3], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 5, position: [6, 2.0, -2], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 6, position: [8, 2.5, -2], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 7, position: [8, 2.5, 1], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 8, position: [7, 2.0, 3], size: [2, 0.3, 2], color: "#81c784" },
      { id: 9, position: [5, 2.0, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 10, position: [2, 2.5, 6], size: [2, 0.3, 2], color: "#81c784" },
      { id: 11, position: [-1, 2.5, 7], size: [2, 0.3, 2], color: "#81c784" },
      { id: 12, position: [-4, 2.0, 7], size: [3, 0.3, 3], color: "#81c784" },
      { id: 13, position: [-6, 2.0, 6], size: [2, 0.3, 2], color: "#81c784" },
      { id: 14, position: [-7, 2.5, 4], size: [2, 0.3, 2], color: "#81c784" },
      { id: 15, position: [-6, 2.5, 1], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 16, position: [-4, 2.0, -1], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 17, position: [-2, 1.5, -2], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 18, position: [1, 1.5, -2], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 19, position: [4, 2.0, 0], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 20, position: [3, 2.0, 3], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 21, position: [0, 2.5, 3], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 22, position: [-2, 2.5, 3], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 23, position: [1, 1.5, 6], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 24, position: [-4, 1.5, -4], size: [2, 0.3, 2], color: "#ce93d8" },
      { id: 25, position: [8, 3.0, 4], size: [2, 0.3, 2], color: "#ffab40" },
    ],
    start: [-8, 2.0, -8],
    goal: [9, 3.5, 5],
  },
];

const MOVE_SPEED = 6;
const GRAVITY = 15;
const OBSERVE_RANGE = 5;
const RESPAWN_Y = -20;
const GOAL_RADIUS = 1.0;

interface PlatformRuntime extends PlatformDef {
  state: PlatformState;
  observeFlash: number;
}

function Starfield() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffffff" sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function PlatformMesh({
  platform,
}: {
  platform: PlatformRuntime;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((_, delta) => {
    if (!matRef.current) return;

    if (platform.observeFlash > 0) {
      platform.observeFlash -= delta * 3;
      matRef.current.emissive.set("#ffffff");
      matRef.current.emissiveIntensity = platform.observeFlash * 2;
      if (platform.observeFlash <= 0) {
        platform.observeFlash = 0;
      }
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
    <Box
      ref={meshRef}
      args={platform.size}
      position={platform.position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        ref={matRef}
        color={platform.color}
        roughness={0.4}
        metalness={0.3}
        transparent
        opacity={0.3}
      />
    </Box>
  );
}

function PlayerSphere({
  position,
}: {
  position: React.MutableRefObject<THREE.Vector3>;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(position.current);
    }
  });

  return (
    <Sphere ref={ref} args={[0.35, 32, 32]}>
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.0}
      />
    </Sphere>
  );
}

function GoalSphere({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 1.5;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.7;
      const s = 1 + Math.sin(performance.now() * 0.003) * 0.15;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={ref} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffa000"
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.8}
        />
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
    const desired = new THREE.Vector3(p.x + 7, p.y + 8, p.z + 7);
    camera.position.lerp(desired, 0.04);
    camera.lookAt(p.x, p.y + 0.5, p.z);
  });

  return null;
}

const OBSERVE_COOLDOWN = 0.5;

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
  const [platforms, setPlatforms] = useState<PlatformRuntime[]>(() =>
    LEVELS[level].platforms.map((p) => ({ ...p, state: "superposed" as PlatformState, observeFlash: 0 })),
  );
  const playerPos = useRef(new THREE.Vector3(...LEVELS[level].start));
  const playerVel = useRef(new THREE.Vector3(0, 0, 0));
  const keysRef = useRef<Set<string>>(new Set());
  const observeCooldown = useRef(0);
  const platformsRef = useRef(platforms);
  const levelRef = useRef(level);
  const goalPos = useMemo(() => new THREE.Vector3(...LEVELS[level].goal), [level]);
  const [, forceRender] = useState(0);

  useEffect(() => {
    platformsRef.current = platforms;
  }, [platforms]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const def = LEVELS[level];
    const newPlats = def.platforms.map((p) => ({
      ...p,
      state: "superposed" as PlatformState,
      observeFlash: 0,
    }));
    setPlatforms(newPlats);
    playerPos.current.set(...def.start);
    playerVel.current.set(0, 0, 0);
    observeCooldown.current = 0;
  }, [level]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
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

    const collapsed = Math.random() < 0.5 ? "solid" : "void";
    const newState = collapsed as PlatformState;

    setPlatforms((prev) =>
      prev.map((plat) =>
        plat.id === nearest!.id
          ? { ...plat, state: newState, observeFlash: 1.0 }
          : plat,
      ),
    );

    onObservationsUpdate();
  }, [onObservationsUpdate]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    observeCooldown.current = Math.max(0, observeCooldown.current - dt);

    const p = playerPos.current;
    const v = playerVel.current;
    const plats = platformsRef.current;

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
        p.x >= px - halfW + 0.35 &&
        p.x <= px + halfW - 0.35 &&
        p.z >= pz - halfD + 0.35 &&
        p.z <= pz + halfD - 0.35
      ) {
        if (p.y <= top + 0.05 && p.y >= top - 1.2) {
          p.y = top;
          v.y = 0;
          grounded = true;
          break;
        }
      }
    }

    const speed = grounded ? MOVE_SPEED : MOVE_SPEED * 0.6;
    v.x = inputX * speed;
    v.z = inputZ * speed;

    if (!grounded) {
      v.y -= GRAVITY * dt;
    }

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
    const distToGoal = Math.sqrt(dxg * dxg + dyg * dyg + dzg * dzg);
    if (distToGoal < GOAL_RADIUS) {
      if (levelRef.current < LEVELS.length - 1) {
        onLevelComplete(levelRef.current);
      } else {
        onGameComplete();
      }
    }

    forceRender((r) => r + 1);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.4} color="#4488ff" />
      <Starfield />
      {platforms.map((plat) => (
        <PlatformMesh key={plat.id} platform={plat} />
      ))}
      <PlayerSphere position={playerPos} />
      <GoalSphere position={LEVELS[level].goal} />
      <CameraFollower target={playerPos} />
    </>
  );
}

export default function QuantumArchitectGame() {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [observations, setObservations] = useState(0);
  const [gamePhase, setGamePhase] = useState<"title" | "playing" | "win">("title");
  const levelRef = useRef(level);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const handleStart = useCallback(() => {
    setLevel(0);
    setScore(0);
    setObservations(0);
    setGamePhase("playing");
  }, []);

  const handleScoreUpdate = useCallback((delta: number) => {
    setScore((s) => s + delta);
  }, []);

  const handleObservationsUpdate = useCallback(() => {
    setObservations((o) => o + 1);
  }, []);

  const handleLevelComplete = useCallback(
    (completedLevel: number) => {
      const levelBonus = (completedLevel + 1) * 1000;
      const efficiency = Math.max(0, 500 - observations * 10);
      setScore((s) => s + levelBonus + efficiency);
      setLevel((l) => l + 1);
      setObservations(0);
    },
    [observations],
  );

  const handleGameComplete = useCallback(() => {
    setScore((s) => s + 2000);
    setGamePhase("win");
  }, []);

  const handleReset = useCallback(() => { }, [] as never[]);

  return (
    <div className="relative flex h-[80vh] w-full flex-col items-center bg-black">
      <Canvas
        className="h-full w-full"
        camera={{ position: [10, 12, 10], fov: 55, near: 0.1, far: 100 }}
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

      <div className="pointer-events-none absolute left-0 top-0 z-10 flex w-full justify-between p-4">
        <div className="rounded-lg bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
          <div className="text-sm font-bold text-blue-300">Score: {score}</div>
          <div className="text-xs text-gray-400">
            Level {level + 1}/{LEVELS.length}{" "}
            {gamePhase === "playing" ? `— ${LEVELS[level].name}` : ""}
          </div>
        </div>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
          <div className="text-sm font-bold text-purple-300">Observations: {observations}</div>
          <div className="text-xs text-gray-400">Quantum probability: 50/50</div>
        </div>
      </div>

      {gamePhase === "title" && (
        <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
          <h1 className="mb-2 text-4xl font-bold text-cyan-300">Quantum Architect</h1>
          <p className="mb-6 max-w-md text-center text-gray-300">
            Manipulate quantum states to create walkable platforms.{"\n"}
            Observe superposition platforms — they may solidify or vanish.
          </p>
          <div className="mb-4 text-sm text-gray-400">
            <div>WASD / Arrows — Move</div>
            <div>Space — Observe (collapse nearest platform)</div>
          </div>
          <button
            onClick={handleStart}
            className="rounded-lg bg-cyan-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-cyan-500"
          >
            Begin Experiment
          </button>
        </div>
      )}

      {gamePhase === "win" && (
        <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
          <h1 className="mb-2 text-4xl font-bold text-yellow-300">Wave Function Resolved!</h1>
          <p className="mb-2 text-xl text-gray-300">Final Score: {score}</p>
          <p className="mb-6 text-sm text-gray-400">Total Observations: {observations}</p>
          <button
            onClick={handleStart}
            className="rounded-lg bg-cyan-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-cyan-500"
          >
            New Experiment
          </button>
        </div>
      )}

      {gamePhase === "playing" && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-center text-xs text-gray-400 backdrop-blur-sm">
          WASD/Arrows to move | Space to observe nearest quantum platform
        </div>
      )}
    </div>
  );
}
