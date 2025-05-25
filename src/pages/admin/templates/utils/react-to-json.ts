// React component to JSON converter with comprehensive extraction capabilities
export const reactToJSON = (
    componentCode: string,
): {
    type: string
    properties: string
    styles?: string
    rawCode: string
    jsxContent?: string
    orderIndex: number
    isCustom: boolean
    id?: string
} => {
    try {
        // Extract component type from the code
        let componentType = "Component"
        const componentNameMatch =
            componentCode.match(/const\s+(\w+)\s*=\s*\(/) || componentCode.match(/function\s+(\w+)\s*\(/)

        if (componentNameMatch && componentNameMatch[1]) {
            componentType = componentNameMatch[1]
        } else {
            // Try to determine component type based on file name or content
            if (componentCode.includes("Hero")) {
                componentType = "Hero"
            } else if (componentCode.includes("Header")) {
                componentType = "Header"
            } else if (componentCode.includes("Features") || componentCode.includes("Feature")) {
                componentType = "Features"
            } else if (componentCode.includes("Footer")) {
                componentType = "Footer"
            } else if (componentCode.includes("Nav") || componentCode.includes("Menu")) {
                componentType = "Navigation"
            } else if (componentCode.includes("Card")) {
                componentType = "Card"
            } else if (componentCode.includes("Form")) {
                componentType = "Form"
            }
        }

        // Store the entire component code for rendering
        const rawCode = componentCode.trim()

        // Extract JSX content
        const jsxContent = extractJSXContent(componentCode)

        // Extract properties using regex with improved patterns
        const properties: Record<string, any> = {}

        // Look for props object with different patterns
        const propsMatch =
            componentCode.match(/const\s+props\s*=\s*{([^}]+)}/s) ||
            componentCode.match(/const\s+\w+\s*=\s*{\s*([^}]+)\s*}/s) ||
            componentCode.match(/props\s*:\s*{([^}]+)}/s)

        if (propsMatch && propsMatch[1]) {
            const propsContent = propsMatch[1]

            // Extract individual properties with improved regex that handles nested objects
            // First, split by commas that are not inside nested objects
            const propLines = propsContent.split(/,(?![^{]*})/)

            propLines.forEach((line) => {
                const keyValueMatch = line.match(/^\s*(\w+)\s*:\s*(.+)$/)
                if (keyValueMatch) {
                    const [, key, rawValue] = keyValueMatch
                    const trimmedValue = rawValue.trim()

                    // Handle different value types
                    if (trimmedValue.startsWith('"') || trimmedValue.startsWith("'")) {
                        // String value
                        properties[key] = trimmedValue.substring(1, trimmedValue.length - 1)
                    } else if (trimmedValue === "true") {
                        properties[key] = true
                    } else if (trimmedValue === "false") {
                        properties[key] = false
                    } else if (!isNaN(Number(trimmedValue))) {
                        properties[key] = Number(trimmedValue)
                    } else if (trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) {
                        // Nested object - try to parse it
                        try {
                            // Replace single quotes with double quotes for JSON parsing
                            const jsonStr = trimmedValue.replace(/'/g, '"')
                            properties[key] = JSON.parse(jsonStr)
                        } catch (e) {
                            // If parsing fails, store as string
                            properties[key] = trimmedValue
                        }
                    } else {
                        properties[key] = trimmedValue
                    }
                }
            })
        }

        // Extract navigation links if present
        const navLinks: any[] = []
        const navLinksMatch = componentCode.match(/const\s+navLinks\s*=\s*\[([\s\S]*?)\]/)
        if (navLinksMatch && navLinksMatch[1]) {
            const linksContent = navLinksMatch[1]
            const linkMatches = linksContent.match(/{\s*name\s*:\s*(['"])([^'"]+)\1\s*,\s*href\s*:\s*(['"])([^'"]+)\3\s*}/g)

            if (linkMatches) {
                linkMatches.forEach((linkStr) => {
                    const nameMatch = linkStr.match(/name\s*:\s*(['"])([^'"]+)\1/)
                    const hrefMatch = linkStr.match(/href\s*:\s*(['"])([^'"]+)\1/)

                    if (nameMatch && hrefMatch) {
                        navLinks.push({
                            name: nameMatch[2],
                            href: hrefMatch[2],
                        })
                    }
                })
            }
        }

        // If navigation links were found, add them to properties
        if (navLinks.length > 0) {
            properties.navLinks = navLinks
        }

        // If no props found, try to extract from JSX directly
        if (Object.keys(properties).length === 0) {
            // Look for title in JSX
            const titleMatch = componentCode.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i)
            if (titleMatch && titleMatch[1]) {
                properties.title = titleMatch[1].trim()
            }

            // Look for subtitle/paragraph
            const subtitleMatch = componentCode.match(/<p[^>]*>([^<]+)<\/p>/i)
            if (subtitleMatch && subtitleMatch[1]) {
                properties.subtitle = subtitleMatch[1].trim()
            }

            // Look for button text
            const buttonMatch = componentCode.match(/<button[^>]*>([^<]+)<\/button>/i)
            if (buttonMatch && buttonMatch[1]) {
                properties.buttonText = buttonMatch[1].trim()
            }

            // Look for image sources
            const imgMatch = componentCode.match(/src\s*=\s*(['"])([^'"]+)\1/)
            if (imgMatch && imgMatch[2]) {
                properties.imageSrc = imgMatch[2]
            }
        }

        // Extract styles from className props
        const styles: Record<string, string> = {}

        // Look for className attributes with improved regex
        const classNameMatches = componentCode.match(/className\s*=\s*(['"].*?['"])/g)
        if (classNameMatches) {
            classNameMatches.forEach((match) => {
                const classValue = match.replace(/className\s*=\s*(['"])(.*?)\1/, "$2")
                const classes = classValue.split(/\s+/)

                classes.forEach((cls) => {
                    if (cls.startsWith("bg-")) {
                        styles.backgroundColor = cls
                    } else if (cls.startsWith("text-")) {
                        if (!cls.includes("center") && !cls.includes("left") && !cls.includes("right")) {
                            styles.textColor = cls
                        } else if (cls.includes("center")) {
                            styles.textAlign = "center"
                        } else if (cls.includes("left")) {
                            styles.textAlign = "left"
                        } else if (cls.includes("right")) {
                            styles.textAlign = "right"
                        }
                    } else if (cls.startsWith("font-")) {
                        styles.fontWeight = cls
                    } else if (cls.startsWith("p-") || cls.startsWith("px-") || cls.startsWith("py-")) {
                        styles.padding = cls
                    } else if (cls.startsWith("m-") || cls.startsWith("mx-") || cls.startsWith("my-")) {
                        styles.margin = cls
                    } else if (cls.startsWith("rounded")) {
                        styles.borderRadius = cls
                    } else if (cls.startsWith("shadow")) {
                        styles.shadow = cls
                    } else if (cls.startsWith("border")) {
                        styles.border = cls
                    }
                })
            })
        }

        // Extract inline styles
        const inlineStyleMatch = componentCode.match(/style\s*=\s*\{\s*\{([^}]+)\}\s*\}/s)
        if (inlineStyleMatch && inlineStyleMatch[1]) {
            const styleContent = inlineStyleMatch[1]
            const styleEntries = styleContent.match(/(\w+)\s*:\s*(['"].*?['"]|\d+|[^,]+)/g)

            if (styleEntries) {
                styleEntries.forEach((entry) => {
                    const [key, value] = entry.split(/\s*:\s*/)
                    if (key && value) {
                        styles[key.trim()] = value.trim().replace(/['"]/g, "")
                    }
                })
            }
        }

        // Create the result object with the full component code
        return {
            type: componentType,
            properties: JSON.stringify(properties),
            styles: JSON.stringify(styles),
            rawCode: rawCode,
            jsxContent: jsxContent,
            orderIndex: 1,
            isCustom: true,
        }
    } catch (error) {
        console.error("Error converting React to JSON:", error)

        // Fallback to basic extraction if parsing fails
        try {
            const titleMatch =
                componentCode.match(/title=['"]([^'"]+)['"]/) || componentCode.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i)
            const subtitleMatch =
                componentCode.match(/subtitle=['"]([^'"]+)['"]/) || componentCode.match(/<p[^>]*>([^<]+)<\/p>/i)

            const componentType = componentCode.includes("Hero")
                ? "Hero"
                : componentCode.includes("Header")
                    ? "Header"
                    : componentCode.includes("Features")
                        ? "Features"
                        : componentCode.includes("Footer")
                            ? "Footer"
                            : "Component"

            return {
                type: componentType,
                properties: JSON.stringify({
                    title: titleMatch ? titleMatch[1] : "Title",
                    subtitle: subtitleMatch ? subtitleMatch[1] : "Subtitle",
                }),
                styles: JSON.stringify({}),
                rawCode: componentCode,
                jsxContent: extractJSXContent(componentCode),
                orderIndex: 1,
                isCustom: true,
            }
        } catch (fallbackError) {
            console.error("Fallback extraction also failed:", fallbackError)
            return {
                type: "Component",
                properties: JSON.stringify({ error: "Failed to parse component" }),
                styles: JSON.stringify({}),
                rawCode: componentCode,
                jsxContent: "",
                orderIndex: 1,
                isCustom: true,
            }
        }
    }
}

// Helper function to extract JSX content from component code
function extractJSXContent(componentCode: string): string {
    try {
        // Look for return statement with JSX
        const returnMatch =
            componentCode.match(/return\s*$$\s*([\s\S]*?)\s*$$\s*;?\s*\}/) ||
            componentCode.match(/return\s*([\s\S]*?)\s*;?\s*\}/)
        if (returnMatch && returnMatch[1]) {
            return returnMatch[1].trim()
        }

        // If no return statement found, try to find JSX directly
        const jsxMatch = componentCode.match(/<[A-Za-z][^>]*>[\s\S]*<\/[A-Za-z][^>]*>/)
        if (jsxMatch) {
            return jsxMatch[0].trim()
        }

        return ""
    } catch (error) {
        console.error("Error extracting JSX content:", error)
        return ""
    }
}
