// app/admin/dashboard/loading.tsx
export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-secondary rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-secondary rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-secondary rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-secondary rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="h-12 bg-secondary rounded-lg mb-6 animate-pulse"></div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-64 bg-secondary rounded-xl animate-pulse"></div>
        <div className="h-32 bg-secondary rounded-xl animate-pulse"></div>
        <div className="h-48 bg-secondary rounded-xl animate-pulse"></div>
      </div>
    </div>
  )
}