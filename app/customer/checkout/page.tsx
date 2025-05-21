"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if table number is selected
    const tableNum = localStorage.getItem("tableNumber")
    if (!tableNum) {
      router.push("/customer/table-select")
      return
    }

    setTableNumber(tableNum)

    // Get cart items from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    } else {
      // If no cart items, redirect to menu
      router.push("/customer/dashboard")
      return
    }

    setLoading(false)
  }, [router])

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = totalPrice * 0.1
  const finalTotal = totalPrice + tax

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      // In a real app, this would submit the order to your API
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Clear cart
      localStorage.removeItem("cart")
      setOrderPlaced(true)

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
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
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
