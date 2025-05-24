"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CouponForm from "./coupon-form"
import type { Coupon } from "@/types/coupon"

interface CouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon?: Coupon
  onSuccess: () => void
}

export default function CouponDialog({ open, onOpenChange, coupon, onSuccess }: CouponDialogProps) {
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
          <DialogTitle>{coupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          <DialogDescription>
            {coupon
              ? "Update the coupon details. Note: Only quota can be modified for existing coupons."
              : "Fill in the details to create a new coupon."}
          </DialogDescription>
        </DialogHeader>
        <CouponForm coupon={coupon} onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  )
}
