"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/customer/dashboard")
        }
      } else {
        router.push("/auth/login")
      }
    }
  }, [user, loading, router])

  // This page just redirects
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 py-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The Smoothest Way to <span className="text-rose-600">Order</span>
          </h1>
          <p className="text-xl text-gray-600">Enjoy your favorite meals with just a tap. No waiting, no hassle.</p>
          <div className="flex gap-4">
            <Link href="/menu">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                View Menu <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 relative h-[400px] w-full rounded-xl overflow-hidden">
          <Image
            src="/placeholder.svg?height=400&width=600"
            alt="Delicious food"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose RIZZerve?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Ordering</h3>
            <p className="text-gray-600">Order your favorite meals in seconds with our intuitive interface.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Checkout</h3>
            <p className="text-gray-600">Enjoy a seamless and secure checkout process for your orders.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rate Your Experience</h3>
            <p className="text-gray-600">Share your feedback and help us improve our service.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-rose-50 rounded-xl p-8 my-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Order?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our menu and enjoy a delicious meal delivered right to your table.
          </p>
          <Link href="/menu">
            <Button size="lg" className="mt-4 bg-rose-600 hover:bg-rose-700">
              View Menu
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
