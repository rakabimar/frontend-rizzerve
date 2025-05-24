export type TableStatus = "TERSEDIA" | "TERPAKAI" | string

export interface Table {
  id: string
  nomorMeja: number
  status: TableStatus
  activeOrderId?: string | null
  activeOrderStatus?: string | null
  activeOrderTotalPrice?: number | null
  activeOrderItemsJson?: string | null
}

export interface TableListResponse {
  status: string
  data: Table[]
}

export interface TableResponse {
  status: string
  meja: Table
}

export interface OrderItemSummary {
  menuItemId: string
  menuItemName: string
  quantity: number
  price: number
  subtotal: number
}

export interface TableWithOrderResponse {
  mejaId: string
  nomorMeja: number
  statusMeja: TableStatus
  currentOrder: {
    orderId: string
    orderStatus: string
    totalPrice: number
    items: OrderItemSummary[]
  } | null
}