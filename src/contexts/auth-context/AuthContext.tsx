"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "@/services/auth-service/authService"
import type { User, UserUpdateRequest } from "@/types/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (
      username: string,
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phone?: string,
  ) => Promise<void>
  updateUser: (updateData: UserUpdateRequest) => Promise<void>
  deleteUser: () => Promise<void>
  logout: () => void
  hasRole: (roleName: string) => boolean // Add this helper method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser()
        if (userData) {
          console.log("Found existing user data:", userData) // Add debug logging
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          console.log("No existing user data found") // Add debug logging
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const userData = await authService.login(email, password)
      console.log("Login successful, user data:", userData)
      setUser(userData)
      setIsAuthenticated(true)
      return userData
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
      username: string,
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phone?: string,
  ) => {
    setIsLoading(true)
    try {
      const userData = await authService.register(username, email, password, firstName, lastName, phone)
      console.log("Registration successful, user data:", userData) // Add debug logging
      setUser(userData)
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updateData: UserUpdateRequest) => {
    setIsLoading(true)
    try {
      const updatedUser = await authService.updateUser(updateData)
      setUser(updatedUser)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async () => {
    setIsLoading(true)
    try {
      await authService.deleteUser()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  // Helper method to check if user has a specific role
  const hasRole = (roleName: string) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      console.log(`No roles found for user or invalid roles format`) // Add debug logging
      return false
    }

    const hasRoleValue = user.roles.some((role) => role === roleName)
    console.log(`Checking if user has role ${roleName}: ${hasRoleValue}`) // Add debug logging
    console.log(`User roles: ${JSON.stringify(user.roles)}`) // Add debug logging

    return hasRoleValue
  }

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            register,
            updateUser,
            deleteUser,
            logout,
            hasRole, // Add the helper method
          }}
      >
        {children}
      </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
