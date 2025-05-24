"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
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
import type { MenuItem } from "@/types/menu"
import MenuItemDialog from "@/components/menu/menu-item-dialog"
import DeleteMenuItemDialog from "@/components/menu/delete-menu-item-dialog"
import type { Coupon } from "@/types/coupon"
import CouponDialog from "@/components/coupon/coupon-dialog"
import DeleteCouponDialog from "@/components/coupon/delete-coupon-dialog"

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

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="tables">Table Management</TabsTrigger>
            <TabsTrigger value="coupons">Coupon Management</TabsTrigger>
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
                <MenuItemsActions />
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

          <TabsContent value="coupons" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Coupons</CardTitle>
                  <CardDescription>Manage discount coupons and promotions</CardDescription>
                </div>
                <Button
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={() => window.dispatchEvent(new Event("open-add-coupon-dialog"))}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Coupon
                </Button>
              </CardHeader>
              <CardContent>
                <CouponsTable />
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

function MenuItemsActions() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>
      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          // This will be called after successful form submission
          // We'll handle refreshing the menu items list here
        }}
      />
    </>
  )
}

function MenuItemsTable() {
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>(undefined)

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      console.log("Fetching menu items from:", `${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}`)
      const response = await fetch(`${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(errorText || "Failed to fetch menu items")
      }

      const data = await response.json()
      console.log("Menu items fetched successfully:", data)
      setMenuItems(data)
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load menu items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const handleEdit = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem)
    setEditDialogOpen(true)
  }

  const handleDelete = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem)
    setDeleteDialogOpen(true)
  }

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search menu items..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading menu items...</div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No menu items found. Add your first menu item to get started.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No menu items match your search.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  {item.available ? (
                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.type === "FOOD" && item.isSpicy && <Badge className="bg-red-100 text-red-800">Spicy</Badge>}
                  {item.type === "DRINK" && item.isCold && <Badge className="bg-blue-100 text-blue-800">Cold</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      {selectedMenuItem && (
        <MenuItemDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          menuItem={selectedMenuItem}
          onSuccess={fetchMenuItems}
        />
      )}

      {/* Delete Dialog */}
      {selectedMenuItem && (
        <DeleteMenuItemDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          menuItem={selectedMenuItem}
          onSuccess={fetchMenuItems}
        />
      )}
    </div>
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

function CouponsTable() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(undefined)
  const initialFetchCompleted = useRef(false)

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      console.log("Fetching coupons from:", `${API_URLS.COUPON_SERVICE_URL}${API_URLS.COUPON_API_URL}`)
      const response = await fetch(`${API_URLS.COUPON_SERVICE_URL}${API_URLS.COUPON_API_URL}`, {
        headers: {
          Authorization: `Bearer ${user?.token ?? ""}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(errorText || "Failed to fetch coupons")
      }

      const data = await response.json()
      console.log("Coupons fetched successfully:", data)
      setCoupons(data)
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load coupons",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialFetchCompleted.current) {
      fetchCoupons()
      initialFetchCompleted.current = true
    }
  }, [])

  useEffect(() => {
    const openAdd = () => {
      setSelectedCoupon(undefined)
      setEditDialogOpen(true)
    }
    window.addEventListener("open-add-coupon-dialog", openAdd)
    return () => window.removeEventListener("open-add-coupon-dialog", openAdd)
  }, [])

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setEditDialogOpen(true)
  }

  const handleDelete = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setDeleteDialogOpen(true)
  }

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  const getStatusBadge = (coupon: Coupon) => {
    if (isExpired(coupon.expiredAt)) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>
    }
    if (coupon.usedCount >= coupon.quota) {
      return <Badge className="bg-orange-100 text-orange-800">Quota Reached</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search coupons..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No coupons found. Create your first coupon to get started.</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No coupons match your search.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min. Purchase</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.map((coupon) => (
              <TableRow key={coupon.code}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={coupon.type === "PERCENTAGE" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}
                  >
                    {coupon.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                </TableCell>
                <TableCell>${coupon.minimumPurchase.toFixed(2)}</TableCell>
                <TableCell>
                  {coupon.usedCount}/{coupon.quota}
                </TableCell>
                <TableCell>{formatDate(coupon.expiredAt)}</TableCell>
                <TableCell>{getStatusBadge(coupon)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit/Add Dialog */}
      <CouponDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        coupon={selectedCoupon}
        onSuccess={fetchCoupons}
      />

      {/* Delete Dialog */}
      {selectedCoupon && (
        <DeleteCouponDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          coupon={selectedCoupon}
          onSuccess={fetchCoupons}
        />
      )}
    </div>
  )
}
