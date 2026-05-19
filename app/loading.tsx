import { LoadingShell } from "@gamehub/ui/components/shell";

export default function GlobalLoading() {
  return (
    <LoadingShell
      variant="shimmer"
      message="Loading GameHub..."
    />
  );
}
