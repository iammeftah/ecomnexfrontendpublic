"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2, Save, ArrowLeft, Undo, Redo, Eye, EyeOff, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { projectService, type Component, type Page, type Project } from "@/services/project-service/projectService"
import EditorSidebar from "./editor-sidebar"
import { EditorStyles } from "./editor-styles"
import { ComponentRenderer } from "./component-renderer"

// Interface for selected element
interface SelectedElement {
    id: string
    type: string
    path: string[]
    content?: string
    styles?: Record<string, string>
}

// Declare global window interface to add our custom properties
declare global {
    interface Window {
        navigateProject?: (path: string) => void
        selectedElementId?: string
    }
}

const ProjectEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPage, setSelectedPage] = useState<string | null>(null)
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [history, setHistory] = useState<Project[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const previewRef = useRef<HTMLDivElement>(null)

    // Function to add project to history
    const addToHistory = (newProject: Project) => {
        const newHistory = [...history.slice(0, historyIndex + 1), newProject]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }

    // Function to undo changes
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1)
            setProject(history[historyIndex - 1])
        }
    }

    // Function to redo changes
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1)
            setProject(history[historyIndex + 1])
        }
    }

    // Function to handle component selection
    const handleSelectComponent = (component: Component) => {
        setSelectedComponent(component)
        setSelectedElement(null)

        // Clear any selected element highlighting
        document.querySelectorAll("[data-selected-element='true']").forEach((el) => {
            el.setAttribute("data-selected-element", "false")
        })

        // Clear the selected element ID in window
        window.selectedElementId = ""
    }

    // Load project data
    useEffect(() => {
        const fetchProject = async () => {
            try {
                if (!id) return

                setLoading(true)
                const data = await projectService.getProjectById(id)

                // Log the project data
                console.log("Project data:", data)

                // Make sure each page has components
                if (data.pages) {
                    for (const page of data.pages) {
                        if (!page.components || page.components.length === 0) {
                            console.log(`Page ${page.id} has no components, fetching them separately`)
                            try {
                                // Fetch components for this page if they're not included
                                const components = await projectService.getComponentsForPage(page.id)
                                page.components = components
                            } catch (err) {
                                console.error(`Failed to fetch components for page ${page.id}:`, err)
                            }
                        }
                    }
                }

                // Process the data to ensure all components have the necessary fields
                if (data.pages) {
                    data.pages.forEach((page) => {
                        if (page.components) {
                            page.components.forEach((component) => {
                                // Ensure properties is a valid JSON string
                                if (!component.properties) {
                                    component.properties = "{}"
                                }

                                // Ensure styles is a valid JSON string
                                if (!component.styles) {
                                    component.styles = "{}"
                                }
                            })
                        }
                    })
                }

                setProject(data)

                // Initialize history
                setHistory([data])
                setHistoryIndex(0)

                // Set default selected page to home page or first page
                const homePage = data.pages.find((page) => page.isHomePage)
                setSelectedPage(homePage?.id || data.pages[0]?.id || null)
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load project")
                toast.error("Failed to load project")
            } finally {
                setLoading(false)
            }
        }

        fetchProject()
    }, [id])

    // Set up element selection handler
    useEffect(() => {
        if (previewMode || !previewRef.current) return

        const handleElementSelection = (e: MouseEvent) => {
            if (previewMode) return

            // Find the closest element with data-element-id
            let target = e.target as HTMLElement

            // Check if we clicked on an element that's already selected
            const isAlreadySelected = target.getAttribute("data-selected-element") === "true"

            // If we're clicking on an already selected element, don't do anything
            // This allows for selecting text within the element for editing
            if (isAlreadySelected) {
                return
            }

            let elementId = target.getAttribute("data-element-id")
            let elementType = target.getAttribute("data-element-type")
            let elementPath = target.getAttribute("data-element-path")

            // Traverse up the DOM to find the closest element with data-element attributes
            while (target && (!elementId || !elementType || !elementPath)) {
                target = target.parentElement as HTMLElement
                if (!target) break

                elementId = target.getAttribute("data-element-id")
                elementType = target.getAttribute("data-element-type")
                elementPath = target.getAttribute("data-element-path")
            }

            if (elementId && elementType && elementPath) {
                e.stopPropagation()
                e.preventDefault()

                // Set the selected element ID in window for reference
                window.selectedElementId = elementId

                // Extract content based on element type
                let content = ""
                if (
                    ["text", "heading", "paragraph", "span", "h1", "h2", "h3", "h4", "h5", "h6", "p", "button", "link"].includes(
                        elementType,
                    )
                ) {
                    content = target.textContent || ""
                }

                // Extract inline styles
                const computedStyle = window.getComputedStyle(target)
                const styles: Record<string, string> = {}

                // Extract important styles
                const styleProperties = [
                    "color",
                    "backgroundColor",
                    "fontSize",
                    "fontWeight",
                    "fontStyle",
                    "textDecoration",
                    "textAlign",
                    "marginTop",
                    "marginRight",
                    "marginBottom",
                    "marginLeft",
                    "paddingTop",
                    "paddingRight",
                    "paddingBottom",
                    "paddingLeft",
                    "width",
                    "height",
                    "borderWidth",
                    "borderStyle",
                    "borderColor",
                    "borderRadius",
                    "boxShadow",
                ]

                styleProperties.forEach((prop) => {
                    const value = computedStyle.getPropertyValue(prop)
                    if (value) {
                        styles[prop] = value
                    }
                })

                // Set the selected element
                setSelectedElement({
                    id: elementId,
                    type: elementType,
                    path: JSON.parse(elementPath),
                    content,
                    styles,
                })

                // Clear component selection when an element is selected
                setSelectedComponent(null)

                // Add selected class to the element
                document.querySelectorAll("[data-selected-element='true']").forEach((el) => {
                    el.setAttribute("data-selected-element", "false")
                })
                target.setAttribute("data-selected-element", "true")

                console.log("Selected element:", {
                    id: elementId,
                    type: elementType,
                    path: JSON.parse(elementPath),
                    content,
                    styles,
                })
            }
        }

        const previewElement = previewRef.current
        previewElement.addEventListener("click", handleElementSelection, true)

        return () => {
            previewElement.removeEventListener("click", handleElementSelection, true)
        }
    }, [previewMode, previewRef.current])

    // Handle element update
    const handleElementUpdate = (
        elementPath: string[],
        updates: { content?: string; styles?: Record<string, string> },
    ) => {
        if (!project || !selectedPage) return

        const updatedProject = { ...project }
        const pageIndex = updatedProject.pages.findIndex((p) => p.id === selectedPage)

        if (pageIndex === -1) return

        // Find the component that contains the element
        const componentIndex = elementPath[0] ? Number.parseInt(elementPath[0]) : -1

        if (componentIndex === -1 || componentIndex >= updatedProject.pages[pageIndex].components.length) return

        const component = updatedProject.pages[pageIndex].components[componentIndex]

        // Get the element type and path
        const elementType = selectedElement?.type || ""
        const elementPathParts = elementPath.slice(1) // Remove component index

        // Update content based on element type and path
        if (updates.content !== undefined) {
            try {
                const properties = JSON.parse(component.properties || "{}")

                // Determine which property to update based on element type and path
                if (elementType === "heading" || elementType === "h1" || elementType === "h2" || elementType === "h3") {
                    // Update heading/title
                    if (properties.heading) {
                        properties.heading.value = updates.content
                    } else if (properties.title) {
                        properties.title.value = updates.content
                    }
                } else if (elementType === "paragraph" || elementType === "p" || elementType === "text") {
                    // Update paragraph/text content
                    if (properties.subheading) {
                        properties.subheading.value = updates.content
                    } else if (properties.content) {
                        properties.content.value = updates.content
                    } else if (properties.text) {
                        properties.text.value = updates.content
                    }
                } else if (elementType === "button") {
                    // Update button text
                    if (properties.buttonText) {
                        properties.buttonText.value = updates.content
                    }
                } else if (elementType === "link") {
                    // Update link text
                    if (properties.linkText) {
                        properties.linkText.value = updates.content
                    }
                } else {
                    // For other elements or if specific property not found
                    // Try to find a suitable property based on common naming patterns
                    const contentProperty = Object.keys(properties).find(
                        (key) =>
                            key === "content" ||
                            key === "text" ||
                            key === "title" ||
                            key === "heading" ||
                            key === "subheading" ||
                            key === "buttonText" ||
                            key === "linkText",
                    )

                    if (contentProperty) {
                        properties[contentProperty].value = updates.content
                    }
                }

                component.properties = JSON.stringify(properties)
                console.log("Updated component properties:", properties)
            } catch (error) {
                console.error("Error updating element content:", error)
            }
        }

        // Update styles
        if (updates.styles) {
            try {
                const styles = JSON.parse(component.styles || "{}")

                // For now, we'll just update the component's global styles
                // In a more advanced implementation, you would update styles for specific elements
                Object.assign(styles, updates.styles)

                component.styles = JSON.stringify(styles)
            } catch (error) {
                console.error("Error updating element styles:", error)
            }
        }

        updatedProject.pages[pageIndex].components[componentIndex] = component
        setProject(updatedProject)

        // Add to history
        addToHistory(updatedProject)
    }

    // Update component properties
    const handleUpdateComponent = (updatedComponent: Component) => {
        if (!project || !selectedPage) return

        const updatedProject = { ...project }
        const pageIndex = updatedProject.pages.findIndex((p) => p.id === selectedPage)

        if (pageIndex === -1) return

        const componentIndex = updatedProject.pages[pageIndex].components.findIndex((c) => c.id === updatedComponent.id)

        if (componentIndex === -1) return

        updatedProject.pages[pageIndex].components[componentIndex] = updatedComponent
        setProject(updatedProject)

        // Add to history
        addToHistory(updatedProject)
    }

    // Save project changes
    const handleSave = async () => {
        if (!project) return

        setIsSaving(true)
        try {
            // Before saving, ensure all components have valid properties and styles
            const updatedProject = { ...project }

            updatedProject.pages.forEach((page) => {
                page.components.forEach((component) => {
                    // Make sure properties is a valid JSON string
                    try {
                        JSON.parse(component.properties)
                    } catch (e) {
                        console.warn(`Invalid properties JSON for component ${component.id}, resetting`)
                        component.properties = "{}"
                    }

                    // Make sure styles is a valid JSON string
                    try {
                        JSON.parse(component.styles)
                    } catch (e) {
                        console.warn(`Invalid styles JSON for component ${component.id}, resetting`)
                        component.styles = "{}"
                    }
                })
            })

            await projectService.updateProject(project.id, updatedProject)
            toast.success("Project saved successfully")
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save project")
        } finally {
            setIsSaving(false)
        }
    }

    // Handle page change
    const handlePageChange = (pageId: string) => {
        setSelectedPage(pageId)
        setSelectedComponent(null)
        setSelectedElement(null)

        // Clear any selected element highlighting
        document.querySelectorAll("[data-selected-element='true']").forEach((el) => {
            el.setAttribute("data-selected-element", "false")
        })

        // Clear the selected element ID in window
        window.selectedElementId = ""
    }

    // Get current page
    const getCurrentPage = (): Page | undefined => {
        if (!project || !selectedPage) return undefined
        return project.pages.find((page) => page.id === selectedPage)
    }

    // Duplicate a component
    const handleDuplicateComponent = (componentId: string) => {
        if (!project || !selectedPage) return

        const updatedProject = { ...project }
        const pageIndex = updatedProject.pages.findIndex((p) => p.id === selectedPage)

        if (pageIndex === -1) return

        const componentIndex = updatedProject.pages[pageIndex].components.findIndex((c) => c.id === componentId)

        if (componentIndex === -1) return

        // Create a copy of the component with a new ID
        const originalComponent = updatedProject.pages[pageIndex].components[componentIndex]
        const duplicatedComponent = {
            ...JSON.parse(JSON.stringify(originalComponent)),
            id: `${originalComponent.id}-copy-${Date.now()}`,
            orderIndex: originalComponent.orderIndex + 1,
        }

        // Insert the duplicated component after the original
        updatedProject.pages[pageIndex].components.splice(componentIndex + 1, 0, duplicatedComponent)

        // Update order indices for all components after the duplicated one
        for (let i = componentIndex + 2; i < updatedProject.pages[pageIndex].components.length; i++) {
            updatedProject.pages[pageIndex].components[i].orderIndex = i
        }

        setProject(updatedProject)
        addToHistory(updatedProject)
        toast.success("Component duplicated")
    }

    // Delete a component
    const handleDeleteComponent = (componentId: string) => {
        if (!project || !selectedPage) return

        const updatedProject = { ...project }
        const pageIndex = updatedProject.pages.findIndex((p) => p.id === selectedPage)

        if (pageIndex === -1) return

        const componentIndex = updatedProject.pages[pageIndex].components.findIndex((c) => c.id === componentId)

        if (componentIndex === -1) return

        // Remove the component
        updatedProject.pages[pageIndex].components.splice(componentIndex, 1)

        // Update order indices
        for (let i = componentIndex; i < updatedProject.pages[pageIndex].components.length; i++) {
            updatedProject.pages[pageIndex].components[i].orderIndex = i
        }

        setProject(updatedProject)
        setSelectedComponent(null)
        setSelectedElement(null)
        addToHistory(updatedProject)
        toast.success("Component deleted")
    }

    // Move a component up
    const handleMoveComponentUp = (componentId: string) => {
        if (!project || !selectedPage) return

        const updatedProject = { ...project }
        const pageIndex = updatedProject.pages.findIndex((p) => p.id === selectedPage)

        if (pageIndex === -1) return

        const componentIndex = updatedProject.pages[pageIndex].components.findIndex((c) => c.id === componentId)

        if (componentIndex <= 0) return // Already at the top

        // Swap with the component above
        const temp = updatedProject.pages[pageIndex].components[componentIndex - 1]
        updatedProject.pages[pageIndex].components[componentIndex - 1] =
            updatedProject.pages[pageIndex].components[componentIndex]
        updatedProject.pages[pageIndex].components[componentIndex] = temp

        // Update order indices
        updatedProject.pages[pageIndex].components[componentIndex - 1].orderIndex = componentIndex - 1
        updatedProject.pages[pageIndex].components[componentIndex].orderIndex = componentIndex

        setProject(updatedProject)
        addToHistory(updatedProject)
    }

    // Move a component down
    const handleMoveComponentDown = (componentId: string) => {
        if (!project || !selectedPage) return

        const updatedProject = { ...project }
        const pageIndex = updatedProject.pages.findIndex((p) => p.id === selectedPage)

        if (pageIndex === -1) return

        const componentIndex = updatedProject.pages[pageIndex].components.findIndex((c) => c.id === componentId)

        if (componentIndex === -1 || componentIndex >= updatedProject.pages[pageIndex].components.length - 1) return // Already at the bottom

        // Swap with the component below
        const temp = updatedProject.pages[pageIndex].components[componentIndex + 1]
        updatedProject.pages[pageIndex].components[componentIndex + 1] =
            updatedProject.pages[pageIndex].components[componentIndex]
        updatedProject.pages[pageIndex].components[componentIndex] = temp

        // Update order indices
        updatedProject.pages[pageIndex].components[componentIndex + 1].orderIndex = componentIndex + 1
        updatedProject.pages[pageIndex].components[componentIndex].orderIndex = componentIndex

        setProject(updatedProject)
        addToHistory(updatedProject)
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
                <h2 className="text-2xl font-bold mb-4">Error Loading Project</h2>
                <p className="text-red-500 mb-4">{error || "Project not found"}</p>
                <Button onClick={() => navigate("/templates")}>Back to Templates</Button>
            </div>
        )
    }

    const currentPage = getCurrentPage()

    // Sort components by order index to ensure correct rendering order
    const sortedComponents = currentPage?.components
        ? [...currentPage.components].sort((a, b) => a.orderIndex - b.orderIndex)
        : []

    return (
        <div className="flex flex-col h-screen">
            <EditorStyles />
            {/* Header */}
            <header className="border-b bg-background z-10">
                <div className="container flex items-center justify-between h-16 px-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/client/dashboard")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-semibold">{project.name}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleUndo()} disabled={historyIndex <= 0}>
                            <Undo className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRedo()}
                            disabled={historyIndex >= history.length - 1}
                        >
                            <Redo className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setPreviewMode(!previewMode)}>
                            {previewMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="gap-1">
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                </div>
            </header>

            {/* Page Tabs */}
            <div className="border-b bg-background">
                <div className="container px-4">
                    <Tabs value={selectedPage || ""} onValueChange={handlePageChange} className="w-full">
                        <TabsList className="h-10">
                            {project.pages.map((page) => (
                                <TabsTrigger key={page.id} value={page.id} className="flex items-center gap-1">
                                    {page.isHomePage && <Home className="h-3 w-3" />}
                                    {page.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor Sidebar - only show when not in preview mode */}
                {!previewMode && (
                    <div className="w-80 border-r bg-background overflow-y-auto">
                        <EditorSidebar
                            component={selectedComponent}
                            onUpdate={handleUpdateComponent}
                            currentPage={currentPage}
                            onDuplicate={handleDuplicateComponent}
                            onDelete={handleDeleteComponent}
                            onMoveUp={handleMoveComponentUp}
                            onMoveDown={handleMoveComponentDown}
                            selectedElement={selectedElement}
                            onElementUpdate={handleElementUpdate}
                        />
                    </div>
                )}

                {/* Preview Area */}
                <div ref={previewRef} className={`flex-1 overflow-auto ${previewMode ? "w-full" : ""}`}>
                    {currentPage && (
                        <div className="p-4 h-full">
                            <div className="bg-white rounded-lg shadow-sm border h-full overflow-auto">
                                {sortedComponents.map((component, index) => (
                                    <div key={component.id} className="component-container">
                                        <div
                                            className={`component-wrapper ${selectedComponent?.id === component.id ? "selected-component" : ""}`}
                                            onClick={(e) => {
                                                if (!previewMode) {
                                                    e.stopPropagation()
                                                    handleSelectComponent(component)
                                                    setSelectedElement(null)
                                                }
                                            }}
                                        >
                                            {!previewMode && selectedComponent?.id === component.id && (
                                                <div className="component-label">{component.type}</div>
                                            )}
                                            <div className="component-content">
                                                <ComponentRenderer
                                                    component={component}
                                                    isEditorMode={!previewMode}
                                                    selectedComponentId={selectedComponent?.id}
                                                    onSelectComponent={!previewMode ? handleSelectComponent : undefined}
                                                    componentIndex={index}
                                                    selectedElementId={selectedElement?.id}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProjectEditor
