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
import type { MenuItem } from "@/types/menu"
import { useAuth } from "@/context/auth-context"

interface DeleteMenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItem
  onSuccess: () => void
}

export default function DeleteMenuItemDialog({ open, onOpenChange, menuItem, onSuccess }: DeleteMenuItemDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user?.token) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      console.log("Attempting to delete menu item:", menuItem.id)
      console.log("Using auth token:", user.token ? "Token present" : "No token")

      const response = await fetch(`${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}/${menuItem.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Delete response status:", response.status)
      console.log("Delete response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = "Failed to delete menu item"

        // Handle different error status codes
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please log in again."
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to delete menu items."
        } else if (response.status === 404) {
          errorMessage = "Menu item not found."
        } else {
          // Try to get error message from response
          try {
            const errorText = await response.text()
            console.log("Error response text:", errorText)
            if (errorText) {
              errorMessage = errorText
            }
          } catch (textError) {
            console.error("Could not read error response:", textError)
          }
        }

        throw new Error(errorMessage)
      }

      // Check if response has content
      const responseText = await response.text()
      console.log("Delete response body:", responseText)

      toast({
        title: "Menu Item Deleted",
        description: `${menuItem.name} has been deleted successfully.`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete menu item",
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
          <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{menuItem.name}</strong>. This action cannot be undone.
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
