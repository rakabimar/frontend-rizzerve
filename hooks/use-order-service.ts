import { useState } from 'react'
import { API_URLS } from '@/lib/constants'
import { Order, CreateOrderRequest, AddOrderItemRequest, OrderResponse } from '@/types/order'

export function useOrderService() {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a new order
  const createOrder = async (tableNumber: string): Promise<Order | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableNumber } as CreateOrderRequest),
      })

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`)
      }

      const orderResponse: OrderResponse = await response.json()
      const order: Order = {
        id: orderResponse.id,
        tableNumber: orderResponse.tableNumber,
        status: orderResponse.status,
        totalPrice: orderResponse.totalPrice,
        items: orderResponse.items.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      }

      setCurrentOrder(order)
      return order
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Add item to existing order
  const addItemToOrder = async (orderId: string, menuItemId: string, quantity: number): Promise<Order | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}/${orderId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItemId, quantity } as AddOrderItemRequest),
      })

      if (!response.ok) {
        throw new Error(`Failed to add item to order: ${response.statusText}`)
      }

      const orderResponse: OrderResponse = await response.json()
      const updatedOrder: Order = {
        id: orderResponse.id,
        tableNumber: orderResponse.tableNumber,
        status: orderResponse.status,
        totalPrice: orderResponse.totalPrice,
        items: orderResponse.items.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      }

      setCurrentOrder(updatedOrder)
      return updatedOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Get order by ID
  const getOrder = async (orderId: string): Promise<Order | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}/${orderId}`)

      if (!response.ok) {
        throw new Error(`Failed to get order: ${response.statusText}`)
      }

      const orderResponse: OrderResponse = await response.json()
      const order: Order = {
        id: orderResponse.id,
        tableNumber: orderResponse.tableNumber,
        status: orderResponse.status,
        totalPrice: orderResponse.totalPrice,
        items: orderResponse.items.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      }

      setCurrentOrder(order)
      return order
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update item quantity
  const updateItemQuantity = async (orderId: string, itemId: string, quantity: number): Promise<Order | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}/${orderId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update item quantity: ${response.statusText}`)
      }

      const orderResponse: OrderResponse = await response.json()
      const updatedOrder: Order = {
        id: orderResponse.id,
        tableNumber: orderResponse.tableNumber,
        status: orderResponse.status,
        totalPrice: orderResponse.totalPrice,
        items: orderResponse.items.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      }

      setCurrentOrder(updatedOrder)
      return updatedOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Remove item from order
  const removeItemFromOrder = async (orderId: string, itemId: string): Promise<Order | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}/${orderId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to remove item from order: ${response.statusText}`)
      }

      const orderResponse: OrderResponse = await response.json()
      const updatedOrder: Order = {
        id: orderResponse.id,
        tableNumber: orderResponse.tableNumber,
        status: orderResponse.status,
        totalPrice: orderResponse.totalPrice,
        items: orderResponse.items.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      }

      setCurrentOrder(updatedOrder)
      return updatedOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    currentOrder,
    isLoading,
    error,
    createOrder,
    addItemToOrder,
    getOrder,
    updateItemQuantity,
    removeItemFromOrder,
    setCurrentOrder,
  }
} 