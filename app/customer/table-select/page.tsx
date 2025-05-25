"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import { useOrderService } from "@/hooks/use-order-service"

interface MejaCustomer {
  nomorMeja: number
  statusMeja: "TERSEDIA" | "TERPAKAI" | string
}

interface GetAllMejaCustomerResponse {
  message: string
  data: MejaCustomer[]
}

export default function TableSelectPage() {
  const [tables, setTables] = useState<MejaCustomer[]>([])
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const orderService = useOrderService()

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch(
          `${API_URLS.TABLE_SERVICE_URL}${API_URLS.TABLE_API_URL}/customer/all`,
          { cache: "no-store" },
        )
        if (!res.ok) throw new Error(await res.text())

        const json: GetAllMejaCustomerResponse = await res.json()
        setTables(json.data)
      } catch (e) {
        toast({
          title: "Error",
          description:
            e instanceof Error ? e.message : "Could not load tables",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [toast])

  const handleTableSelect = (no: number) => setSelectedTable(no)

  const handleContinue = async () => {
    if (selectedTable && !creating) {
      setCreating(true)
      
      try {
        // Create order in database first
        const order = await orderService.createOrder(String(selectedTable))
        
        if (order) {
          // Store both table number and order ID
          localStorage.setItem("tableNumber", String(selectedTable))
          localStorage.setItem("currentOrderId", order.id)
          
          toast({
            title: "Order created",
            description: `Order created for table ${selectedTable}. You can now browse the menu.`,
          })
          
          router.push("/customer/dashboard")
        } else {
          throw new Error("Failed to create order")
        }
      } catch (error) {
        console.error("Error creating order:", error)
        toast({
          title: "Error",
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        })
      } finally {
        setCreating(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-rose-600">RIZZerve</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Select a Table</h2>
          <p className="text-gray-600">
            Choose an available table to start your order
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Tables</CardTitle>
            <CardDescription>
              Green tables are available for ordering
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading tables...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables
                  .sort((a, b) => a.nomorMeja - b.nomorMeja)
                  .map((t) => (
                    <Button
                      key={t.nomorMeja}
                      variant={t.statusMeja === "TERSEDIA" ? "outline" : "ghost"}
                      className={`h-24 w-full ${
                        t.statusMeja === "TERSEDIA"
                          ? selectedTable === t.nomorMeja
                            ? "border-2 border-rose-600 bg-rose-50"
                            : "border border-green-500 bg-green-50 hover:bg-green-100"
                          : "bg-red-50 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={t.statusMeja !== "TERSEDIA"}
                      onClick={() => handleTableSelect(t.nomorMeja)}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">Table</div>
                        <div className="text-2xl">{t.nomorMeja}</div>
                      </div>
                    </Button>
                  ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={!selectedTable || creating}
              onClick={handleContinue}
            >
              {creating ? "Creating Order..." : "Continue to Menu"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}