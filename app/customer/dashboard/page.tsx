"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import type { MenuItem } from "@/types/menu"
import RatingStars from "@/components/rating/rating-stars"
import RatingModal from "@/components/rating/rating-modal"

interface MenuItemWithRating extends MenuItem {
  averageRating?: number
  totalRatings?: number
  derivedType?: "FOOD" | "DRINK"
}

export default function CustomerDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItemWithRating[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [tableNumber, setTableNumber] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const { toast } = useToast()

  // Helper function to determine menu item type
  const getMenuItemType = (item: any): "FOOD" | "DRINK" => {
    // If isSpicy is not null (either true or false), it's FOOD
    if (item.isSpicy !== null && item.isSpicy !== undefined) {
      return "FOOD"
    }
    // If isCold is not null (either true or false), it's DRINK
    if (item.isCold !== null && item.isCold !== undefined) {
      return "DRINK"
    }
    // Default fallback (you might want to adjust this based on your business logic)
    return "FOOD"
  }

  useEffect(() => {
    // Check if table number is selected
    const tableNum = localStorage.getItem("tableNumber")
    if (!tableNum) {
      router.push("/customer/table-select")
      return
    }

    setTableNumber(tableNum)
    fetchMenuItems()
  }, [router])

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      console.log("Fetching menu items from:", `${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}`)

      // Fetch menu items
      const menuResponse = await fetch(`${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}`)

      if (!menuResponse.ok) {
        throw new Error("Failed to fetch menu items")
      }

      const menuData = await menuResponse.json()
      console.log("Menu items fetched:", menuData)

      // Fetch ratings for each menu item and determine type
      const menuItemsWithRatings = await Promise.all(
        menuData.map(async (item: any) => {
          try {
            // Determine the menu item type based on isSpicy/isCold
            const derivedType = getMenuItemType(item)
            console.log(`Item ${item.name}: isSpicy=${item.isSpicy}, isCold=${item.isCold}, derivedType=${derivedType}`)

            // Fetch average rating
            let averageRating = 0
            let totalRatings = 0

            try {
              const averageResponse = await fetch(
                `${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/item/${item.id}/average`,
                { timeout: 3000 } // Add timeout
              )

              // Fetch all ratings for this item to count them
              const ratingsResponse = await fetch(
                `${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/item/${item.id}`,
                { timeout: 3000 } // Add timeout
              )

              // Handle average rating response
              if (averageResponse.ok) {
                const averageText = await averageResponse.text()
                console.log(`Average rating response for item ${item.id}:`, averageText)

                // The endpoint returns a plain number, not JSON
                if (averageText && averageText.trim() !== "") {
                  averageRating = Number.parseFloat(averageText)
                  // Handle NaN case
                  if (isNaN(averageRating)) {
                    averageRating = 0
                  }
                }
              } else {
                console.log(`No average rating found for item ${item.id}`)
              }

              // Handle ratings count response
              if (ratingsResponse.ok) {
                const ratingsData = await ratingsResponse.json()
                console.log(`Ratings data for item ${item.id}:`, ratingsData)

                // Count the ratings array
                if (Array.isArray(ratingsData)) {
                  totalRatings = ratingsData.length
                }
              } else {
                console.log(`No ratings found for item ${item.id}`)
              }
            } catch (error) {
              console.warn(`Rating service unavailable for item ${item.id}, using defaults:`, error)
              // Use default values when rating service is unavailable
              averageRating = 0
              totalRatings = 0
            }

            console.log(`Item ${item.name}: Average=${averageRating}, Count=${totalRatings}`)

            return {
              ...item,
              type: derivedType, // Add the derived type to the item
              derivedType, // Keep track of the derived type
              averageRating,
              totalRatings,
            }
          } catch (error) {
            console.error(`Error fetching rating for item ${item.id}:`, error)
            return {
              ...item,
              type: getMenuItemType(item), // Add the derived type even on error
              derivedType: getMenuItemType(item),
              averageRating: 0,
              totalRatings: 0,
            }
          }
        }),
      )

      setMenuItems(menuItemsWithRatings)
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prev, { ...item, quantity: 1 }]
      }
    })

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order`,
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const placeOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      })
      return
    }

    // Save cart to localStorage for now (will be replaced with order service)
    localStorage.setItem("cart", JSON.stringify(cartItems))
    router.push("/customer/checkout")
  }

  const handleRateItem = (item: MenuItem) => {
    setSelectedMenuItem(item)
    setRatingModalOpen(true)
  }

  const handleRatingSubmitted = () => {
    // Refresh menu items to get updated ratings
    fetchMenuItems()
  }

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Use the derived type for filtering
    const itemType = item.derivedType?.toLowerCase() || ""
    const matchesCategory = selectedCategory === "all" || itemType === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory && item.available
  })

  const categories = [
    { id: "all", name: "All Items" },
    { id: "food", name: "Food" },
    { id: "drink", name: "Drinks" },
  ]

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading menu...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-rose-600">RIZZerve</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Table #{tableNumber}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("tableNumber")
                  router.push("/customer/table-select")
                }}
                className="flex items-center gap-1"
              >
                Change Table
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Menu</h2>
          <p className="text-gray-600">Browse and order your favorite dishes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Search and Category Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menu..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "bg-rose-600 hover:bg-rose-700" : ""}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.image || "/placeholder.svg?height=200&width=300"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-white">
                        {item.derivedType}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {item.totalRatings && item.totalRatings > 0 ? (
                          <>
                            <RatingStars rating={item.averageRating || 0} size="sm" readOnly />
                            <span className="text-xs text-gray-500">({item.totalRatings})</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No ratings</span>
                        )}
                      </div>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        {item.derivedType === "FOOD" && item.isSpicy && (
                          <Badge className="bg-red-100 text-red-800">🌶️ Spicy</Badge>
                        )}
                        {item.derivedType === "DRINK" && item.isCold && (
                          <Badge className="bg-blue-100 text-blue-800">🧊 Cold</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => addToCart(item)}>
                      <Plus className="mr-2 h-4 w-4" /> Add to Order
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleRateItem(item)}>
                      <Star className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No menu items found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Your Order
                </CardTitle>
                <CardDescription>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">Your order is empty</div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center mt-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p>${(item.price * item.quantity).toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 h-6 mt-1"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%)</span>
                        <span>${(totalPrice * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span>${(totalPrice * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  disabled={cartItems.length === 0}
                  onClick={placeOrder}
                >
                  Place Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Rating Modal */}
      {selectedMenuItem && (
        <RatingModal
          open={ratingModalOpen}
          onOpenChange={setRatingModalOpen}
          menuItem={selectedMenuItem}
          tableNumber={tableNumber}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}
