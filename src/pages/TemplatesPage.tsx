"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { templateService, type Template } from "@/services/template-service/templateService"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, Layout, Github, Linkedin, Eye, FileSearch, X } from "lucide-react"
import { toast } from "sonner"
import CreateProjectModal from "./client/create-project-modal"

const TemplatesPage = () => {
    const [templates, setTemplates] = useState<Template[]>([])
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeFilter, setActiveFilter] = useState("all")
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    // State for project creation modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

    // Fetch templates
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true)
                setError(null)
                let fetchedTemplates: Template[]

                if (isAuthenticated) {
                    fetchedTemplates = await templateService.getTemplates()
                } else {
                    fetchedTemplates = await templateService.getPublicTemplates()
                }

                setTemplates(fetchedTemplates)
                setFilteredTemplates(fetchedTemplates)
            } catch (err) {
                console.error("Error fetching templates:", err)
                setError("Failed to load templates. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchTemplates()
    }, [isAuthenticated])

    // Filter templates based on search term and active filter
    useEffect(() => {
        let result = templates

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (template) =>
                    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.description.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Apply filter
        if (activeFilter === "default") {
            result = result.filter((template) => template.isDefault)
        } else if (activeFilter === "active") {
            result = result.filter((template) => template.isActive)
        }

        setFilteredTemplates(result)
    }, [searchTerm, templates, activeFilter])

    // Handle template selection to create a new project
    const handleSelectTemplate = (template: Template) => {
        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            toast.error("Please log in to create a project")
            navigate("/login", { state: { from: "/templates" } })
            return
        }

        console.log("Selected template:", template)

        // Set the selected template and open the create project modal
        setSelectedTemplate(template)
        setIsCreateModalOpen(true)
    }

    const handlePreviewTemplate = (template: Template) => {
        // Navigate to template preview
        navigate(`/templates/preview/${template.id}`)
    }

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date)
    }

    return (
        <div className="flex min-h-screen text-white max-w-7xl mx-auto mt-16">
            {/* Sidebar - sticky */}
            <div className="w-72 sticky top-0 h-screen overflow-auto p-6">
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-400 mb-4">Follow for updates</h3>
                    <div className="flex flex-col space-y-2">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                        </a>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-400 mb-4">Documentation</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="#docs" className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                                Docs
                            </a>
                        </li>
                        <li>
                            <a href="#user-guide" className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                                User guide
                            </a>
                        </li>
                        <li>
                            <a href="#admin-guide" className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                                Admin guide
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="mb-8">
                    <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-400 mb-4">Templates</h3>
                    <p className="text-zinc-500 text-sm italic">Wait for upcoming version</p>
                </div>

                <div className="mb-8">
                    <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-400 mb-4">Filter Templates</h3>
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActiveFilter("all")
                                }}
                                className={`flex items-center transition-colors ${
                                    activeFilter === "all" ? "text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white" : "text-zinc-600/60 dark:text-zinc-300/60 hover:text-black/60 dark:hover:text-white/60"
                                } transition-colors`}
                            >
                                All Templates
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActiveFilter("default")
                                }}
                                className={`flex items-center transition-colors ${
                                    activeFilter === "default" ? "text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white" : "text-zinc-600/60 dark:text-zinc-300/60 hover:text-black/60 dark:hover:text-white/60"
                                } transition-colors`}
                            >
                                Default
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActiveFilter("active")
                                }}
                                className={`flex items-center transition-colors ${
                                    activeFilter === "active" ? "text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white" : "text-zinc-600/60 dark:text-zinc-300/60 hover:text-black/60 dark:hover:text-white/60"
                                } transition-colors`}
                            >
                                Active
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto relative">
                    <button
                        className="mb-16 bg-neutral-200 dark:bg-neutral-800 no-underline group cursor-pointer relative shadow-2xl shadow-neutral-900/20 dark:shadow-black/40 rounded-full p-px text-xs font-semibold leading-6 text-neutral-900 dark:text-white inline-block"
                        onClick={() => navigate("/contact-us")}
                    >
                        <span className="absolute inset-0 overflow-hidden rounded-full">
                          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(255,105,0,0.6)_0%,rgba(255,105,0,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        </span>
                        <div className="relative flex space-x-2 items-center z-10 rounded-full bg-white dark:bg-zinc-950 py-0.5 px-4 ring-1 ring-neutral-900/10 dark:ring-white/10">
                            <span>Request new templates</span>
                            <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M10.75 8.75L14.25 12L10.75 15.25"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                />
                            </svg>
                        </div>
                        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-rose-400/0 via-rose-600/90 to-rose-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                    </button>

                    {/* Templates grid */}
                    {loading ? (
                        // Loading skeletons
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-48 w-full bg-zinc-200 dark:bg-zinc-800" />
                                    <Skeleton className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
                                    <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-800" />
                                    <Skeleton className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        // Error state
                        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6 text-center">
                            <div className="text-red-400 mb-2">{error}</div>
                            <Button
                                variant="outline"
                                className="bg-transparent border-red-900/50 text-red-400 hover:bg-red-900/30"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 mb-4">
                                <FileSearch className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                            </div>
                            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">No matching templates</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-md text-center">
                                No templates found
                            </p>
                        </div>
                    ) : (
                        // Templates grid
                        <AnimatePresence>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredTemplates.map((template) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        layout
                                    >
                                        <div className="group space-y-3 cursor-pointer" onClick={() => handleSelectTemplate(template)}>
                                            {/* Template image */}
                                            <div className="relative overflow-hidden rounded-lg border border-neutral-400/40 transition-all duration-300 group-hover:opacity-90">
                                                <img
                                                    src={templateService.getTemplatePreviewImage(template) || "/placeholder.svg"}
                                                    alt={template.name}
                                                    className="w-full h-64 object-cover "
                                                />
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    {template.isDefault && (
                                                        <Badge variant="secondary" className="bg-purple-900/60 text-purple-300 hover:bg-purple-900">
                                                            Default
                                                        </Badge>
                                                    )}
                                                    {template.isActive && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-emerald-700/70 text-emerald-100 hover:bg-emerald-700/80"
                                                        >
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Template info */}
                                            <div>
                                                <h3 className="text-xl font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                                                    {template.name}
                                                </h3>
                                                <p className="text-zinc-800 dark:text-zinc-400 text-sm mt-1 line-clamp-2">{template.description}</p>

                                                <div className="flex items-center text-xs text-zinc-500 mt-2">
                                                    <Layout className="h-3 w-3 mr-1" />
                                                    <span className="mr-3">{templateService.getTemplateSummary(template)}</span>
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    <span>{template.createdAt ? formatDate(template.createdAt) : "No date"}</span>
                                                </div>

                                                <button
                                                    className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white text-sm mt-2 transition-colors flex flex-row items-center gap-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handlePreviewTemplate(template)
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                    View template
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Project Creation Modal */}
            {selectedTemplate && (
                <CreateProjectModal
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false)
                        // Small delay before clearing the selected template
                        setTimeout(() => setSelectedTemplate(null), 300)
                    }}
                    templateId={selectedTemplate.id}
                    templateName={selectedTemplate.name}
                />
            )}
        </div>
    )
}

export default TemplatesPage
