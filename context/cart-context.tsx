"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
  rating?: number
}

export type CartItem = {
  id: string
  menuItem: MenuItem
  quantity: number
  notes?: string
}

type CartContextType = {
  cartItems: CartItem[]
  tableNumber: string | null
  addToCart: (menuItem: MenuItem, quantity: number, notes?: string) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setTableNumber: (tableNumber: string) => void
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableNumber, setTableNum] = useState<string | null>(null)
  const { toast } = useToast()

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => total + item.menuItem.price * item.quantity, 0)

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    const storedTable = localStorage.getItem("tableNumber")

    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }

    if (storedTable) {
      setTableNum(storedTable)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  // Save table number to localStorage whenever it changes
  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem("tableNumber", tableNumber)
    } else {
      localStorage.removeItem("tableNumber")
    }
  }, [tableNumber])

  const addToCart = (menuItem: MenuItem, quantity: number, notes?: string) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.menuItem.id === menuItem.id)

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        updatedItems[existingItemIndex].notes = notes || updatedItems[existingItemIndex].notes

        toast({
          title: "Cart updated",
          description: `Updated ${menuItem.name} quantity in your cart`,
        })

        return updatedItems
      } else {
        // Add new item if it doesn't exist
        toast({
          title: "Added to cart",
          description: `${quantity} x ${menuItem.name} added to your cart`,
        })

        return [...prevItems, { id: menuItem.id, menuItem, quantity, notes }]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)

      if (itemToRemove) {
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.menuItem.name} removed from your cart`,
        })
      }

      return prevItems.filter((item) => item.id !== id)
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    })
  }

  const setTableNumber = (number: string) => {
    setTableNum(number)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        tableNumber,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setTableNumber,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
