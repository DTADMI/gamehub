import { LoadingShell } from "@gamehub/ui/components/shell";

export default function GameLoading() {
  return (
    <LoadingShell
      variant="spinner"
      message="Loading game..."
    />
  );
}
