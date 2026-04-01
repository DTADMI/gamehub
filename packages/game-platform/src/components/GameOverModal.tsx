"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useFeature, AUTH_FLAGS } from "../lib/flags";
import { ConfettiCelebration } from "./ConfettiCelebration";

interface GameOverModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Final score */
  score: number;
  /** High score (personal best) */
  highScore?: number;
  /** Whether this score is a new personal best */
  isNewHighScore?: boolean;
  /** Game name for display */
  gameName: string;
  /** Callback to play again */
  onPlayAgain: () => void;
  /** Callback to close modal */
  onClose?: () => void;
  /** Whether score was saved successfully */
  scoreSaved?: boolean;
  /** Additional stats to display */
  stats?: Array<{ label: string; value: string | number }>;
  /** Show confetti for wins/high scores */
  showConfetti?: boolean;
}

/**
 * GameOverModal - Unified game over screen with login CTA for guests
 * 
 * Features:
 * - Score display with animation
 * - Personal best indicator
 * - Login CTA for guests (feature flagged)
 * - Share button
 * - Play again action
 * - Confetti celebration for high scores
 */
export function GameOverModal({
  isOpen,
  score,
  highScore,
  isNewHighScore = false,
  gameName,
  onPlayAgain,
  onClose,
  scoreSaved,
  stats,
  showConfetti = false,
}: GameOverModalProps) {
  const { isAuthenticated, isGuest } = useAuth();
  const showLoginCTA = useFeature(AUTH_FLAGS.POST_GAME_LOGIN_CTA);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Animate score counting up
  useEffect(() => {
    if (!isOpen) {
      setAnimatedScore(0);
      setShowContent(false);
      return;
    }

    // Show content after brief delay
    const contentTimer = setTimeout(() => setShowContent(true), 100);

    // Animate score
    const duration = 1000;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const scoreTimer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setAnimatedScore(current);

      if (step >= steps) {
        clearInterval(scoreTimer);
        setAnimatedScore(score);
      }
    }, duration / steps);

    return () => {
      clearTimeout(contentTimer);
      clearInterval(scoreTimer);
    };
  }, [isOpen, score]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shouldShowLoginCTA = showLoginCTA && (isGuest || !isAuthenticated);
  const shouldShowConfetti = showConfetti || isNewHighScore;

  return (
    <>
      {shouldShowConfetti && (
        <ConfettiCelebration
          active={isOpen && showContent}
          duration={2500}
          particleCount={isNewHighScore ? 150 : 80}
        />
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border bg-card p-6 shadow-xl",
          showContent ? "animate-scale-in" : "opacity-0"
        )}
      >
        {/* Header */}
        <div className="text-center">
          <h2
            id="game-over-title"
            className="text-2xl font-bold text-foreground"
          >
            Game Over
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{gameName}</p>
        </div>

        {/* Score Display */}
        <div className="mt-6 text-center">
          <div className="text-6xl font-black tabular-nums text-primary">
            {animatedScore.toLocaleString()}
          </div>
          <p className="mt-1 text-sm uppercase tracking-wide text-muted-foreground">
            Final Score
          </p>

          {/* New High Score Badge */}
          {isNewHighScore && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary animate-bounce-in">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              New Personal Best!
            </div>
          )}

          {/* Previous High Score */}
          {!isNewHighScore && highScore !== undefined && highScore > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Personal Best: {highScore.toLocaleString()}
            </p>
          )}
        </div>

        {/* Additional Stats */}
        {stats && stats.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-lg bg-muted/50 p-3 text-center"
              >
                <div className="text-lg font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Score Saved Indicator */}
        {isAuthenticated && !isGuest && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            {scoreSaved ? (
              <>
                <svg
                  className="h-4 w-4 text-chart-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-chart-1">Score saved to leaderboard</span>
              </>
            ) : (
              <span className="text-muted-foreground">Saving score...</span>
            )}
          </div>
        )}

        {/* Guest Login CTA */}
        {shouldShowLoginCTA && (
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="font-semibold text-foreground">
              Want to save your score?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to track your progress, compete on leaderboards, and earn achievements!
            </p>
            <div className="mt-3 flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/register">Create Account</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={onPlayAgain}
            className="flex-1"
            size="lg"
          >
            Play Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${gameName} Score`,
                  text: `I scored ${score.toLocaleString()} points in ${gameName}!`,
                  url: window.location.href,
                });
              } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(
                  `I scored ${score.toLocaleString()} points in ${gameName}! ${window.location.href}`
                );
              }
            }}
            aria-label="Share score"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </Button>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}

export default GameOverModal;
