import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/contexts/auth-context/AuthContext';
import { projectService } from '@/services/project-service/projectService';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    templateName: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   templateId,
                                                                   templateName
                                                               }) => {
    const defaultName = typeof templateName === 'string' ? templateName : 'New';
    const [projectName, setProjectName] = useState(`${defaultName} Project`);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if we have a token
                const token = localStorage.getItem('auth_token');
                console.log('Auth token available:', !!token);

                if (token) {
                    // Try to make a test request to verify the token works
                    const response = await api.get('/api/projects/auth-check');
                    console.log('Auth check response:', response.data);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            }
        };

        if (isOpen) {
            checkAuth();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!templateId) {
            setError('Template ID is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Creating project with template ID:', templateId);
            console.log('Project name:', projectName);
            console.log('Current user:', user);

            // Create the project
            const project = await projectService.createProject(templateId, projectName);

            // Show success toast
            toast.success("Project created successfully");

            // Close the modal
            onClose();

            // Navigate to the editor
            if (project && project.id) {
                navigate(`/client/editor/${project.id}`);
            } else {
                throw new Error('Project creation failed - no project ID returned');
            }
        } catch (err: any) {
            console.error("Project creation error:", err);

            // Detailed error logging
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
                console.error('Response headers:', err.response.headers);

                // Set a more descriptive error message
                if (err.response.status === 403) {
                    setError('Permission denied. You may not have the required permissions or your session has expired.');
                    toast.error('Permission denied. Please try logging in again.');
                } else {
                    setError(err.response?.data?.message || err.message || 'Failed to create project');
                    toast.error(err.response?.data?.message || 'Failed to create project');
                }
            } else {
                setError(err.message || 'Failed to create project');
                toast.error(err.message || 'Failed to create project');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="projectName" className="text-right">
                                Project Name
                            </Label>
                            <Input
                                id="projectName"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProjectModal;
