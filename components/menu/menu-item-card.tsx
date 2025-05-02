"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart, type MenuItem } from "@/context/cart-context"
import { Minus, Plus, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface MenuItemCardProps {
  item: MenuItem
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddToCart = () => {
    addToCart(item, quantity, notes)
    setQuantity(1)
    setNotes("")
    setIsDialogOpen(false)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="relative h-48 w-full">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover rounded-t-lg" />
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Unavailable</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          {item.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{item.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500">{item.description}</p>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-2">
        <span className="font-bold">${item.price.toFixed(2)}</span>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700" disabled={!item.available}>
              Add to Cart
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{item.name}</DialogTitle>
              <DialogDescription>{item.description}</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                <Button variant="outline" size="icon" onClick={decrementQuantity}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-medium text-lg">{quantity}</span>
                <Button variant="outline" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Special Instructions
                </label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or allergies?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={handleAddToCart}>
                Add to Cart - ${(item.price * quantity).toFixed(2)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
