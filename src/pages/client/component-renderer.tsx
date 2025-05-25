"use client"

import React, { useState, useEffect } from "react"
import { transform } from "@babel/standalone"
import { Loader2 } from "lucide-react"
import type { Component } from "@/services/project-service/projectService"

interface ComponentRendererProps {
    component: Component
    onSelectComponent?: (component: Component) => void
    selectedComponentId?: string
    isEditorMode?: boolean
    components?: Component[] // For backward compatibility
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
                                                                        component,
                                                                        onSelectComponent,
                                                                        selectedComponentId,
                                                                        isEditorMode = false,
                                                                        components, // For backward compatibility
                                                                    }) => {
    const [renderedComponent, setRenderedComponent] = useState<React.ReactNode | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Handle the case where components array is passed instead of a single component
    useEffect(() => {
        // If components array is provided but no single component, return early
        if (components && !component) {
            console.warn("ComponentRenderer: Received components array but no single component")
            setLoading(false)
            return
        }

        // Ensure component is defined before proceeding
        if (!component) {
            console.error("ComponentRenderer: No component provided")
            setError("No component provided")
            setLoading(false)
            return
        }

        const renderComponent = async () => {
            try {
                setLoading(true)
                setError(null)

                // Special handling for PromoBar component
                if (component.type === "PromoBar") {
                    try {
                        const promoBarComponent = renderPromoBar(component)
                        setRenderedComponent(promoBarComponent)
                        setLoading(false)
                        return
                    } catch (err) {
                        console.error("Error rendering PromoBar component:", err)
                        // Continue with normal rendering if special handling fails
                    }
                }

                // Always prioritize rawCode if available
                if (!component.rawCode) {
                    console.warn("No raw code available for component:", component.id)
                    // Try to use fallback rendering if no raw code is available
                    if (component.jsxContent) {
                        console.log("Using JSX content as fallback")
                        setRenderedComponent(renderFallbackComponent(component))
                        setLoading(false)
                        return
                    }

                    setError("No component code provided")
                    setLoading(false)
                    return
                }

                // Parse properties
                const props = {}
                try {
                    if (component.properties) {
                        const parsedProps = JSON.parse(component.properties)

                        // Extract actual values from property configs
                        Object.entries(parsedProps).forEach(([key, config]: [string, any]) => {
                            props[key] = config.value
                        })
                    }
                } catch (e) {
                    console.error("Failed to parse component properties:", e)
                }

                // Parse styles
                let styles = {}
                try {
                    if (component.styles) {
                        styles = JSON.parse(component.styles)
                    }
                } catch (e) {
                    console.error("Failed to parse component styles:", e)
                }

                // Process the code to handle imports and exports
                let processedCode = component.rawCode

                // Add internal navigation helper code
                const navigationHelperCode = `
          // Internal navigation helper function
          const handleNavigation = (e, path) => {
            e.preventDefault();
            if (window.navigateProject) {
              window.navigateProject(path);
              return false;
            }
            return true;
          };
        `

                // Insert the navigation helper before the component definition
                processedCode = processedCode.replace(/const\s+(\w+)\s*=\s*$$\s*$$\s*=>\s*{/, (match) => {
                    return navigationHelperCode + match
                })

                // Modify all href attributes to use # to prevent actual navigation
                processedCode = processedCode.replace(
                    /href=\{([^}]+)\}/g,
                    'href="#" data-path={$1} onClick={(e) => handleNavigation(e, $1)}',
                )

                // Extract and remove import statements
                processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, (match) => {
                    // Preserve CSS/style imports
                    if (
                        match.includes(".css") ||
                        match.includes(".scss") ||
                        match.includes(".sass") ||
                        match.includes(".less") ||
                        match.includes("styled-components") ||
                        match.includes("@emotion")
                    ) {
                        return match // Keep style-related imports
                    }
                    return "// " + match + " - removed for dynamic evaluation"
                })

                // Extract component name from export statement
                let componentName = component.type || "DynamicComponent"
                const exportDefaultMatch = processedCode.match(/export\s+default\s+(\w+)/)
                if (exportDefaultMatch && exportDefaultMatch[1]) {
                    componentName = exportDefaultMatch[1]
                }

                // Remove export statements
                processedCode = processedCode.replace(/export\s+default\s+\w+/g, (match) => {
                    return "// " + match + " - removed for dynamic evaluation"
                })

                // Remove named exports
                processedCode = processedCode.replace(/export\s+(?:const|let|var|function|class)\s+/g, (match) => {
                    return match.replace("export ", "")
                })

                // Transform JSX to JavaScript
                const transformedCode = transform(processedCode, {
                    presets: ["react", "typescript"],
                    filename: "component.tsx",
                }).code

                // Create a function factory to evaluate the code
                const functionFactory = new Function(
                    "React",
                    "useState",
                    "useEffect",
                    "useRef",
                    "useMemo",
                    "useCallback",
                    "props",
                    `
            try {
              ${transformedCode}
              
              // Create the component with the extracted props
              const element = React.createElement(${componentName}, props);
              
              return element;
            } catch (err) {
              console.error("Error in component evaluation:", err);
              return React.createElement('div', { className: 'p-4 bg-red-50 text-red-500 border border-red-200 rounded' }, 
                "Error evaluating component: " + err.message
              );
            }
          `,
                )

                // Execute the function to get the component
                const componentElement = functionFactory(
                    React,
                    React.useState,
                    React.useEffect,
                    React.useRef,
                    React.useMemo,
                    React.useCallback,
                    props,
                )

                // Add this function to enhance the component with data attributes for better selection
                // Add this right before the return statement in the renderComponent function

                // Add data attributes to all elements in the component
                const addDataAttributes = (element: HTMLElement, componentId: string, componentIndex: number) => {
                    // Add a unique ID to each element
                    const elementId = `${componentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                    element.setAttribute("data-element-id", elementId)

                    // Determine element type
                    let elementType = element.tagName.toLowerCase()
                    if (element.classList.contains("btn") || element.classList.contains("button")) {
                        elementType = "button"
                    } else if (element.tagName === "A") {
                        elementType = "link"
                    } else if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)) {
                        elementType = "heading"
                    } else if (element.tagName === "P") {
                        elementType = "paragraph"
                    } else if (element.tagName === "IMG") {
                        elementType = "image"
                    }

                    element.setAttribute("data-element-type", elementType)

                    // Set the path to this element (for now just the component index)
                    element.setAttribute("data-element-path", JSON.stringify([componentIndex]))

                    // Process children recursively
                    Array.from(element.children).forEach((child) => {
                        addDataAttributes(child as HTMLElement, componentId, componentIndex)
                    })
                }

                setRenderedComponent(componentElement)

                // Process the rendered component to add data attributes
                // This needs to happen after the component is rendered to the DOM
                setTimeout(() => {
                    const componentContainer = document.querySelector(`[data-component-id="${component.id}"]`)
                    if (componentContainer) {
                        const elements = componentContainer.querySelectorAll("*")
                        elements.forEach((element, index) => {
                            if (element instanceof HTMLElement) {
                                // Skip if element already has data attributes
                                if (!element.hasAttribute("data-element-id")) {
                                    const elementId = `${component.id}-${Date.now()}-${index}`
                                    element.setAttribute("data-element-id", elementId)

                                    // Determine element type
                                    let elementType = element.tagName.toLowerCase()
                                    if (element.classList.contains("btn") || element.classList.contains("button")) {
                                        elementType = "button"
                                    } else if (element.tagName === "A") {
                                        elementType = "link"
                                    } else if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)) {
                                        elementType = "heading"
                                    } else if (element.tagName === "P") {
                                        elementType = "paragraph"
                                    } else if (element.tagName === "IMG") {
                                        elementType = "image"
                                    }

                                    element.setAttribute("data-element-type", elementType)

                                    // Set the path to this element
                                    const path = [index.toString()]
                                    element.setAttribute("data-element-path", JSON.stringify(path))
                                }
                            }
                        })
                    }
                }, 100)

                setError(null)
            } catch (err) {
                console.error("Error rendering component:", err)
                setError(err instanceof Error ? err.message : "Failed to render component")

                // Try fallback rendering
                setRenderedComponent(renderFallbackComponent(component))
            } finally {
                setLoading(false)
            }
        }

        renderComponent()
    }, [component, components])

    // Special rendering function for PromoBar component
    const renderPromoBar = (component: Component) => {
        // Parse properties
        let properties: Record<string, any> = {}
        try {
            if (component.properties) {
                const parsedProps = JSON.parse(component.properties)
                // Extract actual values from property configs
                Object.entries(parsedProps).forEach(([key, config]: [string, any]) => {
                    properties[key] = config.value
                })
            }
        } catch (e) {
            console.error(`Error parsing PromoBar properties:`, e)
            properties = {
                message: "Free shipping on all orders over $50",
                linkText: "Shop Now",
                linkUrl: "/promotions",
                showLink: true,
                backgroundColor: "#5850EC",
                textColor: "#FFFFFF",
            }
        }

        // Extract values with defaults
        const backgroundColor = properties.backgroundColor || "#5850EC"
        const textColor = properties.textColor || "#FFFFFF"
        const message = properties.message || "Free shipping on all orders over $50"
        const showLink = properties.showLink !== undefined ? properties.showLink : true
        const linkText = properties.linkText || "Shop Now"
        const linkUrl = properties.linkUrl || "/promotions"

        // Bar container styles
        const barStyles = {
            backgroundColor,
            color: textColor,
            padding: "0.75rem 1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            width: "100%",
        }

        // Content container styles
        const containerStyles = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
        }

        // Link styles
        const linkStyles = {
            color: textColor,
            textDecoration: "underline",
            fontWeight: "600",
        }

        return (
            <div style={barStyles as React.CSSProperties}>
                <div style={containerStyles as React.CSSProperties}>
                    <span>{message}</span>

                    {/* Optional link */}
                    {showLink && (
                        <a href="#" style={linkStyles as React.CSSProperties}>
                            {linkText}
                        </a>
                    )}
                </div>
            </div>
        )
    }

    // If components array is provided (for backward compatibility)
    if (components && components.length > 0) {
        return (
            <>
                {components.map((comp) => (
                    <ComponentRenderer
                        key={comp.id}
                        component={comp}
                        onSelectComponent={onSelectComponent}
                        selectedComponentId={selectedComponentId}
                        isEditorMode={isEditorMode}
                    />
                ))}
            </>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Rendering component...</span>
            </div>
        )
    }

    if (error && !renderedComponent) {
        return (
            <div className="component-error p-4 bg-red-50 text-red-500 border border-red-200 rounded">
                <div className="font-medium">Failed to render component</div>
                <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">Error details</summary>
                    <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 overflow-auto rounded">{error}</pre>
                </details>
            </div>
        )
    }

    // If we're in editor mode, make the component clickable
    if (isEditorMode && onSelectComponent && component) {
        return (
            <div
                className={`component-wrapper relative ${selectedComponentId === component.id ? "selected-component" : ""}`}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelectComponent(component)
                }}
                data-component-id={component.id}
            >
                {selectedComponentId === component.id && <div className="component-label">{component.type}</div>}
                {renderedComponent}
            </div>
        )
    }

    return (
        <div className="component" data-component-id={component.id}>
            {renderedComponent}
        </div>
    )
}

// Fallback component rendering function
const renderFallbackComponent = (component: Component) => {
    // Parse properties
    const properties: Record<string, any> = {}
    try {
        if (component.properties) {
            const parsedProps = JSON.parse(component.properties)
            // Extract actual values from property configs
            Object.entries(parsedProps).forEach(([key, config]: [string, any]) => {
                properties[key] = config.value
            })
        }
    } catch (e) {
        console.error(`Error parsing component properties:`, e)
    }

    // Parse styles
    let styles: Record<string, string> = {}
    try {
        styles = component.styles ? JSON.parse(component.styles) : {}
    } catch (e) {
        console.error(`Error parsing component styles:`, e)
    }

    // For the specific PromoBar component
    if (component.type === "PromoBar") {
        const backgroundColor = properties.backgroundColor || "#5850EC"
        const textColor = properties.textColor || "#FFFFFF"
        const message = properties.message || "Free shipping on all orders over $50"
        const showLink = properties.showLink !== undefined ? properties.showLink : true
        const linkText = properties.linkText || "Shop Now"
        const linkUrl = properties.linkUrl || "/promotions"

        // Bar container styles
        const barStyles = {
            backgroundColor,
            color: textColor,
            padding: "0.75rem 1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            width: "100%",
        }

        // Content container styles
        const containerStyles = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
        }

        // Link styles
        const linkStyles = {
            color: textColor,
            textDecoration: "underline",
            fontWeight: "600",
        }

        return (
            <div style={barStyles as React.CSSProperties}>
                <div style={containerStyles as React.CSSProperties}>
                    <span>{message}</span>

                    {/* Optional link */}
                    {showLink && (
                        <a href="#" style={linkStyles as React.CSSProperties}>
                            {linkText}
                        </a>
                    )}
                </div>
            </div>
        )
    }

    // Extract common properties
    const title = properties.title || properties.heading || ""
    const text = properties.text || properties.content || ""
    const imageUrl = properties.imageUrl || properties.image || ""
    const buttonText = properties.buttonText || "Click Me"
    const buttonLink = properties.buttonLink || "/"

    // Handle navigation for fallback components
    const handleNavigation = (e: React.MouseEvent) => {
        e.preventDefault()
        if (window.navigateProject) {
            window.navigateProject(buttonLink)
        }
    }

    // If we have JSX content, render it directly
    if (component.jsxContent) {
        return (
            <div
                className="component-wrapper"
                style={styles as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: component.jsxContent }}
            />
        )
    }

    // Render based on component type
    switch (component.type) {
        case "Hero":
        case "HeroSection":
            return (
                <div className="text-center py-12" style={styles as React.CSSProperties}>
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-lg mb-6">{text}</p>
                    {buttonText && (
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-md" onClick={handleNavigation}>
                            {buttonText}
                        </button>
                    )}
                </div>
            )

        case "Header":
            return (
                <header style={styles as React.CSSProperties}>
                    <h1 className="text-2xl font-bold">{title || "Header Title"}</h1>
                    {text && <p className="mt-2 text-gray-600">{text}</p>}
                    {buttonText && (
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleNavigation}>
                            {buttonText}
                        </button>
                    )}
                </header>
            )

        case "TextBlock":
        case "TextSection":
            return (
                <div style={styles as React.CSSProperties}>
                    {title && <h2 className="text-2xl font-bold mb-3">{title}</h2>}
                    <p>{text}</p>
                </div>
            )

        case "ImageBlock":
        case "ImageSection":
            return (
                <div className="text-center" style={styles as React.CSSProperties}>
                    {title && <h2 className="text-2xl font-bold mb-3">{title}</h2>}
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
                    {text && <p className="mt-3">{text}</p>}
                </div>
            )

        default:
            // Fallback for unknown component types
            return (
                <div className="border border-dashed border-gray-300 p-4 rounded-md" style={styles as React.CSSProperties}>
                    <div className="text-sm text-gray-500 mb-2">{component.type} Component</div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(properties, null, 2)}</pre>
                </div>
            )
    }
}

// Modify the special rendering function for Hero component to add data attributes
const renderHero = (component: Component, componentIndex = 0) => {
    // Parse properties
    let properties: Record<string, any> = {}
    try {
        if (component.properties) {
            const parsedProps = JSON.parse(component.properties)
            // Extract actual values from property configs
            Object.entries(parsedProps).forEach(([key, config]: [string, any]) => {
                properties[key] = config.value
            })
        }
    } catch (e) {
        console.error(`Error parsing Hero properties:`, e)
        properties = {
            title: "Build Your Online Business with EcomNex",
            subtitle: "The complete e-commerce solution with everything you need to launch, grow, and manage your business",
            buttonText: "Get Started",
            buttonLink: "/get-started",
            backgroundImage: "/ecommerce-shopping-cart-background.png",
        }
    }

    // Extract values with defaults
    const title = properties.title || properties.heading || "Build Your Online Business with EcomNex"
    const subtitle =
        properties.subtitle ||
        properties.subheading ||
        "The complete e-commerce solution with everything you need to launch, grow, and manage your business"
    const buttonText = properties.buttonText || "Get Started"
    const buttonLink = properties.buttonLink || "/get-started"
    const backgroundImage = properties.backgroundImage || "/ecommerce-shopping-cart-background.png"

    // Create the hero component with data attributes for selection
    const heroElement = document.createElement("div")
    heroElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`
    heroElement.style.backgroundSize = "cover"
    heroElement.style.backgroundPosition = "center"
    heroElement.style.color = "white"
    heroElement.style.padding = "4rem 2rem"
    heroElement.style.textAlign = "center"
    heroElement.setAttribute("data-element-id", `hero-${component.id}`)
    heroElement.setAttribute("data-element-type", "hero")
    heroElement.setAttribute("data-element-path", JSON.stringify([componentIndex]))

    const contentDiv = document.createElement("div")
    contentDiv.style.maxWidth = "800px"
    contentDiv.style.margin = "0 auto"
    contentDiv.setAttribute("data-element-id", `hero-content-${component.id}`)
    contentDiv.setAttribute("data-element-type", "container")
    contentDiv.setAttribute("data-element-path", JSON.stringify([componentIndex, "content"]))

    const titleElement = document.createElement("h1")
    titleElement.textContent = title
    titleElement.style.fontSize = "2.5rem"
    titleElement.style.fontWeight = "bold"
    titleElement.style.marginBottom = "1rem"
    titleElement.setAttribute("data-element-id", `hero-title-${component.id}`)
    titleElement.setAttribute("data-element-type", "heading")
    titleElement.setAttribute("data-element-path", JSON.stringify([componentIndex, "title"]))

    const subtitleElement = document.createElement("p")
    subtitleElement.textContent = subtitle
    subtitleElement.style.fontSize = "1.25rem"
    subtitleElement.style.marginBottom = "2rem"
    subtitleElement.setAttribute("data-element-id", `hero-subtitle-${component.id}`)
    subtitleElement.setAttribute("data-element-type", "paragraph")
    subtitleElement.setAttribute("data-element-path", JSON.stringify([componentIndex, "subtitle"]))

    const buttonElement = document.createElement("button")
    buttonElement.textContent = buttonText
    buttonElement.style.backgroundColor = "#6366F1"
    buttonElement.style.color = "white"
    buttonElement.style.padding = "0.75rem 1.5rem"
    buttonElement.style.borderRadius = "0.375rem"
    buttonElement.style.fontWeight = "bold"
    buttonElement.style.border = "none"
    buttonElement.style.cursor = "pointer"
    buttonElement.setAttribute("data-element-id", `hero-button-${component.id}`)
    buttonElement.setAttribute("data-element-type", "button")
    buttonElement.setAttribute("data-element-path", JSON.stringify([componentIndex, "button"]))

    contentDiv.appendChild(titleElement)
    contentDiv.appendChild(subtitleElement)
    contentDiv.appendChild(buttonElement)
    heroElement.appendChild(contentDiv)

    // Convert the DOM element to a React element
    const heroHtml = heroElement.outerHTML
    return <div dangerouslySetInnerHTML={{ __html: heroHtml }} />
}

// Add this function to the ComponentRenderer component, right before the return statement
const processRenderedComponent = (renderedElement: HTMLElement, componentId: string, componentIndex: number) => {
    // Add data attributes to all elements in the component
    const addDataAttributes = (element: HTMLElement, path: string[] = [componentIndex.toString()]) => {
        // Skip if element already has data attributes
        if (element.hasAttribute("data-element-id")) {
            return
        }

        // Generate a unique ID for this element
        const elementId = `${componentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        element.setAttribute("data-element-id", elementId)

        // Determine element type
        let elementType = element.tagName.toLowerCase()
        if (element.classList.contains("btn") || element.classList.contains("button")) {
            elementType = "button"
        } else if (element.tagName === "A") {
            elementType = "link"
        } else if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)) {
            elementType = "heading"
        } else if (element.tagName === "P") {
            elementType = "paragraph"
        } else if (element.tagName === "IMG") {
            elementType = "image"
        } else if (element.tagName === "DIV" && element.classList.contains("hero")) {
            elementType = "hero"
        }

        element.setAttribute("data-element-type", elementType)

        // Set the path to this element
        element.setAttribute("data-element-path", JSON.stringify(path))

        // Process children recursively
        Array.from(element.children).forEach((child, index) => {
            if (child instanceof HTMLElement) {
                addDataAttributes(child, [...path, index.toString()])
            }
        })
    }

    // Start processing from the root element
    addDataAttributes(renderedElement)

    return renderedElement
}
