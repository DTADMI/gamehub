// games/tower-defense/src/components/TowerDefenseGame.tsx
"use client";

import { soundManager } from "@gamehub/game-platform";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TILE = 32;
const COLS = 20;
const ROWS = 12;

type TowerTypeId = "arrow" | "cannon" | "magic";
type CreepTypeId = "normal" | "fast" | "armored" | "boss";
type GameStatus = "idle" | "spawning" | "running" | "lost";

type TowerTypeConfig = {
  id: TowerTypeId;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  splash: number;
  slowFactor: number;
  slowDuration: number;
  color: string;
  upgradeCost: number;
  description: string;
};

type CreepConfig = {
  id: CreepTypeId;
  hp: number;
  speed: number;
  color: string;
  size: number;
  reward: number;
};

type MapData = {
  name: string;
  difficulty: string;
  path: { x: number; y: number }[];
};

type Creep = {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  wp: number;
  alive: boolean;
  type: CreepTypeId;
  slowFactor: number;
  slowTimer: number;
  reward: number;
  size: number;
  color: string;
};

type TowerInstance = {
  x: number;
  y: number;
  typeId: TowerTypeId;
  level: number;
  cd: number;
  range: number;
  damage: number;
  splash: number;
  slowFactor: number;
  slowDuration: number;
  fireRate: number;
  upgradeCost: number;
  upgradeBase: number;
  flashTimer: number;
};

type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  alive: boolean;
  typeId: TowerTypeId;
  age: number;
  splash: number;
  slowFactor: number;
  slowDuration: number;
};

const TOWER_TYPES: TowerTypeConfig[] = [
  {
    id: "arrow",
    name: "Arrow",
    cost: 50,
    damage: 12,
    range: 3.0,
    fireRate: 2.5,
    splash: 0,
    slowFactor: 1,
    slowDuration: 0,
    color: "#22c55e",
    upgradeCost: 40,
    description: "Fast, cheap",
  },
  {
    id: "cannon",
    name: "Cannon",
    cost: 100,
    damage: 25,
    range: 2.5,
    fireRate: 1.0,
    splash: 1.2,
    slowFactor: 1,
    slowDuration: 0,
    color: "#f59e0b",
    upgradeCost: 75,
    description: "Splash damage",
  },
  {
    id: "magic",
    name: "Magic",
    cost: 150,
    damage: 40,
    range: 3.5,
    fireRate: 0.7,
    splash: 0,
    slowFactor: 0.4,
    slowDuration: 2.5,
    color: "#a855f7",
    upgradeCost: 100,
    description: "Slow, strong",
  },
];

const CREEP_TYPES: Record<CreepTypeId, CreepConfig> = {
  normal: { id: "normal", hp: 30, speed: 2, color: "#f97316", size: 7, reward: 5 },
  fast: { id: "fast", hp: 15, speed: 4, color: "#3b82f6", size: 6, reward: 3 },
  armored: { id: "armored", hp: 80, speed: 1.2, color: "#64748b", size: 8, reward: 10 },
  boss: { id: "boss", hp: 200, speed: 1.5, color: "#ef4444", size: 12, reward: 50 },
};

const MAPS: MapData[] = [
  {
    name: "The Pass",
    difficulty: "Easy",
    path: [
      { x: 0, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 8 },
      { x: 19, y: 8 },
    ],
  },
  {
    name: "The Serpent",
    difficulty: "Medium",
    path: [
      { x: 0, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 9 },
      { x: 14, y: 9 },
      { x: 14, y: 2 },
      { x: 19, y: 2 },
    ],
  },
  {
    name: "The Fortress",
    difficulty: "Hard",
    path: [
      { x: 0, y: 6 },
      { x: 3, y: 6 },
      { x: 3, y: 1 },
      { x: 8, y: 1 },
      { x: 8, y: 10 },
      { x: 13, y: 10 },
      { x: 13, y: 1 },
      { x: 17, y: 1 },
      { x: 17, y: 10 },
      { x: 19, y: 10 },
    ],
  },
];

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function getWaveComposition(wave: number): { type: CreepTypeId; count: number }[] {
  const normal = 6 + wave * 2;
  const fast = wave >= 2 ? 2 + Math.floor((wave - 1) * 1.5) : 0;
  const armored = wave >= 3 ? 1 + Math.floor((wave - 2) * 0.8) : 0;
  const boss = wave % 5 === 0 ? 1 : 0;
  return [
    { type: "normal", count: Math.min(normal, 30) },
    { type: "fast", count: Math.min(fast, 15) },
    { type: "armored", count: Math.min(armored, 10) },
    ...(boss > 0 ? [{ type: "boss" as CreepTypeId, count: boss }] : []),
  ];
}

function hasTowerAt(towers: TowerInstance[], tx: number, ty: number) {
  return towers.some((t) => Math.floor(t.x) === tx && Math.floor(t.y) === ty);
}

export const TowerDefenseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });

  const [mapIdx, setMapIdx] = useState(0);
  const [lives, setLives] = useState(20);
  const [money, setMoney] = useState(150);
  const [wave, setWave] = useState(1);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [selectedTowerType, setSelectedTowerType] = useState<TowerTypeId>("arrow");
  const [selectedTowerIdx, setSelectedTowerIdx] = useState(-1);
  const [wavesCompleted, setWavesCompleted] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [goldEarned, setGoldEarned] = useState(0);
  const [zoom, setZoom] = useState(1);

  const creeps = useRef<Creep[]>([]);
  const towers = useRef<TowerInstance[]>([]);
  const shots = useRef<Projectile[]>([]);
  const spawnTimer = useRef(0);
  const spawnQueue = useRef<CreepTypeId[]>([]);
  const raf = useRef<number | null>(null);
  const hoverPos = useRef<{ x: number; y: number } | null>(null);
  const lastTouchDist = useRef(0);

  const livesRef = useRef(lives);
  const moneyRef = useRef(money);
  const waveRef = useRef(wave);
  const statusRef = useRef<GameStatus>(status);
  const mapIdxRef = useRef(mapIdx);
  const selectedTowerIdxRef = useRef(selectedTowerIdx);
  const zoomRef = useRef(zoom);
  const wavesCompletedRef = useRef(wavesCompleted);
  const enemiesKilledRef = useRef(enemiesKilled);
  const goldEarnedRef = useRef(goldEarned);

  useEffect(() => {
    livesRef.current = lives;
    moneyRef.current = money;
    waveRef.current = wave;
    statusRef.current = status;
    mapIdxRef.current = mapIdx;
    selectedTowerIdxRef.current = selectedTowerIdx;
    zoomRef.current = zoom;
    wavesCompletedRef.current = wavesCompleted;
    enemiesKilledRef.current = enemiesKilled;
    goldEarnedRef.current = goldEarned;
  });

  const startWave = useCallback(() => {
    if (statusRef.current !== "idle") return;
    const w = waveRef.current;
    const comp = getWaveComposition(w);
    const queue: CreepTypeId[] = [];
    for (const g of comp) {
      for (let i = 0; i < g.count; i++) queue.push(g.type);
    }
    spawnQueue.current = queue;
    spawnTimer.current = 0;
    setStatus("spawning");
    soundManager.playSound("click", 0.5);
  }, []);

  const resetGame = useCallback(() => {
    creeps.current = [];
    shots.current = [];
    towers.current = [];
    spawnQueue.current = [];
    setLives(20);
    setMoney(150);
    setWave(1);
    setStatus("idle");
    setSelectedTowerIdx(-1);
    setWavesCompleted(0);
    setEnemiesKilled(0);
    setGoldEarned(0);
    soundManager.playSound("click", 0.5);
  }, []);

  const selectMap = useCallback((idx: number) => {
    setMapIdx(idx);
    resetGame();
  }, [resetGame]);

  const placeTower = useCallback(
    (tx: number, ty: number) => {
      if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return;
      if (hasTowerAt(towers.current, tx, ty)) return;
      const mapData = MAPS[mapIdxRef.current];
      const path = mapData.path;
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];
        const cx = tx + 0.5;
        const cy = ty + 0.5;
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const wx = cx - a.x;
        const wy = cy - a.y;
        const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy || 1)));
        const px = a.x + t * vx;
        const py = a.y + t * vy;
        if (dist(cx, cy, px, py) < 0.9) return;
      }
      const cfg = TOWER_TYPES.find((t) => t.id === selectedTowerType);
      if (!cfg) return;
      if (moneyRef.current < cfg.cost) return;
      towers.current.push({
        x: tx + 0.5,
        y: ty + 0.5,
        typeId: cfg.id,
        level: 1,
        cd: 0,
        range: cfg.range,
        damage: cfg.damage,
        splash: cfg.splash,
        slowFactor: cfg.slowFactor,
        slowDuration: cfg.slowDuration,
        fireRate: cfg.fireRate,
        upgradeCost: cfg.upgradeCost,
        upgradeBase: cfg.upgradeCost,
        flashTimer: 0,
      });
      setMoney((m) => m - cfg.cost);
      soundManager.playSound("click", 0.5);
    },
    [selectedTowerType],
  );

  const upgradeTower = useCallback(() => {
    const idx = selectedTowerIdxRef.current;
    if (idx < 0 || idx >= towers.current.length) return;
    const t = towers.current[idx];
    if (t.level >= 3) return;
    const cost = t.upgradeCost;
    if (moneyRef.current < cost) return;
    t.level++;
    t.damage = Math.round(t.damage * 1.2);
    t.range = Math.round(t.range * 1.15 * 10) / 10;
    t.upgradeCost = Math.round(t.upgradeBase * t.level);
    setMoney((m) => m - cost);
    setSelectedTowerIdx(-1);
    soundManager.playSound("powerUp", 0.6);
  }, []);

  const handleCanvasClick = useCallback(
    (clientX: number, clientY: number) => {
      const rect = rectRef.current;
      const z = zoomRef.current;
      const cx = (clientX - rect.left) / z;
      const cy = (clientY - rect.top) / z;
      const tx = Math.floor(cx / TILE);
      const ty = Math.floor(cy / TILE);
      const existing = towers.current.findIndex(
        (t) => Math.floor(t.x) === tx && Math.floor(t.y) === ty,
      );
      if (existing >= 0) {
        if (selectedTowerIdxRef.current === existing) {
          setSelectedTowerIdx(-1);
        } else {
          setSelectedTowerIdx(existing);
        }
        return;
      }
      setSelectedTowerIdx(-1);
      placeTower(tx, ty);
    },
    [placeTower],
  );

  const step = useCallback((dt: number) => {
    const s = statusRef.current;
    const w = waveRef.current;
    const mapPath = MAPS[mapIdxRef.current].path;

    if (s === "spawning") {
      spawnTimer.current += dt;
      const interval = 0.5;
      const toSpawn = Math.floor(spawnTimer.current / interval);
      const queue = spawnQueue.current;
      const toCreate = Math.min(toSpawn, queue.length);
      for (let i = 0; i < toCreate; i++) {
        const typeId = queue[i];
        const cfg = CREEP_TYPES[typeId];
        const hp = cfg.hp + (typeId === "boss" ? w * 20 : w * 8);
        creeps.current.push({
          x: mapPath[0].x + 0.5,
          y: mapPath[0].y + 0.5,
          hp,
          maxHp: hp,
          speed: cfg.speed + w * 0.15,
          baseSpeed: cfg.speed + w * 0.15,
          wp: 1,
          alive: true,
          type: typeId,
          slowFactor: 1,
          slowTimer: 0,
          reward: cfg.reward + Math.floor(w / 3),
          size: cfg.size,
          color: cfg.color,
        });
      }
      if (toCreate > 0) {
        spawnQueue.current = queue.slice(toCreate);
      }
      if (spawnQueue.current.length === 0) {
        setStatus("running");
      }
    }

    for (const c of creeps.current) {
      if (!c.alive) continue;
      if (c.slowTimer > 0) {
        c.slowTimer -= dt;
        if (c.slowTimer <= 0) {
          c.slowFactor = 1;
          c.speed = c.baseSpeed;
        }
      }
      const target = mapPath[c.wp];
      if (!target) continue;
      const dx = target.x + 0.5 - c.x;
      const dy = target.y + 0.5 - c.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.05) {
        c.wp++;
        if (c.wp >= mapPath.length) {
          c.alive = false;
          setLives((L) => Math.max(0, L - 1));
        }
      } else {
        const effectiveSpeed = c.speed * c.slowFactor;
        c.x += (dx / (d || 1)) * effectiveSpeed * dt;
        c.y += (dy / (d || 1)) * effectiveSpeed * dt;
      }
    }

    for (const t of towers.current) {
      t.cd -= dt;
      if (t.flashTimer > 0) t.flashTimer -= dt;
      if (t.cd > 0) continue;
      let best: Creep | null = null;
      let bestD = Infinity;
      for (const c of creeps.current) {
        if (!c.alive) continue;
        const d = dist(t.x, t.y, c.x, c.y);
        if (d <= t.range && d < bestD) {
          best = c;
          bestD = d;
        }
      }
      if (!best) continue;
      const speed = 10;
      const px = best.x - t.x;
      const py = best.y - t.y;
      const len = Math.sqrt(px * px + py * py) || 1;
      shots.current.push({
        x: t.x,
        y: t.y,
        vx: (px / len) * speed,
        vy: (py / len) * speed,
        damage: t.damage,
        alive: true,
        typeId: t.typeId,
        age: 0,
        splash: t.splash,
        slowFactor: t.slowFactor,
        slowDuration: t.slowDuration,
      });
      t.cd = 1 / t.fireRate;
      t.flashTimer = 0.08;
      soundManager.playSound("paddle", 0.3);
    }

    const deadEnemies: number[] = [];
    for (const s of shots.current) {
      if (!s.alive) continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.age += dt;
      if (s.x < -1 || s.y < -1 || s.x > COLS + 1 || s.y > ROWS + 1) {
        s.alive = false;
        continue;
      }
      for (let ci = 0; ci < creeps.current.length; ci++) {
        const c = creeps.current[ci];
        if (!c.alive) continue;
        if (dist(s.x, s.y, c.x, c.y) < 0.35) {
          s.alive = false;
          if (s.splash > 0) {
            for (const c2 of creeps.current) {
              if (!c2.alive) continue;
              if (dist(c.x, c.y, c2.x, c2.y) <= s.splash) {
                c2.hp -= Math.round(s.damage * 0.6);
                if (c2.hp <= 0 && c2.alive) {
                  c2.alive = false;
                  setMoney((m) => m + c2.reward);
                  setGoldEarned((g) => g + c2.reward);
                  setEnemiesKilled((k) => k + 1);
                  deadEnemies.push(ci);
                  soundManager.playSound("brickBreak", 0.5);
                }
              }
            }
            soundManager.playSound("wall", 0.4);
          } else {
            c.hp -= s.damage;
            if (s.slowFactor < 1 && s.slowDuration > 0) {
              c.slowFactor = s.slowFactor;
              c.slowTimer = s.slowDuration;
              c.speed = c.baseSpeed * s.slowFactor;
            }
            if (c.hp <= 0) {
              c.alive = false;
              setMoney((m) => m + c.reward);
              setGoldEarned((g) => g + c.reward);
              setEnemiesKilled((k) => k + 1);
              deadEnemies.push(ci);
              soundManager.playSound("brickBreak", 0.5);
            }
          }
          break;
        }
      }
    }

    creeps.current = creeps.current.filter((c) => c.alive);
    shots.current = shots.current.filter((s) => s.alive);

    if (
      (statusRef.current === "running" || statusRef.current === "spawning") &&
      creeps.current.length === 0 &&
      statusRef.current !== "spawning" &&
      spawnQueue.current.length === 0
    ) {
      setWave((v) => v + 1);
      setWavesCompleted((v) => v + 1);
      setStatus("idle");
      soundManager.playSound("levelComplete", 0.5);
    }
    if (livesRef.current <= 0 && statusRef.current !== "lost") {
      setStatus("lost");
      soundManager.playSound("gameOver", 0.6);
    }
  }, []);

  const render = useCallback(() => {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const ctx = cnv.getContext("2d");
    if (!ctx) return;
    const w = COLS * TILE;
    const h = ROWS * TILE;
    const z = zoomRef.current;
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.save();
    ctx.scale(z, z);

    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, w, h);

    const mapData = MAPS[mapIdxRef.current];
    const path = mapData.path;

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const px = path[i].x * TILE + TILE / 2;
      const py = path[i].y * TILE + TILE / 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(74, 222, 128, 0.15)";
    ctx.beginPath();
    const sp = path[0];
    ctx.arc(sp.x * TILE + TILE / 2, sp.y * TILE + TILE / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
    ctx.beginPath();
    const ep = path[path.length - 1];
    ctx.arc(ep.x * TILE + TILE / 2, ep.y * TILE + TILE / 2, 14, 0, Math.PI * 2);
    ctx.fill();

    for (let col = 0; col < COLS; col++) {
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(col * TILE, 0);
      ctx.lineTo(col * TILE, h);
      ctx.stroke();
    }
    for (let row = 0; row < ROWS; row++) {
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, row * TILE);
      ctx.lineTo(w, row * TILE);
      ctx.stroke();
    }

    const hoveredTowerIdx = (() => {
      if (!hoverPos.current) return -1;
      const hx = hoverPos.current.x;
      const hy = hoverPos.current.y;
      for (let i = 0; i < towers.current.length; i++) {
        const t = towers.current[i];
        if (dist(t.x * TILE, t.y * TILE, hx, hy) < 24) return i;
      }
      return -1;
    })();

    for (let i = 0; i < towers.current.length; i++) {
      const t = towers.current[i];
      const px = t.x * TILE;
      const py = t.y * TILE;
      const isHovered = i === hoveredTowerIdx;
      const isSelected = i === selectedTowerIdxRef.current;

      if (isHovered || isSelected) {
        ctx.strokeStyle = isSelected ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(px, py, t.range * TILE, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const cfg = TOWER_TYPES.find((ct) => ct.id === t.typeId)!;
      ctx.fillStyle = cfg.color;
      ctx.shadowColor = cfg.color;
      ctx.shadowBlur = 8;
      if (t.typeId === "arrow") {
        const s = 10 + t.level * 2;
        ctx.beginPath();
        ctx.moveTo(px + s, py);
        ctx.lineTo(px - s, py - 5);
        ctx.lineTo(px - s, py + 5);
        ctx.closePath();
        ctx.fill();
      } else if (t.typeId === "cannon") {
        ctx.beginPath();
        ctx.arc(px, py, 8 + t.level * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(px - 2, py - 2, 3 + t.level, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        const s = 7 + t.level * 2;
        for (let j = 0; j < 4; j++) {
          const a = (j / 4) * Math.PI * 2 - Math.PI / 2;
          const px2 = px + Math.cos(a) * s;
          const py2 = py + Math.sin(a) * s;
          if (j === 0) ctx.moveTo(px2, py2);
          else ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (t.flashTimer > 0) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Lv" + t.level, px, py - 14);
    }

    for (const c of creeps.current) {
      const px = c.x * TILE;
      const py = c.y * TILE;
      ctx.fillStyle = c.color;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(px, py, c.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const bw = c.size * 3;
      const bh = 3;
      const bx = px - bw / 2;
      const by = py - c.size - 6;
      ctx.fillStyle = "#111827";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = c.hp > c.maxHp * 0.5 ? "#10b981" : c.hp > c.maxHp * 0.25 ? "#f59e0b" : "#ef4444";
      const hpPct = Math.max(0, c.hp / c.maxHp);
      ctx.fillRect(bx, by, bw * hpPct, bh);

      if (c.slowTimer > 0) {
        ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, c.size + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (const s of shots.current) {
      const px = s.x * TILE;
      const py = s.y * TILE;
      if (s.typeId === "arrow") {
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - s.vx * TILE * 0.06, py - s.vy * TILE * 0.06);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (s.typeId === "cannon") {
        ctx.fillStyle = "#f59e0b";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const trailCount = Math.min(4, Math.floor(s.age / 0.02));
        for (let ti = 1; ti <= trailCount; ti++) {
          const alpha = 1 - ti / (trailCount + 1);
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(px - s.vx * TILE * 0.04 * ti, py - s.vy * TILE * 0.04 * ti, 3 - ti * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "#a855f7";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 12;
        const pulseSize = 3 + Math.sin(s.age * 20) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, cnv.width, 52);
    ctx.fillStyle = "white";
    ctx.font = "bold 13px system-ui, -apple-system";
    ctx.textAlign = "left";
    ctx.fillText(`\u2764 ${livesRef.current}`, 10, 20);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`\uFFE5 ${moneyRef.current}`, 80, 20);
    ctx.fillStyle = "white";
    ctx.fillText(`Wave ${waveRef.current}`, 160, 20);
    ctx.fillStyle = statusRef.current === "idle" ? "#4ade80" : statusRef.current === "lost" ? "#ef4444" : "#fbbf24";
    ctx.fillText(statusRef.current.toUpperCase(), 240, 20);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px system-ui, -apple-system";
    ctx.fillText(`Killed: ${enemiesKilledRef.current}`, 10, 38);
    ctx.fillText(`Waves: ${wavesCompletedRef.current}`, 110, 38);
    ctx.fillText(`Gold: ${goldEarnedRef.current}`, 200, 38);

    if (statusRef.current === "lost") {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, cnv.width, cnv.height);
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 32px system-ui, -apple-system";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", cnv.width / 2, cnv.height / 2 - 10);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "14px system-ui, -apple-system";
      ctx.fillText("Press R to restart", cnv.width / 2, cnv.height / 2 + 30);
      ctx.fillText(`Waves: ${wavesCompletedRef.current}  Kills: ${enemiesKilledRef.current}`, cnv.width / 2, cnv.height / 2 + 55);
    }
  }, []);

  useEffect(() => {
    const updateRect = () => {
      const c = canvasRef.current;
      if (c) {
        const r = c.getBoundingClientRect();
        rectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
      }
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      step(dt);
      render();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const c = canvasRef.current;
      if (!c) return;
      handleCanvasClick(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const z = zoomRef.current;
      hoverPos.current = {
        x: (e.clientX - rect.left) / z,
        y: (e.clientY - rect.top) / z,
      };
    };
    const onMouseLeave = () => {
      hoverPos.current = null;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n" && statusRef.current === "idle") {
        startWave();
      }
      if (e.key.toLowerCase() === "r") {
        resetGame();
      }
      if (e.key === "Escape") {
        setSelectedTowerIdx(-1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && e.touches.length === 0) {
        const touch = e.changedTouches[0];
        handleCanvasClick(touch.clientX, touch.clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist2 = Math.sqrt(dx * dx + dy * dy);
        if (lastTouchDist.current > 0) {
          const scale = dist2 / lastTouchDist.current;
          setZoom((z) => Math.max(0.5, Math.min(3, z * scale)));
        }
        lastTouchDist.current = dist2;
      }
    };

    const cnv = canvasRef.current;
    cnv?.addEventListener("click", onClick);
    cnv?.addEventListener("mousemove", onMouseMove);
    cnv?.addEventListener("mouseleave", onMouseLeave);
    cnv?.addEventListener("touchstart", onTouchStart, { passive: false });
    cnv?.addEventListener("touchend", onTouchEnd);
    cnv?.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      cnv?.removeEventListener("click", onClick);
      cnv?.removeEventListener("mousemove", onMouseMove);
      cnv?.removeEventListener("mouseleave", onMouseLeave);
      cnv?.removeEventListener("touchstart", onTouchStart);
      cnv?.removeEventListener("touchend", onTouchEnd);
      cnv?.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [startWave, resetGame, handleCanvasClick, step, render]);

  const towerTypeLabel = useMemo(
    () =>
      TOWER_TYPES.map((t, i) => (
        <button
          key={t.id}
          onClick={() => {
            setSelectedTowerType(t.id);
            setSelectedTowerIdx(-1);
          }}
          className={`relative flex flex-col items-center rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
            selectedTowerType === t.id
              ? "border-blue-400 bg-blue-900/40 text-white shadow-md shadow-blue-500/20"
              : "border-gray-700 bg-gray-800/60 text-gray-300 hover:border-gray-500 hover:text-white"
          }`}
          aria-label={`Select ${t.name} tower`}
        >
          <span className="text-sm font-bold" style={{ color: t.color }}>
            {t.name}
          </span>
          <span className="text-[10px] text-gray-400">${t.cost}</span>
          <span className="text-[9px] text-gray-500">{t.description}</span>
        </button>
      )),
    [selectedTowerType],
  );

  const mapButtons = useMemo(
    () =>
      MAPS.map((m, i) => (
        <button
          key={i}
          onClick={() => selectMap(i)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            mapIdx === i
              ? "border-emerald-400 bg-emerald-900/40 text-emerald-300"
              : "border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-500 hover:text-gray-200"
          }`}
          aria-label={`Select map ${m.name}`}
        >
          {m.name}
          <span className="ml-1.5 text-[10px] opacity-60">({m.difficulty})</span>
        </button>
      )),
    [mapIdx, selectMap],
  );

  const selectedTower = selectedTowerIdx >= 0 && selectedTowerIdx < towers.current.length ? towers.current[selectedTowerIdx] : null;

  return (
    <div className="flex flex-col items-center gap-2 p-1 sm:p-2">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {mapButtons}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {towerTypeLabel}
      </div>
      <div
        className="relative touch-none"
        style={{
          width: COLS * TILE,
          maxWidth: "100%",
          overflow: "hidden",
          borderRadius: 8,
        }}
      >
        <canvas
          ref={canvasRef}
          width={COLS * TILE}
          height={ROWS * TILE}
          className="block w-full rounded-lg border border-gray-700 shadow-lg"
          style={{
            willChange: "transform",
            imageRendering: "pixelated",
          }}
          aria-label="Tower Defense game canvas"
        />
        <div className="pointer-events-none absolute right-1 top-1 flex gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded bg-black/50 text-xs text-white backdrop-blur hover:bg-black/70"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded bg-black/50 text-xs text-white backdrop-blur hover:bg-black/70"
            aria-label="Zoom out"
          >
            -
          </button>
        </div>
      </div>

      {selectedTower && (
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-purple-700/50 bg-gray-900/80 px-4 py-2 text-xs text-gray-200">
          <span className="font-semibold" style={{ color: TOWER_TYPES.find((t) => t.id === selectedTower.typeId)?.color }}>
            {TOWER_TYPES.find((t) => t.id === selectedTower.typeId)?.name}
          </span>
          <span>Lv{selectedTower.level}/3</span>
          <span>DMG: {selectedTower.damage}</span>
          <span>Range: {selectedTower.range}</span>
          {selectedTower.level < 3 && (
            <button
              onClick={upgradeTower}
              className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
                money >= selectedTower.upgradeCost
                  ? "border-yellow-500 bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60"
                  : "border-gray-600 bg-gray-800 text-gray-500"
              }`}
              disabled={money < selectedTower.upgradeCost}
            >
              Upgrade ${selectedTower.upgradeCost}
            </button>
          )}
          {selectedTower.level >= 3 && (
            <span className="text-yellow-400">MAX LEVEL</span>
          )}
          <button
            onClick={() => setSelectedTowerIdx(-1)}
            className="rounded px-2 py-0.5 text-gray-500 hover:text-white"
          >
            X
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-500">
        <span>
          Press <kbd className="rounded border border-gray-600 bg-gray-800 px-1">N</kbd> next wave
        </span>
        <span>
          Press <kbd className="rounded border border-gray-600 bg-gray-800 px-1">R</kbd> restart
        </span>
        <span>
          Press <kbd className="rounded border border-gray-600 bg-gray-800 px-1">Esc</kbd> deselect
        </span>
        <span className="hidden sm:inline">Pinch to zoom (touch)</span>
      </div>

      {status === "idle" && (
        <button
          onClick={startWave}
          className="rounded-lg border border-emerald-600 bg-emerald-900/30 px-6 py-2 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-900/50"
        >
          Start Wave {wave} (N)
        </button>
      )}
      {status === "lost" && (
        <button
          onClick={resetGame}
          className="rounded-lg border border-red-600 bg-red-900/30 px-6 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-900/50"
        >
          Restart (R)
        </button>
      )}
    </div>
  );
};

export default React.memo(TowerDefenseGame);
