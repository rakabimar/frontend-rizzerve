import { Suspense } from "react"
import MenuList from "@/components/menu/menu-list"
import MenuCategories from "@/components/menu/menu-categories"
import MenuSearch from "@/components/menu/menu-search"
import { Skeleton } from "@/components/ui/skeleton"

export default function MenuPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>

      <div className="mb-6">
        <MenuSearch />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <MenuCategories />
        </div>

        <div className="md:col-span-3">
          <Suspense fallback={<MenuSkeleton />}>
            <MenuList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-40 w-full rounded-md mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        ))}
    </div>
  )
}
