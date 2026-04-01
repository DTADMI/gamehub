"use client";

import { useEffect, useRef, useCallback } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "square" | "circle" | "triangle";
}

interface ConfettiCelebrationProps {
  /** Whether confetti is active */
  active: boolean;
  /** Duration in milliseconds before auto-stopping */
  duration?: number;
  /** Number of particles */
  particleCount?: number;
  /** Custom colors (defaults to festive palette) */
  colors?: string[];
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Respect reduced motion preferences */
  respectReducedMotion?: boolean;
}

const DEFAULT_COLORS = [
  "#FF6B6B", // coral red
  "#4ECDC4", // teal
  "#FFE66D", // yellow
  "#95E1D3", // mint
  "#F38181", // pink
  "#AA96DA", // lavender
  "#FCBAD3", // light pink
  "#A8D8EA", // sky blue
];

/**
 * ConfettiCelebration - Canvas-based confetti animation for celebrations
 * 
 * Features:
 * - Lightweight canvas rendering
 * - Configurable particle count, colors, and duration
 * - Respects prefers-reduced-motion
 * - Auto-cleanup on unmount
 */
export function ConfettiCelebration({
  active,
  duration = 3000,
  particleCount = 100,
  colors = DEFAULT_COLORS,
  onComplete,
  respectReducedMotion = true,
}: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const prefersReducedMotion = 
    respectReducedMotion && 
    typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const createParticle = useCallback((canvasWidth: number): ConfettiParticle => {
    const shapes: ConfettiParticle["shape"][] = ["square", "circle", "triangle"];
    return {
      x: Math.random() * canvasWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  }, [colors]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: ConfettiParticle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.fillStyle = particle.color;
    
    switch (particle.shape) {
      case "square":
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(particle.size / 2, particle.size / 2);
        ctx.lineTo(-particle.size / 2, particle.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }, []);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const elapsed = timestamp - startTimeRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.rotation += particle.rotationSpeed;
      particle.vx *= 0.99; // air resistance

      // Draw if on screen
      if (particle.y < canvas.height + 20) {
        drawParticle(ctx, particle);
        return true;
      }
      return false;
    });

    // Add new particles during burst phase
    if (elapsed < duration * 0.3 && particlesRef.current.length < particleCount) {
      const newCount = Math.min(5, particleCount - particlesRef.current.length);
      for (let i = 0; i < newCount; i++) {
        particlesRef.current.push(createParticle(canvas.width));
      }
    }

    // Continue animation or complete
    if (particlesRef.current.length > 0 && elapsed < duration + 2000) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }, [duration, particleCount, createParticle, drawParticle, onComplete]);

  useEffect(() => {
    if (!active || prefersReducedMotion) {
      // For reduced motion, just trigger complete after brief delay
      if (active && prefersReducedMotion) {
        const timer = setTimeout(() => onComplete?.(), 500);
        return () => clearTimeout(timer);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    particlesRef.current = [];
    startTimeRef.current = performance.now();

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particlesRef.current = [];
    };
  }, [active, prefersReducedMotion, animate, onComplete]);

  if (!active || prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}

export default ConfettiCelebration;
