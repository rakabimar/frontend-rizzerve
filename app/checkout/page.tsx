"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

export default function CheckoutPage() {
  const { cartItems, tableNumber, totalPrice, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Calculate totals
  const subtotal = totalPrice
  const tax = subtotal * 0.1
  const discountAmount = couponApplied ? subtotal * (discount / 100) : 0
  const finalTotal = subtotal + tax - discountAmount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setLoading(true)
    try {
      // In a real app, this would validate the coupon with your API
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate a valid coupon with 10% discount
      if (couponCode.toLowerCase() === "welcome10") {
        setCouponApplied(true)
        setDiscount(10)
        toast({
          title: "Coupon applied",
          description: "10% discount has been applied to your order",
        })
      } else {
        toast({
          title: "Invalid coupon",
          description: "The coupon code you entered is invalid or expired",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      toast({
        title: "Error",
        description: "Could not apply coupon. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!tableNumber || cartItems.length === 0) return

    setLoading(true)
    try {
      // In a real app, this would submit the order to your API
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setOrderPlaced(true)
      clearCart()

      toast({
        title: "Order placed successfully",
        description: "Your order has been sent to the kitchen",
      })
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "Could not place your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>Your order has been placed successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="font-medium">Order Number</p>
              <p className="text-2xl font-bold">{Math.floor(Math.random() * 10000)}</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Table Number</p>
              <p className="text-xl">{tableNumber}</p>
            </div>
            <p className="text-center text-gray-500">
              Your order has been sent to the kitchen and will be served shortly.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => router.push("/menu")}>
              Order More Items
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (cartItems.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/cart" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Table #{tableNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="relative h-16 w-16 rounded overflow-hidden">
                      <Image
                        src={item.menuItem.image || "/placeholder.svg"}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.menuItem.name}</h3>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-medium">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Complete your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="coupon" className="text-sm font-medium">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied || loading}
                  />
                  <Button onClick={handleApplyCoupon} disabled={!couponCode || couponApplied || loading}>
                    Apply
                  </Button>
                </div>
                {couponApplied && <p className="text-sm text-green-600">Coupon applied: {discount}% off</p>}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  This is a demo application. No actual payment will be processed.
                </p>
                <p className="text-sm text-gray-600">In a real application, payment options would be displayed here.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Processing..." : "Place Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
