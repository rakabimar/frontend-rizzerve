"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"
import type { MenuItem, MenuItemRequest } from "@/types/menu"
import { useAuth } from "@/context/auth-context"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  menuType: z.enum(["FOOD", "DRINK"]),
  available: z.boolean().default(true),
  isSpicy: z.boolean().optional(),
  isCold: z.boolean().optional(),
  image: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Helper function to determine menu type based on item properties
const determineMenuType = (item: MenuItem): "FOOD" | "DRINK" => {
  if ("isSpicy" in item) return "FOOD"
  if ("isCold" in item) return "DRINK"

  // Default to FOOD if we can't determine
  return "FOOD"
}

interface MenuItemFormProps {
  menuItem?: MenuItem
  onSuccess: () => void
  onCancel: () => void
}

export default function MenuItemForm({ menuItem, onSuccess, onCancel }: MenuItemFormProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values or existing menu item values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: menuItem
      ? {
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          menuType: determineMenuType(menuItem),
          available: menuItem.available, // Use nullish coalescing instead of !== undefined
          isSpicy: menuItem.isSpicy || false,
          isCold: menuItem.isCold || false,
          image: menuItem.image || "",
        }
      : {
          name: "",
          description: "",
          price: 0,
          menuType: "FOOD",
          available: true,
          isSpicy: false,
          isCold: false,
          image: "",
        },
  })

  // Watch the menuType to conditionally render fields
  const menuType = form.watch("menuType")

  const onSubmit = async (data: FormValues) => {
    if (!user?.token) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the request body - ensure available field is explicitly included
      const requestBody: MenuItemRequest = {
        name: data.name,
        description: data.description,
        price: data.price,
        available: Boolean(data.available), // Explicitly convert to boolean
        image: data.image || "",
      }

      // Add type-specific fields
      if (data.menuType === "FOOD") {
        requestBody.isSpicy = data.isSpicy || false
      } else if (data.menuType === "DRINK") {
        requestBody.isCold = data.isCold || false
      }

      let url = `${API_URLS.MENU_SERVICE_URL}${API_URLS.MENU_API_URL}`
      let method = "POST"

      // If editing an existing item, use PUT method
      if (menuItem) {
        url = `${url}/${menuItem.id}`
        method = "PUT"
      } else {
        // If creating a new item, add the menuType query parameter
        url = `${url}?menuType=${data.menuType}`
      }

      console.log(`${menuItem ? "Updating" : "Creating"} menu item:`, {
        url,
        method,
        requestBody,
        authToken: user.token ? "Token exists" : "No token",
      })

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(errorText || "Failed to save menu item")
      }

      toast({
        title: menuItem ? "Menu Item Updated" : "Menu Item Created",
        description: `${data.name} has been ${menuItem ? "updated" : "added"} successfully.`,
      })

      onSuccess()
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save menu item",
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
          name="menuType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!menuItem} // Disable if editing an existing item
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select menu type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FOOD">Food</SelectItem>
                  <SelectItem value="DRINK">Drink</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {menuItem
                  ? "Menu type cannot be changed after creation"
                  : "Select whether this is a food or drink item"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter item name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter item description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    console.log("Available field changed to:", checked) // Debug log
                  }} 
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Available</FormLabel>
                <FormDescription>Check if this item is currently available for ordering</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter image URL (optional)" {...field} />
              </FormControl>
              <FormDescription>Enter a URL for the item image</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {menuType === "FOOD" && (
          <FormField
            control={form.control}
            name="isSpicy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Spicy</FormLabel>
                  <FormDescription>Check if this food item is spicy</FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {menuType === "DRINK" && (
          <FormField
            control={form.control}
            name="isCold"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Cold</FormLabel>
                  <FormDescription>Check if this drink is served cold</FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
            {isSubmitting ? "Saving..." : menuItem ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
