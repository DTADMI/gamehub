import { EmptyShell } from "@gamehub/ui/components/shell";

export default function GameNotFoundPage() {
  return (
    <EmptyShell
      title="Game not found"
      message="The game you're looking for doesn't exist or may have been removed."
    />
  );
}
