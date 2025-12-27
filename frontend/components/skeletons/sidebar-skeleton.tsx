import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="basis-[300px] flex flex-col gap-2 py-6 px-4 bg-gray-50 border-gray-200 border rounded-md min-h-[calc(100vh-90px)]">
      <div className="h-12 px-3 flex items-center gap-3">
        <Skeleton className="size-6 rounded" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="h-12 px-3 flex items-center gap-3">
        <Skeleton className="size-6 rounded" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="h-12 px-3 flex items-center gap-3">
        <Skeleton className="size-6 rounded" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}
