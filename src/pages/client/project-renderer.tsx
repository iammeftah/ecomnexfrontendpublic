"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Project, Page } from "@/services/project-service/projectService"
import { ComponentRenderer } from "./component-renderer"

interface ProjectRendererProps {
  project: Project
  pagePath?: string
  onSelectComponent?: (component: any) => void
  selectedComponentId?: string
  isEditorMode?: boolean
}

export const ProjectRenderer: React.FC<ProjectRendererProps> = ({
                                                                  project,
                                                                  pagePath = "/",
                                                                  onSelectComponent,
                                                                  selectedComponentId,
                                                                  isEditorMode = false,
                                                                }) => {
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update the page whenever pagePath changes
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      console.log(`ProjectRenderer: Finding page for path: ${pagePath}`)

      // Get the page from the project
      let foundPage: Page | null = null

      // First, try to get the page by the specified path
      if (pagePath) {
        foundPage = project.pages.find((page) => page.path === pagePath) || null
        if (foundPage) {
          console.log(`ProjectRenderer: Found page by path: ${pagePath}`, foundPage.name)
        } else {
          console.log(`ProjectRenderer: No page found for path: ${pagePath}`)
        }
      }

      // If no page found by path or no path provided, get the home page
      if (!foundPage) {
        foundPage = project.pages.find((page) => page.isHomePage) || null
        if (foundPage) {
          console.log(`ProjectRenderer: Using home page: ${foundPage.name}`)
        }
      }

      // If still no page found, use the first page
      if (!foundPage && project.pages.length > 0) {
        foundPage = project.pages[0]
        console.log(`ProjectRenderer: Using first page: ${foundPage.name}`)
      }

      if (!foundPage) {
        console.error("No valid page found in project")
        setError("No valid page found in project")
        setLoading(false)
        return
      }

      setCurrentPage(foundPage)
    } catch (err) {
      console.error("Error rendering project:", err)
      setError("Failed to render project")
    } finally {
      setLoading(false)
    }
  }, [project, pagePath])

  if (loading) {
    return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading page...</span>
        </div>
    )
  }

  if (error) {
    return (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
  }

  if (!currentPage) {
    return (
        <Alert className="m-4">
          <AlertDescription>Page not found</AlertDescription>
        </Alert>
    )
  }

  // Sort components by order index
  const sortedComponents = [...currentPage.components].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
      <div className="project-content">
        {/* Render all components */}
        <div className="components-container">
          {sortedComponents.map((component) => (
              <div key={component.id} className="component-container">
                <ComponentRenderer
                    component={component}
                    onSelectComponent={onSelectComponent}
                    selectedComponentId={selectedComponentId}
                    isEditorMode={isEditorMode}
                />
              </div>
          ))}
        </div>
      </div>
  )
}
