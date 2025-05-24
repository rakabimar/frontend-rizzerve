"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useOrderService } from "@/hooks/use-order-service"
import { Order } from "@/types/order"

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
  currentOrder: Order | null
  addToCart: (menuItem: MenuItem, quantity: number, notes?: string) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setTableNumber: (tableNumber: string) => void
  totalPrice: number
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableNumber, setTableNum] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Backend integration
  const orderService = useOrderService()

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => total + item.menuItem.price * item.quantity, 0)

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    const storedTable = localStorage.getItem("tableNumber")
    const storedOrderId = localStorage.getItem("currentOrderId")

    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }

    if (storedTable) {
      setTableNum(storedTable)
    }

    // Try to restore order from backend
    if (storedOrderId) {
      orderService.getOrder(storedOrderId)
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

  // Save current order ID to localStorage
  useEffect(() => {
    if (orderService.currentOrder?.id) {
      localStorage.setItem("currentOrderId", orderService.currentOrder.id)
    } else {
      localStorage.removeItem("currentOrderId")
    }
  }, [orderService.currentOrder])

  const addToCart = async (menuItem: MenuItem, quantity: number, notes?: string) => {
    // First, update the local cart for immediate UI feedback
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.menuItem.id === menuItem.id)

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        updatedItems[existingItemIndex].notes = notes || updatedItems[existingItemIndex].notes
        return updatedItems
      } else {
        return [...prevItems, { id: menuItem.id, menuItem, quantity, notes }]
      }
    })

    // Then sync with backend
    try {
      if (!orderService.currentOrder && tableNumber) {
        // Create order first if it doesn't exist
        await orderService.createOrder(tableNumber)
      }

      if (orderService.currentOrder) {
        // Add item to backend order
        await orderService.addItemToOrder(orderService.currentOrder.id, menuItem.id, quantity)
        
        toast({
          title: "Added to order",
          description: `${quantity} x ${menuItem.name} added to your order`,
        })
      }
    } catch (error) {
      // If backend fails, show error but keep local cart
      toast({
        title: "Warning",
        description: "Item added locally, but failed to sync with server",
        variant: "destructive",
      })
    }
  }

  const removeFromCart = async (id: string) => {
    const itemToRemove = cartItems.find((item) => item.id === id)
    
    // Update local cart immediately
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))

    if (itemToRemove) {
      toast({
        title: "Removed from cart",
        description: `${itemToRemove.menuItem.name} removed from your cart`,
      })

      // Try to remove from backend order
      if (orderService.currentOrder) {
        try {
          const backendItem = orderService.currentOrder.items.find(item => item.menuItemId === id)
          if (backendItem) {
            await orderService.removeItemFromOrder(orderService.currentOrder.id, backendItem.id)
          }
        } catch (error) {
          toast({
            title: "Warning", 
            description: "Item removed locally, but failed to sync with server",
            variant: "destructive",
          })
        }
      }
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    // Update local cart immediately
    setCartItems((prevItems) => 
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    )

    // Try to update backend order
    if (orderService.currentOrder) {
      try {
        const backendItem = orderService.currentOrder.items.find(item => item.menuItemId === id)
        if (backendItem) {
          await orderService.updateItemQuantity(orderService.currentOrder.id, backendItem.id, quantity)
        }
      } catch (error) {
        toast({
          title: "Warning",
          description: "Quantity updated locally, but failed to sync with server", 
          variant: "destructive",
        })
      }
    }
  }

  const clearCart = () => {
    setCartItems([])
    // Note: We keep the backend order intact as clearing cart is just a UI action
    // The actual order will be handled by checkout service
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    })
  }

  const setTableNumber = async (number: string) => {
    setTableNum(number)
    
    // Create order when table is selected
    if (number && !orderService.currentOrder) {
      try {
        await orderService.createOrder(number)
        toast({
          title: "Order created",
          description: `Order created for table ${number}`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create order on server",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        tableNumber,
        currentOrder: orderService.currentOrder,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setTableNumber,
        totalPrice,
        isLoading: orderService.isLoading,
        error: orderService.error,
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
