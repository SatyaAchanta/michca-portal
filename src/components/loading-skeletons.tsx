import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={`skeleton-${index}`} className="h-40 w-full" />
      ))}
    </div>
  );
}
