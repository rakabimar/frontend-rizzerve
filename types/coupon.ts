export interface Coupon {
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minimumPurchase: number
  expiredAt: string
  quota: number
  usedCount: number
}

export interface CouponRequest {
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minimumPurchase: number
  expiredAt: string
  quota: number
}

export interface CouponUpdateRequest extends CouponRequest {
  usedCount: number
}
