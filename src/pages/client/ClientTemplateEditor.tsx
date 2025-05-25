"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { projectService } from "@/services/project-service/projectService"
import ProjectEditor from "./ProjectEditor"

const ClientTemplateEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [projectExists, setProjectExists] = useState(false)

    useEffect(() => {
        const checkProject = async () => {
            try {
                if (!id) {
                    setError("Project ID is required")
                    return
                }

                setLoading(true)

                // Check if the project exists and the user has access
                const project = await projectService.getProjectById(id)

                // If we get here, the project exists and the user has access
                console.log("Project loaded successfully:", project.id)
                setProjectExists(true)
                setLoading(false)
            } catch (err: any) {
                console.error("Error checking project:", err)
                setError(err.response?.data?.message || "Failed to load project")
                toast.error("Failed to load project. You may not have access to this project.")
                setLoading(false)
            }
        }

        checkProject()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading editor...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-bold mb-4">Error Loading Project</h2>
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => navigate("/templates")}>Back to Templates</Button>
            </div>
        )
    }

    if (projectExists) {
        return <ProjectEditor />
    }

    return null
}

export default ClientTemplateEditor
