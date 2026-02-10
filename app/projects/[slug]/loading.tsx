import { Skeleton } from "@games/shared";
import { Separator } from "@games/shared";

export default function ProjectLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Hero section skeleton */}
      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* Image skeleton */}
        <Skeleton className="aspect-video w-full rounded-lg" />

        {/* Info skeleton */}
        <div className="flex flex-col justify-center">
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="mb-6 h-6 w-5/6" />

          <div className="mb-6 flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="mb-6 flex gap-3">
            <Skeleton className="h-11 w-40" />
            <Skeleton className="h-11 w-32" />
          </div>

          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Features skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
