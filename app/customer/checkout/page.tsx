"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Star, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { useOrderService } from "@/hooks/use-order-service"
import { API_URLS } from "@/lib/constants"
import RatingModal from "@/components/rating/rating-modal"
import RatingStars from "@/components/rating/rating-stars"
import type { MenuItem } from "@/types/menu"

interface CustomerRating {
  ratingId: string
  itemId: string
  itemName: string
  value: number
  canUpdate: boolean
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [customerRatings, setCustomerRatings] = useState<CustomerRating[]>([])
  const [loadingRatings, setLoadingRatings] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const orderService = useOrderService()

  // Generate a table ID based on table number (same logic as in RatingModal)
  const generateTableId = (tableNum: string) => {
    // For now, we'll generate a consistent UUID based on table number
    // In a real app, you'd fetch the actual table ID from your table service
    return `204a1dff-a4c7-48e3-abcd-61f6342acc55`
  }

  useEffect(() => {
    // Check if table number is selected
    const tableNum = localStorage.getItem("tableNumber")
    if (!tableNum) {
      router.push("/customer/table-select")
      return
    }

    // Check if order ID exists
    const orderId = localStorage.getItem("currentOrderId")
    if (!orderId) {
      // No existing order, redirect back to dashboard
      router.push("/customer/dashboard")
      return
    }

    setTableNumber(tableNum)
    setCurrentOrderId(orderId)

    // Get cart items from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      const items = JSON.parse(storedCart)
      setCartItems(items)
      // Fetch customer ratings for these items
      fetchCustomerRatings(items, tableNum)
    } else {
      // If no cart items, redirect to menu
      router.push("/customer/dashboard")
      return
    }

    setLoading(false)
  }, [router])

  const fetchCustomerRatings = async (items: any[], tableNum: string) => {
    setLoadingRatings(true)
    try {
      const tableId = generateTableId(tableNum)
      console.log("Fetching ratings for table ID:", tableId)
      
      // Fetch all ratings for this table once
      const response = await fetch(`${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/meja/${tableId}`)
      
      if (response.ok) {
        const allTableRatings = await response.json()
        console.log("All table ratings:", allTableRatings)
        
        const ratings: CustomerRating[] = []
        
        // Process all ratings and fetch item names
        for (const rating of allTableRatings) {
          let itemName = "Unknown Item"
          
          // First try to find item name from cart items
          const cartItem = items.find(item => item.id === rating.itemId)
          if (cartItem) {
            itemName = cartItem.name
          } else {
            // If not in cart, fetch item name from menu service
            try {
              const menuResponse = await fetch(`${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}/${rating.itemId}`)
              if (menuResponse.ok) {
                const menuItem = await menuResponse.json()
                itemName = menuItem.name || `Item ${rating.itemId.substring(0, 8)}`
              } else {
                itemName = `Item ${rating.itemId.substring(0, 8)}`
              }
            } catch (error) {
              console.error(`Error fetching menu item ${rating.itemId}:`, error)
              itemName = `Item ${rating.itemId.substring(0, 8)}`
            }
          }
          
          ratings.push({
            ratingId: rating.ratingId,
            itemId: rating.itemId,
            itemName: itemName,
            value: rating.value,
            canUpdate: rating.canUpdate
          })
        }
        
        console.log("Processed customer ratings:", ratings)
        setCustomerRatings(ratings)
      } else {
        console.error("Failed to fetch ratings:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching customer ratings:", error)
    } finally {
      setLoadingRatings(false)
    }
  }

  const handleDeleteRating = async (ratingId: string, itemId: string) => {
    try {
      const response = await fetch(`${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/${ratingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the rating from local state
        setCustomerRatings(prev => prev.filter(rating => rating.ratingId !== ratingId))
        
        toast({
          title: "Rating deleted",
          description: "Your rating has been removed successfully",
        })
      } else {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to delete rating")
      }
    } catch (error) {
      console.error("Error deleting rating:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not delete rating. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditRating = (rating: CustomerRating) => {
    // Find the cart item to create MenuItem object
    const cartItem = cartItems.find(item => item.id === rating.itemId)
    if (cartItem) {
      const menuItem: MenuItem = {
        id: cartItem.id,
        name: cartItem.name,
        description: cartItem.description || "",
        price: cartItem.price,
        image: cartItem.image,
        available: cartItem.available !== false,
        isSpicy: cartItem.isSpicy,
        isCold: cartItem.isCold,
        type: cartItem.isSpicy !== undefined ? "FOOD" : "DRINK"
      }
      setSelectedMenuItem(menuItem)
      setRatingModalOpen(true)
    }
  }

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleRatingSubmitted = () => {
    // Rating submitted successfully, refresh ratings
    if (tableNumber) {
      fetchCustomerRatings(cartItems, tableNumber)
    }
    toast({
      title: "Rating submitted",
      description: "Thank you for your feedback!",
    })
  }

  const handleCheckout = async () => {
    if (!currentOrderId || !tableNumber) {
      toast({
        title: "Error",
        description: "No active order found. Please start over.",
        variant: "destructive",
      })
      router.push("/customer/dashboard")
      return
    }

    setLoading(true)
    try {
      let realOrderId = currentOrderId

      // Remove duplicate order creation - order should already exist from table selection
      // Just check if we have a valid order ID
      if (currentOrderId.startsWith('temp-')) {
        toast({
          title: "Error",
          description: "Invalid order. Please start over by selecting a table.",
          variant: "destructive",
        })
        router.push("/customer/table-select")
        return
      }

      // Create checkout request using the checkout service
      const checkoutRequest = {
        orderId: realOrderId,
        couponCode: null // No coupon for now
      }

      console.log("Creating checkout with request:", checkoutRequest)

      // Call checkout service instead of manually adding items
      const response = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.CHECKOUT_API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutRequest),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to create checkout")
      }

      const checkoutData = await response.json()
      console.log("Checkout created successfully:", checkoutData)

      // Clear cart and order ID, set order completed
      localStorage.removeItem("cart")
      localStorage.removeItem("currentOrderId")
      setOrderNumber(checkoutData.checkoutId ? 
        checkoutData.checkoutId.substring(0, 8).toUpperCase() : 
        `T${Date.now().toString().slice(-6)}`)
      setOrderCompleted(true)

      toast({
        title: "Order placed successfully",
        description: "Your order status has been changed to PROCESSING",
      })
    } catch (error) {
      console.error("Error confirming order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not confirm your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>Your order is being prepared</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="font-medium">Order Number</p>
              <p className="text-2xl font-bold">{orderNumber}</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Table Number</p>
              <p className="text-xl">{tableNumber}</p>
            </div>
            <p className="text-center text-gray-500">
              Your order status has been changed to PROCESSING and will be served shortly.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/customer/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Checkout</h2>
          <p className="text-gray-600">Review your order and confirm</p>
        </div>

        <div className="space-y-6">
          {/* Ratings Made by You Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ratings Made by You</CardTitle>
              <CardDescription>Your ratings for ordered items</CardDescription>
            </CardHeader>
            <CardContent>
              {customerRatings.length > 0 ? (
                <div className="space-y-4">
                  {customerRatings.map((rating) => (
                    <div key={rating.ratingId} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{rating.itemName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <RatingStars rating={rating.value} size="sm" readOnly />
                          <span className="text-sm text-gray-600">({rating.value}/5)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rating.canUpdate && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRating(rating)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRating(rating.ratingId, rating.itemId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>You haven't rated any items yet.</p>
                  <p className="text-sm mt-1">Rate items from the dashboard to see them here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Table #{tableNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleCheckout} disabled={loading}>
                {loading ? "Processing..." : "Checkout"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Rating Modal */}
      {selectedMenuItem && tableNumber && (
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
