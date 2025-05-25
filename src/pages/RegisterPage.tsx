"use client"

import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import AuthLayout from "@/components/layouts/AuthLayout"
import { toast } from "sonner"

const RegisterPage = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Password Mismatch", {
        description: "Passwords do not match. Please try again.",
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 5000,
      })
      return
    }

    try {
      await register(name, email, password)
      toast.success("Registration Successful", {
        description: "Your account has been created successfully.",
        icon: <CheckCircle className="h-5 w-5" />,
        duration: 5000,
      })
      navigate("/login")
    } catch (err) {
      toast.error("Registration Failed", {
        description: "There was an error creating your account. Please try again.",
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 5000,
      })
    }
  }

  const registerContent = (
      <div className="container mx-auto py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border bg-transparent shadow-lg max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
              <p className="text-center text-muted-foreground">Enter your information to create an account</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      disabled={isLoading}
                  />
                </div>
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
                  <Label htmlFor="password">Password</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
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
                        Creating Account...
                      </>
                  ) : (
                      "Register"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center w-full text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-brand-fuchsia hover:underline font-medium">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
  )

  return <AuthLayout>{registerContent}</AuthLayout>
}

export default RegisterPage
