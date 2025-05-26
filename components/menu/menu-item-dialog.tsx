"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import MenuItemForm from "./menu-item-form"
import type { MenuItem } from "@/types/menu"

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem?: MenuItem
  onSuccess: () => void
}

export default function MenuItemDialog({ open, onOpenChange, menuItem, onSuccess }: MenuItemDialogProps) {
  const handleSuccess = () => {
    onSuccess()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{menuItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>
            {menuItem ? "Update the details of the existing menu item." : "Fill in the details to add a new menu item."}
          </DialogDescription>
        </DialogHeader>
        <MenuItemForm menuItem={menuItem} onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  )
}