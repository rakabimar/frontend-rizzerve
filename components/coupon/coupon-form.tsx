"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import type { Coupon, CouponRequest, CouponUpdateRequest } from "@/types/coupon"

// Define the form schema with Zod
const formSchema = z.object({
  code: z.string().min(1, "Code is required").max(20, "Code must be 20 characters or less"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive("Value must be positive"),
  minimumPurchase: z.coerce.number().min(0, "Minimum purchase must be 0 or greater"),
  expiredAt: z.string().min(1, "Expiration date is required"),
  quota: z.coerce.number().positive("Quota must be positive"),
})

type FormValues = z.infer<typeof formSchema>

interface CouponFormProps {
  coupon?: Coupon
  onSuccess: () => void
  onCancel: () => void
}

export default function CouponForm({ coupon, onSuccess, onCancel }: CouponFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    // Get the auth token from localStorage
    const token = localStorage.getItem("auth_token")
    setAuthToken(token)
  }, [])

  // Initialize the form with default values or existing coupon values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minimumPurchase: coupon.minimumPurchase,
          expiredAt: coupon.expiredAt.split("T")[0], // Convert to date format for input
          quota: coupon.quota,
        }
      : {
          code: "",
          type: "PERCENTAGE",
          value: 0,
          minimumPurchase: 0,
          expiredAt: "",
          quota: 1,
        },
  })

  const onSubmit = async (data: FormValues) => {
    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Convert date to ISO string format
      const expiredAtISO = new Date(data.expiredAt + "T23:59:59").toISOString()

      let url = `${API_URLS.COUPON_SERVICE_URL}${API_URLS.COUPON_API_URL}`
      let method = "POST"
      let requestBody: CouponRequest | CouponUpdateRequest

      if (coupon) {
        // Update existing coupon - only quota can be changed according to API docs
        url = `${url}/${coupon.code}`
        method = "PUT"
        requestBody = {
          code: coupon.code, // Keep original code
          type: coupon.type, // Keep original type
          value: coupon.value, // Keep original value
          minimumPurchase: coupon.minimumPurchase, // Keep original minimum purchase
          expiredAt: coupon.expiredAt, // Keep original expiration date
          quota: data.quota, // Only this can be updated
          usedCount: coupon.usedCount, // Keep original used count
        }
      } else {
        // Create new coupon
        requestBody = {
          code: data.code,
          type: data.type,
          value: data.value,
          minimumPurchase: data.minimumPurchase,
          expiredAt: expiredAtISO,
          quota: data.quota,
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to save coupon")
      }

      toast({
        title: coupon ? "Coupon Updated" : "Coupon Created",
        description: `${data.code} has been ${coupon ? "updated" : "created"} successfully.`,
      })

      onSuccess()
    } catch (error) {
      console.error("Error saving coupon:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save coupon",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter coupon code (e.g., SAVE20)"
                  {...field}
                  disabled={!!coupon} // Disable if editing
                />
              </FormControl>
              {coupon && <FormDescription>Coupon code cannot be changed after creation</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!coupon} // Disable if editing
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              {coupon && <FormDescription>Discount type cannot be changed after creation</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch("type") === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount ($)"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step={form.watch("type") === "PERCENTAGE" ? "1" : "0.01"}
                  min="0"
                  max={form.watch("type") === "PERCENTAGE" ? "100" : undefined}
                  placeholder={form.watch("type") === "PERCENTAGE" ? "20" : "10.00"}
                  {...field}
                  disabled={!!coupon} // Disable if editing
                />
              </FormControl>
              {coupon && <FormDescription>Discount value cannot be changed after creation</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minimumPurchase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Purchase ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  disabled={!!coupon} // Disable if editing
                />
              </FormControl>
              {coupon && <FormDescription>Minimum purchase cannot be changed after creation</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiredAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={!!coupon} // Disable if editing
                />
              </FormControl>
              {coupon && <FormDescription>Expiration date cannot be changed after creation</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quota"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usage Quota</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="100" {...field} />
              </FormControl>
              <FormDescription>
                {coupon
                  ? "Only the quota can be updated for existing coupons"
                  : "Maximum number of times this coupon can be used"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
            {isSubmitting ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
