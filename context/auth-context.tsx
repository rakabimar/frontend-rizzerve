"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { API_URLS } from "@/lib/constants"

type User = {
  adminId: string
  username: string
  name: string
  token: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (name: string, username: string, password: string) => Promise<void>
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
        const storedToken = localStorage.getItem("auth_token")
        if (storedToken) {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)

            // Validate token by fetching profile
            try {
              const response = await fetch(`${API_URLS.AUTH_SERVICE_URL}${API_URLS.AUTH_PROFILE_API_URL}`, {
                headers: {
                  Authorization: `Bearer ${parsedUser.token}`,
                },
              })

              if (!response.ok) {
                // Token is invalid, log out
                logout()
              }
            } catch (error) {
              console.error("Error validating token:", error)
            }
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
      console.log(`Attempting to login to: ${API_URLS.AUTH_SERVICE_URL}${API_URLS.AUTH_LOGIN_API_URL}`)

      const response = await fetch(`${API_URLS.AUTH_SERVICE_URL}${API_URLS.AUTH_LOGIN_API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Login response status:", response.status)

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to parse error response if available
        let errorMessage = "Login failed"
        try {
          const errorText = await response.text()
          console.log("Error response text:", errorText)

          if (errorText) {
            try {
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.message || "Login failed"
            } catch (parseError) {
              console.error("Error parsing error response:", parseError)
              // If we can't parse the error, use the raw text if available
              errorMessage = errorText || "Login failed"
            }
          }
        } catch (textError) {
          console.error("Error reading response text:", textError)
        }

        throw new Error(errorMessage)
      }

      // Check if response has content before parsing
      const responseText = await response.text()
      console.log("Response text:", responseText)

      if (!responseText) {
        throw new Error("Empty response received from server")
      }

      // Parse the JSON response
      let userData
      try {
        userData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Invalid response format from server")
      }

      // Store user data and token
      setUser(userData)
      localStorage.setItem("auth_token", userData.token)
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      })

      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, username: string, password: string) => {
    setLoading(true)
    try {
      console.log(`Attempting to register to: ${API_URLS.AUTH_SERVICE_URL}${API_URLS.AUTH_REGISTER_API_URL}`)

      const response = await fetch(`${API_URLS.AUTH_SERVICE_URL}${API_URLS.AUTH_REGISTER_API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, password }),
      })

      console.log("Register response status:", response.status)

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to parse error response if available
        let errorMessage = "Registration failed"
        try {
          const errorText = await response.text()
          console.log("Error response text:", errorText)

          if (errorText) {
            try {
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.message || "Registration failed"
            } catch (parseError) {
              console.error("Error parsing error response:", parseError)
              // If we can't parse the error, use the raw text if available
              errorMessage = errorText || "Registration failed"
            }
          }
        } catch (textError) {
          console.error("Error reading response text:", textError)
        }

        throw new Error(errorMessage)
      }

      // Check if response has content before parsing
      const responseText = await response.text()
      console.log("Response text:", responseText)

      if (!responseText) {
        throw new Error("Empty response received from server")
      }

      // Parse the JSON response
      let userData
      try {
        userData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Invalid response format from server")
      }

      // Store user data and token
      setUser(userData)
      localStorage.setItem("auth_token", userData.token)
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      })

      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
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
