"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { projectService, type Project } from "@/services/project-service/projectService"
import { ProjectRenderer } from "./project-renderer"

const ProjectPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("/")
  const [previewUrl, setPreviewUrl] = useState<string>("")

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const fetchedProject = await projectService.getProjectById(id)
        setProject(fetchedProject)

        // Generate a mock URL for the preview
        const domain = fetchedProject.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .substring(0, 15)
        setPreviewUrl(`https://${domain}.softinex.me/`)

        // Set up internal navigation function
        window.navigateProject = (path: string) => {
          console.log("Project internal navigation to:", path)
          setCurrentPath(path)
        }
      } catch (err) {
        console.error("Error fetching project:", err)
        setError("Failed to load project. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()

    // Clean up when component unmounts
    return () => {
      delete window.navigateProject
    }
  }, [id])

  const handleGoBack = () => {
    navigate("/client/dashboard")
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading project...</span>
        </div>
    )
  }

  if (error || !project) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>{error || "Project not found"}</AlertDescription>
          </Alert>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
    )
  }

  return (
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Header */}
        <header className="border-b bg-background z-10">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">{project.name} Preview</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/client/editor/${project.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </header>

        {/* Browser Frame */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
            {/* Browser Chrome */}
            <div className="bg-gray-100 border-b p-2 flex items-center">
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 flex items-center bg-white rounded px-3 py-1 text-sm text-gray-600">
                <span className="mr-2">🔒</span>
                <span className="truncate">{previewUrl}</span>
              </div>
              <div className="ml-4 flex space-x-2">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Browser Tabs */}
            <div className="bg-gray-50 border-b flex items-center px-2">
              {project.pages.map((page) => (
                  <div
                      key={page.id}
                      className={`px-4 py-2 border-r flex items-center gap-2 text-sm cursor-pointer ${
                          currentPath === page.path ? "bg-white border-b-0" : "bg-gray-50 text-gray-600"
                      }`}
                      onClick={() => setCurrentPath(page.path)}
                  >
                    {page.name}
                    {currentPath === page.path && <button className="ml-2 text-gray-400 hover:text-gray-600">×</button>}
                  </div>
              ))}
              <div className="px-2 py-2 text-gray-400 text-sm">+</div>
            </div>

            {/* Browser Content */}
            <div className="flex-1 overflow-auto bg-white">
              <ProjectRenderer project={project} pagePath={currentPath} />
            </div>
          </div>
        </div>
      </div>
  )
}

export default ProjectPreview
