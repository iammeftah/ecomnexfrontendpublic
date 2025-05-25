"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface TemplateFormValues {
    name: string
    description: string
    isDefault: boolean
    isActive: boolean
}

interface TemplateFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: TemplateFormValues) => void
    initialValues: TemplateFormValues
}

const TemplateFormDialog = ({ open, onOpenChange, onSubmit, initialValues }: TemplateFormDialogProps) => {
    const [values, setValues] = useState<TemplateFormValues>(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (field: keyof TemplateFormValues, value: string | boolean) => {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            await onSubmit(values)
            // Reset form after submission
            setValues(initialValues)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                    <DialogDescription>Fill in the template details to get started</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            value={values.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Enter template name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={values.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Enter template description"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Template Status</Label>
                        <div className="flex space-x-6">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={values.isActive}
                                    onCheckedChange={(checked) => handleChange("isActive", checked)}
                                    id="active-status"
                                />
                                <Label htmlFor="active-status">Active</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={values.isDefault}
                                    onCheckedChange={(checked) => handleChange("isDefault", checked)}
                                    id="default-status"
                                />
                                <Label htmlFor="default-status">Default</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!values.name || isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Template"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TemplateFormDialog
