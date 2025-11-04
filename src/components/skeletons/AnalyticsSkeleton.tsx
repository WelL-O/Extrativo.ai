import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CardSkeleton } from "./CardSkeleton"

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[240px] mb-2" />
          <Skeleton className="h-4 w-[320px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>

      {/* Grid 2 Columns */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[160px] mb-2" />
            <Skeleton className="h-4 w-[240px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[260px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Performance by Project */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[220px] mb-2" />
          <Skeleton className="h-4 w-[280px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-[180px]" />
                  <Skeleton className="h-4 w-[240px]" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-[60px] ml-auto" />
                  <Skeleton className="h-3 w-[50px] ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[340px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
