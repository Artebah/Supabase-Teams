import { Skeleton } from "@/components/ui/skeleton";

export function HeaderProfileSkeleton() {
  return (
    <div className="flex gap-2 items-center">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-5 w-24" />
    </div>
  );
}
