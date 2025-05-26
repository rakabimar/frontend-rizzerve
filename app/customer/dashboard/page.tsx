"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import type { MenuItem } from "@/types/menu"
import RatingModal from "@/components/rating/rating-modal"
import RatingStars from "@/components/rating/rating-stars"
import { useOrderService } from "@/hooks/use-order-service"

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
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const orderService = useOrderService()

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

    // Get or create order ID
    initializeOrder(tableNum)
    fetchMenuItems()
  }, [router])

  const initializeOrder = async (tableNum: string) => {
    try {
      // Check if we already have an order ID
      let orderId = localStorage.getItem("currentOrderId")

      if (!orderId || orderId.startsWith("temp-")) {
        // Create a new order
        console.log("Creating new order for table:", tableNum)
        const newOrder = await orderService.createOrder(tableNum)

        if (newOrder && newOrder.id) {
          orderId = newOrder.id
          localStorage.setItem("currentOrderId", orderId)
          console.log("New order created with ID:", orderId)
        } else {
          throw new Error("Failed to create order")
        }
      }

      setCurrentOrderId(orderId)
      console.log("Current order ID:", orderId)
    } catch (error) {
      console.error("Error initializing order:", error)
      // Fallback to temporary ID if order service fails
      const tempOrderId = `temp-${Date.now()}`
      localStorage.setItem("currentOrderId", tempOrderId)
      setCurrentOrderId(tempOrderId)

      toast({
        title: "Warning",
        description: "Using offline mode. Some features may be limited.",
        variant: "destructive",
      })
    }
  }

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
            const averageResponse = await fetch(
              `${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/item/${item.id}/average`,
            )

            // Fetch all ratings for this item to count them
            const ratingsResponse = await fetch(
              `${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/item/${item.id}`,
            )

            let averageRating = 0
            let totalRatings = 0

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

    // Save cart to localStorage for checkout
    localStorage.setItem("cart", JSON.stringify(cartItems))
    router.push("/customer/checkout")
  }

  const handleRateItem = (item: MenuItem) => {
    if (!currentOrderId) {
      toast({
        title: "Error",
        description: "No active order found. Please start over.",
        variant: "destructive",
      })
      return
    }

    // Convert menu item to MenuItem format for rating modal
    const menuItem: MenuItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      available: item.available,
      type: item.type || "FOOD",
      isSpicy: item.isSpicy,
      isCold: item.isCold,
    }
    setSelectedMenuItem(menuItem)
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
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

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
                  localStorage.removeItem("currentOrderId")
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
                    {item.derivedType === "FOOD" && item.isSpicy && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-100 text-red-800">🌶️ Spicy</Badge>
                      </div>
                    )}
                    {item.derivedType === "DRINK" && item.isCold && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-100 text-blue-800">❄️ Cold</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="font-bold text-rose-600">${item.price.toFixed(2)}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                    {/* Rating Display */}
                    <div className="flex items-center gap-2 mb-3">
                      <RatingStars rating={item.averageRating || 0} size="sm" readOnly />
                      <span className="text-sm text-gray-500">
                        {item.totalRatings ? `(${item.totalRatings} reviews)` : "No reviews"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => addToCart(item)}>
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRateItem(item)}
                        className="flex-shrink-0"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No items found</h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? `No results for "${searchTerm}"`
                    : selectedCategory !== "all"
                      ? `No items in the ${selectedCategory} category`
                      : "No menu items available"}
                </p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Your Order</h3>
                <p className="text-sm text-gray-500">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="p-4">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={placeOrder}>
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Rating Modal */}
      {selectedMenuItem && currentOrderId && (
        <RatingModal
          open={ratingModalOpen}
          onOpenChange={setRatingModalOpen}
          menuItem={selectedMenuItem}
          orderId={currentOrderId}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}
