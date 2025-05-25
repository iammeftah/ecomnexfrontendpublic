"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ChevronDown,
    ChevronRight,
    FileCode,
    FileText,
    FolderOpen,
    PlusCircle,
    X,
    FilePlus,
    FolderPlus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { FileItem } from "../utils/file-utils"

interface FileExplorerProps {
    files: FileItem[]
    selectedFile: string
    onFileSelect: (path: string) => void
    onCreateFile: (folder: string, fileName: string) => void
    onDeleteFile: (path: string) => void
    readOnly?: boolean
}

const FileExplorer = ({
                          files,
                          selectedFile,
                          onFileSelect,
                          onCreateFile,
                          onDeleteFile,
                          readOnly = false,
                      }: FileExplorerProps) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src", "src/components", "src/pages"]))
    const [newFileDialog, setNewFileDialog] = useState<{ show: boolean; folder: string; type: "file" | "folder" }>({
        show: false,
        folder: "",
        type: "file",
    })
    const [newFileName, setNewFileName] = useState("")
    const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number; path: string } | null>(null)

    const toggleFolder = (path: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(path)) {
            newExpanded.delete(path)
        } else {
            newExpanded.add(path)
        }
        setExpandedFolders(newExpanded)
    }

    const handleCreateFileClick = (folder: string) => {
        setNewFileDialog({ show: true, folder, type: "file" })
        setNewFileName("")
    }

    const handleCreateFolderClick = (folder: string) => {
        setNewFileDialog({ show: true, folder, type: "folder" })
        setNewFileName("")
    }

    const handleCreateItem = () => {
        if (!newFileName || !newFileDialog.folder) return

        if (newFileDialog.type === "folder") {
            // Create a new folder
            // This would need to be implemented in the parent component
            // For now, we'll just create a file with a folder extension as a placeholder
            onCreateFile(newFileDialog.folder, `${newFileName}.folder`)
        } else {
            // Create a new file
            onCreateFile(newFileDialog.folder, newFileName)
        }

        setNewFileDialog({ show: false, folder: "", type: "file" })
    }

    const handleContextMenu = (e: React.MouseEvent, path: string) => {
        e.preventDefault()
        setContextMenuPosition({ x: e.clientX, y: e.clientY, path })
    }

    const closeContextMenu = () => {
        setContextMenuPosition(null)
    }

    const renderTree = (items: FileItem[], basePath = "") => {
        return items.map((item) => {
            const fullPath = basePath ? `${basePath}/${item.name}` : item.name

            if (item.type === "folder") {
                const isExpanded = expandedFolders.has(fullPath)

                return (
                    <div key={fullPath}>
                        <div
                            className={`flex items-center py-1 px-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer group ${
                                selectedFile === fullPath ? "bg-blue-100 dark:bg-blue-900" : ""
                            }`}
                            onClick={() => toggleFolder(fullPath)}
                            onContextMenu={(e) => handleContextMenu(e, fullPath)}
                        >
              <span className="mr-1">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
                            <FolderOpen className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>{item.name}</span>
                            {!readOnly && (
                                <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5">
                                                <PlusCircle className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleCreateFileClick(fullPath)
                                                }}
                                            >
                                                <FilePlus className="h-4 w-4 mr-2" />
                                                New File
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleCreateFolderClick(fullPath)
                                                }}
                                            >
                                                <FolderPlus className="h-4 w-4 mr-2" />
                                                New Folder
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                        {isExpanded && item.children && <div className="ml-4">{renderTree(item.children, fullPath)}</div>}
                    </div>
                )
            } else {
                return (
                    <div
                        key={fullPath}
                        className={`flex items-center py-1 px-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer group ${
                            selectedFile === fullPath ? "bg-blue-100 dark:bg-blue-900" : ""
                        }`}
                        onClick={() => onFileSelect(fullPath)}
                        onContextMenu={(e) => handleContextMenu(e, fullPath)}
                    >
                        <div className="w-4"></div>
                        {item.name.endsWith(".tsx") || item.name.endsWith(".jsx") ? (
                            <FileCode className="h-4 w-4 mr-2 text-blue-500" />
                        ) : (
                            <FileText className="h-4 w-4 mr-2 text-neutral-500" />
                        )}
                        <span>{item.name}</span>
                        {!readOnly && (
                            <div className="ml-auto opacity-0 group-hover:opacity-100">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDeleteFile(fullPath)
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>
                )
            }
        })
    }

    return (
        <>
            <div className="flex items-center justify-between p-2 border-b">
                <h3 className="text-sm font-medium">Files</h3>
                {!readOnly && (
                    <div className="flex space-x-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCreateFileClick("src")}>
                                        <FilePlus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>New File</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleCreateFolderClick("src")}
                                    >
                                        <FolderPlus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>New Folder</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>
            <ScrollArea className="h-[calc(100vh-94px)]">
                <div className="h-full overflow-y-auto">{renderTree(files)}</div>
            </ScrollArea>

            {/* New File/Folder Dialog */}
            <Dialog
                open={newFileDialog.show}
                onOpenChange={(open) => !open && setNewFileDialog({ show: false, folder: "", type: "file" })}
            >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{newFileDialog.type === "folder" ? "Create New Folder" : "Create New File"}</DialogTitle>
                        <DialogDescription>
                            {newFileDialog.type === "folder" ? "Enter a name for your new folder" : "Enter a name for your new file"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="fileName">{newFileDialog.type === "folder" ? "Folder Name" : "File Name"}</Label>
                            <Input
                                id="fileName"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder={newFileDialog.type === "folder" ? "e.g., utils" : "e.g., Button.tsx"}
                            />
                        </div>
                        <div className="text-sm text-neutral-500">
                            {newFileDialog.type === "folder" ? "Folder" : "File"} will be created in:{" "}
                            <span className="font-mono">{newFileDialog.folder}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewFileDialog({ show: false, folder: "", type: "file" })}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateItem} disabled={!newFileName}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FileExplorer
