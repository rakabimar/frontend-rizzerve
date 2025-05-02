"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CartPage() {
  const { cartItems, tableNumber, removeFromCart, updateQuantity, clearCart, setTableNumber, totalPrice } = useCart()
  const [tableInput, setTableInput] = useState(tableNumber || "")
  const router = useRouter()

  const handleTableSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tableInput.trim()) {
      setTableNumber(tableInput.trim())
    }
  }

  const handleCheckout = () => {
    if (!tableNumber) {
      alert("Please enter a table number before proceeding to checkout")
      return
    }

    router.push("/checkout")
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/menu">
            <Button className="bg-rose-600 hover:bg-rose-700">Browse Menu</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex border-b pb-4">
                    <div className="relative h-20 w-20 rounded overflow-hidden">
                      <Image
                        src={item.menuItem.image || "/placeholder.svg"}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.menuItem.name}</h3>
                        <span className="font-medium">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">${item.menuItem.price.toFixed(2)} each</p>

                      {item.notes && <p className="text-sm text-gray-600 mb-2">Note: {item.notes}</p>}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Clear Cart</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items from your cart. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearCart} className="bg-red-500 hover:bg-red-600">
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Link href="/menu">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!tableNumber ? (
                <form onSubmit={handleTableSubmit} className="space-y-2">
                  <label htmlFor="table-number" className="text-sm font-medium">
                    Table Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="table-number"
                      placeholder="Enter table number"
                      value={tableInput}
                      onChange={(e) => setTableInput(e.target.value)}
                      required
                    />
                    <Button type="submit">Set</Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Table Number:</span>
                  <div className="flex items-center gap-2">
                    <span>{tableNumber}</span>
                    <Button variant="ghost" size="sm" onClick={() => setTableNumber("")} className="h-6 text-xs">
                      Change
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total</span>
                  <span>${(totalPrice * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={handleCheckout} disabled={!tableNumber}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
