"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ComponentRenderer } from "../../renderer/component-renderer"

interface PreviewPanelProps {
    code: string
    properties?: string
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, properties }) => {
    const [error, setError] = useState<string | null>(null)

    // Reset error when code changes
    useEffect(() => {
        setError(null)
    }, [code])

    return (
        <div className="h-full bg-white dark:bg-neutral-900 overflow-auto">
            <div className="p-4">
                {error ? (
                    <div className="p-4 bg-red-50 text-red-500 border border-red-200 rounded">
                        <h3 className="font-medium mb-2">Error Rendering Component</h3>
                        <pre className="text-xs overflow-auto">{error}</pre>
                    </div>
                ) : (
                    <ComponentRenderer
                        rawCode={code}
                        properties={properties}
                        errorFallback={
                            <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                                <h3 className="font-medium mb-2">Component Error</h3>
                                <p>There was an error rendering this component. Check your code for syntax errors.</p>
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    )
}

export default PreviewPanel
