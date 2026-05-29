"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { StrokeStore } from "glyph-weaver/lib/glyph/input/strokeStore";
import { createConfig } from "glyph-weaver/lib/glyph/config";
import { cleanStrokes } from "glyph-weaver/lib/glyph/parser/strokeCleaner";
import { detectRing } from "glyph-weaver/lib/glyph/parser/ringDetector";
import { classifyStrokesAgainstRing } from "glyph-weaver/lib/glyph/parser/coordinateNormalizer";
import { mapLayers } from "glyph-weaver/lib/glyph/parser/layerMapper";
import { buildSymbolCandidates } from "glyph-weaver/lib/glyph/parser/strokeGrouper";
import { recognizeCandidates } from "glyph-weaver/lib/glyph/parser/symbolRecognizer";
import { classifyDrawing } from "glyph-weaver/lib/glyph/parser/drawingClassifier";
import { compileSpell } from "glyph-weaver/lib/glyph/compiler/spellBuilder";
import { loadDictionary } from "glyph-weaver/lib/glyph/dictionary/loader";
import { CanvasRenderer } from "glyph-weaver/lib/glyph/renderer/canvasRenderer";
import type { GlyphAST, SpellIR, Stroke } from "glyph-weaver/lib/glyph/types";

type ElementName = "fire" | "water" | "wind" | "earth" | "light" | null;

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
  light: "\u{2728}",
};

export function SpellCraftGame() {
  const glyphCanvasRef = useRef<HTMLCanvasElement>(null);
  const effectCanvasRef = useRef<HTMLCanvasElement>(null);
  const [spellIR, setSpellIR] = useState<SpellIR | null>(null);
  const [glyphAST, setGlyphAST] = useState<GlyphAST | null>(null);
  const [element, setElement] = useState<ElementName>(null);
  const [message, setMessage] = useState("Draw a ring, then a sigil inside it");
  const [pipeline, setPipeline] = useState<unknown>(null);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [showGuides, setShowGuides] = useState(true);

  const storeRef = useRef(new StrokeStore());
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const dictionaryRef = useRef<unknown>(null);
  const configRef = useRef(createConfig());
  const animFrameRef = useRef<number>(0);
  const isDrawingRef = useRef(false);

  const runPipeline = useCallback(() => {
    const store = storeRef.current;
    const config = configRef.current;
    const strokes = store.getStrokes();
    if (strokes.length === 0) return;

    try {
      const cleaned = cleanStrokes(strokes, config);
      const ring = detectRing(cleaned, config);
      const classified = classifyStrokesAgainstRing(cleaned, ring, config);
      const layerResult = mapLayers(classified, config);
      const candidates = buildSymbolCandidates(layerResult, config);
      const dict = dictionaryRef.current;
      if (!dict) return;
      const recognitions = recognizeCandidates(candidates, dict as Parameters<typeof recognizeCandidates>[1], ring, config);
      const ast = classifyDrawing(cleaned, ring, classified, candidates, recognitions, config);
      const ir = compileSpell({ glyphAST: ast, config });

      setGlyphAST(ast);
      setSpellIR(ir);
      setPipeline({ cleanedStrokes: cleaned, ring, classifications: classified, candidates, recognitions, glyphAST: ast });

      if (ir.valid && ir.active) {
        setElement(ir.element as ElementName);
        setMessage(`${ELEMENT_EMOJIS[ir.element ?? ""] ?? ""} ${ir.element} spell cast! Force: ${Math.round(ir.force * 100)}`);
      } else if (ir.valid && ir.prepared) {
        const el = ir.element ?? ast.primarySigil?.element ?? null;
        setElement(el as ElementName);
        setMessage(`Close the ring to cast your ${el ?? "?"} spell`);
      } else {
        setMessage(ir.status);
      }
    } catch {
      setMessage("Drawing error");
    }
  }, []);

  const render = useCallback((ts: number) => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const store = storeRef.current;
    const strokes = store.getStrokes();

    const { width, height } = renderer.glyphCanvas;
    renderer.glyphCtx.clearRect(0, 0, width, height);
    renderer.renderGlyph({
      strokes,
      currentStroke,
      pipeline,
      showGuides,
      showDebug: false,
    });

    renderer.renderEffect({
      spellIR,
      ring: pipeline?.ring ?? null,
      timestamp: ts,
      showGuides,
    });

    animFrameRef.current = requestAnimationFrame(render);
  }, [currentStroke, pipeline, spellIR, showGuides]);

  useEffect(() => {
    void (async () => {
      dictionaryRef.current = await loadDictionary();
    })();
  }, []);

  useEffect(() => {
    const glyph = glyphCanvasRef.current;
    const effect = effectCanvasRef.current;
    if (!glyph || !effect) return;
    const renderer = new CanvasRenderer(glyph, effect, configRef.current);
    rendererRef.current = renderer;
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = glyphCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const store = storeRef.current;
    store.addStroke([{ x, y, t: performance.now() }]);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = glyphCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const store = storeRef.current;
    const strokes = store.getStrokes();
    const last = strokes[strokes.length - 1];
    if (last) {
      last.points.push({ x, y, t: performance.now() });
      setCurrentStroke({ ...last });
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    setCurrentStroke(null);
    runPipeline();
  }, [runPipeline]);

  const handleClear = useCallback(() => {
    storeRef.current.clear();
    setSpellIR(null);
    setGlyphAST(null);
    setPipeline(null);
    setElement(null);
    setMessage("Draw a ring, then a sigil inside it");
    setCurrentStroke(null);
  }, []);

  const elementStyle = element
    ? { boxShadow: `0 0 24px ${ELEMENT_COLORS[element] ?? "#fff"}` }
    : {};

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <h2 className="text-xl font-bold">Spell Craft</h2>
        {element && (
          <span className="text-sm px-3 py-1 rounded-full border" style={{ borderColor: ELEMENT_COLORS[element] ?? "#fff", color: ELEMENT_COLORS[element] ?? "#fff" }}>
            {ELEMENT_EMOJIS[element] ?? ""} {element}
          </span>
        )}
        <button
          onClick={() => setShowGuides((g) => !g)}
          className="text-xs px-2 py-1 rounded border border-muted-foreground/30"
        >
          {showGuides ? "Hide Guides" : "Show Guides"}
        </button>
      </div>

      <div className="relative" style={elementStyle}>
        <canvas
          ref={effectCanvasRef}
          width={400}
          height={400}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <canvas
          ref={glyphCanvasRef}
          width={400}
          height={400}
          className="relative bg-white rounded-lg border border-muted-foreground/20 cursor-crosshair touch-none max-w-full"
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

      {spellIR?.valid && spellIR.active && (
        <div className="text-xs text-muted-foreground grid grid-cols-3 gap-x-4 gap-y-1 text-center">
          <span>Force: {Math.round(spellIR.force * 100)}</span>
          <span>Spread: {Math.round(spellIR.spread * 100)}</span>
          <span>Focus: {Math.round(spellIR.focus * 100)}</span>
          <span>Quality: {Math.round(spellIR.quality * 100)}</span>
          <span>Stability: {Math.round(spellIR.stability * 100)}</span>
          <span>Duration: {spellIR.duration.toFixed(1)}s</span>
        </div>
      )}
    </div>
  );
}

export default SpellCraftGame;
