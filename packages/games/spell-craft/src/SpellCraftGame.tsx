"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Stroke = Point[];
type ElementName = "fire" | "water" | "wind" | "earth" | "light" | null;

interface SpellResult {
  element: ElementName;
  force: number;
  spread: number;
  focus: number;
  quality: number;
  stability: number;
  duration: number;
  ringCount: number;
  message: string;
  active: boolean;
  prepared: boolean;
  valid: boolean;
  status: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: "#f97316",
  water: "#3b82f6",
  wind: "#a3e635",
  earth: "#8b5cf6",
  light: "#fbbf24",
};

const ELEMENT_EMOJIS: Record<string, string> = {
  fire: "\u{1F525}",
  water: "\u{1F4A7}",
  wind: "\u{1F32C}\uFE0F",
  earth: "\u{1F33F}",
  light: "\u2728",
};

const ELEMENT_SPELL_NAMES: Record<string, string[]> = {
  fire: ["Inferno Burst", "Flame Lash", "Ember Swirl", "Blazing Sigil"],
  water: ["Tidal Ward", "Frost Barrier", "Healing Rain", "Aqua Veil"],
  wind: ["Gale Slash", "Zephyr Step", "Cyclone Shield", "Whispering Wind"],
  earth: ["Stone Fortress", "Quake Pulse", "Vine Snare", "Crystal Shard"],
  light: ["Radiant Beam", "Starfall", "Prism Shield", "Dawn's Grace"],
};

function pointDist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleBetweenSegments(a: Point, b: Point, c: Point): number {
  const v1: Point = { x: b.x - a.x, y: b.y - a.y };
  const v2: Point = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (mag === 0) {return 0;}
  return Math.acos(Math.max(-1, Math.min(1, dot / mag)));
}

function analyzeStrokes(strokes: Stroke[], w: number, h: number): SpellResult {
  const allPoints = strokes.flat();

  if (allPoints.length < 5) {
    return {
      element: null, force: 0, spread: 0, focus: 0, quality: 0,
      stability: 0, duration: 0, ringCount: 0,
      message: "Draw a sigil to cast a spell",
      active: false, prepared: false, valid: false, status: "No sigil drawn",
    };
  }

  let minX = Infinity; let minY = Infinity;
  let maxX = -Infinity; let maxY = -Infinity;
  for (const p of allPoints) {
    if (p.x < minX) {minX = p.x;}
    if (p.y < minY) {minY = p.y;}
    if (p.x > maxX) {maxX = p.x;}
    if (p.y > maxY) {maxY = p.y;}
  }
  const bboxW = maxX - minX;
  const bboxH = maxY - minY;
  const bboxArea = bboxW * bboxH;
  const centroid: Point = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

  let totalLength = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) {
      totalLength += pointDist(stroke[i - 1], stroke[i]);
    }
  }

  let ringCount = 0;
  for (const stroke of strokes) {
    if (stroke.length < 5) {continue;}
    if (pointDist(stroke[0], stroke[stroke.length - 1]) < 25) {ringCount++;}
  }

  let sharpAngleCount = 0;
  let totalSegments = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length - 1; i++) {
      const angle = angleBetweenSegments(stroke[i - 1], stroke[i], stroke[i + 1]);
      if (angle > (110 * Math.PI) / 180) {sharpAngleCount++;}
      totalSegments++;
    }
  }
  const sharpRatio = totalSegments > 0 ? sharpAngleCount / totalSegments : 0;
  const smoothness = 1 - Math.min(1, sharpRatio * 4);

  const density = bboxArea > 0 ? totalLength / Math.sqrt(bboxArea) : 0;

  let maxDistFromCentroid = 0;
  for (const p of allPoints) {
    const d = pointDist(p, centroid);
    if (d > maxDistFromCentroid) {maxDistFromCentroid = d;}
  }
  const outwardRatio = Math.sqrt(bboxArea) > 1
    ? maxDistFromCentroid / (Math.sqrt(bboxArea) / 2)
    : 1;

  let element: ElementName = null;
  let spellMsg = "";

  if (ringCount > 0) {
    element = "water";
    spellMsg = `${ringCount} ring${ringCount > 1 ? "s" : ""} closed — Water magic flows`;
  } else if (sharpRatio > 0.1) {
    element = "fire";
    spellMsg = "Sharp strokes ignite — Fire magic surges";
  } else if (smoothness > 0.8 && totalLength > 150) {
    element = "wind";
    spellMsg = "Graceful curves — Wind magic swirls";
  } else if (density > 2.2 && bboxArea < w * h * 0.25) {
    element = "earth";
    spellMsg = "Dense lines ground — Earth magic solidifies";
  } else if (outwardRatio > 1.5 && ringCount === 0) {
    element = "light";
    spellMsg = "Radiant energy — Light magic shines";
  } else {
    const scores: [ElementName, number][] = [
      ["water", ringCount * 3],
      ["fire", sharpRatio * 5],
      ["wind", smoothness * 3],
      ["earth", density * 0.5],
      ["light", (outwardRatio - 1) * 2],
    ];
    scores.sort((a, b) => b[1] - a[1]);
    element = scores[0][0];
    spellMsg = `Raw ${element} energy coalesces`;
  }

  const normalizedLen = Math.min(1, totalLength / 4000);
  const normalizedSpread = Math.min(1, Math.sqrt(bboxArea) / Math.min(w, h));

  const force = Math.min(1, normalizedLen * 0.8 + sharpRatio * 2);
  const spread = Math.min(1, normalizedSpread * 0.8 + (1 - (ringCount > 0 ? 0.3 : 0)));
  const focus = Math.min(1, 0.3 + (ringCount > 0 ? 0.4 : 0) + smoothness * 0.3);
  const quality = Math.min(1, (force + spread + focus) / 3 + (ringCount > 0 ? 0.15 : 0));
  const stability = Math.min(1, 0.4 + (ringCount > 0 ? 0.35 : 0) + smoothness * 0.25);
  const duration = Math.max(0.5, ringCount * 1.5 + normalizedLen * 3);

  return {
    element, force, spread, focus, quality, stability, duration, ringCount,
    message: spellMsg,
    active: ringCount > 0,
    prepared: allPoints.length > 5 && ringCount === 0,
    valid: allPoints.length >= 5,
    status: ringCount > 0 ? "Spell cast!" : allPoints.length > 5 ? "Close the ring to cast" : "Draw a sigil",
  };
}

export function SpellCraftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectCanvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke>([]);
  const isDrawingRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const castTimeRef = useRef(0);

  const [spellResult, setSpellResult] = useState<SpellResult | null>(null);
  const [element, setElement] = useState<ElementName>(null);
  const [message, setMessage] = useState("Draw a ring, then a sigil inside it");
  const [, forceRender] = useState(0);

  const runAnalysis = useCallback(() => {
    const strokes = strokesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    const result = analyzeStrokes(strokes, canvas.width, canvas.height);
    setSpellResult(result);
    setElement(result.element);
    setMessage(`${ELEMENT_EMOJIS[result.element ?? ""] ?? ""} ${result.message}`);

    if (result.active && result.element) {
      castTimeRef.current = performance.now();
      // Dispatch game:complete for GameShell PostGameCTA
      window.dispatchEvent(
        new CustomEvent("game:complete", {
          detail: { score: Math.round(result.quality * 100), element: result.element },
        })
      );
      const color = ELEMENT_COLORS[result.element];
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      const newParticles: Particle[] = [];
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5;
        const speed = 1 + Math.random() * 3;
        newParticles.push({
          x: cx + (Math.random() - 0.5) * 100,
          y: cy + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
          size: 2 + Math.random() * 3,
        });
      }
      particlesRef.current = newParticles;
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const effectCanvas = effectCanvasRef.current;
    if (!canvas || !effectCanvas) {
      animFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const ctx = canvas.getContext("2d");
    const ectx = effectCanvas.getContext("2d");
    if (!ctx || !ectx) {
      animFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);
    ectx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = "rgba(156, 163, 175, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 140);
    ctx.lineTo(cx, cy + 140);
    ctx.moveTo(cx - 140, cy);
    ctx.lineTo(cx + 140, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    for (const stroke of strokesRef.current) {
      if (stroke.length < 2) {continue;}
      ctx.save();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    const cur = currentStrokeRef.current;
    if (cur.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(cur[0].x, cur[0].y);
      for (let i = 1; i < cur.length; i++) {
        ctx.lineTo(cur[i].x, cur[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (spellResult && spellResult.ringCount > 0) {
      for (const stroke of strokesRef.current) {
        if (stroke.length < 5) {continue;}
        if (pointDist(stroke[0], stroke[stroke.length - 1]) < 25) {
          const el = spellResult.element;
          const color = el ? ELEMENT_COLORS[el] : "#3b82f6";
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5 + 0.3 * Math.sin(performance.now() * 0.003);
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }
    }

    const now = performance.now();
    const particles = particlesRef.current;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.015;
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
    while (particles.length > 0 && particles[0].life <= 0) {
      particles.shift();
    }

    for (const p of particles) {
      ectx.save();
      ectx.globalAlpha = p.life;
      ectx.fillStyle = p.color;
      ectx.shadowColor = p.color;
      ectx.shadowBlur = 6;
      ectx.beginPath();
      ectx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ectx.fill();
      ectx.restore();
    }

    if (spellResult?.active && spellResult.element) {
      const elColor = ELEMENT_COLORS[spellResult.element];
      const pulse = 0.3 + 0.2 * Math.sin(now * 0.004);
      const timeSinceCast = now - castTimeRef.current;
      const fade = timeSinceCast < 2000 ? 1 - timeSinceCast / 2000 : 0;

      if (fade > 0) {
        ectx.save();
        ectx.globalAlpha = fade * 0.4;
        ectx.strokeStyle = elColor;
        ectx.lineWidth = 2;
        ectx.shadowColor = elColor;
        ectx.shadowBlur = 20 + 10 * pulse;
        ectx.beginPath();
        ectx.arc(cx, cy, 125, 0, Math.PI * 2);
        ectx.stroke();
        ectx.shadowBlur = 0;
        ectx.restore();
      }
    }

    animFrameRef.current = requestAnimationFrame(render);
  }, [spellResult]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    currentStrokeRef.current = [{ x, y }];
    forceRender((n) => n + 1);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) {return;}
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    currentStrokeRef.current = [...currentStrokeRef.current, { x, y }];
    forceRender((n) => n + 1);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) {return;}
    isDrawingRef.current = false;
    const cur = currentStrokeRef.current;
    if (cur.length > 1) {
      strokesRef.current = [...strokesRef.current, [...cur]];
    }
    currentStrokeRef.current = [];
    forceRender((n) => n + 1);
    setTimeout(() => runAnalysis(), 50);
  }, [runAnalysis]);

  const handleClear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    particlesRef.current = [];
    setSpellResult(null);
    setElement(null);
    setMessage("Draw a ring, then a sigil inside it");
    forceRender((n) => n + 1);
  }, []);

  const spellName = spellResult?.element
    ? (() => {
        const names = ELEMENT_SPELL_NAMES[spellResult.element];
        return names[Math.floor(Math.random() * names.length)];
      })()
    : null;

  const elementStyle = element
    ? { boxShadow: `0 0 24px ${ELEMENT_COLORS[element] ?? "#fff"}` }
    : {};

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <h2 className="text-xl font-bold">Spell Craft</h2>
        {element && (
          <span
            className="text-sm px-3 py-1 rounded-full border"
            style={{
              borderColor: ELEMENT_COLORS[element] ?? "#fff",
              color: ELEMENT_COLORS[element] ?? "#fff",
            }}
          >
            {ELEMENT_EMOJIS[element] ?? ""} {element}
          </span>
        )}
      </div>

      <div className="relative" style={elementStyle}>
        <canvas
          ref={effectCanvasRef}
          width={400}
          height={400}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="relative bg-white dark:bg-gray-900 rounded-lg border border-muted-foreground/20 cursor-crosshair touch-none max-w-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-sm">{message}</p>

      <button
        onClick={handleClear}
        className="text-sm px-4 py-2 rounded bg-muted hover:bg-muted/80"
      >
        Clear Canvas
      </button>

      {spellResult?.valid && spellResult.element && (
        <div
          className="rounded-xl p-5 border-2 text-center w-72"
          style={{
            borderColor: ELEMENT_COLORS[spellResult.element] ?? "#888",
            background: `linear-gradient(135deg, ${ELEMENT_COLORS[spellResult.element] ?? "#888"}11, transparent)`,
          }}
        >
          <div className="text-3xl mb-2">
            {ELEMENT_EMOJIS[spellResult.element] ?? ""}
          </div>
          <div
            className="text-lg font-bold mb-1"
            style={{ color: ELEMENT_COLORS[spellResult.element] ?? "#fff" }}
          >
            {spellName}
          </div>
          <div className="text-xs text-muted-foreground mb-3 capitalize">
            {spellResult.element} spell
          </div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <div className="flex flex-col">
              <span className="opacity-60">Force</span>
              <span className="font-semibold" style={{ color: ELEMENT_COLORS[spellResult.element] }}>
                {Math.round(spellResult.force * 100)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-60">Spread</span>
              <span className="font-semibold" style={{ color: ELEMENT_COLORS[spellResult.element] }}>
                {Math.round(spellResult.spread * 100)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-60">Focus</span>
              <span className="font-semibold" style={{ color: ELEMENT_COLORS[spellResult.element] }}>
                {Math.round(spellResult.focus * 100)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-60">Quality</span>
              <span className="font-semibold" style={{ color: ELEMENT_COLORS[spellResult.element] }}>
                {Math.round(spellResult.quality * 100)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-60">Stability</span>
              <span className="font-semibold" style={{ color: ELEMENT_COLORS[spellResult.element] }}>
                {Math.round(spellResult.stability * 100)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-60">Duration</span>
              <span className="font-semibold" style={{ color: ELEMENT_COLORS[spellResult.element] }}>
                {spellResult.duration.toFixed(1)}s
              </span>
            </div>
          </div>
          {spellResult.ringCount > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              {spellResult.ringCount} ring spell
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SpellCraftGame;
