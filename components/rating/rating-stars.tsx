"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface RatingStarsProps {
  rating?: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  readOnly?: boolean
  showValue?: boolean
  onRatingChange?: (rating: number) => void
}

export default function RatingStars({
  rating = 0,
  maxRating = 5,
  size = "md",
  readOnly = false,
  showValue = false,
  onRatingChange,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (selectedRating: number) => {
    if (readOnly) return

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

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayRating

          return (
            <span
              key={index}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`${readOnly ? "" : "cursor-pointer hover:scale-110 transition-transform"}`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                } transition-colors`}
              />
            </span>
          )
        })}
      </div>
      {showValue && <span className="text-sm text-gray-600 ml-1">{rating > 0 ? rating.toFixed(1) : "No ratings"}</span>}
    </div>
  )
}
