import { LoadingShell } from "@gamehub/ui/components/shell";

export default function BlogPostLoading() {
  return (
    <LoadingShell
      variant="shimmer"
      message="Loading post..."
    />
  );
}
