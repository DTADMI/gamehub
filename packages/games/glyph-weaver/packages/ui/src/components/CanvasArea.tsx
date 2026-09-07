'use client';

import { DrawingCanvas } from '../canvas/DrawingCanvas';
import { EffectsOverlay } from '../canvas/EffectsOverlay';
import { useStore } from '../state/store';

export function CanvasArea() {
  const spellState = useStore((s) => s.spellState);

  return (
    <div className="flex-1 relative overflow-hidden">
      <DrawingCanvas />
      <EffectsOverlay spell={spellState} />
    </div>
  );
}
