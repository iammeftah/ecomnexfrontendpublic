"use client"

import { useMonaco } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import { useEffect } from "react"

interface CodeEditorProps {
    file: string
    content: string
    onChange: (value: string | undefined) => void
    theme: "vs-dark" | "vs-light"
    readOnly?: boolean
}

const CodeEditor = ({ file, content, onChange, theme, readOnly = false }: CodeEditorProps) => {
    const monaco = useMonaco()

    // Initialize editor theme
    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("vs-dark-custom", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.background": "#1e1e1e",
                },
            })
            monaco.editor.setTheme("vs-dark-custom")
        }
    }, [monaco])

    // Determine language based on file extension
    const getLanguage = () => {
        if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
            return "typescript"
        } else if (file.endsWith(".css")) {
            return "css"
        } else if (file.endsWith(".json")) {
            return "json"
        } else {
            return "plaintext"
        }
    }

    return (
        <div className="h-full">
            <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 border-b">
                <div className="flex items-center px-3 py-1 mr-1 text-sm rounded-t-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                    {file.split("/").pop() || "No file selected"}
                </div>
            </div>

            <Editor
                height="calc(100vh - 95px)"
                language={getLanguage()}
                theme={theme}
                value={content}
                onChange={onChange}
                options={{
                    minimap: { enabled: true },
                    readOnly: readOnly,
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    tabSize: 2,
                    wordWrap: "on",
                    lineNumbers: "on",
                    renderLineHighlight: "all",
                    glyphMargin: true,
                    folding: true,
                    automaticLayout: true,
                }}
            />
        </div>
    )
}

export default CodeEditor
