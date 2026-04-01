"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  /** Whether countdown is active */
  active: boolean;
  /** Starting number (default: 3) */
  from?: number;
  /** Callback when countdown reaches 0 */
  onComplete: () => void;
  /** Custom labels (default: numbers, then "GO!") */
  labels?: string[];
  /** Interval in milliseconds between counts */
  interval?: number;
  /** Custom className for the overlay */
  className?: string;
}

/**
 * Countdown - 3-2-1-Go! overlay for game starts
 * 
 * Features:
 * - Animated number pop effect
 * - Customizable starting number and labels
 * - Callback on completion
 * - Respects reduced motion
 */
export function Countdown({
  active,
  from = 3,
  onComplete,
  labels,
  interval = 800,
  className,
}: CountdownProps) {
  const [count, setCount] = useState<number | null>(null);
  const [displayText, setDisplayText] = useState<string>("");
  const [animationKey, setAnimationKey] = useState(0);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getDisplayText = useCallback((currentCount: number): string => {
    if (labels && labels[from - currentCount]) {
      return labels[from - currentCount];
    }
    if (currentCount === 0) {
      return "GO!";
    }
    return String(currentCount);
  }, [from, labels]);

  useEffect(() => {
    if (!active) {
      setCount(null);
      setDisplayText("");
      return;
    }

    // For reduced motion, skip to complete immediately
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Initialize countdown
    setCount(from);
    setDisplayText(getDisplayText(from));
    setAnimationKey((prev) => prev + 1);

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === null) return null;
        
        const next = prev - 1;
        
        if (next < 0) {
          clearInterval(timer);
          // Brief delay after "GO!" before calling complete
          setTimeout(onComplete, 300);
          return null;
        }
        
        setDisplayText(getDisplayText(next));
        setAnimationKey((k) => k + 1);
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [active, from, interval, onComplete, getDisplayText, prefersReducedMotion]);

  if (!active || count === null) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="assertive"
      aria-label={`Countdown: ${displayText}`}
    >
      <div
        key={animationKey}
        className={cn(
          "text-8xl font-black tracking-tight",
          "text-primary drop-shadow-lg",
          !prefersReducedMotion && "animate-bounce-in",
          "md:text-9xl"
        )}
        style={{
          textShadow: "0 4px 24px var(--ring)",
        }}
      >
        {displayText}
      </div>
    </div>
  );
}

export default Countdown;
