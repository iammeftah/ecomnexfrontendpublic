"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Component, Page, Template } from "@/services/template-service/templateService"
import { templateRendererService } from "@/services/template-service/template-renderer-service"
import { ComponentRenderer } from "./component-renderer"
import {
    extractTailwindClasses,
    extractPropValues,
    mapToTailwindColorClass,
    mapToTailwindTextAlignClass,
} from "@/utils/tailwind-mapper"

interface TemplateRendererProps {
    template: Template
    pagePath?: string
    containerClassName?: string
}

export const TemplateRenderer = ({ template, pagePath, containerClassName = "" }: TemplateRendererProps) => {
    const [page, setPage] = useState<Page | null>(null)
    const [components, setComponents] = useState<Component[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Update the page whenever pagePath changes
    useEffect(() => {
        try {
            setLoading(true)
            setError(null)

            console.log(`TemplateRenderer: Trying to find page for path: ${pagePath}`)

            // Get the page from the template
            let foundPage: Page | null = null

            // First, try to get the page by the specified path
            if (pagePath) {
                foundPage = templateRendererService.getPage(template, pagePath)
                if (foundPage) {
                    console.log(`TemplateRenderer: Found page by path: ${pagePath}`, foundPage.name)
                } else {
                    console.log(`TemplateRenderer: No page found for path: ${pagePath}`)
                }
            }

            // If no page found by path or no path provided, get the home page
            if (!foundPage) {
                foundPage = templateRendererService.getHomePage(template)
                if (foundPage) {
                    console.log(`TemplateRenderer: Using home page: ${foundPage.name}`)
                }
            }

            if (!foundPage) {
                console.error("No valid page found in template")
                setError("No valid page found in template")
                setLoading(false)
                return
            }

            setPage(foundPage)

            // Get ordered components
            const orderedComponents = templateRendererService.getOrderedComponents(foundPage)
            setComponents(orderedComponents)
        } catch (err) {
            console.error("Error rendering template:", err)
            setError("Failed to render template")
        } finally {
            setLoading(false)
        }
    }, [template, pagePath])

    if (loading) {
        return (
            <div className={`space-y-4 p-4 ${containerClassName}`}>
                <MacDeviceFrame isLoading>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </MacDeviceFrame>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`p-4 ${containerClassName}`}>
                <MacDeviceFrame>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </MacDeviceFrame>
            </div>
        )
    }

    if (!page) {
        return (
            <div className={`p-4 ${containerClassName}`}>
                <MacDeviceFrame>
                    <Alert>
                        <AlertDescription>Page not found</AlertDescription>
                    </Alert>
                </MacDeviceFrame>
            </div>
        )
    }

    return (
        <div className={containerClassName}>
            <MacDeviceFrame url={`https://ecomnex.softnex.ma${page.path}`}>
                <div className="overflow-auto">
                    {components.map((component) => {
                        // Parse component properties
                        let props = {}
                        try {
                            props = JSON.parse(component.properties)
                        } catch (err) {
                            console.error(`Error parsing properties for component ${component.id}:`, err)
                        }

                        // Parse and extract Tailwind classes from component styles
                        let styles = {}
                        let tailwindClasses = ""

                        if (component.styles) {
                            try {
                                const parsedStyles = JSON.parse(component.styles)

                                // Use utility to extract Tailwind classes from styles
                                tailwindClasses = extractTailwindClasses(parsedStyles)

                                // Keep any non-Tailwind style properties for inline styles
                                const {
                                    tailwindClasses: _,
                                    backgroundColor,
                                    textColor,
                                    borderColor,
                                    padding,
                                    margin,
                                    paddingX,
                                    paddingY,
                                    marginX,
                                    marginY,
                                    display,
                                    width,
                                    height,
                                    maxWidth,
                                    fontSize,
                                    fontWeight,
                                    textAlign,
                                    borderRadius,
                                    borderWidth,
                                    shadow,
                                    ...restStyles
                                } = parsedStyles

                                styles = restStyles
                            } catch (err) {
                                console.error(`Error parsing styles for component ${component.id}:`, err)
                            }
                        }

                        // Render component
                        return (
                            <div
                                key={component.id}
                                className={`component-wrapper ${tailwindClasses}`}
                                style={styles as React.CSSProperties}
                            >
                                {component.rawCode ? (
                                    <ComponentRenderer rawCode={component.rawCode} properties={component.properties} />
                                ) : (
                                    renderFallbackComponent(component, props)
                                )}
                            </div>
                        )
                    })}
                </div>
            </MacDeviceFrame>
        </div>
    )
}

// MacOS Device Frame Component
interface MacDeviceFrameProps {
    children: React.ReactNode
    url?: string
    isLoading?: boolean
}

const MacDeviceFrame = ({ children, url = "https://ecomnex.softnex.ma", isLoading = false }: MacDeviceFrameProps) => {
    return (
        <div className="w-full mx-auto">
            {/* MacOS Window Frame */}
            <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-200 bg-white">
                {/* Window Header */}
                <div className="bg-gray-100 px-4 pt-2 border-b border-gray-200">
                    {/* Window Controls */}
                    <div className="flex items-center">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>

                        {/* URL Bar */}
                        <div className="flex-1 mx-4">
                            <div className="bg-white rounded-md border border-gray-300 flex items-center px-3 py-1">
                                <div className="flex-shrink-0 text-gray-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                                        />
                                    </svg>
                                </div>
                                <span className="ml-2 text-xs text-gray-600 truncate">{url}</span>
                            </div>
                        </div>

                        {/* Browser Actions */}
                        <div className="flex space-x-3 text-gray-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Browser Tabs */}
                    <div className="flex mt-4 text-xs">
                        <div className="bg-white rounded-t-md px-4 py-1 border-t border-l border-r border-gray-300 flex items-center">
                          <span className="truncate max-w-[150px]">
                            {isLoading ? "Loading..." : url.split("/").pop() || "Home"}
                          </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 ml-2 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="px-3 py-1 text-gray-500">+</div>
                    </div>
                </div>

                {/* Browser Content */}
                <div className="bg-white overflow-auto">{children}</div>

                {/* Browser Footer */}
                <div className="bg-gray-100 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <div>{isLoading ? "Loading..." : "Ready"}</div>
                    <div className="flex items-center space-x-4">
                        <div>100%</div>
                        <div>{new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper function to render fallback components when no rawCode is available
const renderFallbackComponent = (component: Component, props: any) => {
    const { type } = component

    // Extract prop values with our utility function
    const extractedProps = extractPropValues(props)

    // Extract common properties
    const title = extractedProps.title || extractedProps.heading || ""
    const text = extractedProps.text || extractedProps.content || ""
    const imageUrl = extractedProps.imageUrl || extractedProps.image || ""
    const buttonText = extractedProps.buttonText || "Click Me"
    const buttonLink = extractedProps.buttonLink || "/"

    // Handle navigation for fallback components
    const handleNavigation = (e: React.MouseEvent) => {
        e.preventDefault()
        if (window.navigateTemplate) {
            window.navigateTemplate(buttonLink)
        }
    }

    // Map color and alignment properties to Tailwind classes
    const bgColorClass = mapToTailwindColorClass("bg", extractedProps.backgroundColor || extractedProps.bgColor)
    const textColorClass = mapToTailwindColorClass("text", extractedProps.textColor)
    const alignmentClass = mapToTailwindTextAlignClass(extractedProps.align || extractedProps.textAlign)

    // Create container classes
    let containerClasses = "py-4"

    // Add alignment if specified
    if (alignmentClass) containerClasses += ` ${alignmentClass}`

    // Add spacing classes based on extracted props
    if (extractedProps.padding === "large") containerClasses += " p-8"
    else if (extractedProps.padding === "medium") containerClasses += " p-4"
    else if (extractedProps.padding === "small") containerClasses += " p-2"

    if (extractedProps.margin === "large") containerClasses += " m-8"
    else if (extractedProps.margin === "medium") containerClasses += " m-4"
    else if (extractedProps.margin === "small") containerClasses += " m-2"

    // Render based on component type
    switch (type) {
        case "Hero":
        case "HeroSection":
            return (
                <div className={`text-center py-12 ${containerClasses}`}>
                    <h1 className={`text-4xl font-bold mb-4 ${textColorClass}`}>{title}</h1>
                    <p className={`text-lg mb-6 ${textColorClass}`}>{text}</p>
                    {buttonText && (
                        <button
                            className={`px-6 py-2 ${bgColorClass || "bg-blue-500"} text-white rounded-md`}
                            onClick={handleNavigation}
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            )

        case "Header":
            return (
                <header className={containerClasses}>
                    <h1 className={`text-2xl font-bold ${textColorClass}`}>{title || "Header Title"}</h1>
                    {text && <p className={`mt-2 text-gray-600 ${textColorClass}`}>{text}</p>}
                    {buttonText && (
                        <button
                            className={`mt-4 px-4 py-2 ${bgColorClass || "bg-blue-500"} text-white rounded`}
                            onClick={handleNavigation}
                        >
                            {buttonText}
                        </button>
                    )}
                </header>
            )

        case "TextBlock":
        case "TextSection":
            return (
                <div className={containerClasses}>
                    {title && <h2 className={`text-2xl font-bold mb-3 ${textColorClass}`}>{title}</h2>}
                    <p className={textColorClass}>{text}</p>
                </div>
            )

        case "ImageBlock":
        case "ImageSection":
            return (
                <div className={`${containerClasses} ${alignmentClass || "text-center"}`}>
                    {title && <h2 className={`text-2xl font-bold mb-3 ${textColorClass}`}>{title}</h2>}
                    {imageUrl ? (
                        <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={title || "Image"}
                            className="mx-auto max-w-full h-auto rounded-md"
                        />
                    ) : (
                        <div className="bg-gray-100 h-48 flex items-center justify-center rounded-md">
                            <span className="text-gray-400">Image Placeholder</span>
                        </div>
                    )}
                    {text && <p className={`mt-3 ${textColorClass}`}>{text}</p>}
                </div>
            )

        case "Button":
        case "ButtonBlock":
            return (
                <div className={`py-2 ${alignmentClass || "text-center"} ${containerClasses}`}>
                    <button
                        className={`px-6 py-2 ${bgColorClass || "bg-blue-500"} text-white rounded-md`}
                        onClick={handleNavigation}
                    >
                        {buttonText}
                    </button>
                </div>
            )

        case "FeatureList":
        case "Features":
            return (
                <div className={containerClasses}>
                    {title && <h2 className={`text-2xl font-bold mb-4 ${textColorClass}`}>{title}</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border rounded-md">
                                <h3 className={`font-bold mb-2 ${textColorClass}`}>Feature {i}</h3>
                                <p className={textColorClass}>Feature description goes here</p>
                            </div>
                        ))}
                    </div>
                </div>
            )

        default:
            return (
                <div className="border border-dashed border-gray-300 p-4 rounded-md">
                    <div className="text-sm text-gray-500 mb-2">{type} Component</div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(extractedProps, null, 2)}</pre>
                </div>
            )
    }
}
