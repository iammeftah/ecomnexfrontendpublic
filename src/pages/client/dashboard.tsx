"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { projectService, type Project } from "@/services/project-service/projectService"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"

const ClientDashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("all")
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    const navigate = useNavigate()

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true)
                setError(null)
                const fetchedProjects = await projectService.getProjects()
                setProjects(fetchedProjects)
                setFilteredProjects(fetchedProjects)
            } catch (err) {
                console.error("Error fetching projects:", err)
                setError("Failed to load projects. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    // Filter projects based on search term
    useEffect(() => {
        let result = projects

        // Apply search filter
        if (searchTerm) {
            result = result.filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        // Apply tab filter (you can add more filters based on project status if needed)
        if (activeTab === "recent") {
            // Sort by last modified date
            result = [...result]
                .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                .slice(0, 5)
        }

        setFilteredProjects(result)
    }, [searchTerm, projects, activeTab])

    // Handle project editing
    const handleEditProject = (project: Project) => {
        navigate(`/client/editor/${project.id}`)
    }

    // Handle project preview
    const handlePreviewProject = (project: Project) => {
        // Navigate to project preview (you'll need to implement this page)
        navigate(`/client/preview/${project.id}`)
    }

    // Handle project deletion
    const handleDeleteProject = async () => {
        if (!projectToDelete) return

        try {
            await projectService.deleteProject(projectToDelete.id)
            setProjects(projects.filter((p) => p.id !== projectToDelete.id))
            toast.success("Project deleted successfully")
            setProjectToDelete(null)
        } catch (err) {
            console.error("Error deleting project:", err)
            toast.error("Failed to delete project")
        }
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
        <div className="container mx-auto py-10 px-4">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Projects</h1>
                        <p className="text-gray-600 mt-1">Manage and edit your website projects</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search projects..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => navigate("/templates")}>New Project</Button>
                    </div>
                </div>

                <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="all">All Projects</TabsTrigger>
                        <TabsTrigger value="recent">Recently Modified</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-0">
                        {loading ? (
                            // Loading skeletons
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <Skeleton className="h-40 w-full" />
                                        <CardHeader className="pb-2">
                                            <Skeleton className="h-6 w-3/4" />
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <Skeleton className="h-4 w-full mb-2" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </CardContent>
                                        <CardFooter>
                                            <Skeleton className="h-9 w-full" />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : error ? (
                            // Error state
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <div className="text-red-500 mb-2">⚠️ {error}</div>
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Try Again
                                </Button>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            // Empty state
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
                                <p className="text-gray-500 mb-4">No projects found</p>
                                <Button onClick={() => navigate("/templates")}>Create Your First Project</Button>
                            </div>
                        ) : (
                            // Projects grid
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <Card key={project.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                                            {/* You can add a project thumbnail here */}
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                {project.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="flex items-center text-xs text-gray-500 mb-2">
                                                <Badge variant="outline" className="mr-2">
                                                    {project.pages.length} pages
                                                </Badge>
                                                <Badge variant="outline">{project.componentCount} components</Badge>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>Last modified: {formatDate(project.lastModified)}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button className="flex-1" onClick={() => handleEditProject(project)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={() => handlePreviewProject(project)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => setProjectToDelete(project)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProjectToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ClientDashboard
