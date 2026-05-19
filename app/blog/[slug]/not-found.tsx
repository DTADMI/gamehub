import { EmptyShell } from "@gamehub/ui/components/shell";

export default function BlogPostNotFoundPage() {
  return (
    <EmptyShell
      title="Post not found"
      message="The blog post you're looking for doesn't exist or has been removed."
    />
  );
}
