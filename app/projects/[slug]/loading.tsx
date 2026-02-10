import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProjectLoading() {
  return (
    <div className="px-6 py-8 md:px-8">
      <Skeleton className="mb-6 h-4 w-32" />
      <Skeleton className="mb-4 h-10 w-3/4" />
      <Skeleton className="mb-2 h-6 w-full max-w-lg" />
      <Skeleton className="mb-6 h-6 w-5/6 max-w-lg" />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Separator className="my-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
