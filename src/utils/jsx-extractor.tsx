/**
 * Extracts JSX content from a React component's raw code
 */
export function extractJSXContent(rawCode: string): string | null {
    try {
        // Look for return statement with JSX
        const returnMatch = rawCode.match(/return\s*$$\s*([\s\S]*?)\s*$$\s*;?\s*\}/)
        if (returnMatch && returnMatch[1]) {
            return returnMatch[1].trim()
        }

        // If no return statement found, try to find JSX directly
        const jsxMatch = rawCode.match(/<[A-Za-z][^>]*>[\s\S]*<\/[A-Za-z][^>]*>/)
        if (jsxMatch) {
            return jsxMatch[0].trim()
        }

        return null
    } catch (error) {
        console.error("Error extracting JSX content:", error)
        return null
    }
}

/**
 * Extracts properties from a React component's raw code
 */
export function extractProperties(rawCode: string): Record<string, any> {
    try {
        const properties: Record<string, any> = {}

        // Look for props object
        const propsMatch = rawCode.match(/const\s+props\s*=\s*({[^;]+});/)
        if (propsMatch && propsMatch[1]) {
            const propsObjectStr = propsMatch[1]

            // Convert to valid JSON
            const formattedPropsStr = propsObjectStr
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .replace(/(\w+):/g, '"$1":') // Add quotes around property names
                .replace(/,\s*}/g, "}") // Remove trailing commas

            try {
                // Try to parse as JSON
                return JSON.parse(formattedPropsStr)
            } catch (jsonError) {
                console.error("Invalid JSON in component properties:", jsonError)
            }
        }

        // Extract navigation links if present
        const navLinks: any[] = []
        const navLinksMatch = rawCode.match(/const\s+navLinks\s*=\s*\[([\s\S]*?)\]/)
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

        return properties
    } catch (error) {
        console.error("Error extracting properties:", error)
        return {}
    }
}
