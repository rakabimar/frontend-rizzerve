"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface RatingStarsProps {
  initialRating?: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  readOnly?: boolean
  onRatingChange?: (rating: number) => void
}

export default function RatingStars({
  initialRating = 0,
  maxRating = 5,
  size = "md",
  readOnly = false,
  onRatingChange,
}: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (selectedRating: number) => {
    if (readOnly) return

    setRating(selectedRating)
    if (onRatingChange) {
      onRatingChange(selectedRating)
    }
  }

  const handleMouseEnter = (hoveredRating: number) => {
    if (readOnly) return
    setHoverRating(hoveredRating)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverRating(0)
  }

  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating

        return (
          <span
            key={index}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            className={`${readOnly ? "" : "cursor-pointer"} mr-1`}
          >
            <Star
              className={`${sizeClasses[size]} ${isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          </span>
        )
      })}
    </div>
  )
}
