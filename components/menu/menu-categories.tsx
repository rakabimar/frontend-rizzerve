"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

type Category = {
  id: string
  name: string
  slug: string
}

export default function MenuCategories() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"

  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All Items", slug: "all" },
    { id: "appetizers", name: "Appetizers", slug: "appetizers" },
    { id: "sushi", name: "Sushi", slug: "sushi" },
    { id: "main", name: "Main Dishes", slug: "main" },
    { id: "desserts", name: "Desserts", slug: "desserts" },
    { id: "drinks", name: "Drinks", slug: "drinks" },
  ])

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categorySlug === "all") {
      params.delete("category")
    } else {
      params.set("category", categorySlug)
    }

    router.push(`/menu?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-semibold text-lg mb-4">Categories</h2>
      <div className="space-y-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={currentCategory === category.slug ? "default" : "ghost"}
            className={`w-full justify-start ${
              currentCategory === category.slug ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
            }`}
            onClick={() => handleCategoryChange(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
