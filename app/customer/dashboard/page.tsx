"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ShoppingCart } from "lucide-react"
import Image from "next/image"

export default function CustomerDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [tableNumber, setTableNumber] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Check if table number is selected
    const tableNum = localStorage.getItem("tableNumber")
    if (!tableNum) {
      router.push("/customer/table-select")
      return
    }

    setTableNumber(tableNum)

    // Load menu items
    const dummyMenuItems = [
      {
        id: "1",
        name: "Spicy Tuna Roll",
        description: "Fresh tuna with spicy mayo and cucumber",
        price: 12.99,
        category: "sushi",
        image: "/placeholder.svg?height=200&width=300",
        available: true,
      },
      {
        id: "2",
        name: "California Roll",
        description: "Crab, avocado, and cucumber",
        price: 10.99,
        category: "sushi",
        image: "/placeholder.svg?height=200&width=300",
        available: true,
      },
      {
        id: "3",
        name: "Miso Soup",
        description: "Traditional Japanese soup with tofu and seaweed",
        price: 4.99,
        category: "appetizers",
        image: "/placeholder.svg?height=200&width=300",
        available: true,
      },
      {
        id: "4",
        name: "Edamame",
        description: "Steamed soybeans with sea salt",
        price: 5.99,
        category: "appetizers",
        image: "/placeholder.svg?height=200&width=300",
        available: true,
      },
      {
        id: "5",
        name: "Chicken Teriyaki",
        description: "Grilled chicken with teriyaki sauce and steamed rice",
        price: 16.99,
        category: "main",
        image: "/placeholder.svg?height=200&width=300",
        available: true,
      },
      {
        id: "6",
        name: "Salmon Nigiri",
        description: "Fresh salmon over pressed vinegar rice",
        price: 8.99,
        category: "sushi",
        image: "/placeholder.svg?height=200&width=300",
        available: true,
      },
    ]

    setMenuItems(dummyMenuItems)
    setLoading(false)
  }, [router])

  const addToCart = (item: any) => {
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

  // Add checkout button and cart storage
  const placeOrder = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty")
      return
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems))
    router.push("/customer/checkout")
  }

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menu..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => addToCart(item)}>
                      <Plus className="mr-2 h-4 w-4" /> Add to Order
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

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
                <div className="space-y-2">
                  <label htmlFor="table-number" className="text-sm font-medium">
                    Table Number
                  </label>
                  <Input
                    id="table-number"
                    placeholder="Enter table number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    disabled
                  />
                </div>

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
                  disabled={cartItems.length === 0 || !tableNumber}
                  onClick={placeOrder}
                >
                  Place Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
