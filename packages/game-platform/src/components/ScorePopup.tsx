"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScorePopupProps {
  /** Points to display (e.g., +10, +100) */
  points: number;
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Custom color */
  color?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * ScorePopup - Animated floating score indicator
 * 
 * Shows a floating "+X" animation when points are earned.
 * Floats up and fades out.
 */
export function ScorePopup({
  points,
  x,
  y,
  onComplete,
  color,
  size = "md",
}: ScorePopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div
      className={cn(
        "score-popup font-bold",
        sizeClasses[size]
      )}
      style={{
        left: x,
        top: y,
        color: color || "var(--chart-1)",
      }}
      aria-hidden="true"
    >
      +{points}
    </div>
  );
}

interface ScorePopupManagerProps {
  /** Array of popup data */
  popups: Array<{
    id: string;
    points: number;
    x: number;
    y: number;
  }>;
  /** Callback to remove a popup by ID */
  onRemove: (id: string) => void;
}

/**
 * ScorePopupManager - Manages multiple score popups
 * 
 * Use this to render multiple score animations simultaneously.
 */
export function ScorePopupManager({ popups, onRemove }: ScorePopupManagerProps) {
  return (
    <>
      {popups.map((popup) => (
        <ScorePopup
          key={popup.id}
          points={popup.points}
          x={popup.x}
          y={popup.y}
          onComplete={() => onRemove(popup.id)}
        />
      ))}
    </>
  );
}

export default ScorePopup;
