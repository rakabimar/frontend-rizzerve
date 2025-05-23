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
import { Clock, DollarSign, Edit, Eye, LogOut, Plus, ShoppingBag, Trash2, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import type { MenuItem } from "@/types/menu"
import MenuItemDialog from "@/components/menu/menu-item-dialog"
import DeleteMenuItemDialog from "@/components/menu/delete-menu-item-dialog"
import type { Table as RzTable, TableListResponse } from "@/types/table"
import TableDialog from "@/components/table/table-dialog"
import DeleteTableDialog from "@/components/table/delete-table-dialog"
import TableOrderDialog from "@/components/table/table-order-dialog"

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Add state for refreshing menu items
  const [menuRefreshTrigger, setMenuRefreshTrigger] = useState(0)

  // Function to trigger menu refresh
  const refreshMenuItems = () => {
    setMenuRefreshTrigger((prev) => prev + 1)
  }

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

  useEffect(() => {
    if (user) {
      refreshTableStats()
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const occupancy = tableStats.total ? Math.round((tableStats.active / tableStats.total) * 100) : 0

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
            value={`${tableStats.active}/${tableStats.total}`}
            trend={`${occupancy}% occupancy`}
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
                <MenuItemsActions onSuccess={refreshMenuItems} />
              </CardHeader>
              <CardContent>
                <MenuItemsTable refreshTrigger={menuRefreshTrigger} />
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
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => window.dispatchEvent(new Event("open-add-table-dialog"))}>
                  <Plus className="mr-2 h-4 w-4" /> Add Table
                </Button>
              </CardHeader>
              <CardContent>
                <TablesTable onTableChange={refreshTableStats} />
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
    // Skip the initial mount since we already fetched above
    if (!initialFetchCompleted.current) {
      fetchMenuItems()
      initialFetchCompleted.current = true
    }
  }, [])

  // Fetch when refresh trigger changes
  useEffect(() => {
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

function TablesTable({ onTableChange }: { onTableChange?: () => void }) {
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
      if (onTableChange) onTableChange()
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load tables", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialFetchCompleted.current) {
      fetchTables()
      initialFetchCompleted.current = true
    }
  }, [])

  useEffect(() => {
    const openAdd = () => {
      setSelectedTable(null)
      setEditOpen(true)
    }
    window.addEventListener("open-add-table-dialog", openAdd)
    return () => window.removeEventListener("open-add-table-dialog", openAdd)
  }, [])

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