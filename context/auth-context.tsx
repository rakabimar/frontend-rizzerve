"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  username: string
  email: string
  role: "admin" | "customer"
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (name: string, username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Redirect admin to dashboard
          if (parsedUser.role === "admin") {
            router.push("/admin/dashboard")
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      // In a real app, this would be a fetch to your backend
      // Simulating API call
      const response = {
        id: "1",
        name: username === "admin" ? "Admin User" : "Customer User",
        username,
        email: `${username}@example.com`,
        role: username === "admin" ? "admin" : ("customer" as "admin" | "customer"),
      }

      setUser(response)
      localStorage.setItem("user", JSON.stringify(response))

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.name}!`,
      })

      // Redirect based on role
      if (response.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/customer/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, username: string, email: string, password: string) => {
    setLoading(true)
    try {
      // In a real app, this would be a fetch to your backend
      // Simulating API call
      const response = {
        id: "2",
        name,
        username,
        email,
        role: "customer" as "admin" | "customer",
      }

      setUser(response)
      localStorage.setItem("user", JSON.stringify(response))

      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      })

      // Redirect to customer dashboard
      router.push("/customer/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration failed",
        description: "Could not create account",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
