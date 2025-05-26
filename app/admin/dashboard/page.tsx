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
import { Clock, DollarSign, Edit, LogOut, Plus, ShoppingBag, Trash2, Users, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import type { MenuItem } from "@/types/menu"
import MenuItemDialog from "@/components/menu/menu-item-dialog"
import DeleteMenuItemDialog from "@/components/menu/delete-menu-item-dialog"
import type { Coupon } from "@/types/coupon"
import CouponDialog from "@/components/coupon/coupon-dialog"
import DeleteCouponDialog from "@/components/coupon/delete-coupon-dialog"
import type { Table as RzTable, TableListResponse } from "@/types/table"
import TableDialog from "@/components/table/table-dialog"
import DeleteTableDialog from "@/components/table/delete-table-dialog"
import TableOrderDialog from "@/components/table/table-order-dialog"

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Add state for refreshing tables
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0)

  const [tableStats, setTableStats] = useState<{ active: number; total: number }>({ active: 0, total: 0 })

  const refreshTableStats = async () => {
    try {
      const response = await fetch(`${API_URLS.TABLE_SERVICE_URL}${API_URLS.TABLE_API_URL}`, {
        headers: { Authorization: `Bearer ${user?.token ?? ""}` },
      })
      if (!response.ok) return
      const data: TableListResponse = await response.json()
      const totalTables = data.data.length
      const activeTables = data.data.filter((t) => t.status === "TERPAKAI").length
      setTableStats({ active: activeTables, total: totalTables })
    } catch (_) {
      setTableStats({ active: 0, total: 0 })
    }
  }

  // Function to trigger table refresh
  const refreshTables = () => {
    setTableRefreshTrigger((prev) => prev + 1)
    refreshTableStats()
  }

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
                <MenuItemsActions onSuccess={refreshTables} />
              </CardHeader>
              <CardContent>
                <MenuItemsTable refreshTrigger={0} />
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
                <TableActions onSuccess={refreshTables} />
              </CardHeader>
              <CardContent>
                <TablesTable refreshTrigger={tableRefreshTrigger} onTableChange={refreshTableStats} />
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

function MenuItemsActions({ onSuccess }: { onSuccess: () => void }) {
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
          onSuccess() // Call the refresh function
          setDialogOpen(false)
        }}
      />
    </>
  )
}

function MenuItemsTable({ refreshTrigger }: { refreshTrigger: number }) {
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>(undefined)

  // Use a ref to avoid double fetching on initial mount
  const initialFetchCompleted = useRef(false)

  // Define fetchMenuItems outside of useEffect
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

  // Initial fetch on mount
  useEffect(() => {
    if (!initialFetchCompleted.current) {
      fetchMenuItems()
      initialFetchCompleted.current = true
    }
  }, [])

  // Fetch when refresh trigger changes
  useEffect(() => {
    // Skip the initial mount since we already fetched above
    if (initialFetchCompleted.current && refreshTrigger > 0) {
      fetchMenuItems()
    }
  }, [refreshTrigger])

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

  // Helper function to determine menu item type
  const getMenuItemType = (item: MenuItem): string => {
    if ('isSpicy' in item) return "FOOD";
    if ('isCold' in item) return "DRINK";
    return "UNKNOWN";
  }

  // Helper function to get appropriate badge for the menu type
  const getMenuTypeBadge = (item: MenuItem) => {
    const type = getMenuItemType(item);
    
    return (
      <Badge 
        variant="outline" 
        className={type === "FOOD" 
          ? "bg-amber-50 text-amber-700 border-amber-200" 
          : type === "DRINK" 
            ? "bg-blue-50 text-blue-700 border-blue-200" 
            : "bg-gray-50 text-gray-700 border-gray-200"
        }
      >
        {type}
      </Badge>
    );
  };

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
                  {getMenuTypeBadge(item)}
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
                  {'isSpicy' in item && item.isSpicy && <Badge className="bg-red-100 text-red-800">Spicy</Badge>}
                  {'isCold' in item && item.isCold && <Badge className="bg-blue-100 text-blue-800">Cold</Badge>}
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
  const { toast } = useToast()
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      console.log("Fetching orders from:", `${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}`)
      const response = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}`, {
        headers: {
          Authorization: `Bearer ${user?.token ?? ""}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      console.log("Orders fetched successfully:", data)
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCompleteOrder = async (orderId: string) => {
    try {
      console.log("Completing order:", orderId)
      
      // First, get the order details to find the table number
      const orderResponse = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}/${orderId}`, {
        headers: {
          Authorization: `Bearer ${user?.token ?? ""}`,
        },
      })
      
      if (!orderResponse.ok) {
        throw new Error("Failed to get order details")
      }
      
      const order = await orderResponse.json()
      
      // Only allow completing orders that are in PROCESSING status
      if (order.status === "PROCESSING") {
        // Use the complete endpoint
        const completeResponse = await fetch(`${API_URLS.ORDER_SERVICE_URL}${API_URLS.ORDER_API_URL}/${orderId}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token ?? ""}`,
          },
        })

        if (!completeResponse.ok) {
          const errorText = await completeResponse.text()
          throw new Error(errorText || "Failed to complete order")
        }
        
        // Table will be released automatically by the order service via RabbitMQ

        toast({
          title: "Order completed",
          description: `Order ${orderId.substring(0, 8).toUpperCase()} has been marked as completed`,
        })

        // Refresh orders list
        fetchOrders()
      } else {
        toast({
          title: "Cannot complete order",
          description: `Order ${orderId.substring(0, 8).toUpperCase()} is in ${order.status} status. Only PROCESSING orders can be completed.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error completing order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NEW":
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>
      case "PROCESSING":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-4">Loading orders...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input 
          placeholder="Search orders..." 
          className="max-w-xs" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={fetchOrders} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.substring(0, 8).toUpperCase()}</TableCell>
              <TableCell>{order.tableNumber}</TableCell>
              <TableCell>{order.items?.length || 0}</TableCell>
              <TableCell>${order.totalPrice?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{order.createdAt ? formatDateTime(order.createdAt) : 'N/A'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {order.status?.toUpperCase() === "PROCESSING" && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleCompleteOrder(order.id)}
                    >
                      Complete
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orders found
        </div>
      )}
    </div>
  )
}

function TablesTable({ refreshTrigger, onTableChange }: { refreshTrigger: number; onTableChange: () => void }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [tables, setTables] = useState<RzTable[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<RzTable | null>(null)
  const initialFetchCompleted = useRef(false)

  const fetchTables = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URLS.TABLE_SERVICE_URL}${API_URLS.TABLE_API_URL}`, {
        headers: { Authorization: `Bearer ${user?.token ?? ""}` },
      })
      if (!response.ok) throw new Error(await response.text())
      const data: TableListResponse = await response.json()
      setTables(data.data)
      onTableChange() // Update table stats
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load tables", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    if (!initialFetchCompleted.current) {
      fetchTables()
      initialFetchCompleted.current = true
    }
  }, [])

  // Fetch when refresh trigger changes
  useEffect(() => {
    if (initialFetchCompleted.current && refreshTrigger > 0) {
      fetchTables()
    }
  }, [refreshTrigger])

  const filteredTables = tables
    .filter(
      (table) =>
        table.nomorMeja.toString().includes(searchTerm) ||
        table.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => a.nomorMeja - b.nomorMeja)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search tables..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={fetchTables} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading tables...</div>
      ) : tables.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tables found. Add your first table to get started.</p>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tables match your search.</p>
        </div>
      ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Table Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {filteredTables.map((table) => (
            <TableRow key={table.id}>
              <TableCell className="font-medium">{table.id}</TableCell>
                <TableCell>{table.nomorMeja}</TableCell>
              <TableCell>
                  {table.status === "TERPAKAI" ? (
                  <Badge className="bg-red-100 text-red-800">Occupied</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedTable(table); setOrderOpen(true) }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedTable(table); setEditOpen(true) }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedTable(table); setDeleteOpen(true) }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}

      <TableDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        table={selectedTable ?? undefined}
        onSuccess={fetchTables}
      />

      {selectedTable && (
        <>
          <DeleteTableDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            table={selectedTable}
            onSuccess={fetchTables}
          />
          <TableOrderDialog
            open={orderOpen}
            onOpenChange={setOrderOpen}
            tableId={selectedTable.id}
          />
        </>
      )}
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

function TableActions({ onSuccess }: { onSuccess: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button 
        className="bg-rose-600 hover:bg-rose-700" 
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Table
      </Button>
      <TableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        table={undefined} // undefined for new table
        onSuccess={() => {
          onSuccess() // Call the refresh function
          setDialogOpen(false)
        }}
      />
    </>
  )
}
