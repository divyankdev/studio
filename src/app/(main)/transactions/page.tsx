import { Suspense } from "react"
import TransactionsClientPage from "./transactions-client"
import { Skeleton } from "@/components/ui/skeleton"

function TransactionsPageSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-[260px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-96 w-full rounded-md border" />
        <div className="flex items-center justify-end space-x-2 py-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsPageSkeleton />}>
      <TransactionsClientPage />
    </Suspense>
  )
}
