import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Team Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 max-w-64" />
        <Skeleton className="h-5 max-w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className={i === 3 ? "sm:max-lg:col-span-2" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 max-w-24" />
              <Skeleton className="size-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 max-w-20 mb-2" />
              <Skeleton className="h-4 max-w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Members Section Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 max-w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-12 max-w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 max-w-32" />
                <Skeleton className="h-4 max-w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Overview Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 max-w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 max-w-16 mb-1" />
              <Skeleton className="h-10 w-full max-w-[500px]" />
            </div>
            <div>
              <Skeleton className="h-4 max-w-20 mb-1" />
              <Skeleton className="h-10 w-full max-w-[500px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
