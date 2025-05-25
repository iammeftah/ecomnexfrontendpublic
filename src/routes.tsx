"use client"

import type React from "react"
import { useEffect } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import HomePage from "@/pages/HomePage"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import UserProfile from "@/pages/UserProfile.tsx"
import TemplatesPage from "@/pages/TemplatesPage"
import TemplateManager from "./pages/admin/templates/page"
import TemplatePreview from "./pages/admin/template-preview/TemplatePreview"
import ClientTemplateEditor from "./pages/client/ClientTemplateEditor"
import ProjectEditor from "./pages/client/ProjectEditor"
import ClientDashboard from "./pages/client/dashboard"
import ProjectPreview from "./pages/client/project-preview"
import { MainLayout } from "@/components/layouts/MainLayout"
import Loader from "./components/common/loader"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // Debug logging
    useEffect(() => {
        console.log(
            `ProtectedRoute check - isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}, path: ${location.pathname}`,
        )
    }, [isAuthenticated, isLoading, location.pathname])

    // Only redirect when loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
        console.log("Redirecting to login - not authenticated")
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    // Show loading indicator while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader speed={100} />
            </div>
        )
    }

    // If we reach here, user is authenticated
    return <>{children}</>
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, user, hasRole } = useAuth()
    const location = useLocation()

    // Debug logging
    useEffect(() => {
        console.log(
            `AdminRoute check - isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}, path: ${location.pathname}`,
        )
        console.log(`User details: ${JSON.stringify(user)}`)
        console.log(`Is admin: ${hasRole("ADMIN") || hasRole("ROLE_ADMIN")}`)
    }, [isAuthenticated, isLoading, user, hasRole, location.pathname])

    // Check if the user has admin roles
    const isAdmin = hasRole("ADMIN") || hasRole("ROLE_ADMIN")

    // Only redirect when loading is complete and user is not admin
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
        console.log("Redirecting to login - not authorized as admin")
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    // Show loading indicator while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader speed={100} />
            </div>
        )
    }

    // If we reach here, user is authenticated and has admin role
    return <>{children}</>
}

/**
 * ClientRoute - Ensures the user has client permissions (any authenticated user)
 * This is used for the client template editor that doesn't need admin privileges
 */
const ClientRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // Only redirect when loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    // Show loading indicator while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader speed={100} />
            </div>
        )
    }

    // If we reach here, user is authenticated (any role is fine)
    return <>{children}</>
}

const AppRoutes = () => {
    const { isLoading } = useAuth()

    // While initial auth check is happening, show a loading indicator
    if (isLoading) {
        return (
            <div className="absolute top-0 w-full h-screen flex items-center justify-center">
                <Loader speed={100} />
            </div>
        )
    }

    return (
        <Routes>
            {/* Auth routes - NO MainLayout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with MainLayout */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <UserProfile />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Public routes with MainLayout */}
            <Route
                path="/templates"
                element={
                    <MainLayout>
                        <TemplatesPage />
                    </MainLayout>
                }
            />
            <Route
                path="/templates/preview/:id"
                element={
                    <MainLayout>
                        <TemplatePreview />
                    </MainLayout>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin/templates"
                element={
                    <AdminRoute>
                        <MainLayout>
                            <TemplateManager />
                        </MainLayout>
                    </AdminRoute>
                }
            />

            {/* Client Routes */}
            <Route
                path="/templates/edit/:id"
                element={
                    <ClientRoute>
                        <ClientTemplateEditor />
                    </ClientRoute>
                }
            />

            <Route
                path="/client/dashboard"
                element={
                    <ClientRoute>
                        <MainLayout>
                            <ClientDashboard />
                        </MainLayout>
                    </ClientRoute>
                }
            />

            {/* Important: Remove MainLayout for editor routes */}
            <Route
                path="/client/editor/:id"
                element={
                    <ClientRoute>
                        <ProjectEditor />
                    </ClientRoute>
                }
            />

            <Route
                path="/client/preview/:id"
                element={
                    <ClientRoute>
                        <ProjectPreview />
                    </ClientRoute>
                }
            />

            <Route
                path="/"
                element={
                    <MainLayout>
                        <HomePage />
                    </MainLayout>
                }
            />

            {/* Add a catch-all route that redirects to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default AppRoutes
