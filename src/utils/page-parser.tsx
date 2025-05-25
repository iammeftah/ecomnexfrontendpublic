/**
 * Gets components used in a page file
 * @param pageCode Page file code
 * @returns Array of component names
 */
export const getComponentsInPageOrder = (pageCode: string): string[] => {
    // Create a map to track components and their positions
    const componentPositions: Map<string, number> = new Map()

    // Track imported components
    const importedComponents = new Set<string>()

    // Look for import statements
    const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
    let match
    while ((match = importRegex.exec(pageCode)) !== null) {
        const componentName = match[1]
        const importPath = match[2]

        // Only include components that are imported from the components directory
        if (importPath.includes("components/")) {
            importedComponents.add(componentName)
        }
    }

    // Look for component usage in JSX - be more specific to match actual component usage
    // This regex looks for component tags with proper opening and closing
    const jsxRegex = /<([A-Z]\w+)(?:\s+[^>]*)?(?:\/?>|>[\s\S]*?<\/\1>)/g
    while ((match = jsxRegex.exec(pageCode)) !== null) {
        const componentName = match[1]

        // Only track components that were imported from components directory
        if (importedComponents.has(componentName)) {
            // Only store the first occurrence position
            if (!componentPositions.has(componentName)) {
                componentPositions.set(componentName, match.index)
            }
        }
    }

    // Sort components by their position in the file
    const sortedComponents = Array.from(componentPositions.entries())
        .sort((a, b) => a[1] - b[1])
        .map((entry) => entry[0])

    console.log("Components in order:", sortedComponents)
    return sortedComponents
}

/**
 * Extracts the JSX content from a React component
 * @param code Component code
 * @returns JSX content or empty string if not found
 */
export const extractJSXContent = (code: string): string => {
    // Look for the return statement with JSX
    const returnRegex = /return\s*$$\s*([\s\S]*?)\s*$$\s*;?\s*\}/
    const match = returnRegex.exec(code)

    if (match && match[1]) {
        return match[1].trim()
    }

    return ""
}

/**
 * Checks if a page is the homepage based on its name or path
 * @param pageName Page name
 * @param pagePath Page path
 * @returns True if the page is the homepage
 */
export const isHomePage = (pageName: string, pagePath?: string): boolean => {
    if (pagePath === "/" || pagePath === "") return true
    return pageName.toLowerCase() === "home"
}
