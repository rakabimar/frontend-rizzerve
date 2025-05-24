"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import type { Coupon } from "@/types/coupon"

interface DeleteCouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: Coupon
  onSuccess: () => void
}

export default function DeleteCouponDialog({ open, onOpenChange, coupon, onSuccess }: DeleteCouponDialogProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`${API_URLS.COUPON_SERVICE_URL}${API_URLS.COUPON_API_URL}/${coupon.code}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to delete coupon")
      }

      toast({
        title: "Coupon Deleted",
        description: `${coupon.code} has been deleted successfully.`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete coupon",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this coupon?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the coupon <strong>{coupon.code}</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
