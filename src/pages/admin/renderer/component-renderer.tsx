// Updated component-renderer.tsx with internal-only navigation

"use client"

import React, { useState, useEffect } from "react"
import { transform } from "@babel/standalone"

interface ComponentRendererProps {
    rawCode?: string
    properties?: string
    errorFallback?: React.ReactNode
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
                                                                        rawCode,
                                                                        properties,
                                                                        errorFallback = (
                                                                            <div className="p-4 bg-red-50 text-red-500 border border-red-200 rounded">Failed to render component</div>
                                                                        ),
                                                                    }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [props, setProps] = useState<Record<string, any>>({})

    useEffect(() => {
        if (!rawCode) {
            setError("No component code provided")
            return
        }

        try {
            // Parse properties if provided
            if (properties) {
                try {
                    const parsedProps = JSON.parse(properties)
                    setProps(parsedProps)
                } catch (e) {
                    console.error("Failed to parse component properties:", e)
                }
            }

            // Process the code to handle imports and exports
            let processedCode = rawCode

            // Add internal navigation helper code
            const navigationHelperCode = `
                // Internal navigation helper function
                // This does NOT change the actual URL, just the template view
                const handleNavigation = (e, path) => {
                  e.preventDefault();
                  if (window.navigateTemplate) {
                    window.navigateTemplate(path);
                    return false;
                  }
                  return true;
                };
            `;

            // Insert the navigation helper before the component definition
            processedCode = processedCode.replace(/const\s+(\w+)\s*=\s*\(\s*\)\s*=>\s*{/, (match) => {
                return navigationHelperCode + match;
            });

            // Modify all href attributes to use # to prevent actual navigation
            processedCode = processedCode.replace(/href=\{([^}]+)\}/g, 'href="#" data-path={$1}');

            // Modify onClick handlers to use our navigation function
            processedCode = processedCode.replace(/onClick=\{([^}]+)\}/g, 'onClick={(e) => {$1; handleNavigation(e, data-path);}}');

            // Extract and remove import statements
            const importStatements: string[] = []
            processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, (match) => {
                importStatements.push(match)

                // Preserve CSS/style imports
                if (
                    match.includes(".css") ||
                    match.includes(".scss") ||
                    match.includes(".sass") ||
                    match.includes(".less") ||
                    match.includes("styled-components") ||
                    match.includes("@emotion")
                ) {
                    console.log("Preserving style import:", match)
                    return match // Keep style-related imports
                }

                return "// " + match + " - removed for dynamic evaluation"
            })

            // Extract component name from export statement
            let componentName = "DynamicComponent"
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
                `
          try {
            ${transformedCode}
            return React.createElement(${componentName});
          } catch (err) {
            console.error("Error in component evaluation:", err);
            return React.createElement('div', { className: 'p-4 bg-red-50 text-red-500 border border-red-200 rounded' }, 
              "Error evaluating component: " + err.message
            );
          }
        `,
            )

            // Execute the function to get the component
            const ComponentElement = functionFactory(
                React,
                React.useState,
                React.useEffect,
                React.useRef,
                React.useMemo,
                React.useCallback,
            )

            setComponent(() => () => ComponentElement)
            setError(null)
        } catch (err) {
            console.error("Error rendering component:", err)
            setError(err instanceof Error ? err.message : "Failed to render component")
        }
    }, [rawCode, properties])

    if (error) {
        return (
            <div className="component-error">
                {errorFallback}
                <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">Error details</summary>
                    <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 overflow-auto rounded">{error}</pre>
                </details>
            </div>
        )
    }

    if (!Component) {
        return <div className="p-4 text-neutral-500"></div>
    }

    try {
        return <Component {...props} />
    } catch (renderError) {
        console.error("Runtime error rendering component:", renderError)
        return (
            <div className="p-4 bg-red-50 text-red-500 border border-red-200 rounded">
                Runtime error: {renderError instanceof Error ? renderError.message : "Unknown error"}
            </div>
        )
    }
}
