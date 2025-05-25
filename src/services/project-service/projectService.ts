import api from "../api"

// Define types
export interface Component {
    id: string
    type: string
    properties: string
    styles: string
    rawCode: string
    jsxContent: string
    orderIndex: number
    isCustom: boolean
    originalTemplateComponentId?: string
}

export interface Page {
    id: string
    name: string
    path: string
    components: Component[]
    isHomePage: boolean
    originalTemplatePageId?: string
    version?: number // Add version for optimistic locking
}

export interface Project {
    id: string
    name: string
    userId: string
    userTier: string
    templateId: string
    pages: Page[]
    createdAt: string
    lastModified: string
    componentCount: number
    version?: number // Add version for optimistic locking
}

export interface TierLimitResponse {
    allowed: boolean
    tier: string
    maxPages: number
    currentPages: number
    message: string
}

class ProjectService {
    private apiUrl = "/api/projects"

    async createProject(templateId: string, name: string): Promise<Project> {
        try {
            console.log(`Creating project with templateId: ${templateId}, name: ${name}`)
            // Log the token being used
            const token = localStorage.getItem("auth_token")
            console.log("Token available:", !!token)
            if (token) {
                console.log("Token first 15 chars:", token.substring(0, 15) + "...")
            }

            const response = await api.post<Project>(this.apiUrl, {
                templateId,
                name,
            })

            // Log the response to see what's coming back
            console.log("Project created successfully:", response.data)
            console.log("Pages received:", response.data.pages?.length || 0)

            // Check if pages have components
            if (response.data.pages && response.data.pages.length > 0) {
                response.data.pages.forEach((page, index) => {
                    console.log(`Page ${index + 1} (${page.name}): ${page.components?.length || 0} components`)
                    if (page.components && page.components.length > 0) {
                        console.log(`First component type: ${page.components[0].type}`)
                        console.log(`First component has properties: ${!!page.components[0].properties}`)
                        console.log(`First component has styles: ${!!page.components[0].styles}`)
                        console.log(`First component has JSX content: ${!!page.components[0].jsxContent}`)
                    }
                })
            } else {
                console.warn("No pages or empty pages array received from server")
            }

            return response.data
        } catch (error) {
            console.error("Error creating project:", error)
            throw error
        }
    }

    // Get a project by ID with enhanced logging
    async getProjectById(id: string): Promise<Project> {
        try {
            console.log(`Fetching project with ID: ${id}`)
            const response = await api.get<Project>(`${this.apiUrl}/${id}`)

            // Log the response to debug
            console.log("Project fetched successfully:", response.data)
            console.log("Pages received:", response.data.pages?.length || 0)

            // Check if pages have components
            if (response.data.pages && response.data.pages.length > 0) {
                response.data.pages.forEach((page, index) => {
                    console.log(`Page ${index + 1} (${page.name}): ${page.components?.length || 0} components`)
                    if (page.components && page.components.length > 0) {
                        console.log(`First component type: ${page.components[0].type}`)
                        console.log(`First component has properties: ${!!page.components[0].properties}`)
                        console.log(`First component has styles: ${!!page.components[0].styles}`)
                        console.log(`First component has JSX content: ${!!page.components[0].jsxContent}`)
                    }
                })
            } else {
                console.warn("No pages or empty pages array received from server")
            }

            return response.data
        } catch (error) {
            console.error(`Error fetching project with ID ${id}:`, error)
            throw error
        }
    }

    // Get all projects for the current user
    async getProjects(): Promise<Project[]> {
        try {
            const response = await api.get<Project[]>(this.apiUrl)
            return response.data
        } catch (error) {
            console.error("Error fetching projects:", error)
            throw error
        }
    }

    // Get recent projects for the current user
    async getRecentProjects(limit = 5): Promise<Project[]> {
        try {
            const response = await api.get<Project[]>(`${this.apiUrl}/recent?limit=${limit}`)
            return response.data
        } catch (error) {
            console.error("Error fetching recent projects:", error)
            throw error
        }
    }

    // Update a project with retry logic for concurrency issues
    async updateProject(projectId: string, project: Project): Promise<Project> {
        const maxRetries = 3
        let retryCount = 0
        let lastError = null

        while (retryCount < maxRetries) {
            try {
                console.log(`Updating project with ID ${projectId} (attempt ${retryCount + 1})`)
                const response = await api.put<Project>(`${this.apiUrl}/${projectId}`, project)
                console.log("Project updated successfully")
                return response.data
            } catch (error: any) {
                lastError = error
                console.error(`Error updating project (attempt ${retryCount + 1}):`, error)

                // Check if it's a concurrency error
                if (error.response?.data?.error?.includes("Row was updated or deleted by another transaction")) {
                    console.log("Detected concurrency issue, fetching latest version...")

                    try {
                        // Get the latest version of the project
                        const latestProject = await this.getProjectById(projectId)

                        // Merge our changes with the latest version
                        project.version = latestProject.version

                        // For each page, update the version
                        if (project.pages && latestProject.pages) {
                            project.pages.forEach(page => {
                                const latestPage = latestProject.pages.find(p => p.id === page.id)
                                if (latestPage) {
                                    page.version = latestPage.version
                                }
                            })
                        }

                        console.log("Retrieved latest version, retrying update...")
                        retryCount++
                        continue
                    } catch (fetchError) {
                        console.error("Error fetching latest project version:", fetchError)
                        throw error // Throw the original error
                    }
                }

                // If it's not a concurrency error or we couldn't resolve it, throw the error
                throw error
            }
        }

        // If we've exhausted all retries
        console.error(`Failed to update project after ${maxRetries} attempts`)
        throw lastError
    }

    // Delete a project
    async deleteProject(projectId: string): Promise<void> {
        try {
            await api.delete(`${this.apiUrl}/${projectId}`)
        } catch (error) {
            console.error(`Error deleting project with ID ${projectId}:`, error)
            throw error
        }
    }

    // Check if a template can be used to create a project
    async checkTemplateAccess(templateId: string): Promise<TierLimitResponse> {
        try {
            const response = await api.get<TierLimitResponse>(`${this.apiUrl}/check-template/${templateId}`)
            return response.data
        } catch (error) {
            console.error(`Error checking template access for template ID ${templateId}:`, error)
            throw error
        }
    }

    // Inside the ProjectService class, add this method:
    async getComponentsForPage(pageId: string): Promise<Component[]> {
        try {
            console.log(`Fetching components for page ID: ${pageId}`)
            const response = await api.get<Component[]>(`${this.apiUrl}/pages/${pageId}/components`)

            // Log the response to debug
            console.log(`Received ${response.data.length} components for page ${pageId}`)

            return response.data
        } catch (error) {
            console.error(`Error fetching components for page ${pageId}:`, error)
            throw error
        }
    }

    // Helper methods for UI
    getProjectSummary(project: Project): string {
        return `${project.pages.length} pages · ${project.componentCount} components`
    }

    getProjectColor(project: Project): string {
        // Assign a border color based on name hash for visual distinction
        const hash = project.name.split("").reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc)
        }, 0)

        const colors = [
            "border-blue-400",
            "border-green-400",
            "border-purple-400",
            "border-yellow-400",
            "border-pink-400",
            "border-indigo-400",
            "border-red-400",
            "border-orange-400",
            "border-teal-400",
        ]

        return colors[Math.abs(hash) % colors.length]
    }
}

export const projectService = new ProjectService()

// Add this to the global Window interface
declare global {
    interface Window {
        navigateProject?: (path: string) => void
        Babel?: any
    }
}
