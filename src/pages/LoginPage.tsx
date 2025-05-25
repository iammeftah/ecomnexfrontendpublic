"use client"

import { useState, type FormEvent, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import AuthLayout from "@/components/layouts/AuthLayout"
import { toast } from "sonner"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, isAuthenticated, user, hasRole } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  // Function to redirect based on user role
  const redirectBasedOnRole = (userData: any) => {
    console.log("Redirecting based on role:", userData)

    // Check if user has admin role
    if (userData.roles && (userData.roles.includes("ADMIN") || userData.roles.includes("ROLE_ADMIN"))) {
      console.log("User is admin, redirecting to admin templates")
      navigate("/admin/templates")
    } else {
      // Regular user/client
      console.log("User is client, redirecting to client dashboard")
      navigate("/client/dashboard")
    }
  }

  // Check if user is already authenticated on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user)
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      // Login and get user data
      const userData = await login(email, password)

      // Immediately redirect based on role
      redirectBasedOnRole(userData)
    } catch (err) {
      toast("Authentication Failed", {
        description: "Invalid email or password. Please try again.",
        duration: 5000,
      })
    }
  }

  const loginContent = (
      <div className="container mx-auto py-64">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border bg-transparent shadow-lg max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
              <p className="text-center text-muted-foreground">Welcome back! Please sign in to your account.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="password">Password</Label>
                    <a
                        href="#forgot-password"
                        className="hover:underline opacity-80 flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 duration-300"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>
                <Button
                    type="submit"
                    className="w-full bg-gradient-to-tr from-rose-500 to-fuchsia-600 text-white font-bold"
                    disabled={isLoading}
                >
                  {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                  ) : (
                      "Login"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center w-full text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-brand-fuchsia hover:underline font-medium">
                  Register
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
  )

  return <AuthLayout>{loginContent}</AuthLayout>
}

export default LoginPage
