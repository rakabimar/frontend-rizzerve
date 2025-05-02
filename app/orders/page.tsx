"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled"

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
}

type Order = {
  id: string
  tableNumber: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  date: string
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchOrders = async () => {
      setLoading(true)
      try {
        // In a real app, this would fetch from your API
        // Simulating API call with dummy data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const dummyOrders: Order[] = [
          {
            id: "ORD-1001",
            tableNumber: "12",
            items: [
              { id: "1", name: "Spicy Tuna Roll", quantity: 2, price: 12.99 },
              { id: "3", name: "Miso Soup", quantity: 1, price: 4.99 },
            ],
            status: "delivered",
            total: 30.97,
            date: "2023-05-15T14:30:00Z",
          },
          {
            id: "ORD-1002",
            tableNumber: "8",
            items: [
              { id: "5", name: "Chicken Teriyaki", quantity: 1, price: 16.99 },
              { id: "4", name: "Edamame", quantity: 1, price: 5.99 },
            ],
            status: "ready",
            total: 22.98,
            date: "2023-05-16T18:45:00Z",
          },
          {
            id: "ORD-1003",
            tableNumber: "15",
            items: [
              { id: "2", name: "California Roll", quantity: 3, price: 10.99 },
              { id: "7", name: "Green Tea Ice Cream", quantity: 2, price: 6.99 },
            ],
            status: "preparing",
            total: 46.95,
            date: "2023-05-17T12:15:00Z",
          },
        ]

        setOrders(dummyOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, router])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        <p>Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => router.push("/menu")}>
                Browse Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>View your order history and status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.tableNumber}</TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
