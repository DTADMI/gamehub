"use client";

import { ErrorShell } from "@gamehub/ui/components/shell";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorShell
      title="Admin panel error"
      message={error.message || "Something went wrong in the admin panel. Please try again."}
      onRetry={reset}
    />
  );
}
