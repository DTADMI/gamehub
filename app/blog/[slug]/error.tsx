"use client";

import { ErrorShell } from "@gamehub/ui/components/shell";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorShell
      title="Failed to load post"
      message={error.message || "Unable to load this blog post. Please try again."}
      onRetry={reset}
    />
  );
}
