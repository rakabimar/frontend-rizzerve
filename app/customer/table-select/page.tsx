"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function TableSelectPage() {
  const [tables, setTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Fetch available tables
    const fetchTables = async () => {
      try {
        // In a real app, this would fetch from your API
        // Simulating API call with dummy data
        await new Promise((resolve) => setTimeout(resolve, 500))

        const dummyTables = [
          { id: "1", number: "1", status: "occupied" },
          { id: "2", number: "2", status: "available" },
          { id: "3", number: "3", status: "occupied" },
          { id: "4", number: "4", status: "available" },
          { id: "5", number: "5", status: "occupied" },
          { id: "6", number: "6", status: "available" },
          { id: "7", number: "7", status: "occupied" },
          { id: "8", number: "8", status: "available" },
          { id: "9", number: "9", status: "available" },
          { id: "10", number: "10", status: "available" },
          { id: "11", number: "11", status: "available" },
          { id: "12", number: "12", status: "available" },
        ]

        setTables(dummyTables)
      } catch (error) {
        console.error("Error fetching tables:", error)
        toast({
          title: "Error",
          description: "Could not load available tables",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [toast])

  const handleTableSelect = (tableNumber: string) => {
    setSelectedTable(tableNumber)
  }

  const handleContinue = () => {
    if (selectedTable) {
      // Save selected table to localStorage
      localStorage.setItem("tableNumber", selectedTable)
      router.push("/customer/dashboard")
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
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Select a Table</h2>
          <p className="text-gray-600">Choose an available table to start your order</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Tables</CardTitle>
            <CardDescription>Green tables are available for ordering</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading tables...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map((table) => (
                  <Button
                    key={table.id}
                    variant={table.status === "available" ? "outline" : "ghost"}
                    className={`h-24 w-full ${
                      table.status === "available"
                        ? selectedTable === table.number
                          ? "border-2 border-rose-600 bg-rose-50"
                          : "border border-green-500 bg-green-50 hover:bg-green-100"
                        : "bg-red-50 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={table.status !== "available"}
                    onClick={() => handleTableSelect(table.number)}
                  >
                    <div className="text-center">
                      <div className="text-xl font-bold">Table</div>
                      <div className="text-2xl">{table.number}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-rose-600 hover:bg-rose-700" disabled={!selectedTable} onClick={handleContinue}>
              Continue to Menu
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
