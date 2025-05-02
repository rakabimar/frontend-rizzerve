"use client"

import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-xs">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-lg p-4 transform transition-all duration-300 ${
            toast.variant === "destructive" ? "border-l-4 border-red-500" : "border-l-4 border-green-500"
          }`}
        >
          {toast.title && <h3 className="font-medium">{toast.title}</h3>}
          {toast.description && <p className="text-sm text-gray-500">{toast.description}</p>}
        </div>
      ))}
    </div>
  )
}
