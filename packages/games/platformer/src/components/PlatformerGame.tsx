"use client";

import {
  GameContainer,
  ParticlePool,
  soundManager,
  useGameSettings,
} from "@gamehub/game-platform";
import { submitScore } from "@/lib/score-submit";
import React, { useCallback, useEffect, useRef, useState } from "react";

const TILE = 32;
const COLS = 20;
const ROWS = 12;
const CANVAS_W = COLS * TILE;
const CANVAS_H = ROWS * TILE;
const GRAVITY = 0.45;
const JUMP_VY = -9;
const MOVE_VX = 2.5;
const MAX_FALL_SPEED = 12;

type TileType = 0 | 1 | 2 | 3 | 4;

type LevelData = {
  id: number;
  name: string;
  map: TileType[][];
  bgTop: string;
  bgBottom: string;
  platformColor: string;
  goalTime: number;
};

type MovingPlatform = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  speed: number;
  dir: number;
};

type Enemy = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  alive: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  facingRight: boolean;
  frame: number;
  frameTimer: number;
};

const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "Green Meadows",
    bgTop: "#0b2e1f",
    bgBottom: "#1a4a2e",
    platformColor: "#4a7c59",
    goalTime: 0,
    map: (() => {
      const m: TileType[][] = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(0) as TileType[],
      );
      for (let x = 0; x < COLS; x++) {m[ROWS - 1][x] = 1;}
      for (let x = 2; x < 5; x++) {m[ROWS - 3][x] = 1;}
      for (let x = 7; x < 10; x++) {m[ROWS - 5][x] = 1;}
      for (let x = 13; x < 17; x++) {m[ROWS - 4][x] = 1;}
      m[ROWS - 7][9] = 2; m[ROWS - 4][15] = 2; m[ROWS - 5][8] = 2;
      m[ROWS - 3][3] = 2; m[ROWS - 2][5] = 2; m[ROWS - 6][7] = 2;
      m[ROWS - 6][14] = 2; m[ROWS - 3][14] = 2;
      m[ROWS - 5][2] = 4; m[ROWS - 5][3] = 4;
      m[ROWS - 2][COLS - 3] = 3; m[ROWS - 2][COLS - 2] = 3;
      return m;
    })(),
  },
  {
    id: 2,
    name: "Fire Cavern",
    bgTop: "#1a0a0a",
    bgBottom: "#3a1515",
    platformColor: "#8b3a3a",
    goalTime: 0,
    map: (() => {
      const m: TileType[][] = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(0) as TileType[],
      );
      for (let x = 0; x < COLS; x++) {m[ROWS - 1][x] = 1;}
      for (let x = 4; x < 8; x++) {m[ROWS - 3][x] = 1;}
      for (let x = 11; x < 15; x++) {m[ROWS - 5][x] = 1;}
      for (let x = 1; x < 4; x++) {m[ROWS - 7][x] = 1;}
      for (let x = 7; x < 10; x++) {m[ROWS - 8][x] = 1;}
      m[ROWS - 4][3] = 4; m[ROWS - 4][4] = 4; m[ROWS - 4][5] = 4;
      m[ROWS - 6][13] = 4; m[ROWS - 6][14] = 4;
      m[ROWS - 3][6] = 2; m[ROWS - 5][13] = 2; m[ROWS - 7][2] = 2;
      m[ROWS - 8][8] = 2; m[ROWS - 3][12] = 2; m[ROWS - 9][6] = 2;
      m[ROWS - 9][12] = 2;
      m[ROWS - 2][COLS - 3] = 3; m[ROWS - 2][COLS - 2] = 3;
      return m;
    })(),
  },
  {
    id: 3,
    name: "Sky Fortress",
    bgTop: "#0f172a",
    bgBottom: "#1e293b",
    platformColor: "#475569",
    goalTime: 0,
    map: (() => {
      const m: TileType[][] = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(0) as TileType[],
      );
      for (let x = 0; x < COLS; x++) {m[ROWS - 1][x] = 1;}
      for (let x = 0; x < 4; x++) {m[ROWS - 4][x] = 1;}
      for (let x = 6; x < 9; x++) {m[ROWS - 3][x] = 1;}
      for (let x = 10; x < 13; x++) {m[ROWS - 6][x] = 1;}
      for (let x = 15; x < 20; x++) {m[ROWS - 5][x] = 1;}
      for (let x = 2; x < 5; x++) {m[ROWS - 8][x] = 1;}
      for (let x = 8; x < 11; x++) {m[ROWS - 9][x] = 1;}
      for (let x = 14; x < 17; x++) {m[ROWS - 10][x] = 1;}
      m[ROWS - 5][3] = 4; m[ROWS - 5][4] = 4;
      m[ROWS - 4][10] = 4; m[ROWS - 4][11] = 4;
      m[ROWS - 3][7] = 2; m[ROWS - 6][11] = 2; m[ROWS - 8][3] = 2;
      m[ROWS - 9][9] = 2; m[ROWS - 10][15] = 2; m[ROWS - 5][16] = 2;
      m[ROWS - 2][8] = 2; m[ROWS - 7][14] = 2;
      m[ROWS - 2][COLS - 3] = 3; m[ROWS - 2][COLS - 2] = 3;
      return m;
    })(),
  },
];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export const PlatformerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [won, setWon] = useState(false);
  const [died, setDied] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const wonRef = useRef(false);
  const diedRef = useRef(false);
  const gameOverRef = useRef(false);
  const isPausedRef = useRef(false);
  const gameStartedRef = useRef(false);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const currentLevelRef = useRef(0);
  const { enableParticles } = useGameSettings();

  useEffect(() => { wonRef.current = won; }, [won]);
  useEffect(() => { diedRef.current = died; }, [died]);

  // Dispatch game:complete event when player dies
  useEffect(() => {
    if (died) {
      try {
        window.dispatchEvent(new CustomEvent("game:complete", { detail: { score: scoreRef.current } }));
      } catch {}
    }
  }, [died]);

  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { gameStartedRef.current = gameStarted; }, [gameStarted]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { highScoreRef.current = highScore; }, [highScore]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  const keys = useRef<Record<string, boolean>>({});
  const touchKeys = useRef<Record<string, boolean>>({});
  const rafId = useRef<number | null>(null);
  const particlesRef = useRef<ParticlePool | null>(null);
  const levelMapRef = useRef<TileType[][]>(LEVELS[0].map.map((r) => [...r]));
  const movingPlatformsRef = useRef<MovingPlatform[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const collectParticlesRef = useRef<Particle[]>([]);
  const deathParticlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef(0);
  const spikeAnimRef = useRef(0);

  const player = useRef<Player>({
    x: 2 * TILE,
    y: (ROWS - 3) * TILE,
    vx: 0,
    vy: 0,
    w: 22,
    h: 26,
    onGround: false,
    facingRight: true,
    frame: 0,
    frameTimer: 0,
  });

  function isDown(key: string): boolean {
    return !!(keys.current[key] || touchKeys.current[key]);
  }

  function solidAt(tx: number, ty: number, map: TileType[][]): boolean {
    if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) {return true;}
    return map[ty][tx] === 1;
  }

  function spikeAt(tx: number, ty: number, map: TileType[][]): boolean {
    if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) {return false;}
    return map[ty][tx] === 4;
  }

  function initLevel(levelIndex: number) {
    const level = LEVELS[levelIndex];
    levelMapRef.current = level.map.map((r) => [...r]);

    movingPlatformsRef.current = [];
    enemiesRef.current = [];
    collectParticlesRef.current = [];
    deathParticlesRef.current = [];

    if (!particlesRef.current) {
      particlesRef.current = new ParticlePool({ maxParticles: 64 });
    }

    if (levelIndex === 1) {
      movingPlatformsRef.current.push({
        x: 8 * TILE, y: (ROWS - 4) * TILE,
        w: 3 * TILE, h: TILE,
        vx: 1.2, startX: 8 * TILE, endX: 16 * TILE,
        startY: (ROWS - 4) * TILE, endY: (ROWS - 4) * TILE,
        speed: 1.2, dir: 1,
      });
    }

    if (levelIndex === 2) {
      movingPlatformsRef.current.push({
        x: 4 * TILE, y: (ROWS - 7) * TILE,
        w: 3 * TILE, h: TILE,
        vx: 1.5, startX: 4 * TILE, endX: 12 * TILE,
        startY: (ROWS - 7) * TILE, endY: (ROWS - 7) * TILE,
        speed: 1.5, dir: 1,
      });
      movingPlatformsRef.current.push({
        x: 13 * TILE, y: (ROWS - 8) * TILE,
        w: 2 * TILE, h: TILE,
        vx: 0, startX: 13 * TILE, endX: 13 * TILE,
        startY: (ROWS - 8) * TILE, endY: (ROWS - 5) * TILE,
        speed: 1, dir: -1,
      });
    }

    enemiesRef.current.push({
      x: 6 * TILE, y: (ROWS - 2) * TILE - 20,
      w: 24, h: 20, vx: 1, minX: 5 * TILE, maxX: 12 * TILE, alive: true,
    });
    if (levelIndex >= 1) {
      enemiesRef.current.push({
        x: 14 * TILE, y: (ROWS - 2) * TILE - 20,
        w: 24, h: 20, vx: -0.8, minX: 10 * TILE, maxX: 18 * TILE, alive: true,
      });
    }
    if (levelIndex >= 2) {
      enemiesRef.current.push({
        x: 3 * TILE, y: (ROWS - 3) * TILE - 20,
        w: 24, h: 20, vx: 1.2, minX: 2 * TILE, maxX: 8 * TILE, alive: true,
      });
    }

    player.current = {
      x: 2 * TILE,
      y: (ROWS - 3) * TILE,
      vx: 0,
      vy: 0,
      w: 22,
      h: 26,
      onGround: false,
      facingRight: true,
      frame: 0,
      frameTimer: 0,
    };
  }

  function resetGame() {
    setScore(0);
    setHighScore((h) => Math.max(h, scoreRef.current));
    setWon(false);
    setDied(false);
    setGameOver(false);
    setCurrentLevel(0);
    currentLevelRef.current = 0;
    initLevel(0);
    soundManager.stopMusic();
  }

  function aabbTileCollision(
    px: number, py: number, w: number, h: number, map: TileType[][],
  ): boolean {
    const left = Math.floor(px / TILE);
    const right = Math.floor((px + w - 1) / TILE);
    const top = Math.floor(py / TILE);
    const bottom = Math.floor((py + h - 1) / TILE);
    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (solidAt(tx, ty, map)) {return true;}
      }
    }
    return false;
  }

  function aabbCollision(
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number,
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function isOnMovingPlatform(p: Player): MovingPlatform | null {
    for (const mp of movingPlatformsRef.current) {
      if (
        p.vy >= 0 &&
        p.x + p.w > mp.x + 2 &&
        p.x < mp.x + mp.w - 2 &&
        p.y + p.h >= mp.y &&
        p.y + p.h <= mp.y + mp.h + 4
      ) {
        return mp;
      }
    }
    return null;
  }

  function emitCollectParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      collectParticlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2 - 1,
        life: 400,
        maxLife: 400,
        color,
        size: 3 + Math.random() * 2,
      });
    }
  }

  function emitDeathParticles(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      deathParticlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 500 + Math.random() * 300,
        maxLife: 800,
        color: "#ef4444",
        size: 3 + Math.random() * 3,
      });
    }
  }

  const step = useCallback((_dt: number) => {
    if (wonRef.current || gameOverRef.current || isPausedRef.current) {return;}
    const p = player.current;
    const map = levelMapRef.current;

    p.vx = 0;
    const left = isDown("ArrowLeft") || isDown("a");
    const right = isDown("ArrowRight") || isDown("d");
    const jump = isDown("ArrowUp") || isDown("w") || isDown(" ");

    if (left) { p.vx = -MOVE_VX; p.facingRight = false; }
    if (right) { p.vx = MOVE_VX; p.facingRight = true; }

    if (jump && p.onGround) {
      p.vy = JUMP_VY;
      p.onGround = false;
      soundManager.playSound("click", 0.4);
    }

    if (!p.onGround) {
      p.vy += GRAVITY;
      if (p.vy > MAX_FALL_SPEED) {p.vy = MAX_FALL_SPEED;}
    }

    const onPlat = isOnMovingPlatform(p);
    if (onPlat && p.onGround) {
      p.x += onPlat.vx * onPlat.dir;
    }

    let nx = p.x + p.vx;
    if (aabbTileCollision(nx, p.y, p.w, p.h, map)) {
      const stepDir = p.vx > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(p.vx); i++) {
        if (!aabbTileCollision(p.x + stepDir, p.y, p.w, p.h, map)) {
          p.x += stepDir;
        } else {break;}
      }
      p.vx = 0;
    } else {
      p.x = nx;
    }

    let ny = p.y + p.vy;
    if (aabbTileCollision(p.x, ny, p.w, p.h, map)) {
      const stepDirY = p.vy > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(p.vy); i++) {
        if (!aabbTileCollision(p.x, p.y + stepDirY, p.w, p.h, map)) {
          p.y += stepDirY;
        } else {break;}
      }
      if (stepDirY > 0) {p.onGround = true;}
      p.vy = 0;
    } else {
      p.y = ny;
      p.onGround = false;
    }

    const cx = Math.floor((p.x + p.w / 2) / TILE);
    const cy = Math.floor((p.y + p.h / 2) / TILE);
    if (cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS) {
      if (map[cy][cx] === 2) {
        map[cy][cx] = 0;
        const pts = 100;
        setScore((s) => s + pts);
        soundManager.playSound("powerUp", 0.5);
        emitCollectParticles(cx * TILE + TILE / 2, cy * TILE + TILE / 2, "#fbbf24");
      } else if (map[cy][cx] === 3) {
        map[cy][cx] = 0;
        soundManager.playSound("levelComplete", 0.8);
        const lvl = currentLevelRef.current;
        if (lvl < LEVELS.length - 1) {
          setCurrentLevel(lvl + 1);
          currentLevelRef.current = lvl + 1;
          initLevel(lvl + 1);
          setScore((s) => s + 500);
        } else {
          setWon(true);
          const finalScore = scoreRef.current + 1000;
          setScore((s) => s + 1000);
          submitScore("PLATFORMER", finalScore).catch(() => {});
          soundManager.stopMusic();
        }
        return;
      }
    }

    if (
      !p.onGround &&
      spikeAt(Math.floor((p.x + 4) / TILE), Math.floor((p.y + p.h - 2) / TILE), map)
    ) {
      emitDeathParticles(p.x + p.w / 2, p.y + p.h / 2);
      soundManager.playSound("loseLife", 0.6);
      setDied(true);
      return;
    }

    for (const e of enemiesRef.current) {
      if (!e.alive) {continue;}
      e.x += e.vx;
      if (e.x <= e.minX || e.x + e.w >= e.maxX) {e.vx *= -1;}

      if (aabbCollision(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
        if (p.vy > 0 && p.y + p.h - e.y < 20) {
          e.alive = false;
          p.vy = JUMP_VY * 0.6;
          setScore((s) => s + 200);
          soundManager.playSound("powerUp", 0.5);
          emitCollectParticles(e.x + e.w / 2, e.y + e.h / 2, "#ef4444");
        } else {
          emitDeathParticles(p.x + p.w / 2, p.y + p.h / 2);
          soundManager.playSound("loseLife", 0.6);
          setDied(true);
          return;
        }
      }
    }

    for (const mp of movingPlatformsRef.current) {
      mp.x += mp.speed * mp.dir;
      if (mp.dir > 0 && mp.x >= mp.endX) {mp.dir = -1;}
      if (mp.dir < 0 && mp.x <= mp.startX) {mp.dir = 1;}
      mp.y += (mp.startY === mp.endY ? 0 : mp.speed * mp.dir * 0.5);
    }

    if (p.y > ROWS * TILE + 50) {
      emitDeathParticles(p.x + p.w / 2, p.y);
      setDied(true);
    }

    if (Math.abs(p.vx) > 0.1) {
      p.frameTimer += 1;
      if (p.frameTimer > 6) {
        p.frame = (p.frame + 1) % 4;
        p.frameTimer = 0;
      }
    } else {
      p.frame = 0;
      p.frameTimer = 0;
    }

    animFrameRef.current += 1;
    spikeAnimRef.current += 0.05;

    if (particlesRef.current) {
      particlesRef.current.update(_dt * 1000);
    }
    if (collectParticlesRef.current.length > 0) {
      for (let i = collectParticlesRef.current.length - 1; i >= 0; i--) {
        const pt = collectParticlesRef.current[i];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vy += 0.1;
        pt.life -= _dt * 1000;
        if (pt.life <= 0) {collectParticlesRef.current.splice(i, 1);}
      }
    }
    if (deathParticlesRef.current.length > 0) {
      for (let i = deathParticlesRef.current.length - 1; i >= 0; i--) {
        const pt = deathParticlesRef.current[i];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vy += 0.15;
        pt.life -= _dt * 1000;
        if (pt.life <= 0) {deathParticlesRef.current.splice(i, 1);}
      }
    }
  }, []);

  const render = useCallback(() => {
    const c = canvasRef.current;
    if (!c) {return;}
    const ctx = c.getContext("2d");
    if (!ctx) {return;}

    const level = LEVELS[currentLevelRef.current] || LEVELS[0];

    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, level.bgTop);
    grad.addColorStop(1, level.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const t = levelMapRef.current[y][x];
        if (t === 1) {
          const isTop = y > 0 && levelMapRef.current[y - 1]?.[x] !== 1;
          ctx.fillStyle = isTop ? level.platformColor : "#2d1b0e";
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
          if (isTop) {
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fillRect(x * TILE, y * TILE, TILE, 3);
          }
        }
        if (t === 2) {
          const bobY = Math.sin(x * 0.5 + animFrameRef.current * 0.03) * 2;
          ctx.save();
          ctx.translate(x * TILE + TILE / 2, y * TILE + TILE / 2 + bobY);
          const pulse = 1 + Math.sin(animFrameRef.current * 0.05) * 0.1;
          ctx.scale(pulse, pulse);
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(1, -1, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (t === 3) {
          const glow = Math.sin(animFrameRef.current * 0.06) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(16, 185, 129, ${glow})`;
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x * TILE + 2, y * TILE + 2, TILE - 4, TILE - 4);
        }
        if (t === 4) {
          const s = Math.sin(spikeAnimRef.current) * 2;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.moveTo(x * TILE, (y + 1) * TILE);
          ctx.lineTo(x * TILE + TILE / 2, (y + 1) * TILE - TILE / 2 - s);
          ctx.lineTo((x + 1) * TILE, (y + 1) * TILE);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.moveTo(x * TILE + 3, (y + 1) * TILE);
          ctx.lineTo(x * TILE + TILE / 2, (y + 1) * TILE - TILE / 3 - s);
          ctx.lineTo((x + 1) * TILE - 3, (y + 1) * TILE);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    for (const mp of movingPlatformsRef.current) {
      ctx.fillStyle = "#64748b";
      ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(mp.x + 4, mp.y + 4, mp.w - 8, 4);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(mp.x + 2, mp.y + 2, mp.w - 4, mp.h - 4);
    }

    for (const e of enemiesRef.current) {
      if (!e.alive) {continue;}
      const bounce = Math.sin(animFrameRef.current * 0.08) * 2;
      if (e.vx > 0) {
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(e.x, e.y + bounce, e.w, e.h);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(e.x + 2, e.y + bounce - 2, e.w - 4, e.h - 4);
        ctx.fillStyle = "#fca5a5";
        ctx.fillRect(e.x + 4, e.y + bounce + 3, 5, 3);
        ctx.fillRect(e.x + e.w - 9, e.y + bounce + 3, 5, 3);
      } else {
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(e.x, e.y + bounce, e.w, e.h);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(e.x + 2, e.y + bounce - 2, e.w - 4, e.h - 4);
        ctx.fillStyle = "#fca5a5";
        ctx.fillRect(e.x + 4, e.y + bounce + 3, 5, 3);
        ctx.fillRect(e.x + e.w - 9, e.y + bounce + 3, 5, 3);
      }
    }

    const p = player.current;
    if (!diedRef.current) {
      ctx.save();
      ctx.translate(Math.floor(p.x + p.w / 2), Math.floor(p.y + p.h / 2));
      if (!p.facingRight) {ctx.scale(-1, 1);}
      const headBobY = Math.abs(p.vx) > 0.5 ? Math.sin(animFrameRef.current * 0.15) * 1 : 0;
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(-p.w / 2, -p.h / 2 + headBobY, p.w, 8);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(-p.w / 2 + 2, -p.h / 2 + 2 + headBobY, p.w - 4, 5);
      ctx.fillStyle = "#93c5fd";
      ctx.fillRect(-p.w / 2 + 2, -p.h / 2 + 2 + headBobY, 4, 4);
      ctx.fillRect(p.w / 2 - 6, -p.h / 2 + 2 + headBobY, 4, 4);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(-p.w / 2 + 1, -p.h / 2 + 8 + headBobY, p.w - 2, p.h - 10);
      ctx.fillStyle = "#1d4ed8";
      const legAnim = Math.sin(animFrameRef.current * 0.12) * 3;
      ctx.fillRect(-p.w / 2 + 2, 0, 7, 6 + legAnim);
      ctx.fillRect(p.w / 2 - 9, 0, 7, 6 - legAnim);
      ctx.restore();
    }

    if (particlesRef.current && enableParticles) {
      particlesRef.current.draw(ctx);
    }

    for (const pt of collectParticlesRef.current) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * (1 - (1 - alpha) * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const pt of deathParticlesRef.current) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * (1 - (1 - alpha) * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${scoreRef.current}`, 8, 18);
    ctx.fillText(`Level ${LEVELS[currentLevelRef.current]?.id ?? 1}`, 8, 36);
    ctx.textAlign = "right";
    ctx.fillText(LEVELS[currentLevelRef.current]?.name ?? "", CANVAS_W - 8, 18);

    if (wonRef.current) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("You Win!", CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.fillStyle = "white";
      ctx.font = "16px system-ui, -apple-system, sans-serif";
      ctx.fillText(`Final Score: ${scoreRef.current}`, CANVAS_W / 2, CANVAS_H / 2 + 15);
      ctx.fillText("Press R to restart", CANVAS_W / 2, CANVAS_H / 2 + 45);
    } else if (diedRef.current) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("You Died!", CANVAS_W / 2, CANVAS_H / 2 - 10);
      ctx.fillStyle = "white";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText("Press R to retry", CANVAS_W / 2, CANVAS_H / 2 + 20);
    } else if (!gameStartedRef.current) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "white";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${LEVELS[currentLevelRef.current]?.name ?? ""}`, CANVAS_W / 2, CANVAS_H / 2 - 30);
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText("Press Space to start", CANVAS_W / 2, CANVAS_H / 2 + 5);
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      ctx.fillText("Arrow keys / WASD to move & jump", CANVAS_W / 2, CANVAS_H / 2 + 30);
    } else if (isPausedRef.current) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "white";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Paused", CANVAS_W / 2, CANVAS_H / 2);
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText("Press Space to resume", CANVAS_W / 2, CANVAS_H / 2 + 30);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const SWIPE_THRESHOLD = 30;
    const onTouchStart = (e: TouchEvent) => {
      if (isPausedRef.current || wonRef.current || diedRef.current) {return;}
      const t = e.touches[0];
      swipeStartRef.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!swipeStartRef.current) {return;}
      const t = e.changedTouches[0];
      const dx = t.clientX - swipeStartRef.current.x;
      const dy = t.clientY - swipeStartRef.current.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax < SWIPE_THRESHOLD && ay < SWIPE_THRESHOLD) {
        if (!gameStartedRef.current) {
          setGameStarted(true);
          gameStartedRef.current = true;
          initLevel(currentLevelRef.current);
          soundManager.playMusic("background", 0.4);
        }
        swipeStartRef.current = null;
        return;
      }
      if (ax > ay) {
        if (dx < -SWIPE_THRESHOLD) {touchKeys.current["ArrowLeft"] = true;}
        else if (dx > SWIPE_THRESHOLD) {touchKeys.current["ArrowRight"] = true;}
      } else {
        if (dy < -SWIPE_THRESHOLD) {touchKeys.current["ArrowUp"] = true;}
      }
      swipeStartRef.current = null;
      setTimeout(() => {
        touchKeys.current["ArrowLeft"] = false;
        touchKeys.current["ArrowRight"] = false;
        touchKeys.current["ArrowUp"] = false;
      }, 80);
      e.preventDefault();
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart as any);
      canvas.removeEventListener("touchend", onTouchEnd as any);
    };
  }, []);

  useEffect(() => {
    const loop = (t: number) => {
      const dt = clamp((t - (lastTimeRef.current || t)) / 1000, 0.008, 0.05);
      lastTimeRef.current = t;
      step(dt);
      render();
      rafId.current = requestAnimationFrame(loop);
    };
    const lastTimeRef = { current: 0 };
    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) {cancelAnimationFrame(rafId.current);}
    };
  }, [step, render]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") {
        resetGame();
        setGameStarted(true);
        gameStartedRef.current = true;
        initLevel(currentLevelRef.current);
        soundManager.playMusic("background", 0.4);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        if (wonRef.current || diedRef.current || gameOverRef.current) {return;}
        if (!gameStartedRef.current) {
          e.preventDefault();
          setGameStarted(true);
          gameStartedRef.current = true;
          initLevel(currentLevelRef.current);
          soundManager.playMusic("background", 0.4);
        } else {
          e.preventDefault();
          setIsPaused((p) => !p);
        }
      }
    };
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, []);

  useEffect(() => {
    if (diedRef.current) {
      const timer = setTimeout(() => {
        if (diedRef.current) {
          const lvl = currentLevelRef.current;
          initLevel(lvl);
          setDied(false);
          setScore((s) => Math.max(0, s - 50));
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [died]);

  useEffect(() => {
    initLevel(0);
    soundManager.preloadSound("background", "/sounds/background.mp3", true);
    return () => { soundManager.stopMusic(); };
  }, []);

  const scoreForSubmit = score;
  useEffect(() => {
    if (gameOver && scoreForSubmit > 0) {
      submitScore("PLATFORMER", scoreForSubmit).catch(() => {});
    }
  }, [gameOver, scoreForSubmit]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    gameStartedRef.current = true;
    initLevel(currentLevelRef.current);
    soundManager.playMusic("background", 0.4);
  }, []);

  const restartGame = useCallback(() => {
    resetGame();
    setGameStarted(true);
    gameStartedRef.current = true;
    initLevel(0);
    soundManager.playMusic("background", 0.4);
  }, []);

  return (
    <GameContainer title="Platformer" description="Jump, run, and collect!">
      <div className="flex flex-col items-center justify-center p-2">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="rounded-lg border border-gray-700 shadow-lg"
            style={{ willChange: "transform", transform: "translateZ(0)", touchAction: "none" }}
            aria-label="Platformer game"
          />
          {!gameStarted && !gameOver && (
            <button
              onClick={startGame}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 rounded-lg"
              aria-label="Start game"
            >
              <span className="text-white text-lg font-bold bg-black/50 px-6 py-3 rounded-lg">
                Tap to Start
              </span>
            </button>
          )}
        </div>

        <div className="mt-3 hidden md:flex gap-2">
          <button
            onPointerDown={() => { touchKeys.current["ArrowLeft"] = true; }}
            onPointerUp={() => { touchKeys.current["ArrowLeft"] = false; }}
            onPointerLeave={() => { touchKeys.current["ArrowLeft"] = false; }}
            className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-5 py-3 text-xl select-none active:scale-95"
            aria-label="Move left"
          >
            ◀
          </button>
          <button
            onPointerDown={() => { touchKeys.current["ArrowUp"] = true; }}
            onPointerUp={() => { touchKeys.current["ArrowUp"] = false; }}
            onPointerLeave={() => { touchKeys.current["ArrowUp"] = false; }}
            className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-5 py-3 text-xl select-none active:scale-95"
            aria-label="Jump"
          >
            ▲
          </button>
          <button
            onPointerDown={() => { touchKeys.current["ArrowRight"] = true; }}
            onPointerUp={() => { touchKeys.current["ArrowRight"] = false; }}
            onPointerLeave={() => { touchKeys.current["ArrowRight"] = false; }}
            className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-5 py-3 text-xl select-none active:scale-95"
            aria-label="Move right"
          >
            ▶
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-400 text-center">
          Arrows/WASD to move &amp; jump &middot; Space to pause &middot; R to restart
        </div>
      </div>
    </GameContainer>
  );
};

export default React.memo(PlatformerGame);
