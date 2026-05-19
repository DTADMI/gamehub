"use client";

import { ErrorShell } from "@gamehub/ui/components/shell";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorShell
      title="Game failed to load"
      message={error.message || "Unable to load this game. Please try again."}
      onRetry={reset}
    />
  );
}
