import type { AuthRequest, AuthResponse, User, UserUpdateRequest } from "@/types/auth"

// Base API URL - can be configured via environment variable
const API_URL = "http://localhost:9090"

class AuthService {
  private storageKey = "auth_user"
  private tokenKey = "auth_token"

  async login(email: string, password: string): Promise<User> {
    console.log("🔍 Login attempt:", { email, password: "********" })
    try {
      console.log("🔍 Sending login request to:", `${API_URL}/api/auth/signin`)

      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password } as AuthRequest),
      })

      console.log("🔍 Login response status:", response.status)
      console.log("🔍 Login response headers:", Object.fromEntries([...response.headers.entries()]))

      // Get response text regardless of status for debugging
      const responseText = await response.text()
      console.log("🔍 Login response body:", responseText)

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} - ${responseText}`)
      }

      // Try to parse the response as JSON
      let data: AuthResponse
      try {
        data = JSON.parse(responseText) as AuthResponse
        console.log("🔍 Parsed login response:", data)
      } catch (e) {
        console.error("🔍 Error parsing login response as JSON:", e)
        throw new Error(`Authentication failed: Invalid response format - ${responseText}`)
      }

      // Store token and user data
      localStorage.setItem(this.tokenKey, data.token)
      console.log("🔍 Stored token in localStorage")

      const user: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        roles: data.roles,
      }

      localStorage.setItem(this.storageKey, JSON.stringify(user))
      console.log("🔍 Stored user in localStorage:", user)
      return user
    } catch (error) {
      console.error("🔍 Login error details:", error)
      throw error
    }
  }

  async register(username: string, email: string, password: string, firstName: string, lastName: string, phone?: string): Promise<User> {
    console.log("🔍 Register attempt:", {
      username,
      email,
      password: "********",
      firstName,
      lastName,
      phone
    })

    try {
      const requestBody = {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        roles: ["USER"] // Add default user role
      } as AuthRequest;

      console.log("🔍 Register request URL:", `${API_URL}/api/auth/signup`)
      console.log("🔍 Register request payload:", requestBody)

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("🔍 Register response status:", response.status)
      console.log("🔍 Register response status text:", response.statusText)
      console.log("🔍 Register response headers:", Object.fromEntries([...response.headers.entries()]))

      // Get the response text for debugging purposes regardless of status
      const responseText = await response.text()
      console.log("🔍 Register response raw text:", responseText)

      if (!response.ok) {
        console.error("🔍 Registration failed with status:", response.status)
        throw new Error(`Registration failed: ${response.status} - ${responseText}`)
      }

      // Try to parse the response as JSON
      let data: AuthResponse
      try {
        data = JSON.parse(responseText) as AuthResponse
        console.log("🔍 Parsed registration response:", data)
      } catch (e) {
        console.error("🔍 Error parsing registration response as JSON:", e)
        throw new Error(`Registration failed: Invalid response format - ${responseText}`)
      }

      // Store token and user data
      localStorage.setItem(this.tokenKey, data.token)
      console.log("🔍 Stored token in localStorage")

      const user: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        roles: data.roles,
      }

      localStorage.setItem(this.storageKey, JSON.stringify(user))
      console.log("🔍 Stored user in localStorage:", user)
      return user
    } catch (error) {
      console.error("🔍 Registration error full details:", error)
      throw error
    }
  }

  async updateUser(updateData: UserUpdateRequest): Promise<User> {
    console.log("🔍 Update user attempt:", updateData)
    try {
      const token = this.getToken()
      if (!token) {
        console.error("🔍 Update error: No authentication token found")
        throw new Error("User not authenticated")
      }

      console.log("🔍 Update request URL:", `${API_URL}/api/users/me`)
      console.log("🔍 Update request payload:", updateData)

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      })

      console.log("🔍 Update response status:", response.status)
      console.log("🔍 Update response headers:", Object.fromEntries([...response.headers.entries()]))

      const responseText = await response.text()
      console.log("🔍 Update response body:", responseText)

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status} - ${responseText}`)
      }

      // Try to parse the response as JSON
      let data: AuthResponse
      try {
        data = JSON.parse(responseText) as AuthResponse
        console.log("🔍 Parsed update response:", data)
      } catch (e) {
        console.error("🔍 Error parsing update response as JSON:", e)
        throw new Error(`Update failed: Invalid response format - ${responseText}`)
      }

      const user: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        roles: data.roles,
      }

      localStorage.setItem(this.storageKey, JSON.stringify(user))
      console.log("🔍 Updated user in localStorage:", user)
      return user
    } catch (error) {
      console.error("🔍 Update error details:", error)
      throw error
    }
  }

  async deleteUser(): Promise<void> {
    console.log("🔍 Delete user attempt")
    try {
      const token = this.getToken()
      if (!token) {
        console.error("🔍 Delete error: No authentication token found")
        throw new Error("User not authenticated")
      }

      console.log("🔍 Delete request URL:", `${API_URL}/api/users/me`)

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })

      console.log("🔍 Delete response status:", response.status)
      console.log("🔍 Delete response headers:", Object.fromEntries([...response.headers.entries()]))

      const responseText = await response.text()
      console.log("🔍 Delete response body:", responseText)

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} - ${responseText}`)
      }

      // Clear local storage after successful deletion
      console.log("🔍 Logout after successful account deletion")
      this.logout()
    } catch (error) {
      console.error("🔍 Delete error details:", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<User | null> {
    console.log("🔍 Get current user from localStorage")
    if (typeof window === "undefined") {
      console.log("🔍 Running on server side, no localStorage access")
      return null
    }

    const userData = localStorage.getItem(this.storageKey)
    console.log("🔍 User data from localStorage:", userData ? "Found" : "Not found")
    return userData ? JSON.parse(userData) : null
  }

  getToken(): string | null {
    console.log("🔍 Get token from localStorage")
    if (typeof window === "undefined") {
      console.log("🔍 Running on server side, no localStorage access")
      return null
    }

    const token = localStorage.getItem(this.tokenKey)
    console.log("🔍 Token from localStorage:", token ? "Found" : "Not found")
    return token
  }

  logout(): void {
    console.log("🔍 Logout - clearing localStorage")
    if (typeof window === "undefined") {
      console.log("🔍 Running on server side, no localStorage access")
      return
    }

    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.tokenKey)
    console.log("🔍 Logout complete - localStorage cleared")
  }

  // Helper method to check if the backend is available
  async healthCheck(): Promise<boolean> {
    console.log("🔍 Health check attempt")
    try {
      console.log("🔍 Health check URL:", `${API_URL}/health`)
      const response = await fetch(`${API_URL}/health`)
      console.log("🔍 Health check response status:", response.status)
      return response.ok
    } catch (error) {
      console.error("🔍 Health check failed details:", error)
      return false
    }
  }

  // Add a specific method to test direct connection to auth service
  async testDirectAuth(): Promise<boolean> {
    console.log("🔍 Testing direct connection to auth service")
    try {
      // Try to connect directly to auth service
      const response = await fetch(`http://localhost:9091/api/auth/health`, {
        method: "GET"
      })
      console.log("🔍 Direct auth service test result:", response.status, response.statusText)
      const text = await response.text()
      console.log("🔍 Direct auth service response:", text)
      return response.ok
    } catch (error) {
      console.error("🔍 Direct auth service test failed:", error)
      return false
    }
  }
}

export const authService = new AuthService()
