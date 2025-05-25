"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteTemplateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    templateName: string
    onDelete: () => void
}

const DeleteTemplateDialog = ({ open, onOpenChange, templateName, onDelete }: DeleteTemplateDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Template</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the template "{templateName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteTemplateDialog
