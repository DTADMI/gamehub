"use client";

import { t } from "@/lib/i18n";
import { Box, Html,Sphere } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type PlatformState = "superposed" | "solid" | "void";
type KeyColor = "red" | "blue" | "green";

interface PlatformDef {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  solidBias?: number;
  entangledWith?: number;
  entangledGroup?: number;
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

interface CrystalDef {
  id: number;
  position: [number, number, number];
}

interface LevelDef {
  name: string;
  platforms: PlatformDef[];
  gates: GateDef[];
  keys: KeyDef[];
  crystals: CrystalDef[];
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
    crystals: [],
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
    crystals: [],
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
    crystals: [],
    start: [-8, 2.0, -8],
    goal: [9, 4.0, 9],
  },
  {
    name: "Certainty Principle",
    platforms: [
      { id: 1, position: [0, 1.5, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [3, 2.0, 0], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3 },
      { id: 3, position: [6, 2.0, 0], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.7, entangledWith: 2 },
      { id: 4, position: [9, 2.5, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 5, position: [6, 2.5, 3], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 6, position: [3, 2.5, 3], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 7, position: [0, 2.0, 3], size: [3, 0.3, 3], color: "#81c784" },
      { id: 8, position: [0, 2.5, 6], size: [3, 0.3, 3], color: "#ce93d8" },
    ],
    gates: [
      { id: 1, position: [3, 2.7, 3], size: [0.3, 1.5, 2], color: "red" },
    ],
    keys: [
      { id: 1, position: [6, 2.9, 3], color: "red" },
    ],
    crystals: [
      { id: 1, position: [3, 2.5, 0] },
      { id: 2, position: [0, 2.5, 3] },
    ],
    start: [0, 2.0, -3],
    goal: [0, 3.0, 8],
  },
  {
    name: "Chain Reaction",
    platforms: [
      { id: 1, position: [-3, 1.5, -4], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [0, 2.0, -3], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.5, entangledGroup: 1 },
      { id: 3, position: [3, 2.0, -3], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.5, entangledGroup: 1 },
      { id: 4, position: [6, 2.0, -3], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.5, entangledGroup: 1 },
      { id: 5, position: [6, 2.5, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 6, position: [3, 2.5, 1], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 7, position: [0, 2.5, 2], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 2 },
      { id: 8, position: [-3, 2.5, 2], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 2 },
      { id: 9, position: [-3, 3.0, 4], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 2 },
      { id: 10, position: [0, 3.0, 5], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 2 },
      { id: 11, position: [0, 3.5, 7], size: [3, 0.3, 3], color: "#81c784" },
    ],
    gates: [],
    keys: [],
    crystals: [
      { id: 1, position: [6, 2.9, 0] },
    ],
    start: [-4, 2.0, -6],
    goal: [0, 4.0, 9],
  },
  {
    name: "The Observer's Dilemma",
    platforms: [
      { id: 1, position: [-3, 1.5, -5], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [0, 2.0, -4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 3, position: [3, 2.0, -3], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3 },
      { id: 4, position: [6, 2.0, -3], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.7, entangledWith: 3 },
      { id: 5, position: [6, 2.5, 0], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 6, position: [3, 2.5, 1], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 7, position: [0, 2.5, 2], size: [2, 0.3, 2], color: "#81c784" },
      { id: 8, position: [-3, 2.5, 2], size: [2, 0.3, 2], color: "#81c784" },
      { id: 9, position: [-3, 3.0, 4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 10, position: [0, 3.0, 5], size: [2, 0.3, 2], color: "#81c784" },
      { id: 11, position: [3, 3.0, 6], size: [2, 0.3, 2], color: "#81c784" },
      { id: 12, position: [5, 3.5, 7], size: [3, 0.3, 3], color: "#ce93d8" },
    ],
    gates: [
      { id: 1, position: [6, 2.7, 0], size: [0.3, 1.5, 2], color: "red" },
      { id: 2, position: [-3, 2.7, 2], size: [0.3, 1.5, 2], color: "blue" },
      { id: 3, position: [0, 3.2, 5], size: [0.3, 1.5, 2], color: "green" },
    ],
    keys: [
      { id: 1, position: [3, 2.5, -3], color: "red" },
      { id: 2, position: [0, 2.9, 2], color: "blue" },
      { id: 3, position: [-3, 3.4, 4], color: "green" },
    ],
    crystals: [
      { id: 1, position: [3, 2.5, 1] },
      { id: 2, position: [0, 3.5, 5] },
    ],
    start: [-4, 2.0, -7],
    goal: [5, 4.0, 9],
  },
  {
    name: "Entanglement Web",
    platforms: [
      { id: 1, position: [-6, 1.5, -5], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [-3, 2.0, -4], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 1 },
      { id: 3, position: [0, 2.0, -4], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 1 },
      { id: 4, position: [3, 2.0, -3], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 1 },
      { id: 5, position: [6, 2.0, -3], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.4, entangledGroup: 1 },
      { id: 6, position: [6, 2.5, 0], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 7, position: [3, 2.5, 1], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 8, position: [0, 2.5, 2], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 9, position: [-3, 2.5, 2], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 10, position: [-3, 3.0, 4], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 11, position: [0, 3.0, 5], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 12, position: [3, 3.0, 6], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 13, position: [5, 3.5, 7], size: [3, 0.3, 3], color: "#ce93d8" },
      { id: 14, position: [8, 3.5, 5], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3, entangledWith: 15 },
      { id: 15, position: [8, 3.0, 2], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3, entangledWith: 14 },
    ],
    gates: [
      { id: 1, position: [3, 2.7, 1], size: [0.3, 1.5, 2], color: "red" },
      { id: 2, position: [0, 3.2, 5], size: [0.3, 1.5, 2], color: "blue" },
    ],
    keys: [
      { id: 1, position: [6, 2.9, 0], color: "red" },
      { id: 2, position: [3, 3.4, 6], color: "blue" },
    ],
    crystals: [
      { id: 1, position: [-3, 2.5, -4] },
      { id: 2, position: [0, 2.5, 2] },
      { id: 3, position: [8, 3.0, 5] },
    ],
    start: [-7, 2.0, -7],
    goal: [7, 4.0, 8],
  },
  {
    name: "Final Observation",
    platforms: [
      { id: 1, position: [-6, 1.5, -7], size: [3, 0.3, 3], color: "#4fc3f7" },
      { id: 2, position: [-3, 2.0, -6], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 3, position: [0, 2.0, -5], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3, entangledWith: 4 },
      { id: 4, position: [3, 2.0, -5], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.3, entangledWith: 3 },
      { id: 5, position: [6, 2.0, -4], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.5, entangledGroup: 1 },
      { id: 6, position: [6, 2.5, -1], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.5, entangledGroup: 1 },
      { id: 7, position: [6, 3.0, 2], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.5, entangledGroup: 1 },
      { id: 8, position: [3, 2.5, 3], size: [2, 0.3, 2], color: "#81c784" },
      { id: 9, position: [0, 2.5, 3], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 10, position: [-3, 2.5, 3], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 11, position: [-3, 3.0, 5], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 12, position: [0, 3.0, 6], size: [2, 0.3, 2], color: "#9966ff", solidBias: 0.6, entangledGroup: 2 },
      { id: 13, position: [3, 3.0, 7], size: [2, 0.3, 2], color: "#81c784" },
      { id: 14, position: [6, 3.5, 8], size: [2, 0.3, 2], color: "#81c784" },
      { id: 15, position: [3, 3.5, 6], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.8, entangledWith: 14 },
      { id: 16, position: [0, 3.5, 4], size: [2, 0.3, 2], color: "#ff8a65", solidBias: 0.8, entangledWith: 15 },
      { id: 17, position: [3, 3.0, 4], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 18, position: [6, 3.0, 5], size: [2, 0.3, 2], color: "#4fc3f7" },
      { id: 19, position: [9, 3.5, 5], size: [3, 0.3, 3], color: "#81c784" },
      { id: 20, position: [9, 4.0, 8], size: [3, 0.3, 3], color: "#ce93d8" },
    ],
    gates: [
      { id: 1, position: [3, 2.7, 3], size: [0.3, 1.5, 2], color: "red" },
      { id: 2, position: [0, 3.2, 4], size: [2, 1.5, 0.3], color: "blue" },
      { id: 3, position: [6, 3.2, 8], size: [0.3, 1.5, 2], color: "green" },
    ],
    keys: [
      { id: 1, position: [6, 2.5, -4], color: "red" },
      { id: 2, position: [-3, 3.4, 5], color: "blue" },
      { id: 3, position: [3, 3.4, 7], color: "green" },
    ],
    crystals: [
      { id: 1, position: [0, 2.5, -5] },
      { id: 2, position: [6, 3.4, 2] },
      { id: 3, position: [0, 3.5, 6] },
      { id: 4, position: [9, 3.9, 5] },
    ],
    start: [-7, 2.0, -9],
    goal: [9, 4.5, 10],
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

interface CrystalRuntime {
  id: number;
  position: [number, number, number];
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
    if (ref.current) {ref.current.rotation.y += delta * 0.015;}
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
    if (!matRef.current) {return;}
    if (platform.observeFlash > 0) {
      platform.observeFlash -= delta * 3;
      matRef.current.emissive.set("#ffffff");
      matRef.current.emissiveIntensity = platform.observeFlash * 2;
      if (platform.observeFlash <= 0) {platform.observeFlash = 0;}
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
    <Box ref={meshRef as any} args={platform.size} position={platform.position} castShadow receiveShadow>
      <meshStandardMaterial ref={matRef} color={platform.color} roughness={0.4} metalness={0.3} transparent opacity={0.3} />
    </Box>
  );
}

function GateWall({ gate }: { gate: GateRuntime }) {
  if (!gate.locked) {return null;}
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
  if (keyDef.collected) {return null;}
  return (
    <Sphere ref={ref as any} args={[0.3, 32, 32]} position={keyDef.position}>
      <meshStandardMaterial color={colorMap[keyDef.color]} emissive={colorMap[keyDef.color]} emissiveIntensity={0.8} roughness={0.2} metalness={0.3} />
    </Sphere>
  );
}

function PlayerSphere({ position }: { position: React.MutableRefObject<THREE.Vector3> }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => { if (ref.current) {ref.current.position.copy(position.current);} });
  return (
    <Sphere ref={ref as any} args={[0.35, 32, 32]}>
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} roughness={0.1} metalness={0.0} />
    </Sphere>
  );
}

function GoalSphere({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) {ref.current.rotation.y += delta * 1.5;}
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.7;
      glowRef.current.scale.setScalar(1 + Math.sin(performance.now() * 0.003) * 0.15);
    }
  });
  return (
    <group position={position}>
      <Sphere ref={ref as any} args={[0.4, 32, 32]}>
        <meshStandardMaterial color="#ffd700" emissive="#ffa000" emissiveIntensity={1.0} roughness={0.2} metalness={0.8} />
      </Sphere>
      <Sphere ref={glowRef as any} args={[0.55, 32, 32]}>
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

function CrystalMesh({ crystal, collected }: { crystal: CrystalRuntime; collected: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (!ref.current || collected) {return;}
    ref.current.rotation.y += delta * 1.5;
    ref.current.rotation.x += delta * 0.3;
    ref.current.position.y = crystal.position[1] + Math.sin(performance.now() * 0.003 + crystal.id) * 0.15;
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.5;
      glowRef.current.scale.setScalar(1 + Math.sin(performance.now() * 0.004 + crystal.id) * 0.1);
    }
  });
  if (collected) {return null;}
  return (
    <group>
      <mesh ref={ref} position={crystal.position}>
        <tetrahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffa000" emissiveIntensity={0.8} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh ref={glowRef} position={crystal.position}>
        <tetrahedronGeometry args={[0.35, 0]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function CatenaryChain({ positions, color }: { positions: [number, number, number][]; color: string }) {
  const { vecPoints, posArray } = useMemo(() => {
    if (positions.length < 2) {return { vecPoints: [] as THREE.Vector3[], posArray: null as Float32Array | null };}
    const vecs = positions.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vecs);
    const pts = curve.getPoints(50);
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return { vecPoints: pts, posArray: arr };
  }, [positions]);
  const points = vecPoints;
  if (points.length < 2 || posArray === null) {return null;}
  const positionsArray = posArray;
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionsArray, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.5} />
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
  onCrystalsUpdate,
}: {
  level: number;
  onScoreUpdate: (delta: number) => void;
  onObservationsUpdate: () => void;
  onLevelComplete: (lvl: number) => void;
  onReset: () => void;
  onGameComplete: () => void;
  onCrystalsUpdate: (count: number) => void;
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
  const [crystals, setCrystals] = useState<CrystalRuntime[]>(() =>
    (levelDef.crystals ?? []).map((c) => ({ ...c, collected: false })),
  );
  const [crystalsAvail, setCrystalsAvail] = useState(0);
  const [observationUI, setObservationUI] = useState<{ platformId: number; selected: "solid" | "void" } | null>(null);

  const playerPos = useRef(new THREE.Vector3(...levelDef.start));
  const playerVel = useRef(new THREE.Vector3(0, 0, 0));
  const keysRef = useRef<Set<string>>(new Set());
  const observeCooldown = useRef(0);
  const platformsRef = useRef(platforms);
  const gatesRef = useRef(gates);
  const keysStateRef = useRef(keys);
  const collectedKeysRef = useRef(collectedKeys);
  const crystalsRef = useRef(crystals);
  const levelRef = useRef(level);
  const goalPos = useMemo(() => new THREE.Vector3(...levelDef.goal), [level]);
  const [, forceRender] = useState(0);
  const isObservingRef = useRef(false);
  const crystalsAvailRef = useRef(0);
  const observationDataRef = useRef<{ platformId: number; selected: "solid" | "void" } | null>(null);

  useEffect(() => { platformsRef.current = platforms; }, [platforms]);
  useEffect(() => { gatesRef.current = gates; }, [gates]);
  useEffect(() => { keysStateRef.current = keys; }, [keys]);
  useEffect(() => { collectedKeysRef.current = collectedKeys; }, [collectedKeys]);
  useEffect(() => { crystalsRef.current = crystals; }, [crystals]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { crystalsAvailRef.current = crystalsAvail; }, [crystalsAvail]);
  useEffect(() => { isObservingRef.current = observationUI !== null; observationDataRef.current = observationUI; }, [observationUI]);

  useEffect(() => {
    const def = LEVELS[level];
    setPlatforms(def.platforms.map((p) => ({ ...p, state: "superposed" as PlatformState, observeFlash: 0 })));
    setGates(def.gates.map((g) => ({ ...g, locked: true })));
    setKeys(def.keys.map((k) => ({ ...k, collected: false })));
    setCrystals((def.crystals ?? []).map((c) => ({ ...c, collected: false })));
    setCrystalsAvail(0);
    setCollectedKeys(new Set());
    setObservationUI(null);
    playerPos.current.set(...def.start);
    playerVel.current.set(0, 0, 0);
    observeCooldown.current = 0;
  }, [level]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (isObservingRef.current) {
        e.preventDefault();
        const data = observationDataRef.current;
        if (key === "e") { handleObservationChoiceFn(data, "solid"); return; }
        if (key === "q") { handleObservationChoiceFn(data, "void"); return; }
        if (key === "arrowleft") { setObservationUI(data ? { ...data, selected: "solid" } : null); return; }
        if (key === "arrowright") { setObservationUI(data ? { ...data, selected: "void" } : null); return; }
        if (e.key === " " || e.code === "Space") { if (data) {handleObservationChoiceFn(data, data.selected);} return; }
        if (key === "escape") { setObservationUI(null); return; }
        return;
      }

      keysRef.current.add(key);

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (observeCooldown.current <= 0) {
          startObservingFn();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const startObservingFn = useCallback(() => {
    const p = playerPos.current;
    const plats = platformsRef.current;

    let nearest: PlatformRuntime | null = null;
    let minDist = Infinity;

    for (const plat of plats) {
      if (plat.state !== "superposed") {continue;}
      const dx = p.x - plat.position[0];
      const dy = p.y - plat.position[1];
      const dz = p.z - plat.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < minDist && dist < OBSERVE_RANGE) {
        minDist = dist;
        nearest = plat;
      }
    }

    if (!nearest) {return;}

    keysRef.current.clear();
    setObservationUI({ platformId: nearest.id, selected: "solid" });
  }, []);

  const handleObservationChoiceFn = useCallback((data: { platformId: number; selected: "solid" | "void" } | null, chosenOutcome: "solid" | "void") => {
    if (!data) {return;}

    const platform = platformsRef.current.find((p) => p.id === data.platformId);
    if (!platform) { setObservationUI(null); return; }

    let actualOutcome: PlatformState;

    if (crystalsAvailRef.current > 0) {
      actualOutcome = chosenOutcome;
      setCrystalsAvail((prev) => prev - 1);
    } else {
      const bias = platform.solidBias ?? 0.5;
      actualOutcome = Math.random() < bias ? "solid" : "void";
    }

    setPlatforms((prev) => {
      return prev.map((plat) => {
        if (plat.id === platform.id) {
          return { ...plat, state: actualOutcome, observeFlash: 1.0 };
        }
        if (plat.entangledWith === platform.id) {
          return { ...plat, state: actualOutcome, observeFlash: 0.8 };
        }
        if (platform.entangledWith !== undefined && plat.id === platform.entangledWith) {
          return { ...plat, state: actualOutcome, observeFlash: 0.8 };
        }
        if (platform.entangledGroup !== undefined && plat.entangledGroup === platform.entangledGroup && plat.id !== platform.id) {
          return { ...plat, state: actualOutcome, observeFlash: 0.8 };
        }
        return plat;
      });
    });

    setObservationUI(null);
    observeCooldown.current = OBSERVE_COOLDOWN;
    onObservationsUpdate();
  }, [onObservationsUpdate]);

  const handleObservationChoice = useCallback((chosenOutcome: "solid" | "void") => {
    handleObservationChoiceFn(observationDataRef.current, chosenOutcome);
  }, []);

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
    if (k.has("w") || k.has("arrowup")) {inputZ -= 1;}
    if (k.has("s") || k.has("arrowdown")) {inputZ += 1;}
    if (k.has("a") || k.has("arrowleft")) {inputX -= 1;}
    if (k.has("d") || k.has("arrowright")) {inputX += 1;}

    if (inputX !== 0 && inputZ !== 0) {
      const mag = 1 / Math.SQRT2;
      inputX *= mag;
      inputZ *= mag;
    }

    let grounded = false;

    for (const plat of plats) {
      if (plat.state !== "solid") {continue;}
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
      if (!g.locked) {continue;}
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
        if (inputX > 0) {p.x = gx - halfW;}
        else if (inputX < 0) {p.x = gx + halfW;}
        if (inputZ > 0) {p.z = gz - halfD;}
        else if (inputZ < 0) {p.z = gz + halfD;}
        v.x = 0;
        v.z = 0;
      }
    }

    for (const key of kst) {
      if (key.collected) {continue;}
      const dx = p.x - key.position[0];
      const dy = p.y - key.position[1];
      const dz = p.z - key.position[2];
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.0) {
        collectKey(key.id, key.color);
      }
    }

    const crst = crystalsRef.current;
    for (const crystal of crst) {
      if (crystal.collected) {continue;}
      const dx = p.x - crystal.position[0];
      const dy = p.y - crystal.position[1];
      const dz = p.z - crystal.position[2];
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.0) {
        setCrystals((prev) => prev.map((c) => c.id === crystal.id ? { ...c, collected: true } : c));
        setCrystalsAvail((prev) => prev + 1);
        onScoreUpdate(500);
      }
    }

    const speed = grounded ? MOVE_SPEED : MOVE_SPEED * 0.6;
    v.x = inputX * speed;
    v.z = inputZ * speed;
    if (!grounded) {v.y -= GRAVITY * dt;}

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

  const chainGroups = useMemo(() => {
    const groups = new Map<number, [number, number, number][]>();
    for (const p of levelDef.platforms) {
      if (p.entangledGroup !== undefined) {
        const existing = groups.get(p.entangledGroup) || [];
        existing.push(p.position);
        groups.set(p.entangledGroup, existing);
      }
    }
    return groups;
  }, [levelDef]);

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
      {crystals.map((c) => (
        <CrystalMesh key={`crystal-${c.id}`} crystal={c} collected={c.collected} />
      ))}
      {entangledPairs.map(([a, b]) => (
        <EntanglementLine key={`el-${a.id}-${b.id}`} p1={a.position} p2={b.position} color="#ff8888" />
      ))}
      {Array.from(chainGroups.entries()).map(([groupId, positions]) => (
        <CatenaryChain key={`chain-${groupId}`} positions={positions} color="#9966ff" />
      ))}
      <PlayerSphere position={playerPos} />
      <GoalSphere position={levelDef.goal} />
      <CameraFollower target={playerPos} />
      {observationUI && (
        <Html center position={[0, 3, 0]}>
          <div style={{
            background: "rgba(10, 10, 30, 0.95)",
            border: "1px solid #4fc3f7",
            borderRadius: 12,
            padding: "24px 32px",
            minWidth: 320,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            color: "white",
          }}>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#4fc3f7", marginBottom: 8 }}>
              ⚛ OBSERVING P{observationUI.platformId}
            </div>
            <div style={{ fontSize: 13, color: "#ffd700", marginBottom: 12 }}>
              ✦ Certainty Crystals: {crystalsAvail} {crystalsAvail > 0 ? "(guaranteed)" : "(bias applies)"}
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 12 }}>
              <button
                onClick={() => handleObservationChoice("solid")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: observationUI.selected === "solid" ? "2px solid #4fc3f7" : "2px solid #444",
                  background: observationUI.selected === "solid" ? "rgba(79, 195, 247, 0.2)" : "rgba(255,255,255,0.05)",
                  color: "white",
                  fontSize: 16,
                  fontWeight: observationUI.selected === "solid" ? "bold" : "normal",
                  cursor: "pointer",
                }}
              >
                [E] Solid
              </button>
              <button
                onClick={() => handleObservationChoice("void")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: observationUI.selected === "void" ? "2px solid #4fc3f7" : "2px solid #444",
                  background: observationUI.selected === "void" ? "rgba(79, 195, 247, 0.2)" : "rgba(255,255,255,0.05)",
                  color: "white",
                  fontSize: 16,
                  fontWeight: observationUI.selected === "void" ? "bold" : "normal",
                  cursor: "pointer",
                }}
              >
                [Q] Void
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>
              ←/→ select • Space confirm • Esc cancel
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

export default function QuantumArchitectGame() {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [observations, setObservations] = useState(0);
  const [gamePhase, setGamePhase] = useState<"title" | "playing" | "win">("title");
  const [nearPlatformBias, setNearPlatformBias] = useState<string>("-");
  const [crystalsCollected, setCrystalsCollected] = useState(0);

  const handleStart = useCallback(() => {
    setLevel(0); setScore(0); setObservations(0); setGamePhase("playing");
    setNearPlatformBias("-");
    setCrystalsCollected(0);
  }, []);

  const handleScoreUpdate = useCallback((delta: number) => {
    setScore((s) => s + delta);
  }, []);

  const handleObservationsUpdate = useCallback(() => {
    setObservations((o) => o + 1);
  }, []);

  const handleCrystalsUpdate = useCallback((count: number) => {
    setCrystalsCollected(count);
  }, []);

  const handleLevelComplete = useCallback(
    (completedLevel: number) => {
      const levelBonus = (completedLevel + 1) * 1200;
      const efficiency = Math.max(0, 600 - observations * 15);
      setScore((s) => s + levelBonus + efficiency);
      setLevel((l) => l + 1);
      setObservations(0);
      setNearPlatformBias("-");
      setCrystalsCollected(0);
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
            onCrystalsUpdate={handleCrystalsUpdate}
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
            <div className="text-xs text-yellow-400">✦ {crystalsCollected}</div>
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
            <div>Space — Observe (E/Q or arrows to choose outcome)</div>
            <div>✦ Certainty Crystals — Guarantee one observation</div>
            <div>Collect colored keys to unlock matching gates</div>
            <div>Entangled platforms (pink): observing one affects both</div>
            <div>Entanglement chains (purple): linked in groups of 3+</div>
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
                {p.entangledGroup !== undefined && <span className="text-purple-400"> (Chain {p.entangledGroup})</span>}
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
