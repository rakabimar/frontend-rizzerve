"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Edit, LogOut, Plus, ShoppingBag, Trash2, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Fetch admin profile data
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch(`${API_URLS.AUTH_SERVICE_URL}${API_URLS.AUTH_PROFILE_API_URL}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (!response.ok) {
          // If unauthorized, redirect to login
          if (response.status === 401) {
            logout()
            return
          }
          throw new Error("Failed to fetch profile")
        }

        // Profile data is already in the user object from login/register
        setLoading(false)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      }
    }

    fetchAdminProfile()
  }, [user, router, logout, toast])

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
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-gray-600">Manage your restaurant operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="Total Orders"
            value="156"
            trend="+12% from last week"
            icon={<ShoppingBag className="h-5 w-5" />}
            color="bg-blue-100 text-blue-700"
          />
          <DashboardCard
            title="Total Revenue"
            value="$4,385.90"
            trend="+8% from last week"
            icon={<DollarSign className="h-5 w-5" />}
            color="bg-green-100 text-green-700"
          />
          <DashboardCard
            title="Active Tables"
            value="12/20"
            trend="60% occupancy"
            icon={<Users className="h-5 w-5" />}
            color="bg-purple-100 text-purple-700"
          />
          <DashboardCard
            title="Avg. Preparation Time"
            value="18 min"
            trend="-2 min from last week"
            icon={<Clock className="h-5 w-5" />}
            color="bg-orange-100 text-orange-700"
          />
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="tables">Table Management</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage and track customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Menu Items</CardTitle>
                  <CardDescription>Add, edit, or remove menu items</CardDescription>
                </div>
                <Button className="bg-rose-600 hover:bg-rose-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <MenuItemsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tables</CardTitle>
                  <CardDescription>Manage restaurant tables</CardDescription>
                </div>
                <Button className="bg-rose-600 hover:bg-rose-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Table
                </Button>
              </CardHeader>
              <CardContent>
                <TablesTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  trend,
  icon,
  color,
}: {
  title: string
  value: string
  trend: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersTable() {
  const orders = [
    {
      id: "ORD-1005",
      table: "8",
      items: 4,
      total: 56.97,
      status: "pending",
      time: "5 min ago",
    },
    {
      id: "ORD-1004",
      table: "12",
      items: 2,
      total: 28.5,
      status: "preparing",
      time: "15 min ago",
    },
    {
      id: "ORD-1003",
      table: "5",
      items: 3,
      total: 42.75,
      status: "ready",
      time: "25 min ago",
    },
    {
      id: "ORD-1002",
      table: "10",
      items: 5,
      total: 78.25,
      status: "delivered",
      time: "45 min ago",
    },
    {
      id: "ORD-1001",
      table: "3",
      items: 2,
      total: 32.99,
      status: "delivered",
      time: "1 hour ago",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "preparing":
        return <Badge className="bg-blue-100 text-blue-800">Preparing</Badge>
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case "delivered":
        return <Badge className="bg-gray-100 text-gray-800">Delivered</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search orders..." className="max-w-xs" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.table}</TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{order.time}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MenuItemsTable() {
  const menuItems = [
    {
      id: "1",
      name: "Spicy Tuna Roll",
      category: "Sushi",
      price: 12.99,
      available: true,
    },
    {
      id: "2",
      name: "California Roll",
      category: "Sushi",
      price: 10.99,
      available: true,
    },
    {
      id: "3",
      name: "Miso Soup",
      category: "Appetizers",
      price: 4.99,
      available: true,
    },
    {
      id: "4",
      name: "Edamame",
      category: "Appetizers",
      price: 5.99,
      available: true,
    },
    {
      id: "5",
      name: "Chicken Teriyaki",
      category: "Main",
      price: 16.99,
      available: false,
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search menu items..." className="max-w-xs" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>${item.price.toFixed(2)}</TableCell>
              <TableCell>
                {item.available ? (
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TablesTable() {
  const tables = [
    { id: "1", number: "1", status: "occupied", orders: 1 },
    { id: "2", number: "2", status: "available", orders: 0 },
    { id: "3", number: "3", status: "occupied", orders: 1 },
    { id: "4", number: "4", status: "available", orders: 0 },
    { id: "5", number: "5", status: "occupied", orders: 2 },
    { id: "6", number: "6", status: "available", orders: 0 },
    { id: "7", number: "7", status: "occupied", orders: 1 },
    { id: "8", number: "8", status: "available", orders: 0 },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search tables..." className="max-w-xs" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Table Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active Orders</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table) => (
            <TableRow key={table.id}>
              <TableCell className="font-medium">{table.id}</TableCell>
              <TableCell>{table.number}</TableCell>
              <TableCell>
                {table.status === "occupied" ? (
                  <Badge className="bg-red-100 text-red-800">Occupied</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                )}
              </TableCell>
              <TableCell>{table.orders}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
