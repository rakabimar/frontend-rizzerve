"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type { MenuItem } from "@/context/cart-context"
import MenuItemCard from "./menu-item-card"

export default function MenuList() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const category = searchParams.get("category")
  const search = searchParams.get("search")

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true)
      try {
        // In a real app, this would fetch from your API
        // Simulating API call with dummy data
        const dummyData: MenuItem[] = [
          {
            id: "1",
            name: "Spicy Tuna Roll",
            description: "Fresh tuna with spicy mayo and cucumber",
            price: 12.99,
            category: "sushi",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.7,
          },
          {
            id: "2",
            name: "California Roll",
            description: "Crab, avocado, and cucumber",
            price: 10.99,
            category: "sushi",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.5,
          },
          {
            id: "3",
            name: "Miso Soup",
            description: "Traditional Japanese soup with tofu and seaweed",
            price: 4.99,
            category: "appetizers",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.2,
          },
          {
            id: "4",
            name: "Edamame",
            description: "Steamed soybeans with sea salt",
            price: 5.99,
            category: "appetizers",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.0,
          },
          {
            id: "5",
            name: "Chicken Teriyaki",
            description: "Grilled chicken with teriyaki sauce and steamed rice",
            price: 16.99,
            category: "main",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.8,
          },
          {
            id: "6",
            name: "Salmon Nigiri",
            description: "Fresh salmon over pressed vinegar rice",
            price: 8.99,
            category: "sushi",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.6,
          },
          {
            id: "7",
            name: "Green Tea Ice Cream",
            description: "Creamy matcha flavored ice cream",
            price: 6.99,
            category: "desserts",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.3,
          },
          {
            id: "8",
            name: "Tempura Udon",
            description: "Thick noodles in broth with tempura shrimp",
            price: 14.99,
            category: "main",
            image: "/placeholder.svg?height=200&width=300",
            available: true,
            rating: 4.4,
          },
        ]

        // Filter by category if provided
        let filteredItems = dummyData

        if (category && category !== "all") {
          filteredItems = filteredItems.filter((item) => item.category === category)
        }

        // Filter by search term if provided
        if (search) {
          const searchLower = search.toLowerCase()
          filteredItems = filteredItems.filter(
            (item) =>
              item.name.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower),
          )
        }

        setMenuItems(filteredItems)
      } catch (error) {
        console.error("Error fetching menu items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [category, search])

  if (loading) {
    return <p>Loading menu items...</p>
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No items found</h3>
        <p className="text-gray-500">
          {search
            ? `No results for "${search}"`
            : category
              ? `No items in the ${category} category`
              : "No menu items available"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {menuItems.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
