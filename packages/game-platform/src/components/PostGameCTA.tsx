"use client";

import { Trophy, UserPlus } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

import { usePostGameCTA } from "../hooks/usePostGameCTA";

type PostGameCTAProps = {
  slug: string;
  onClose: () => void;
  score?: number;
};

export function PostGameCTA({ slug, onClose, score }: PostGameCTAProps) {
  const { shouldShow } = usePostGameCTA(slug);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(() => {
    if (dismissed) return;
    if (shouldShow()) {
      setVisible(true);
    }
  }, [shouldShow, dismissed]);

  useEffect(() => {
    // Small delay so the game-over UI renders first
    const t = setTimeout(check, 600);
    return () => clearTimeout(t);
  }, [check]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    onClose();
  }, [onClose]);

  const handleCloseOverlay = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleDismiss();
      }
    },
    [handleDismiss],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    },
    [handleDismiss],
  );

  if (!visible) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleCloseOverlay}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Save your progress"
    >
      <div className="bg-card mx-4 w-full max-w-sm rounded-xl p-6 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 rounded-full p-3">
            <Trophy className="text-primary h-8 w-8" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-lg font-bold">
          Save your progress
        </h2>

        {score !== undefined && (
          <p className="text-muted-foreground mb-3 text-center text-sm">
            You scored {score.toLocaleString()}. Sign in to save your score and compete on the
            leaderboard.
          </p>
        )}
        {score === undefined && (
          <p className="text-muted-foreground mb-3 text-center text-sm">
            Sign in to save your progress, unlock rankings, and compete with others.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Link
            href={`/auth?redirect=/games/${slug}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
          >
            <UserPlus className="h-4 w-4" />
            Create account
          </Link>
          <Link
            href={`/auth?redirect=/games/${slug}`}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground rounded-md px-4 py-2 text-sm font-medium"
          >
            Continue playing
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostGameCTA;
