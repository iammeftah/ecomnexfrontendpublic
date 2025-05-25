"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { templateService, type Template } from "@/services/template-service/templateService"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Check, PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import TemplateList from "./components/template-list"
import TemplateFormDialog from "./components/template-form-dialog"
import TemplateEditor from "./components/template-editor"
import DeleteTemplateDialog from "./components/delete-template-dialog"

const TemplateManager = () => {
    const [templates, setTemplates] = useState<Template[]>([])
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("all")
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [mode, setMode] = useState<"select" | "edit" | "create" | "preview">("select")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // New Template Form State
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [newTemplate, setNewTemplate] = useState({
        name: "",
        description: "",
        isDefault: false,
        isActive: true,
    })

    const { isAuthenticated, hasRole } = useAuth()
    const navigate = useNavigate()

    const isAdmin = hasRole("ADMIN") || hasRole("ROLE_ADMIN")

    // Fetch templates
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true)
                setError(null)

                if (!isAuthenticated || !isAdmin) {
                    setError("You don't have permission to access this page")
                    setLoading(false)
                    return
                }

                const fetchedTemplates = await templateService.getTemplates()
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
    }, [isAuthenticated, isAdmin, hasRole])

    // Apply search filter
    useEffect(() => {
        let result = templates

        if (searchTerm) {
            result = result.filter(
                (template) =>
                    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.description.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Apply tab filter
        if (activeTab === "default") {
            result = result.filter((template) => template.isDefault)
        } else if (activeTab === "active") {
            result = result.filter((template) => template.isActive)
        }

        setFilteredTemplates(result)
    }, [searchTerm, templates, activeTab])

    // Show success message then hide it after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [successMessage])

    // Handle template creation
    const handleCreateTemplate = () => {
        setShowCreateDialog(true)
    }

    // Handle template edit
    const handleEditTemplate = (template: Template) => {
        setSelectedTemplate(template)
        setMode("edit")
    }

    // Handle template preview
    const handleViewTemplate = (template: Template) => {
        setSelectedTemplate(template)
        setMode("preview")
    }

    // Handle template deletion confirmation
    const confirmDelete = (template: Template) => {
        setTemplateToDelete(template)
        setShowDeleteDialog(true)
    }

    // Handle template deletion
    const handleDeleteTemplate = async () => {
        if (!templateToDelete) return

        try {
            setLoading(true)
            await templateService.deleteTemplate(templateToDelete.id)

            // Update templates list
            setTemplates(templates.filter((t) => t.id !== templateToDelete.id))
            setSuccessMessage("Template deleted successfully")

            // Reset selection
            if (selectedTemplate?.id === templateToDelete.id) {
                setSelectedTemplate(null)
                setMode("select")
            }

            // Close dialog
            setShowDeleteDialog(false)
            setTemplateToDelete(null)
        } catch (err) {
            console.error("Error deleting template:", err)
            setError("Failed to delete template. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    // Handle new template creation
    const handleCreateNewTemplate = async (templateData: typeof newTemplate) => {
        try {
            setLoading(true);

            // Create initial template data WITHOUT specifying any IDs
            // This allows the server to generate fresh entities with new IDs
            const initialTemplate: Partial<Template> = {
                // Don't include ID for new template
                name: templateData.name,
                description: templateData.description,
                content: JSON.stringify({
                    theme: "default",
                    primaryColor: "#3b82f6",
                    secondaryColor: "#f59e0b",
                }),
                isDefault: templateData.isDefault,
                isActive: templateData.isActive,
                pages: [
                    {
                        // Don't include ID for new page
                        name: "Home",
                        path: "/",
                        isHomePage: true,
                        components: [],
                    },
                ],
            };

            console.log("Creating template with data:", JSON.stringify(initialTemplate, null, 2));

            // Call API to create template
            const createdTemplate = await templateService.createTemplate(initialTemplate);

            // Update templates list
            setTemplates([...templates, createdTemplate]);
            setSuccessMessage("Template created successfully");

            // Switch to edit mode and select the new template
            setSelectedTemplate(createdTemplate);
            setMode("edit");
            setShowCreateDialog(false);
        } catch (err) {
            console.error("Error creating template:", err);
            setError(err instanceof Error ? err.message : "Failed to create template. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Handle template update from editor
    const handleTemplateUpdate = (updatedTemplate: Template) => {
        setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)))
        setSelectedTemplate(updatedTemplate)
        setSuccessMessage("Template updated successfully")
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="container mx-auto py-10 px-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to access this page. Please login with an admin account.
                    </AlertDescription>
                </Alert>
                <Button onClick={() => navigate("/login")} className="mt-4">
                    Go to Login
                </Button>
            </div>
        )
    }

    // Template Selection Screen
    if (mode === "select") {
        return (
            <div className="container mx-auto py-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Template Manager</h1>
                            <p className="text-neutral-600 mt-1">Create, edit, and manage website templates</p>
                        </div>
                        <Button onClick={handleCreateTemplate}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Template
                        </Button>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert className="bg-green-50 border-green-200 text-green-800 mb-4">
                            <Check className="h-4 w-4" />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Templates</span>
                                <Badge>{filteredTemplates.length}</Badge>
                            </CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                                <Input
                                    placeholder="Search templates..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="default">Default</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Card key={i} className="overflow-hidden">
                                            <CardHeader className="pb-2">
                                                <Skeleton className="h-6 w-3/4" />
                                            </CardHeader>
                                            <CardContent className="pb-2">
                                                <Skeleton className="h-4 w-full mb-2" />
                                                <Skeleton className="h-4 w-5/6" />
                                            </CardContent>
                                            <CardContent>
                                                <Skeleton className="h-9 w-full" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <TemplateList
                                    templates={filteredTemplates}
                                    onEdit={handleEditTemplate}
                                    onView={handleViewTemplate}
                                    onDelete={confirmDelete}
                                    onCreate={handleCreateTemplate}
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Delete Confirmation Dialog */}
                <DeleteTemplateDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    templateName={templateToDelete?.name || ""}
                    onDelete={handleDeleteTemplate}
                />

                {/* Create Template Dialog */}
                <TemplateFormDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    onSubmit={handleCreateNewTemplate}
                    initialValues={newTemplate}
                />
            </div>
        )
    }

    // IDE Style Editor for Edit or Preview Mode
    return (
        <TemplateEditor
            template={selectedTemplate}
            mode={mode}
            onBack={() => setMode("select")}
            onUpdate={handleTemplateUpdate}
            onError={setError}
            onSuccess={setSuccessMessage}
        />
    )
}

export default TemplateManager
