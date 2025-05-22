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

interface DeleteMenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItem
  onSuccess: () => void
}

export default function DeleteMenuItemDialog({ open, onOpenChange, menuItem, onSuccess }: DeleteMenuItemDialogProps) {
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
      const response = await fetch(`${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}/${menuItem.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to delete menu item")
      }

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
