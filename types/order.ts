import { OrderStatus } from "@/lib/constants"

export interface Order {
  id: string
  tableNumber: string
  status: OrderStatus
  totalPrice: number
  items: OrderItem[]
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  id: string
  menuItemId: string
  menuItemName: string
  price: number
  quantity: number
  subtotal: number
}

// Request DTOs matching backend
export interface CreateOrderRequest {
  tableNumber: string
}

export interface AddOrderItemRequest {
  menuItemId: string
  quantity: number
}

export interface UpdateQuantityRequest {
  quantity: number
}

// Response DTOs matching backend
export interface OrderResponse {
  id: string
  tableNumber: string
  status: OrderStatus
  totalPrice: number
  items: OrderItemResponse[]
}

export interface OrderItemResponse {
  id: string
  menuItemId: string
  menuItemName: string
  price: number
  quantity: number
  subtotal: number
} 