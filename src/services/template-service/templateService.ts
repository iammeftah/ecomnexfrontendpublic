// templateService.ts

import { authService } from "../auth-service/authService"

import vitrinePreview from "../../assets/screenshots/templates/vitrine.png"

const API_URL = "http://localhost:9090"

export interface Template {
    id: string
    name: string
    description: string
    content: string
    pages: Page[]
    isDefault: boolean  // Frontend property name (matches DTO getters in Java)
    isActive: boolean   // Frontend property name (matches DTO getters in Java)
    createdAt: string
    version?: number
}

export interface Page {
    id: string
    name: string
    path: string
    components: Component[]
    isHomePage: boolean
    version?: number
}

export interface Component {
    id: string
    type: string
    properties: string
    styles?: string
    rawCode?: string
    jsxContent?: string
    orderIndex: number
    isCustom: boolean
    version?: number
}

class TemplateService {
    /**
     * Gets all templates from the server
     */
    async getTemplates(): Promise<Template[]> {
        console.log("Fetching all templates...")
        const token = authService.getToken()
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
            console.log("Using authenticated request")
        }

        try {
            const response = await fetch(`${API_URL}/api/templates`, {
                method: "GET",
                headers,
            })

            console.log("Templates response status:", response.status)

            if (!response.ok) {
                throw new Error(`Failed to fetch templates: ${response.status}`)
            }

            const templates = await response.json()
            console.log(`Fetched ${templates.length} templates`)
            return templates.map(template => this.normalizeTemplateResponse(template))
        } catch (error) {
            console.error("Error fetching templates:", error)
            throw error
        }
    }

    /**
     * Gets active templates only
     */
    async getActiveTemplates(): Promise<Template[]> {
        console.log("Fetching active templates...")
        const token = authService.getToken()
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        try {
            const response = await fetch(`${API_URL}/api/templates/active`, {
                method: "GET",
                headers,
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch active templates: ${response.status}`)
            }

            const templates = await response.json()
            console.log(`Fetched ${templates.length} active templates`)
            return templates.map(template => this.normalizeTemplateResponse(template))
        } catch (error) {
            console.error("Error fetching active templates:", error)
            throw error
        }
    }

    /**
     * Gets default templates only
     */
    async getDefaultTemplates(): Promise<Template[]> {
        console.log("Fetching default templates...")
        const token = authService.getToken()
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        try {
            const response = await fetch(`${API_URL}/api/templates/default`, {
                method: "GET",
                headers,
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch default templates: ${response.status}`)
            }

            const templates = await response.json()
            console.log(`Fetched ${templates.length} default templates`)
            return templates.map(template => this.normalizeTemplateResponse(template))
        } catch (error) {
            console.error("Error fetching default templates:", error)
            throw error
        }
    }

    /**
     * Gets public templates (active templates available to all users)
     */
    async getPublicTemplates(): Promise<Template[]> {
        console.log("Fetching public templates...")
        try {
            const response = await fetch(`${API_URL}/api/templates/public`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            console.log("Public templates response status:", response.status)

            if (!response.ok) {
                throw new Error(`Failed to fetch public templates: ${response.status}`)
            }

            const templates = await response.json()
            console.log(`Fetched ${templates.length} public templates`)
            return templates.map(template => this.normalizeTemplateResponse(template))
        } catch (error) {
            console.error("Error fetching public templates:", error)
            throw error
        }
    }

    /**
     * Gets a specific template by ID
     */
    async getTemplateById(id: string): Promise<Template> {
        console.log(`Fetching template with ID: ${id}`)
        const token = authService.getToken()
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        try {
            const response = await fetch(`${API_URL}/api/templates/${id}`, {
                method: "GET",
                headers,
            })

            console.log(`Template ${id} response status:`, response.status)

            if (!response.ok) {
                throw new Error(`Failed to fetch template: ${response.status}`)
            }

            const template = await response.json()
            console.log("Template fetched successfully:", template.name)
            return this.normalizeTemplateResponse(template)
        } catch (error) {
            console.error(`Error fetching template ${id}:`, error)
            throw error
        }
    }

    /**
     * Creates a new template
     */
    async createTemplate(templateData: Partial<Template>): Promise<Template> {
        console.log("Creating new template:", templateData.name)
        const token = authService.getToken()

        if (!token) {
            throw new Error("Authentication required to create templates")
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }

        try {
            // Format template data to match backend expectations
            const formattedData = this.formatTemplateData(templateData)
            console.log("Formatted template data for creation:", JSON.stringify(formattedData, null, 2))

            const response = await fetch(`${API_URL}/api/templates`, {
                method: "POST",
                headers,
                body: JSON.stringify(formattedData),
            })

            console.log("Create template response status:", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Failed to create template: ${response.status} - ${errorText}`)
            }

            const createdTemplate = await response.json()
            console.log("Template created successfully:", createdTemplate.id)
            return this.normalizeTemplateResponse(createdTemplate)
        } catch (error) {
            console.error("Error creating template:", error)
            throw error
        }
    }

    /**
     * Updates an existing template
     */
    async updateTemplate(id: string, templateData: Partial<Template>): Promise<Template> {
        console.log(`Updating template with ID: ${id}`)
        console.log("Update data:", templateData)
        const token = authService.getToken()

        if (!token) {
            throw new Error("Authentication required to update templates")
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }

        try {
            // Get the existing template first to ensure we have the full data
            const existingTemplate = await this.getTemplateById(id);

            // Prepare the data to update, keeping non-updated fields from existing template
            const dataToUpdate = {
                ...existingTemplate,
                ...templateData
            };

            // Format the template data for backend
            const formattedData = this.formatTemplateDataForBackend(dataToUpdate)

            // Log the request
            console.log(`Making PUT request to: ${API_URL}/api/templates/${id}`)
            console.log("Request data:", JSON.stringify({
                id: formattedData.id,
                name: formattedData.name,
                isActive: formattedData.active,
                isDefault: formattedData.default
            }, null, 2))

            const response = await fetch(`${API_URL}/api/templates/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(formattedData),
            })

            console.log(`Update template ${id} response status:`, response.status)

            if (!response.ok) {
                // Try to get more detailed error information
                const errorText = await response.text()
                console.error("Error response body:", errorText)
                throw new Error(`Failed to update template: ${response.status} - ${errorText}`)
            }

            const updatedTemplate = await response.json()
            console.log("Template updated successfully:", updatedTemplate.name)

            // Ensure the updated template has the expected structure
            return this.normalizeTemplateResponse(updatedTemplate)
        } catch (error) {
            console.error(`Error updating template ${id}:`, error)
            throw error
        }
    }

    /**
     * Deletes a template
     */
    async deleteTemplate(id: string): Promise<void> {
        console.log(`Deleting template with ID: ${id}`)
        const token = authService.getToken()

        if (!token) {
            throw new Error("Authentication required to delete templates")
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }

        try {
            const response = await fetch(`${API_URL}/api/templates/${id}`, {
                method: "DELETE",
                headers,
            })

            console.log(`Delete template ${id} response status:`, response.status)

            if (!response.ok) {
                throw new Error(`Failed to delete template: ${response.status}`)
            }

            console.log("Template deleted successfully")
        } catch (error) {
            console.error(`Error deleting template ${id}:`, error)
            throw error
        }
    }

    // Helper function to get a color for different template types
    getTemplateColor(template: Template): string {
        if (template.isDefault && template.isActive) {
            return "bg-blue-100 border-blue-500" // Default and active
        } else if (template.isDefault) {
            return "bg-purple-100 border-purple-500" // Default only
        } else if (template.isActive) {
            return "bg-green-100 border-green-500" // Active only
        }
        return "bg-gray-100 border-gray-500" // Neither
    }

    // Get a preview image (placeholder for now)
    getTemplatePreviewImage(template: Template): string {
        // For placeholder
        return vitrinePreview;
    }

    // Get summary of pages count and status
    getTemplateSummary(template: Template): string {
        const pageCount = template.pages?.length || 0
        const componentCount = template.pages?.reduce((total, page) => total + (page.components?.length || 0), 0) || 0
        const activeStatus = template.isActive ? "Active" : "Inactive"
        return `${pageCount} pages, ${componentCount} components, ${activeStatus}`
    }

    /**
     * Normalizes the template response from the server to match our frontend interface
     */
    private normalizeTemplateResponse(template: any): Template {
        if (!template) {
            throw new Error("Template data is missing or invalid")
        }

        // Handle pages
        const pages: Page[] = Array.isArray(template.pages)
            ? template.pages.map((page) => this.normalizePage(page))
            : []

        // Map backend properties (active, default) to frontend properties (isActive, isDefault)
        return {
            id: template.id || this.generateId(),
            name: template.name || "Unnamed Template",
            description: template.description || "",
            content: typeof template.content === "string" ? template.content : JSON.stringify(template.content || {}),
            pages,
            // Convert the backend fields to our frontend properties
            isDefault: this.normalizeBoolean(template.default !== undefined ? template.default : template.isDefault),
            isActive: this.normalizeBoolean(template.active !== undefined ? template.active : template.isActive),
            createdAt: template.createdAt || new Date().toISOString(),
            version: template.version || 0,
        }
    }

    // Helper to normalize boolean values
    private normalizeBoolean(value: any): boolean {
        // Handle all possible representations of true
        if (value === true || value === 'true' || value === 1 || value === '1') {
            return true;
        }
        // Everything else is false
        return false;
    }

    // Normalize page data
    private normalizePage(page: any): Page {
        if (!page) {
            return {
                id: this.generateId(),
                name: "Unnamed Page",
                path: "/",
                components: [],
                isHomePage: false,
            }
        }

        // Ensure components is an array
        const components: Component[] = Array.isArray(page.components)
            ? page.components.map((component) => this.normalizeComponent(component))
            : []

        // Map backend homePage to frontend isHomePage
        const isHomePage = this.normalizeBoolean(
            page.homePage !== undefined ? page.homePage : page.isHomePage
        );

        return {
            id: page.id || this.generateId(),
            name: page.name || "Unnamed Page",
            path: page.path || "/",
            components,
            isHomePage,
            version: page.version || 0,
        }
    }

    // Normalize component data
    private normalizeComponent(component: any): Component {
        if (!component) {
            return {
                id: this.generateId(),
                type: "Component",
                properties: "{}",
                orderIndex: 0,
                isCustom: false,
            }
        }

        // Map backend custom to frontend isCustom
        const isCustom = this.normalizeBoolean(
            component.custom !== undefined ? component.custom : component.isCustom
        );

        return {
            id: component.id || this.generateId(),
            type: component.type || "Component",
            properties:
                typeof component.properties === "string" ? component.properties : JSON.stringify(component.properties || {}),
            styles: component.styles
                ? typeof component.styles === "string"
                    ? component.styles
                    : JSON.stringify(component.styles)
                : undefined,
            rawCode: component.rawCode,
            jsxContent: component.jsxContent,
            orderIndex: component.orderIndex || 0,
            isCustom,
            version: component.version || 0,
        }
    }

    /**
     * Formats template data for API requests, maintaining frontend property names
     */
    private formatTemplateData(templateData: Partial<Template>): any {
        // Create a deep copy to avoid modifying the original
        const formattedData = JSON.parse(JSON.stringify(templateData));

        // Format content as JSON string if needed
        if (formattedData.content) {
            if (typeof formattedData.content !== "string") {
                try {
                    formattedData.content = JSON.stringify(formattedData.content)
                } catch (e) {
                    console.error("Error stringifying template content:", e)
                    formattedData.content = JSON.stringify({
                        theme: "default",
                        primaryColor: "#3b82f6",
                        secondaryColor: "#f59e0b",
                    })
                }
            }
        } else if (formattedData.content === undefined) {
            formattedData.content = JSON.stringify({
                theme: "default",
                primaryColor: "#3b82f6",
                secondaryColor: "#f59e0b",
            })
        }

        // Format pages and components
        if (formattedData.pages) {
            formattedData.pages = formattedData.pages.map((page: any) => {
                // Process page properties
                const formattedPage = { ...page };

                // Handle components
                if (formattedPage.components) {
                    formattedPage.components = formattedPage.components.map((component: any) => {
                        const formattedComponent = { ...component };

                        // Process properties
                        if (component.properties) {
                            formattedComponent.properties = typeof component.properties === "string"
                                ? component.properties
                                : JSON.stringify(component.properties);
                        } else {
                            formattedComponent.properties = "{}";
                        }

                        // Process styles
                        if (component.styles) {
                            formattedComponent.styles = typeof component.styles === "string"
                                ? component.styles
                                : JSON.stringify(component.styles);
                        }

                        return formattedComponent;
                    });
                }

                return formattedPage;
            });
        }

        return formattedData;
    }

    /**
     * Converts template data from frontend to backend format
     * Maps isActive → active, isDefault → default, isHomePage → homePage, isCustom → custom
     */
    private formatTemplateDataForBackend(templateData: Partial<Template>): any {
        // Create a deep copy to avoid modifying the original
        const formattedData: any = JSON.parse(JSON.stringify(templateData));

        // Map frontend property names to backend property names
        if (formattedData.isActive !== undefined) {
            formattedData.active = this.normalizeBoolean(formattedData.isActive);
            delete formattedData.isActive;
        }

        if (formattedData.isDefault !== undefined) {
            formattedData.default = this.normalizeBoolean(formattedData.isDefault);
            delete formattedData.isDefault;
        }

        // Process pages
        if (formattedData.pages) {
            formattedData.pages = formattedData.pages.map((page: any) => {
                const formattedPage: any = { ...page };

                // Map isHomePage to homePage
                if (formattedPage.isHomePage !== undefined) {
                    formattedPage.homePage = this.normalizeBoolean(formattedPage.isHomePage);
                    delete formattedPage.isHomePage;
                }

                // Process components
                if (formattedPage.components) {
                    formattedPage.components = formattedPage.components.map((component: any) => {
                        const formattedComponent: any = { ...component };

                        // Map isCustom to custom
                        if (formattedComponent.isCustom !== undefined) {
                            formattedComponent.custom = this.normalizeBoolean(formattedComponent.isCustom);
                            delete formattedComponent.isCustom;
                        }

                        // Ensure properties is a string
                        if (formattedComponent.properties && typeof formattedComponent.properties !== 'string') {
                            formattedComponent.properties = JSON.stringify(formattedComponent.properties);
                        }

                        // Ensure styles is a string if present
                        if (formattedComponent.styles && typeof formattedComponent.styles !== 'string') {
                            formattedComponent.styles = JSON.stringify(formattedComponent.styles);
                        }

                        return formattedComponent;
                    });
                }

                return formattedPage;
            });
        }

        // Format content as JSON string if needed
        if (formattedData.content && typeof formattedData.content !== 'string') {
            formattedData.content = JSON.stringify(formattedData.content);
        }

        return formattedData;
    }

    private generateId(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0
            const v = c === "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    // Validate template data before saving
    validateTemplateData(templateData: Partial<Template>): { valid: boolean; errors: string[] } {
        const errors: string[] = []

        // Check required fields
        if (!templateData.name) {
            errors.push("Template name is required")
        }

        // Validate content is valid JSON
        if (templateData.content) {
            try {
                if (typeof templateData.content === "string") {
                    JSON.parse(templateData.content)
                }
            } catch (e) {
                errors.push("Template content must be valid JSON")
            }
        }

        // Validate pages
        if (templateData.pages) {
            templateData.pages.forEach((page, index) => {
                if (!page.name) {
                    errors.push(`Page ${index + 1} must have a name`)
                }
                if (!page.path) {
                    errors.push(`Page ${index + 1} must have a path`)
                }

                // Validate components
                if (page.components) {
                    page.components.forEach((component, compIndex) => {
                        if (!component.type) {
                            errors.push(`Component ${compIndex + 1} on page "${page.name}" must have a type`)
                        }

                        // Validate properties is valid JSON
                        if (component.properties) {
                            try {
                                if (typeof component.properties === "string") {
                                    JSON.parse(component.properties)
                                }
                            } catch (e) {
                                errors.push(`Component ${compIndex + 1} on page "${page.name}" has invalid properties JSON`)
                            }
                        }

                        // Validate styles is valid JSON if present
                        if (component.styles) {
                            try {
                                if (typeof component.styles === "string") {
                                    JSON.parse(component.styles)
                                }
                            } catch (e) {
                                errors.push(`Component ${compIndex + 1} on page "${page.name}" has invalid styles JSON`)
                            }
                        }
                    })
                }
            })
        }

        return {
            valid: errors.length === 0,
            errors,
        }
    }
}

export const templateService = new TemplateService()
