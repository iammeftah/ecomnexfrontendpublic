import type React from "react"
import { ComponentRenderer } from "./component-renderer"
import type { Page } from "@/services/template-service/templateService"

interface PageRendererProps {
    page: Page
    containerClassName?: string
}

export const PageRenderer: React.FC<PageRendererProps> = ({ page, containerClassName = "page-container" }) => {
    if (!page || !page.components || page.components.length === 0) {
        return (
            <div className="p-8 text-center text-neutral-500">
                <h2 className="text-xl font-medium mb-2">Empty Page</h2>
                <p>This page has no components to display.</p>
            </div>
        )
    }

    // Sort components by orderIndex
    const sortedComponents = [...page.components].sort((a, b) => a.orderIndex - b.orderIndex)

    return (
        <div className={containerClassName}>
            {sortedComponents.map((component) => (
                <div key={component.id} className="component-wrapper">
                    <ComponentRenderer rawCode={component.rawCode} properties={component.properties} />
                </div>
            ))}
        </div>
    )
}
