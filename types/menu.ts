export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  available: boolean
  isSpicy?: boolean
  isCold?: boolean
  type: "FOOD" | "DRINK"
  createdAt?: string
  updatedAt?: string
}

export interface MenuItemRequest {
  name: string
  description: string
  price: number
  available: boolean
  isSpicy?: boolean
  isCold?: boolean
  image?: string
}
