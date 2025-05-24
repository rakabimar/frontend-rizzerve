"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import RatingStars from "./rating-stars"
import { API_URLS } from "@/lib/constants"
import type { MenuItem } from "@/types/menu"

interface RatingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItem
  tableNumber: string
  onRatingSubmitted?: () => void
}

export default function RatingModal({
  open,
  onOpenChange,
  menuItem,
  tableNumber,
  onRatingSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingRating, setExistingRating] = useState<any>(null)
  const { toast } = useToast()

  // Generate a table ID based on table number (you might want to fetch this from a table service)
  const generateTableId = (tableNum: string) => {
    // For now, we'll generate a consistent UUID based on table number
    // In a real app, you'd fetch the actual table ID from your table service
    return `204a1dff-a4c7-48e3-abcd-61f6342acc55`
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must select at least 1 star to submit a rating",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let ratingData: any
      let url: string
      let method: string

      if (existingRating) {
        // UPDATE existing rating - include ratingId in request body
        ratingData = {
          ratingId: existingRating.ratingId,
          itemId: menuItem.id,
          mejaId: generateTableId(tableNumber),
          value: rating,
          canUpdate: true,
        }
        url = `${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}/${existingRating.ratingId}`
        method = "PUT"
      } else {
        // CREATE new rating - do NOT include ratingId in request body
        ratingData = {
          itemId: menuItem.id,
          mejaId: generateTableId(tableNumber),
          value: rating,
          canUpdate: true,
        }
        url = `${API_URLS.RATING_SERVICE_URL}${API_URLS.RATING_API_URL}`
        method = "POST"
      }

      console.log("Rating submission details:", {
        url,
        method,
        body: ratingData,
        isUpdate: !!existingRating,
      })

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Rating submission failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
        })
        throw new Error(errorText || "Failed to submit rating")
      }

      const responseData = await response.json()
      console.log("Rating submitted successfully:", responseData)

      toast({
        title: existingRating ? "Rating updated" : "Rating submitted",
        description: `Thank you for rating ${menuItem.name}!`,
      })

      onOpenChange(false)
      setRating(0)

      if (onRatingSubmitted) {
        onRatingSubmitted()
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit rating",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {menuItem.name}</DialogTitle>
          <DialogDescription>
            How would you rate this item? Your feedback helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="text-center">
            <h3 className="font-medium text-lg mb-2">{menuItem.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{menuItem.description}</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm font-medium">Your Rating</p>
            <RatingStars rating={rating} size="lg" onRatingChange={setRating} />
            <p className="text-xs text-gray-500">
              {rating === 0 && "Click on stars to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {existingRating && (
            <div className="text-center">
              <p className="text-xs text-blue-600">You have already rated this item. This will update your rating.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRating}
            disabled={isSubmitting || rating === 0}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isSubmitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
