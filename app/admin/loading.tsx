import { LoadingShell } from "@gamehub/ui/components/shell";

export default function AdminLoading() {
  return (
    <LoadingShell
      variant="shimmer"
      message="Loading admin panel..."
    />
  );
}
