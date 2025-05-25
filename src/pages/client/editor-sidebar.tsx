"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    Info,
    Copy,
    Trash2,
    ArrowUp,
    ArrowDown,
    Type,
    Box,
    Palette,
    Layers,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Bold,
    Italic,
    Underline,
    Send,
    Bot,
    Loader2,
} from "lucide-react"
import { ColorPicker } from "./color-picker"
import type { Component, Page } from "@/services/project-service/projectService"
import { toast } from "sonner"

interface EditorSidebarProps {
    component: Component | null
    onUpdate: (component: Component) => void
    currentPage: Page | undefined
    onDuplicate?: (componentId: string) => void
    onDelete?: (componentId: string) => void
    onMoveUp?: (componentId: string) => void
    onMoveDown?: (componentId: string) => void
    selectedElement?: {
        id: string
        type: string
        path: string[]
        content?: string
        styles?: Record<string, string>
    } | null
    onElementUpdate?: (elementPath: string[], updates: { content?: string; styles?: Record<string, string> }) => void
}

interface PropertyConfig {
    type: string
    value: any
    label: string
    editable: boolean
    options?: string[]
    min?: number
    max?: number
    step?: number
}

interface Properties {
    [key: string]: PropertyConfig
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
                                                         component,
                                                         onUpdate,
                                                         currentPage,
                                                         onDuplicate,
                                                         onDelete,
                                                         onMoveUp,
                                                         onMoveDown,
                                                         selectedElement,
                                                         onElementUpdate,
                                                     }) => {
    const [properties, setProperties] = useState<Properties>({})
    const [styles, setStyles] = useState<Record<string, string>>({})
    const [activeTab, setActiveTab] = useState("content")
    const [jsxContent, setJsxContent] = useState<string>("")
    const [rawCode, setRawCode] = useState<string>("")
    const [elementContent, setElementContent] = useState<string>("")
    const [elementStyles, setElementStyles] = useState<Record<string, string>>({})
    const [aiPrompt, setAiPrompt] = useState<string>("")
    const [aiResponse, setAiResponse] = useState<string>("")
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false)
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false)

    const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Parse component properties and styles when component changes
    useEffect(() => {
        if (!component) {
            setProperties({})
            setStyles({})
            setJsxContent("")
            setRawCode("")
            return
        }

        try {
            // Parse properties
            const parsedProps = component.properties ? JSON.parse(component.properties) : {}
            setProperties(parsedProps)

            // Parse styles
            const parsedStyles = component.styles ? JSON.parse(component.styles) : {}
            setStyles(parsedStyles)

            // Set JSX content
            setJsxContent(component.jsxContent || "")

            // Set raw code
            setRawCode(component.rawCode || "")
        } catch (error) {
            console.error("Error parsing component data:", error)
        }
    }, [component])

    // Update element content and styles when selectedElement changes
    useEffect(() => {
        if (selectedElement) {
            setElementContent(selectedElement.content || "")
            setElementStyles(selectedElement.styles || {})
            setActiveTab("content") // Switch to content tab when a new element is selected
        } else {
            setElementContent("")
            setElementStyles({})
        }
        setUnsavedChanges(false)
    }, [selectedElement])

    // If no component is selected, show page info
    if (!component && !selectedElement) {
        return (
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Page Information</h2>
                {currentPage ? (
                    <div className="space-y-4">
                        <div>
                            <Label>Page Name</Label>
                            <Input value={currentPage.name} disabled />
                        </div>
                        <div>
                            <Label>Path</Label>
                            <Input value={currentPage.path} disabled />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label>Home Page</Label>
                            <Switch checked={currentPage.isHomePage} disabled />
                        </div>
                        <div>
                            <Label>Components</Label>
                            <div className="text-sm text-muted-foreground">
                                {currentPage.components.length} components on this page
                            </div>
                        </div>
                        <div className="p-4 bg-muted rounded-md">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span>Click on any element in the preview to edit its properties</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground">No page selected</div>
                )}
            </div>
        )
    }

    // Update a property value
    const handlePropertyChange = (key: string, value: any) => {
        const updatedProperties = { ...properties }
        updatedProperties[key].value = value

        setProperties(updatedProperties)

        // Update the component
        const updatedComponent = { ...component }
        updatedComponent.properties = JSON.stringify(updatedProperties)
        onUpdate(updatedComponent)
    }

    // Update a style value
    const handleStyleChange = (key: string, value: string) => {
        const updatedStyles = { ...styles }
        updatedStyles[key] = value

        setStyles(updatedStyles)

        // Update the component
        const updatedComponent = { ...component }
        updatedComponent.styles = JSON.stringify(updatedStyles)
        onUpdate(updatedComponent)
    }

    // Handle element content change with debounce
    const handleElementContentChange = (content: string) => {
        setElementContent(content)
        setUnsavedChanges(true)

        // Clear any existing timeout
        if (contentUpdateTimeoutRef.current) {
            clearTimeout(contentUpdateTimeoutRef.current)
        }

        // Set a new timeout for real-time preview
        contentUpdateTimeoutRef.current = setTimeout(() => {
            if (selectedElement && onElementUpdate) {
                onElementUpdate(selectedElement.path, { content })
            }
        }, 500) // 500ms debounce
    }

    // Handle element style change
    const handleElementStyleChange = (key: string, value: string) => {
        const updatedStyles = { ...elementStyles, [key]: value }
        setElementStyles(updatedStyles)
        setUnsavedChanges(true)

        // Update in real-time
        if (selectedElement && onElementUpdate) {
            onElementUpdate(selectedElement.path, { styles: updatedStyles })
        }
    }

    // Save element changes to database
    const handleSaveElementChanges = () => {
        if (selectedElement && onElementUpdate) {
            onElementUpdate(selectedElement.path, {
                content: elementContent,
                styles: elementStyles,
            })
            setUnsavedChanges(false)
            toast.success("Element changes saved successfully")
        }
    }

    // Render element content editor
    const renderElementContentEditor = () => {
        if (!selectedElement) return null

        // Get the element type and path for better context
        const elementType = selectedElement.type
        const elementPath = selectedElement.path

        // Log for debugging
        console.log(`Rendering editor for ${elementType} element at path ${JSON.stringify(elementPath)}`)
        console.log(`Current content: "${elementContent}"`)

        switch (elementType) {
            case "text":
            case "heading":
            case "paragraph":
            case "span":
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
            case "p":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label className="flex items-center gap-2">
                                <Type className="h-4 w-4" /> Text Content
                            </Label>
                            <Textarea
                                value={elementContent}
                                onChange={(e) => handleElementContentChange(e.target.value)}
                                rows={5}
                                className="font-mono text-sm"
                            />
                            <div className="mt-2 text-xs text-muted-foreground">
                                Element type: {elementType}, Path: {JSON.stringify(elementPath)}
                            </div>
                        </div>
                        <Button onClick={handleSaveElementChanges} disabled={!unsavedChanges} className="w-full">
                            Save Changes
                        </Button>
                    </div>
                )

            case "button":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label className="flex items-center gap-2">
                                <Type className="h-4 w-4" /> Button Text
                            </Label>
                            <Input value={elementContent} onChange={(e) => handleElementContentChange(e.target.value)} />
                            <div className="mt-2 text-xs text-muted-foreground">
                                Element type: {elementType}, Path: {JSON.stringify(elementPath)}
                            </div>
                        </div>
                        <Button onClick={handleSaveElementChanges} disabled={!unsavedChanges} className="w-full">
                            Save Changes
                        </Button>
                    </div>
                )

            case "link":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label className="flex items-center gap-2">
                                <Type className="h-4 w-4" /> Link Text
                            </Label>
                            <Input value={elementContent} onChange={(e) => handleElementContentChange(e.target.value)} />
                            <div className="mt-2 text-xs text-muted-foreground">
                                Element type: {elementType}, Path: {JSON.stringify(elementPath)}
                            </div>
                        </div>
                        <Button onClick={handleSaveElementChanges} disabled={!unsavedChanges} className="w-full">
                            Save Changes
                        </Button>
                    </div>
                )

            default:
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-md">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span>This element type doesn't have editable content</span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Element type: {elementType}, Path: {JSON.stringify(elementPath)}
                            </div>
                        </div>
                        {elementContent && (
                            <div>
                                <Label>Current Content</Label>
                                <div className="p-2 bg-muted rounded-md mt-1 text-sm">{elementContent}</div>
                            </div>
                        )}
                    </div>
                )
        }
    }

    // Render element style editor
    const renderElementStyleEditor = () => {
        if (!selectedElement) return null

        return (
            <div className="space-y-6">
                {/* Text Styling */}
                <Accordion type="single" collapsible defaultValue="text-styling">
                    <AccordionItem value="text-styling">
                        <AccordionTrigger className="text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Type className="h-4 w-4" /> Text Styling
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-2">
                                {/* Font Size */}
                                <div className="space-y-2">
                                    <Label>Font Size</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={elementStyles.fontSize || ""}
                                            onChange={(e) => handleElementStyleChange("fontSize", e.target.value)}
                                            placeholder="16px"
                                        />
                                        <Select
                                            value={elementStyles.fontSize?.includes("rem") ? "rem" : "px"}
                                            onValueChange={(value) => {
                                                const size = elementStyles.fontSize?.replace(/[^\d.]/g, "") || "16"
                                                handleElementStyleChange("fontSize", `${size}${value}`)
                                            }}
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue placeholder="Unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="px">px</SelectItem>
                                                <SelectItem value="rem">rem</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Font Weight */}
                                <div className="space-y-2">
                                    <Label>Font Weight</Label>
                                    <Select
                                        value={elementStyles.fontWeight || "normal"}
                                        onValueChange={(value) => handleElementStyleChange("fontWeight", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select weight" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="bold">Bold</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                            <SelectItem value="200">200</SelectItem>
                                            <SelectItem value="300">300</SelectItem>
                                            <SelectItem value="400">400</SelectItem>
                                            <SelectItem value="500">500</SelectItem>
                                            <SelectItem value="600">600</SelectItem>
                                            <SelectItem value="700">700</SelectItem>
                                            <SelectItem value="800">800</SelectItem>
                                            <SelectItem value="900">900</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Text Color */}
                                <div className="space-y-2">
                                    <Label>Text Color</Label>
                                    <ColorPicker
                                        value={elementStyles.color || "#000000"}
                                        onChange={(color) => handleElementStyleChange("color", color)}
                                    />
                                </div>

                                {/* Text Align */}
                                <div className="space-y-2">
                                    <Label>Text Align</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={elementStyles.textAlign === "left" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => handleElementStyleChange("textAlign", "left")}
                                        >
                                            <AlignLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={elementStyles.textAlign === "center" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => handleElementStyleChange("textAlign", "center")}
                                        >
                                            <AlignCenter className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={elementStyles.textAlign === "right" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => handleElementStyleChange("textAlign", "right")}
                                        >
                                            <AlignRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={elementStyles.textAlign === "justify" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => handleElementStyleChange("textAlign", "justify")}
                                        >
                                            <AlignJustify className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Text Decoration */}
                                <div className="space-y-2">
                                    <Label>Text Style</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={elementStyles.fontWeight === "bold" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() =>
                                                handleElementStyleChange("fontWeight", elementStyles.fontWeight === "bold" ? "normal" : "bold")
                                            }
                                        >
                                            <Bold className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={elementStyles.fontStyle === "italic" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() =>
                                                handleElementStyleChange(
                                                    "fontStyle",
                                                    elementStyles.fontStyle === "italic" ? "normal" : "italic",
                                                )
                                            }
                                        >
                                            <Italic className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={elementStyles.textDecoration === "underline" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() =>
                                                handleElementStyleChange(
                                                    "textDecoration",
                                                    elementStyles.textDecoration === "underline" ? "none" : "underline",
                                                )
                                            }
                                        >
                                            <Underline className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Layout Styling */}
                <Accordion type="single" collapsible defaultValue="layout-styling">
                    <AccordionItem value="layout-styling">
                        <AccordionTrigger className="text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4" /> Layout
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-2">
                                {/* Margin */}
                                <div className="space-y-2">
                                    <Label>Margin</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <Label className="text-xs">Top</Label>
                                            <Input
                                                value={elementStyles.marginTop || ""}
                                                onChange={(e) => handleElementStyleChange("marginTop", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Right</Label>
                                            <Input
                                                value={elementStyles.marginRight || ""}
                                                onChange={(e) => handleElementStyleChange("marginRight", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Bottom</Label>
                                            <Input
                                                value={elementStyles.marginBottom || ""}
                                                onChange={(e) => handleElementStyleChange("marginBottom", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Left</Label>
                                            <Input
                                                value={elementStyles.marginLeft || ""}
                                                onChange={(e) => handleElementStyleChange("marginLeft", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Padding */}
                                <div className="space-y-2">
                                    <Label>Padding</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <Label className="text-xs">Top</Label>
                                            <Input
                                                value={elementStyles.paddingTop || ""}
                                                onChange={(e) => handleElementStyleChange("paddingTop", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Right</Label>
                                            <Input
                                                value={elementStyles.paddingRight || ""}
                                                onChange={(e) => handleElementStyleChange("paddingRight", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Bottom</Label>
                                            <Input
                                                value={elementStyles.paddingBottom || ""}
                                                onChange={(e) => handleElementStyleChange("paddingBottom", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Left</Label>
                                            <Input
                                                value={elementStyles.paddingLeft || ""}
                                                onChange={(e) => handleElementStyleChange("paddingLeft", e.target.value)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Width & Height */}
                                <div className="space-y-2">
                                    <Label>Size</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs">Width</Label>
                                            <Input
                                                value={elementStyles.width || ""}
                                                onChange={(e) => handleElementStyleChange("width", e.target.value)}
                                                placeholder="auto"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Height</Label>
                                            <Input
                                                value={elementStyles.height || ""}
                                                onChange={(e) => handleElementStyleChange("height", e.target.value)}
                                                placeholder="auto"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Background & Colors */}
                <Accordion type="single" collapsible>
                    <AccordionItem value="colors">
                        <AccordionTrigger className="text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" /> Background & Colors
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-2">
                                {/* Background Color */}
                                <div className="space-y-2">
                                    <Label>Background Color</Label>
                                    <ColorPicker
                                        value={elementStyles.backgroundColor || "transparent"}
                                        onChange={(color) => handleElementStyleChange("backgroundColor", color)}
                                    />
                                </div>

                                {/* Background Image */}
                                <div className="space-y-2">
                                    <Label>Background Image URL</Label>
                                    <Input
                                        value={elementStyles.backgroundImage?.replace(/url$$['"](.+)['"]$$/, "$1") || ""}
                                        onChange={(e) =>
                                            handleElementStyleChange("backgroundImage", e.target.value ? `url('${e.target.value}')` : "")
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Border & Effects */}
                <Accordion type="single" collapsible>
                    <AccordionItem value="border-effects">
                        <AccordionTrigger className="text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Box className="h-4 w-4" /> Border & Effects
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-2">
                                {/* Border */}
                                <div className="space-y-2">
                                    <Label>Border Width</Label>
                                    <Input
                                        value={elementStyles.borderWidth || ""}
                                        onChange={(e) => handleElementStyleChange("borderWidth", e.target.value)}
                                        placeholder="0px"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Style</Label>
                                    <Select
                                        value={elementStyles.borderStyle || "none"}
                                        onValueChange={(value) => handleElementStyleChange("borderStyle", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="solid">Solid</SelectItem>
                                            <SelectItem value="dashed">Dashed</SelectItem>
                                            <SelectItem value="dotted">Dotted</SelectItem>
                                            <SelectItem value="double">Double</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Color</Label>
                                    <ColorPicker
                                        value={elementStyles.borderColor || "#000000"}
                                        onChange={(color) => handleElementStyleChange("borderColor", color)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Radius</Label>
                                    <Input
                                        value={elementStyles.borderRadius || ""}
                                        onChange={(e) => handleElementStyleChange("borderRadius", e.target.value)}
                                        placeholder="0px"
                                    />
                                </div>

                                {/* Box Shadow */}
                                <div className="space-y-2">
                                    <Label>Box Shadow</Label>
                                    <Input
                                        value={elementStyles.boxShadow || ""}
                                        onChange={(e) => handleElementStyleChange("boxShadow", e.target.value)}
                                        placeholder="0px 4px 6px rgba(0, 0, 0, 0.1)"
                                    />
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleElementStyleChange("boxShadow", "none")}
                                        >
                                            None
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleElementStyleChange("boxShadow", "0px 4px 6px rgba(0, 0, 0, 0.1)")}
                                        >
                                            Light
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleElementStyleChange("boxShadow", "0px 10px 15px -3px rgba(0, 0, 0, 0.2)")}
                                        >
                                            Medium
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Custom CSS */}
                <div className="space-y-2">
                    <Label>Custom CSS</Label>
                    <Textarea
                        value={Object.entries(elementStyles)
                            .filter(
                                ([key]) =>
                                    ![
                                        "color",
                                        "backgroundColor",
                                        "fontSize",
                                        "fontWeight",
                                        "textAlign",
                                        "marginTop",
                                        "marginRight",
                                        "marginBottom",
                                        "marginLeft",
                                        "paddingTop",
                                        "paddingRight",
                                        "paddingBottom",
                                        "paddingLeft",
                                        "width",
                                        "height",
                                        "borderWidth",
                                        "borderStyle",
                                        "borderColor",
                                        "borderRadius",
                                        "boxShadow",
                                        "backgroundImage",
                                        "fontStyle",
                                        "textDecoration",
                                    ].includes(key),
                            )
                            .map(([key, value]) => `${key}: ${value};`)
                            .join("\n")}
                        onChange={(e) => {
                            // Parse custom CSS
                            const customStyles = e.target.value
                                .split("\n")
                                .map((line) => line.trim())
                                .filter((line) => line.includes(":"))
                                .reduce(
                                    (acc, line) => {
                                        const [key, value] = line.split(":").map((part) => part.trim())
                                        acc[key] = value.replace(/;$/, "")
                                        return acc
                                    },
                                    {} as Record<string, string>,
                                )

                            // Merge with existing styles
                            const updatedStyles = { ...elementStyles }
                            Object.entries(customStyles).forEach(([key, value]) => {
                                updatedStyles[key] = value
                            })

                            // Update element
                            if (selectedElement && onElementUpdate) {
                                onElementUpdate(selectedElement.path, { styles: updatedStyles })
                            }

                            setElementStyles(updatedStyles)
                            setUnsavedChanges(true)
                        }}
                        placeholder="Enter custom CSS properties (e.g. transform: rotate(45deg);)"
                        rows={5}
                    />
                </div>
            </div>
        )
    }

    const handleAiPromptSubmit = async () => {
        setIsAiLoading(true)
        try {
            // Replace with your actual AI assistant logic
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
            setAiResponse(`Mock AI response for: ${aiPrompt}`)
        } catch (error) {
            console.error("AI assistant error:", error)
            setAiResponse("Error processing your request.")
        } finally {
            setIsAiLoading(false)
        }
    }

    // Render AI assistant
    const renderAiAssistant = () => {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bot className="h-4 w-4" />
                        <span>Ask me anything about how to use the editor</span>
                    </div>
                </div>

                {aiResponse && (
                    <div className="p-4 bg-blue-50 rounded-md">
                        <p className="text-sm">{aiResponse}</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="How do I change the text color?"
                        rows={3}
                    />
                    <Button
                        type="button"
                        size="icon"
                        onClick={handleAiPromptSubmit}
                        disabled={isAiLoading || !aiPrompt.trim()}
                        className="self-end"
                    >
                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        )
    }

    // Render component properties editor
    const renderComponentPropertiesEditor = () => {
        if (!component) return null

        // Extract the actual property values from the component
        const extractedProperties: Record<string, any> = {}
        try {
            if (component.properties) {
                const parsedProps = JSON.parse(component.properties)

                // For each property, extract the actual value
                Object.entries(parsedProps).forEach(([key, config]: [string, any]) => {
                    extractedProperties[key] = config.value
                })
            }
        } catch (error) {
            console.error("Error extracting component properties:", error)
        }

        // Log the extracted properties for debugging
        console.log("Extracted component properties:", extractedProperties)

        return (
            <div className="space-y-4">
                {Object.keys(properties).length > 0 ? (
                    <Accordion type="multiple" defaultValue={["editable"]}>
                        <AccordionItem value="editable">
                            <AccordionTrigger>Editable Properties</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    {Object.entries(properties)
                                        .filter(([_, config]) => config.editable)
                                        .map(([key, config]) => (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={key}>{config.label || key}</Label>
                                                {renderPropertyEditor(key, config)}
                                            </div>
                                        ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="readonly">
                            <AccordionTrigger>Read-Only Properties</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    {Object.entries(properties)
                                        .filter(([_, config]) => !config.editable)
                                        .map(([key, config]) => (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={key}>{config.label || key}</Label>
                                                <Input value={String(config.value)} disabled />
                                            </div>
                                        ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">No editable properties available</div>
                )}
            </div>
        )
    }

    // Render property editor based on type
    const renderPropertyEditor = (key: string, config: PropertyConfig) => {
        if (!config.editable) {
            return <Input value={String(config.value)} disabled className="bg-muted/50" />
        }

        switch (config.type) {
            case "text":
                return <Input value={config.value || ""} onChange={(e) => handlePropertyChange(key, e.target.value)} />

            case "textarea":
                return (
                    <Textarea value={config.value || ""} onChange={(e) => handlePropertyChange(key, e.target.value)} rows={3} />
                )

            case "number":
                return (
                    <Input
                        type="number"
                        value={config.value || 0}
                        onChange={(e) => handlePropertyChange(key, Number(e.target.value))}
                        min={config.min}
                        max={config.max}
                        step={config.step || 1}
                    />
                )

            case "boolean":
                return (
                    <Switch checked={Boolean(config.value)} onCheckedChange={(checked) => handlePropertyChange(key, checked)} />
                )

            case "select":
                return (
                    <Select value={String(config.value)} onValueChange={(value) => handlePropertyChange(key, value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                            {config.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case "color":
                return <ColorPicker value={config.value || "#000000"} onChange={(color) => handlePropertyChange(key, color)} />

            case "slider":
                return (
                    <div className="flex flex-col gap-2">
                        <Slider
                            value={[Number(config.value) || 0]}
                            min={config.min || 0}
                            max={config.max || 100}
                            step={config.step || 1}
                            onValueChange={(values) => handlePropertyChange(key, values[0])}
                        />
                        <div className="text-xs text-right">{config.value}</div>
                    </div>
                )

            case "array":
                // For array types, we'll show a textarea with JSON
                try {
                    const jsonValue = JSON.stringify(config.value || [], null, 2)
                    return (
                        <Textarea
                            value={jsonValue}
                            onChange={(e) => {
                                try {
                                    const newValue = JSON.parse(e.target.value)
                                    handlePropertyChange(key, newValue)
                                } catch (err) {
                                    // Don't update if JSON is invalid
                                    console.error("Invalid JSON:", err)
                                }
                            }}
                            rows={5}
                            className="font-mono text-sm"
                        />
                    )
                } catch (e) {
                    return <div className="text-red-500 text-sm">Error parsing array</div>
                }

            case "object":
                // For object types, we'll show a textarea with JSON
                try {
                    const jsonValue = JSON.stringify(config.value || {}, null, 2)
                    return (
                        <Textarea
                            value={jsonValue}
                            onChange={(e) => {
                                try {
                                    const newValue = JSON.parse(e.target.value)
                                    handlePropertyChange(key, newValue)
                                } catch (err) {
                                    // Don't update if JSON is invalid
                                    console.error("Invalid JSON:", err)
                                }
                            }}
                            rows={5}
                            className="font-mono text-sm"
                        />
                    )
                } catch (e) {
                    return <div className="text-red-500 text-sm">Error parsing object</div>
                }

            default:
                return <Input value={String(config.value)} onChange={(e) => handlePropertyChange(key, e.target.value)} />
        }
    }

    // Determine what to show in the header
    const headerTitle = selectedElement
        ? `${selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Element`
        : component?.type || "Component"

    return (
        <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{headerTitle}</h2>

                <div className="flex gap-1">
                    {selectedElement ? (
                        <Button
                            variant={unsavedChanges ? "default" : "outline"}
                            size="sm"
                            onClick={handleSaveElementChanges}
                            disabled={!unsavedChanges}
                        >
                            Save Changes
                        </Button>
                    ) : (
                        <>
                            {onMoveUp && (
                                <Button variant="ghost" size="icon" onClick={() => onMoveUp(component!.id)} title="Move Up">
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            )}
                            {onMoveDown && (
                                <Button variant="ghost" size="icon" onClick={() => onMoveDown(component!.id)} title="Move Down">
                                    <ArrowDown className="h-4 w-4" />
                                </Button>
                            )}
                            {onDuplicate && (
                                <Button variant="ghost" size="icon" onClick={() => onDuplicate(component!.id)} title="Duplicate">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button variant="ghost" size="icon" onClick={() => onDelete(component!.id)} title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                    <TabsTrigger value="content" className="flex-1">
                        Content
                    </TabsTrigger>
                    <TabsTrigger value="style" className="flex-1">
                        Style
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex-1">
                        AI Assistant
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                    {selectedElement ? renderElementContentEditor() : renderComponentPropertiesEditor()}
                </TabsContent>

                <TabsContent value="style" className="space-y-4 mt-4">
                    {selectedElement ? (
                        renderElementStyleEditor()
                    ) : (
                        <div className="space-y-4">
                            {/* Component Style Editor */}
                            {Object.keys(styles).length > 0 ? (
                                <div className="space-y-4">
                                    {/* Common style properties */}
                                    {[
                                        { key: "color", label: "Text Color", type: "color" },
                                        { key: "backgroundColor", label: "Background Color", type: "color" },
                                        { key: "fontSize", label: "Font Size", type: "text" },
                                        {
                                            key: "fontWeight",
                                            label: "Font Weight",
                                            type: "select",
                                            options: ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
                                        },
                                        {
                                            key: "textAlign",
                                            label: "Text Align",
                                            type: "select",
                                            options: ["left", "center", "right", "justify"],
                                        },
                                        { key: "padding", label: "Padding", type: "text" },
                                        { key: "margin", label: "Margin", type: "text" },
                                        { key: "borderRadius", label: "Border Radius", type: "text" },
                                        { key: "border", label: "Border", type: "text" },
                                    ].map((style) => (
                                        <div key={style.key} className="space-y-2">
                                            <Label htmlFor={style.key}>{style.label}</Label>
                                            {style.type === "color" ? (
                                                <ColorPicker
                                                    value={styles[style.key] || ""}
                                                    onChange={(color) => handleStyleChange(style.key, color)}
                                                />
                                            ) : style.type === "select" ? (
                                                <Select
                                                    value={styles[style.key] || ""}
                                                    onValueChange={(value) => handleStyleChange(style.key, value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {style.options?.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    value={styles[style.key] || ""}
                                                    onChange={(e) => handleStyleChange(style.key, e.target.value)}
                                                    placeholder={`Enter ${style.label.toLowerCase()}`}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <Separator className="my-4" />

                                    {/* Custom CSS */}
                                    <div className="space-y-2">
                                        <Label>Custom CSS</Label>
                                        <Textarea
                                            value={Object.entries(styles)
                                                .filter(
                                                    ([key]) =>
                                                        ![
                                                            "color",
                                                            "backgroundColor",
                                                            "fontSize",
                                                            "fontWeight",
                                                            "textAlign",
                                                            "padding",
                                                            "margin",
                                                            "borderRadius",
                                                            "border",
                                                        ].includes(key),
                                                )
                                                .map(([key, value]) => `${key}: ${value};`)
                                                .join("\n")}
                                            onChange={(e) => {
                                                // Parse custom CSS
                                                const customStyles = e.target.value
                                                    .split("\n")
                                                    .map((line) => line.trim())
                                                    .filter((line) => line.includes(":"))
                                                    .reduce(
                                                        (acc, line) => {
                                                            const [key, value] = line.split(":").map((part) => part.trim())
                                                            acc[key] = value.replace(/;$/, "")
                                                            return acc
                                                        },
                                                        {} as Record<string, string>,
                                                    )

                                                // Merge with existing common styles
                                                const updatedStyles = { ...styles }
                                                Object.entries(customStyles).forEach(([key, value]) => {
                                                    updatedStyles[key] = value
                                                })

                                                // Update component
                                                const updatedComponent = { ...component }
                                                updatedComponent.styles = JSON.stringify(updatedStyles)
                                                onUpdate(updatedComponent)
                                            }}
                                            placeholder="Enter custom CSS properties (e.g. transform: rotate(45deg);)"
                                            rows={5}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">No styles available for this component</div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="ai" className="space-y-4 mt-4">
                    {renderAiAssistant()}
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default EditorSidebar
