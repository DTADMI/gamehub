"use client";
import { effects, type EngineCtx,ensureCtx } from "@games/pointclick-engine/engine";
import React, { useCallback, useEffect, useRef, useState } from "react";

export type ShadowPuzzleProps = {
  lang: "en" | "fr";
  ctx: EngineCtx;
  setCtx: React.Dispatch<React.SetStateAction<EngineCtx>>;
};

type ShadowPositions = {
  circle: { x: number; y: number };
  square: { x: number; y: number };
  triangle: { x: number; y: number };
};

const CANVAS_W = 480;
const CANVAS_H = 200;

/**
 * E2 — Shadow Puzzle: align 3 shapes (circle, square, triangle) to match
 * a target outline on a canvas. Draggable via pointer events.
 */
export function ShadowPuzzle({ lang, ctx, setCtx }: ShadowPuzzleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [positions, setPositions] = useState<ShadowPositions>({
    circle: { x: 80, y: 80 },
    square: { x: 200, y: 80 },
    triangle: { x: 320, y: 80 },
  });
  const [solved, setSolved] = useState(!!ctx.flags?.["shadow.solved"]);
  const [dragging, setDragging] = useState<"circle" | "square" | "triangle" | null>(null);

  // Check if all shapes are within the target area
  const checkSolve = useCallback((pos: ShadowPositions) => {
    const valid =
      pos.circle.x >= 150 && pos.circle.x <= 170 &&
      pos.circle.y >= 110 && pos.circle.y <= 130 &&
      pos.square.x >= 210 && pos.square.x <= 230 &&
      pos.square.y >= 110 && pos.square.y <= 130 &&
      pos.triangle.x >= 270 && pos.triangle.x <= 290 &&
      pos.triangle.y >= 110 && pos.triangle.y <= 130;
    if (valid) {
      setSolved(true);
      setCtx((c) => effects.setFlag("shadow.solved", true)(ensureCtx(c)));
    }
  }, [setCtx]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) {return;}

    ctx2d.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx2d.fillStyle = "#1a1a2e";
    ctx2d.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Instruction
    ctx2d.fillStyle = "#ffd700";
    ctx2d.font = "12px monospace";
    ctx2d.fillText(
      lang === "fr" ? "Alignez les formes pour le contour cible" : "Align shapes to match the target outline",
      10, 15,
    );

    // Target outline (dashed)
    ctx2d.strokeStyle = "#556";
    ctx2d.lineWidth = 2;
    ctx2d.setLineDash([6, 4]);
    ctx2d.beginPath();
    (ctx2d as any).roundRect?.(140, 120, 200, 50, 8) || ctx2d.stroke();
    ctx2d.stroke();
    ctx2d.setLineDash([]);

    // Circle
    const cs = positions.circle;
    ctx2d.fillStyle = "rgba(220,100,100,0.7)";
    ctx2d.beginPath();
    ctx2d.arc(cs.x, cs.y, 25, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.strokeStyle = "#e88";
    ctx2d.lineWidth = 2;
    ctx2d.stroke();

    // Square
    const ss = positions.square;
    ctx2d.fillStyle = "rgba(100,220,100,0.7)";
    ctx2d.fillRect(ss.x - 25, ss.y - 25, 50, 50);
    ctx2d.strokeStyle = "#8e8";
    ctx2d.lineWidth = 2;
    ctx2d.strokeRect(ss.x - 25, ss.y - 25, 50, 50);

    // Triangle
    const ts = positions.triangle;
    ctx2d.fillStyle = "rgba(100,100,220,0.7)";
    ctx2d.beginPath();
    ctx2d.moveTo(ts.x, ts.y - 30);
    ctx2d.lineTo(ts.x + 26, ts.y + 22);
    ctx2d.lineTo(ts.x - 26, ts.y + 22);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.strokeStyle = "#88e";
    ctx2d.lineWidth = 2;
    ctx2d.stroke();

    // Solved indicator
    if (solved) {
      ctx2d.fillStyle = "#4f4";
      ctx2d.font = "bold 14px monospace";
      ctx2d.fillText(
        lang === "fr" ? "Ombre align\u00E9e !" : "Shadow aligned!",
        340, 15,
      );
    }
  }, [positions, solved, lang]);

  // Pointer handlers for drag
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {return { x: 0, y: 0 };}
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    };
  };

  const getNearestShape = (x: number, y: number): "circle" | "square" | "triangle" | null => {
    const distC = Math.hypot(x - positions.circle.x, y - positions.circle.y);
    const distS = Math.hypot(x - positions.square.x, y - positions.square.y);
    const distT = Math.hypot(x - positions.triangle.x, y - positions.triangle.y);
    const min = Math.min(distC, distS, distT);
    if (min > 50) {return null;}
    if (min === distC) {return "circle";}
    if (min === distS) {return "square";}
    return "triangle";
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(e);
    const shape = getNearestShape(x, y);
    if (shape) {
      setDragging(shape);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) {return;}
    const { x, y } = getCanvasPos(e);
    const clamped = {
      x: Math.max(30, Math.min(CANVAS_W - 30, x)),
      y: Math.max(35, Math.min(CANVAS_H - 35, y)),
    };
    setPositions((prev) => {
      const next = { ...prev, [dragging]: clamped };
      checkSolve(next);
      return next;
    });
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  return (
    <div className="mb-4 rounded-md border p-3">
      <h3 className="mb-2 font-semibold">
        {lang === "fr" ? "Puzzle d'ombres" : "Shadow Puzzle"}
      </h3>
      <p className="mb-2 text-sm">
        {lang === "fr"
          ? "Faites glisser les formes dans le contour cible pour r\u00E9v\u00E9ler l'indice."
          : "Drag the shapes into the target outline to reveal the clue."}
      </p>
      {solved && (
        <p className="mb-2 font-bold text-emerald-400">
          {lang === "fr" ? "Ombre align\u00E9e avec succ\u00E8s !" : "Shadow aligned successfully!"}
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full max-w-[480px] cursor-grab touch-none rounded border border-gray-700"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <button
        className="mt-2 min-h-[32px] rounded border px-3 py-1 text-sm"
        onClick={() => {
          setPositions({
            circle: { x: 80, y: 80 },
            square: { x: 200, y: 80 },
            triangle: { x: 320, y: 80 },
          });
          setSolved(false);
        }}
      >
        {lang === "fr" ? "R\u00E9initialiser" : "Reset"}
      </button>
    </div>
  );
}