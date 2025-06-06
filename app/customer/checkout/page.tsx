"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, Trash2, Edit, Tag } from "lucide-react"
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
  
  // Coupon state
  const [couponCode, setCouponCode] = useState<string>("")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null)
  const [loadingCoupon, setLoadingCoupon] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const orderService = useOrderService()

  const fetchCustomerRatings = async (items: any[], orderId: string) => {
    setLoadingRatings(true)
    try {
      console.log("Fetching ratings for order ID:", orderId)

      // Fetch all ratings for this order (using orderId as mejaId)
      const response = await fetch(`${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/meja/${orderId}`)

      if (response.ok) {
        const allOrderRatings = await response.json()
        console.log("All order ratings:", allOrderRatings)

        if (!Array.isArray(allOrderRatings)) {
          console.warn("Expected array of ratings, got:", typeof allOrderRatings)
          setCustomerRatings([])
          return
        }

        const ratings: CustomerRating[] = []

        // Process all ratings and fetch item names
        for (const rating of allOrderRatings) {
          if (!rating.itemId || !rating.ratingId) {
            console.warn("Invalid rating object:", rating)
            continue
          }

          let itemName = "Unknown Item"

          // First try to find item name from cart items
          const cartItem = items.find((item) => item.id === rating.itemId)
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
            value: rating.value || 0,
            canUpdate: rating.canUpdate !== false, // Default to true if not specified
          })
        }

        console.log("Processed customer ratings:", ratings)
        setCustomerRatings(ratings)
      } else if (response.status === 404) {
        console.log("No ratings found for this order")
        setCustomerRatings([])
      } else {
        console.error("Failed to fetch ratings:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error response:", errorText)
      }
    } catch (error) {
      console.error("Error fetching customer ratings:", error)
      toast({
        title: "Warning",
        description: "Could not load your previous ratings",
        variant: "destructive",
      })
    } finally {
      setLoadingRatings(false)
    }
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
      // Fetch customer ratings for these items using order ID
      if (orderId) {
        fetchCustomerRatings(items, orderId)
      }
    } else {
      // If no cart items, redirect to menu
      router.push("/customer/dashboard")
      return
    }

    setLoading(false)
  }, [router])

  const handleDeleteRating = async (ratingId: string, itemId: string) => {
    try {
      const response = await fetch(`${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/${ratingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the rating from local state
        setCustomerRatings((prev) => prev.filter((rating) => rating.ratingId !== ratingId))

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
    const cartItem = cartItems.find((item) => item.id === rating.itemId)
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
        type: cartItem.isSpicy !== undefined ? "FOOD" : "DRINK",
      }
      setSelectedMenuItem(menuItem)
      setRatingModalOpen(true)
    }
  }

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const finalPrice = discountedPrice !== null ? discountedPrice : totalPrice

  const handleRatingSubmitted = () => {
    // Rating submitted successfully, refresh ratings
    if (currentOrderId) {
      fetchCustomerRatings(cartItems, currentOrderId)
    }
    toast({
      title: "Rating submitted",
      description: "Thank you for your feedback!",
    })
  }

  const handleUseCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      })
      return
    }

    setLoadingCoupon(true)
    try {
      // Step 1: First validate the coupon exists
      const validateResponse = await fetch(`${API_URLS.COUPON_SERVICE_URL}/coupon/${couponCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!validateResponse.ok) {
        throw new Error("Invalid Coupon")
      }

      // Step 2: Get coupon details and validate business rules
      const couponData = await validateResponse.json()
      
      // Check if coupon is expired
      const expirationDate = new Date(couponData.expiredAt)
      const now = new Date()
      if (now > expirationDate) {
        throw new Error("Invalid Coupon")
      }

      // Check if coupon has quota available
      if (couponData.usedCount >= couponData.quota) {
        throw new Error("Invalid Coupon")
      }

      // Check minimum purchase requirement
      if (totalPrice < couponData.minimumPurchase) {
        throw new Error("Invalid Coupon")
      }

      // Step 3: If all validations pass, calculate the discount
      const calculateResponse = await fetch(`${API_URLS.COUPON_SERVICE_URL}/coupon/${couponCode}/calculate?total=${totalPrice}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (calculateResponse.ok) {
        const discountedTotal = await calculateResponse.json()
        setDiscountedPrice(discountedTotal)
        setAppliedCoupon(couponCode)
        
        const savings = totalPrice - discountedTotal
        toast({
          title: "Coupon applied!",
          description: `You saved $${savings.toFixed(2)} with coupon ${couponCode}`,
        })
      } else {
        throw new Error("Invalid Coupon")
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is not valid or cannot be applied to this order.",
        variant: "destructive",
      })
      
      // Reset coupon state on error
      setDiscountedPrice(null)
      setAppliedCoupon(null)
    } finally {
      setLoadingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode("")
    setAppliedCoupon(null)
    setDiscountedPrice(null)
    toast({
      title: "Coupon removed",
      description: "Coupon has been removed from your order",
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
      const realOrderId = currentOrderId

      // Remove duplicate order creation - order should already exist from table selection
      // Just check if we have a valid order ID
      if (currentOrderId.startsWith("temp-")) {
        toast({
          title: "Error",
          description: "Invalid order. Please start over by selecting a table.",
          variant: "destructive",
        })
        router.push("/customer/table-select")
        return
      }

      // Step 1: Add each cart item to the existing order
      for (const cartItem of cartItems) {
        await orderService.addItemToOrder(realOrderId, cartItem.id, cartItem.quantity)
      }

      // Step 2: Apply coupon if one was used (increment counter)
      let finalOrderTotal = totalPrice
      if (appliedCoupon) {
        try {
          const applyResponse = await fetch(`${API_URLS.COUPON_SERVICE_URL}/coupon/${appliedCoupon}/apply?total=${totalPrice}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (applyResponse.ok) {
            finalOrderTotal = await applyResponse.json()
            console.log(`Coupon ${appliedCoupon} applied successfully. Final total: $${finalOrderTotal}`)
          } else {
            console.warn("Failed to apply coupon during checkout, proceeding with original price")
            toast({
              title: "Coupon Warning",
              description: "Coupon could not be applied during checkout, but your order will proceed at the original price.",
              variant: "destructive",
            })
          }
        } catch (couponError) {
          console.error("Error applying coupon during checkout:", couponError)
          toast({
            title: "Coupon Warning", 
            description: "Coupon service is unavailable, but your order will proceed at the original price.",
            variant: "destructive",
          })
        }
      }

      // Step 3: Confirm the order (changes status to PROCESSING)
      await orderService.confirmOrder(realOrderId)

      // Step 4: Checkout the meja in rating service to disable further rating updates
      try {
        const checkoutResponse = await fetch(`${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/meja/${realOrderId}/checkout`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (checkoutResponse.ok) {
          console.log("Successfully checked out meja in rating service")
        } else {
          console.warn("Failed to checkout meja in rating service:", checkoutResponse.status)
          // Don't fail the entire checkout process if rating service checkout fails
        }
      } catch (ratingError) {
        console.error("Error calling rating service checkout:", ratingError)
        // Don't fail the entire checkout process if rating service is unavailable
      }

      // Clear cart and order ID, set order completed
      localStorage.removeItem("cart")
      localStorage.removeItem("currentOrderId")
      setOrderNumber(realOrderId.substring(0, 8).toUpperCase())
      setOrderCompleted(true)

      toast({
        title: "Order confirmed successfully",
        description: appliedCoupon 
          ? `Your order is being prepared. Final total: $${finalOrderTotal.toFixed(2)} (coupon applied)`
          : "Your order is being prepared in the kitchen",
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
              Your order is being prepared in the kitchen and will be served shortly.
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
              <CardDescription>
                {loadingRatings ? "Loading your ratings..." : "Your ratings for ordered items"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRatings ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading your ratings...</p>
                </div>
              ) : customerRatings.length > 0 ? (
                <div className="space-y-4">
                  {customerRatings.map((rating) => (
                    <div
                      key={rating.ratingId}
                      className="flex justify-between items-center border-b pb-4 last:border-b-0"
                    >
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

          {/* Coupon Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Apply Coupon
              </CardTitle>
              <CardDescription>
                Enter a coupon code to get a discount on your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appliedCoupon ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Coupon Applied: {appliedCoupon}</p>
                      <p className="text-sm text-green-600">
                        You saved ${(totalPrice - finalPrice).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={loadingCoupon}
                  />
                  <Button
                    onClick={handleUseCoupon}
                    disabled={loadingCoupon || !couponCode.trim()}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {loadingCoupon ? "Validating..." : "Use Coupon"}
                  </Button>
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
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-${(totalPrice - finalPrice).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                  </>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className={appliedCoupon ? "text-green-600" : ""}>
                    ${finalPrice.toFixed(2)}
                  </span>
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
