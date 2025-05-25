"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Eye, Edit, Trash, PlusCircle, Clock, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { templateService, type Template } from "@/services/template-service/templateService"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { toast } from "sonner"

interface TemplateListProps {
    templates: Template[]
    onEdit: (template: Template) => void
    onView: (template: Template) => void
    onDelete: (template: Template) => void
    onCreate: () => void
    fetchTemplates?: boolean // Added to control when to fetch templates directly in the component
}

// Define an enum for the template actions to track which action is in progress
enum TemplateAction {
    TOGGLE_ACTIVE = 'toggle_active',
    TOGGLE_DEFAULT = 'toggle_default',
    NONE = 'none'
}

interface UpdatingState {
    templateId: string | null;
    action: TemplateAction;
}

const TemplateList = ({
                          templates: initialTemplates,
                          onEdit,
                          onView,
                          onDelete,
                          onCreate,
                          fetchTemplates = false
                      }: TemplateListProps) => {
    const { hasRole, isAuthenticated, isLoading: authLoading } = useAuth()
    const isAdmin = hasRole("ADMIN") || hasRole("ROLE_ADMIN")

    // Track which template is being updated and what action is being performed
    const [updatingState, setUpdatingState] = useState<UpdatingState>({
        templateId: null,
        action: TemplateAction.NONE
    })

    const [templates, setTemplates] = useState<Template[]>(initialTemplates)
    const [loading, setLoading] = useState<boolean>(fetchTemplates)
    const [error, setError] = useState<string | null>(null)

    // Fetch templates based on user role if fetchTemplates is true
    useEffect(() => {
        if (fetchTemplates && isAuthenticated && !authLoading) {
            const loadTemplates = async () => {
                try {
                    setLoading(true)
                    setError(null)

                    let fetchedTemplates: Template[]

                    if (isAdmin) {
                        // Admin users see all templates
                        console.log("Loading all templates for admin user")
                        fetchedTemplates = await templateService.getTemplates()
                    } else {
                        // Regular users only see active templates
                        console.log("Loading active templates for regular user")
                        fetchedTemplates = await templateService.getActiveTemplates()
                    }

                    setTemplates(fetchedTemplates)
                } catch (err) {
                    console.error("Failed to load templates:", err)
                    setError("Failed to load templates. Please try again later.")
                    toast.error("Failed to load templates", {
                        description: "Please try again or contact support if the issue persists.",
                    })
                } finally {
                    setLoading(false)
                }
            }

            loadTemplates()
        }
    }, [fetchTemplates, isAuthenticated, isAdmin, authLoading])

    // Update local templates when prop changes and not in fetch mode
    useEffect(() => {
        if (!fetchTemplates) {
            setTemplates(initialTemplates)
        }
    }, [initialTemplates, fetchTemplates])

    // Handle toggling isActive status
    const handleToggleActive = async (template: Template, index: number) => {
        try {
            // Set updating state
            setUpdatingState({
                templateId: template.id,
                action: TemplateAction.TOGGLE_ACTIVE
            })

            // Create updated template with toggled isActive value
            const updatedTemplate = {
                ...template,
                isActive: !template.isActive,
            }

            // Show loading toast
            const toastId = toast.loading("Updating template status...")

            // Call API to update the template
            const result = await templateService.updateTemplate(template.id, updatedTemplate)

            // Update the local state
            const newTemplates = [...templates]
            newTemplates[index] = result
            setTemplates(newTemplates)

            // Show success toast
            toast.success(`Template is now ${result.isActive ? "active" : "inactive"}`, {
                id: toastId,
                icon: <CheckCircle2 className="h-4 w-4" />,
            })
        } catch (error) {
            console.error("Error toggling active status:", error)
            toast.error("Failed to update template status", {
                description: "Please try again or contact support if the issue persists.",
                icon: <XCircle className="h-4 w-4" />,
            })
        } finally {
            // Reset updating state
            setUpdatingState({
                templateId: null,
                action: TemplateAction.NONE
            })
        }
    }

    // Handle toggling isDefault status
    const handleToggleDefault = async (template: Template, index: number) => {
        try {
            // Set updating state
            setUpdatingState({
                templateId: template.id,
                action: TemplateAction.TOGGLE_DEFAULT
            })

            // Create updated template with toggled isDefault value
            const updatedTemplate = {
                ...template,
                isDefault: !template.isDefault,
            }

            // Show loading toast
            const toastId = toast.loading("Updating template status...")

            // Call API to update the template
            const result = await templateService.updateTemplate(template.id, updatedTemplate)

            // Update the local state
            const newTemplates = [...templates]
            newTemplates[index] = result
            setTemplates(newTemplates)

            // Show success toast
            toast.success(`Template is ${result.isDefault ? "now" : "no longer"} set as default`, {
                id: toastId,
                icon: <CheckCircle2 className="h-4 w-4" />,
            })
        } catch (error) {
            console.error("Error toggling default status:", error)
            toast.error("Failed to update template status", {
                description: "Please try again or contact support if the issue persists.",
                icon: <XCircle className="h-4 w-4" />,
            })
        } finally {
            // Reset updating state
            setUpdatingState({
                templateId: null,
                action: TemplateAction.NONE
            })
        }
    }

    // Get template color with dark mode support
    const getTemplateColor = (template: Template): string => {
        if (template.isDefault && template.isActive) {
            return "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30"
        } else if (template.isDefault) {
            return "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/30"
        } else if (template.isActive) {
            return "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30"
        }
        return "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
    }

    // Function to check if a specific template and action is being updated
    const isUpdating = (templateId: string, action: TemplateAction): boolean => {
        return updatingState.templateId === templateId && updatingState.action === action;
    }

    // Loading state
    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading templates...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-medium mb-2">Failed to load templates</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        )
    }

    // Not authenticated state (if fetchTemplates is true)
    if (fetchTemplates && !isAuthenticated && !authLoading) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Sign in to view templates</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">You need to be signed in to access templates</p>
            </div>
        )
    }

    // Empty state
    if (templates.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                    {isAdmin
                        ? "Get started by creating your first template"
                        : "No active templates are available"}
                </p>
                {isAdmin && (
                    <Button onClick={onCreate}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
                <Card key={template.id} className={`overflow-hidden ${getTemplateColor(template)}`}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <div className="flex gap-1">
                                {template.isDefault && (
                                    <Badge
                                        variant="outline"
                                        className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                                    >
                                        Default
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className={
                                        template.isActive
                                            ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700"
                                            : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700"
                                    }
                                >
                                    {template.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {template.description || "No description"}
                        </p>
                    </CardHeader>
                    <CardContent className="pb-2">
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{templateService.getTemplateSummary(template)}</span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                                {template.createdAt ? format(new Date(template.createdAt), "MMM d, yyyy, h:mm a") : "Date unknown"}
                            </span>
                        </div>

                        {/* Admin controls for toggling isActive and isDefault */}
                        {isAdmin && (
                            <div className="mt-4 space-y-2 pt-3 border-t dark:border-neutral-700">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`active-${template.id}`} className="text-sm cursor-pointer">
                                        Active
                                    </Label>
                                    <div className="flex items-center">
                                        {isUpdating(template.id, TemplateAction.TOGGLE_ACTIVE) && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-neutral-500" />
                                        )}
                                        <Switch
                                            id={`active-${template.id}`}
                                            checked={template.isActive}
                                            disabled={updatingState.templateId === template.id}
                                            onCheckedChange={() => handleToggleActive(template, index)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`default-${template.id}`} className="text-sm cursor-pointer">
                                        Default
                                    </Label>
                                    <div className="flex items-center">
                                        {isUpdating(template.id, TemplateAction.TOGGLE_DEFAULT) && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-neutral-500" />
                                        )}
                                        <Switch
                                            id={`default-${template.id}`}
                                            checked={template.isDefault}
                                            disabled={updatingState.templateId === template.id}
                                            onCheckedChange={() => handleToggleDefault(template, index)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-2">
                        <div className="flex space-x-2 w-full">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(template)}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Preview template</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {isAdmin && (
                                <>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(template)}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit template</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    onClick={() => onDelete(template)}
                                                >
                                                    <Trash className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete template</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default TemplateList
