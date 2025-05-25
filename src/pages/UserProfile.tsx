"use client"

import { useState, type FormEvent } from "react"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Pencil, Save, X, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { UserUpdateRequest } from "@/types/auth"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const UserProfile = () => {
    const { user, logout, updateUser, deleteUser } = useAuth()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState("profile")
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    // Redirect if not authenticated
    if (!user) {
        navigate("/login")
        return null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Check if passwords match when updating password
            if (activeTab === "security" && formData.newPassword) {
                if (!formData.currentPassword) {
                    setError("Current password is required to change password")
                    setIsLoading(false)
                    return
                }

                if (formData.newPassword !== formData.confirmPassword) {
                    setError("New passwords do not match")
                    setIsLoading(false)
                    return
                }
            }

            // Prepare update data based on active tab
            const updateData: UserUpdateRequest = {}

            if (activeTab === "profile") {
                updateData.firstName = formData.firstName
                updateData.lastName = formData.lastName
                updateData.phone = formData.phone
            } else if (activeTab === "security" && formData.newPassword) {
                // Backend should validate current password
                updateData.password = formData.newPassword
            }

            await updateUser(updateData)
            setIsEditing(false)

            // Reset password fields
            if (activeTab === "security") {
                setFormData(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }))
            }
        } catch (err) {
            setError("Failed to update profile. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        // Reset form data
        setFormData({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            phone: user?.phone || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
        setIsEditing(false)
        setError("")
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            await deleteUser()
            navigate("/")
        } catch (err) {
            setError("Failed to delete account. Please try again.")
            setIsDeleting(false)
        }
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setIsEditing(false)
        setError("")
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Account</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and preferences
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 border-red-200 hover:border-red-300 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Yes, delete my account"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            onClick={logout}
                            variant="outline"
                            size="sm"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="profile" value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl">Profile Information</CardTitle>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="gradient-btn"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="gradient-btn"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {error && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {isEditing ? (
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone (Optional)</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    placeholder="+1234567890"
                                                />
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="text-muted-foreground text-sm">First Name</Label>
                                                <p className="font-medium mt-1">{user.firstName}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground text-sm">Last Name</Label>
                                                <p className="font-medium mt-1">{user.lastName}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground text-sm">Username</Label>
                                                <p className="font-medium mt-1">{user.username}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground text-sm">Email</Label>
                                                <p className="font-medium mt-1">{user.email}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground text-sm">Phone</Label>
                                                <p className="font-medium mt-1">{user.phone || "Not provided"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground text-sm">Role</Label>
                                                <p className="font-medium mt-1">
                                                    {user.roles.map(role => role.replace("ROLE_", "")).join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl">Password & Security</CardTitle>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="gradient-btn"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="gradient-btn"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Change Password
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {error && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {isEditing ? (
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <Input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type="password"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    required
                                                />
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <Input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type="password"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Password</Label>
                                            <p className="font-medium mt-1">••••••••</p>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Your password was last changed never.
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                For security reasons, we recommend changing your password regularly.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    )
}

export default UserProfile
