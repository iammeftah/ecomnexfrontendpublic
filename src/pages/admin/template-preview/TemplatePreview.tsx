// Updated TemplatePreviewPage.tsx with internal navigation only

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { AlertCircle, ArrowLeft } from "lucide-react"
import {templateService, type Template } from "@/services/template-service/templateService"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TemplateRenderer } from "../renderer/template-renderer"

const SafariMockBrowser = ({ children }) => {
    return (
        <div className="mockup-browser border border-base-300 w-full max-w-6xl mx-auto">
            <div className="mockup-browser-toolbar">
                <div className="flex items-center px-4 py-2">
                    <div className="flex space-x-2 mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full px-4 py-1 text-sm text-gray-700">
                        https://example.com
                    </div>
                    <div className="ml-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="flex justify-center bg-base-200">
                {children}
            </div>
        </div>
    );
};

export default function TemplatePreviewPage() {
    const { id: templateId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [template, setTemplate] = useState<Template | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPath, setCurrentPath] = useState<string>("/")

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!templateId) return

            try {
                setLoading(true)
                setError(null)

                const fetchedTemplate = await templateService.getTemplateById(templateId)
                setTemplate(fetchedTemplate)
            } catch (err) {
                console.error("Error fetching template:", err)
                setError("Failed to load template. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchTemplate()
    }, [templateId])

    // Set up the navigateTemplate function globally - INTERNAL ONLY VERSION
    useEffect(() => {
        if (!template) return;

        // Define the navigation function for INTERNAL preview only
        window.navigateTemplate = (path) => {
            console.log('Template internal navigation to:', path);
            // Just update the state, don't change the URL
            setCurrentPath(path);
        };

        // Clean up when component unmounts
        return () => {
            delete window.navigateTemplate;
        };
    }, [template]);

    // Handle navigation between pages in the template
    const handlePageNavigation = (path: string) => {
        setCurrentPath(path)
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-6">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={handleGoBack} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        )
    }

    if (!template) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Alert>
                    <AlertDescription>Template not found.</AlertDescription>
                </Alert>
                <Button onClick={handleGoBack} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="template-preview">
            {/* Navigation for template pages */}
            {template.pages.length > 1 && (
                <div className="bg-neutral-100 dark:bg-neutral-800 p-2 border-b sticky top-0 z-10">
                    <div className="container mx-auto flex gap-2 overflow-x-auto">
                        {template.pages.map((page) => (
                            <Button
                                key={page.id}
                                variant={currentPath === page.path ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageNavigation(page.path)}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}


            {/* Render the template */}
            <div className="template-content container mx-auto m-8">
                <TemplateRenderer template={template} pagePath={currentPath} containerClassName="min-h-screen" />
            </div>
        </div>
    )
}
