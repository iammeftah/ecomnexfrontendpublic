"use client"

import { useState, useEffect } from "react"
import { templateService, type Component, type Page, type Template } from "@/services/template-service/templateService"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { AlertCircle, ArrowLeft, Code, Eye, Globe, Moon, Save, Sun } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import FileExplorer from "./file-explorer"
import CodeEditor from "./code-editor"
import PreviewPanel from "./preview-panel"
import { createFolder, type FileItem } from "../utils/file-utils"
import { getComponentsInPageOrder } from "@/utils/page-parser"

interface TemplateEditorProps {
    template: Template | null
    mode: "edit" | "preview"
    onBack: () => void
    onUpdate: (template: Template) => void
    onError: (error: string) => void
    onSuccess: (message: string) => void
}

const TemplateEditor = ({ template, mode, onBack, onUpdate, onError, onSuccess }: TemplateEditorProps) => {
    const [editorTheme, setEditorTheme] = useState<"vs-dark" | "vs-light">("vs-dark")
    const [showPreview, setShowPreview] = useState(false)
    const [selectedFile, setSelectedFile] = useState<string>("")
    const [editorContent, setEditorContent] = useState<string>("")
    const [fileStructure, setFileStructure] = useState<FileItem[]>([])
    const [fileContentMap, setFileContentMap] = useState<Map<string, { content: string; language: string }>>(new Map())
    const [saving, setSaving] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    // Map to track which files correspond to which database components
    const [fileToComponentMap, setFileToComponentMap] = useState<Map<string, { pageId: string; componentId: string }>>(
        new Map(),
    )

    // Map to track file paths to page IDs
    const [fileToPageMap, setFileToPageMap] = useState<Map<string, string>>(new Map())

    // Track pending changes that haven't been saved to the server yet
    const [pendingChanges, setPendingChanges] = useState<boolean>(false)

    // Keep a copy of the template for pending changes
    const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null)

    // Initialize file structure from template data
    useEffect(() => {
        if (template) {
            // Create a working copy of the template for pending changes
            setPendingTemplate(JSON.parse(JSON.stringify(template)))

            // Try to load App.tsx content from template content field
            let appTsxContent = `import React, { useState, useEffect } from 'react';
import Home from './pages/Home';

const App = () => {
  // State to track current path/route
  const [currentPath, setCurrentPath] = useState('/');
  
  // Setup navigation function
  useEffect(() => {
    // Define a global navigation function
    window.navigateTemplate = (path) => {
      console.log('Navigating to:', path);
      setCurrentPath(path);
    };
    
    // Cleanup
    return () => {
      window.navigateTemplate = undefined;
    };
  }, []);

  // Render the current page based on path
  const renderCurrentPage = () => {
    switch(currentPath) {
      case '/':
        return <Home />;
      default:
        // Fallback to Home page
        console.log(\`No component found for path: \${currentPath}, falling back to Home\`);
        return <Home />;
    }
  };

  return (
    <div className="app">
      {renderCurrentPage()}
    </div>
  );
};

export default App;`

            // Try to get custom App.tsx content from template
            if (template?.content) {
                try {
                    const contentObj = JSON.parse(template.content)
                    if (contentObj.appTsxContent) {
                        appTsxContent = contentObj.appTsxContent
                        console.log("Loaded custom App.tsx content from template")
                    }
                } catch (err) {
                    console.error("Error parsing template content:", err)
                }
            }

            // Create base file structure
            const structure: FileItem[] = [
                {
                    name: "src",
                    type: "folder",
                    children: [
                        {
                            name: "components",
                            type: "folder",
                            children: [],
                        },
                        {
                            name: "pages",
                            type: "folder",
                            children: [],
                        },
                        {
                            name: "App.tsx",
                            type: "file",
                            language: "typescript",
                            content: appTsxContent,
                        },
                    ],
                },
            ]

            // Create a new map for file content
            const contentMap = new Map<string, { content: string; language: string }>()
            contentMap.set("src/App.tsx", {
                content: structure[0].children![2].content!,
                language: "typescript",
            })

            // Create new maps for tracking files to database entities
            const componentMap = new Map<string, { pageId: string; componentId: string }>()
            const pageMap = new Map<string, string>()

            // Add pages from template
            if (template.pages) {
                template.pages.forEach((page) => {
                    // Add page file
                    const pageFileName = `${page.name}.tsx`
                    const pageFilePath = `src/pages/${pageFileName}`

                    // Create imports for components used in this page
                    let componentImports = ""
                    let componentUsage = ""

                    if (page.components && page.components.length > 0) {
                        // Sort components by order index
                        const sortedComponents = [...page.components].sort((a, b) => a.orderIndex - b.orderIndex)

                        // Generate imports and usage
                        componentImports = sortedComponents
                            .map((comp) => `import ${comp.type} from '../components/${comp.type}';`)
                            .join("\n")

                        componentUsage = sortedComponents.map((comp) => `      <${comp.type} />`).join("\n")
                    }

                    // Create page content
                    const pageContent = `import React from 'react';
${componentImports}

const ${page.name} = () => {
  return (
    <div>
${componentUsage}
    </div>
  );
};

export default ${page.name};`

                    // Add to file structure
                    const pagesFolder = structure[0].children!.find((item) => item.name === "pages")
                    if (pagesFolder && pagesFolder.children) {
                        pagesFolder.children.push({
                            name: pageFileName,
                            type: "file",
                            language: "typescript",
                            content: pageContent,
                        })
                    }

                    // Add to content map
                    contentMap.set(pageFilePath, {
                        content: pageContent,
                        language: "typescript",
                    })

                    // Map file path to page ID
                    pageMap.set(pageFilePath, page.id)

                    // Add components from this page
                    if (page.components) {
                        page.components.forEach((component) => {
                            // Use component's raw code if available, otherwise create a basic component
                            const componentContent =
                                component.rawCode ||
                                `import React from 'react';

const ${component.type} = () => {
  const props = ${component.properties || "{}"};
  
  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">${component.type} Component</h2>
    </div>
  );
};

export default ${component.type};`

                            const componentFileName = `${component.type}.tsx`
                            const componentFilePath = `src/components/${componentFileName}`

                            // Add to file structure
                            const componentsFolder = structure[0].children!.find((item) => item.name === "components")
                            if (componentsFolder && componentsFolder.children) {
                                // Check if component already exists to avoid duplicates
                                if (!componentsFolder.children.some((item) => item.name === componentFileName)) {
                                    componentsFolder.children.push({
                                        name: componentFileName,
                                        type: "file",
                                        language: "typescript",
                                        content: componentContent,
                                    })
                                }
                            }

                            // Add to content map
                            contentMap.set(componentFilePath, {
                                content: componentContent,
                                language: "typescript",
                            })

                            // Map file path to component ID
                            componentMap.set(componentFilePath, {
                                pageId: page.id,
                                componentId: component.id,
                            })
                        })
                    }
                })
            }

            setFileStructure(structure)
            setFileContentMap(contentMap)
            setFileToComponentMap(componentMap)
            setFileToPageMap(pageMap)

            // Set initial file selection
            if (contentMap.size > 0) {
                const firstComponentPath = Array.from(componentMap.keys())[0]
                if (firstComponentPath) {
                    setSelectedFile(firstComponentPath)
                    setEditorContent(contentMap.get(firstComponentPath)?.content || "")
                } else {
                    setSelectedFile("src/App.tsx")
                    setEditorContent(contentMap.get("src/App.tsx")?.content || "")
                }
            }
        }
    }, [template])

    // Handle file selection
    const handleFileSelect = (filePath: string) => {
        if (fileContentMap.has(filePath)) {
            setSelectedFile(filePath)
            setEditorContent(fileContentMap.get(filePath)?.content || "")
        }
    }

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && selectedFile) {
            setEditorContent(value);

            // Update the content map
            const updatedMap = new Map(fileContentMap);
            updatedMap.set(selectedFile, {
                content: value,
                language: updatedMap.get(selectedFile)?.language || "typescript",
            });
            setFileContentMap(updatedMap);

            // Mark that changes are pending
            setPendingChanges(true);

            // If this is a component file, update component properties in the pending template
            if (selectedFile.includes('/components/') && pendingTemplate) {
                updateComponentPropertiesRealTime(selectedFile, value);
            }
        }
    };


    const updateComponentPropertiesRealTime = (filePath: string, content: string) => {
        // Only proceed if this is a component file
        if (!filePath.includes('/components/') || !pendingTemplate) {
            return;
        }

        console.log(`Updating properties for component file: ${filePath}`);

        // Get the component mapping
        const mapping = fileToComponentMap.get(filePath);
        if (!mapping) {
            console.log(`No component mapping found for file: ${filePath}`);
            return;
        }

        const { pageId, componentId } = mapping;

        // Find the page and component
        const pageIndex = pendingTemplate.pages.findIndex(p => p.id === pageId);
        if (pageIndex < 0) {
            console.log(`Page with ID ${pageId} not found`);
            return;
        }

        const componentIndex = pendingTemplate.pages[pageIndex].components.findIndex(c => c.id === componentId);
        if (componentIndex < 0) {
            console.log(`Component with ID ${componentId} not found in page ${pendingTemplate.pages[pageIndex].name}`);
            return;
        }

        // Get the component
        const component = pendingTemplate.pages[pageIndex].components[componentIndex];

        // Extract properties from the updated content
        const newProperties = extractPropertiesFromCode(content);
        console.log(`Extracted properties: ${newProperties}`);

        // Update component properties
        if (newProperties) {
            console.log(`Updating component ${component.type} (${componentId}) properties`);

            // Compare old and new properties (for debugging)
            try {
                const oldProps = JSON.parse(component.properties || "{}");
                const newProps = JSON.parse(newProperties);
                console.log("Old properties:", oldProps);
                console.log("New properties:", newProps);

                // Check if properties are different
                if (JSON.stringify(oldProps) !== JSON.stringify(newProps)) {
                    console.log("Properties have changed - updating component");

                    // Update properties
                    component.properties = newProperties;

                    // Update rawCode
                    component.rawCode = content;

                    // Extract and update JSX content
                    const jsxContent = extractJSXContent(content);
                    if (jsxContent) {
                        component.jsxContent = jsxContent;
                    }

                    // Create a new reference to pendingTemplate to trigger re-render
                    const updatedTemplate = {...pendingTemplate};
                    setPendingTemplate(updatedTemplate);

                    console.log("Component properties updated in pending template");
                } else {
                    console.log("No change in properties detected");
                }
            } catch (e) {
                console.error("Error comparing properties:", e);

                // Update anyway as a fallback
                component.properties = newProperties;
                component.rawCode = content;
            }
        }
    };

// This function needs to be updated in the template-editor.tsx file
    const handleCreateFile = (folder: string, fileName: string) => {
        if (!fileName || !template) return

        console.log(`Creating file: ${fileName} in folder: ${folder}`)

        // Check if it's a folder creation request
        if (fileName.endsWith(".folder")) {
            const folderName = fileName.replace(".folder", "")
            handleCreateFolder(folder, folderName)
            return
        }

        // Determine file extension if not provided
        let finalFileName = fileName
        if (!finalFileName.includes(".")) {
            finalFileName += ".tsx"
        }

        // Create the file path
        const filePath = `${folder}/${finalFileName}`

        // Check if file already exists
        if (fileContentMap.has(filePath)) {
            onError(`File ${finalFileName} already exists`)
            return
        }

        // Extract name from file name (without extension)
        const baseName = finalFileName.replace(/\.(tsx|jsx)$/, "")

        // Determine if this is a component or page creation
        const isComponent = folder.includes("/components") || folder === "components"
        const isPage = folder.includes("/pages") || folder === "pages"

        console.log(`Creating ${isComponent ? "component" : isPage ? "page" : "file"}: ${baseName}`)

        // Create initial content based on file type
        let initialContent = ""
        if (finalFileName.endsWith(".tsx") || finalFileName.endsWith(".jsx")) {
            if (isComponent) {
                // MODIFIED: Template for component files with STRUCTURED PROPERTIES format
                // that matches the backend's expected format
                initialContent = `import React from 'react';

const ${baseName} = () => {
  // Define properties in the format the backend expects:
  // Each property has type, value, label, and editable attributes
  const props = {
    "title": {
      "type": "text",
      "value": "${baseName} Component",
      "label": "Title",
      "editable": true
    },
    "subtitle": {
      "type": "text",
      "value": "Edit this component to add your content",
      "label": "Subtitle",
      "editable": true
    },
    "buttonText": {
      "type": "text",
      "value": "Learn More",
      "label": "Button Text",
      "editable": true
    }
  };

  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">{props.title.value}</h2>
      <p className="text-neutral-600 mb-4">{props.subtitle.value}</p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">{props.buttonText.value}</button>
    </div>
  );
};

export default ${baseName};`
            } else if (isPage) {
                // Template for page files - import some default components
                initialContent = `import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';

const ${baseName} = () => {
  return (
    <div>
      <Header />
      <Hero />
      <main className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-6">${baseName} Page</h2>
        <p className="text-lg text-neutral-700">
          This is the ${baseName} page content. Edit this page to customize it.
        </p>
      </main>
    </div>
  );
};

export default ${baseName};`
            } else {
                // For other files
                initialContent = `import React from 'react';

const ${baseName} = () => {
  return (
    <div>
      <h1>${baseName}</h1>
    </div>
  );
};

export default ${baseName};`
            }
        }

        // Update file content map
        const updatedMap = new Map(fileContentMap)
        updatedMap.set(filePath, {
            content: initialContent,
            language: finalFileName.endsWith(".tsx") || finalFileName.endsWith(".jsx") ? "typescript" : "plaintext",
        })
        setFileContentMap(updatedMap)

        // Update file structure
        const folderParts = folder.split("/")
        const newFileStructure = [...fileStructure]

        let currentLevel = newFileStructure
        for (const part of folderParts) {
            const folderItem = currentLevel.find((item) => item.name === part && item.type === "folder")
            if (folderItem && folderItem.children) {
                currentLevel = folderItem.children
            }
        }

        currentLevel.push({
            name: finalFileName,
            type: "file",
            content: initialContent,
            language: finalFileName.endsWith(".tsx") || finalFileName.endsWith(".jsx") ? "typescript" : "plaintext",
        })

        setFileStructure(newFileStructure)

        // Select the new file
        setSelectedFile(filePath)
        setEditorContent(initialContent)

        // Handle database updates based on file type - but DO NOT save to server yet
        // Just update the local mapping
        if (isComponent && template) {
            // Component creation - Generate a temporary ID
            const tempComponentId = generateUUID()

            // Find target page - don't need to update the actual template yet
            let targetPageId = ""

            // Find the home page (or first page if no home page)
            let targetPage = template.pages.find((page) => page.isHomePage)
            if (!targetPage && template.pages.length > 0) {
                targetPage = template.pages[0]
            }

            if (targetPage) {
                targetPageId = targetPage.id
            } else {
                // If no page exists, we'll need to create a default one later
                targetPageId = generateUUID()
            }

            // Map file path to component ID for future reference
            const fileCompMap = new Map(fileToComponentMap)
            fileCompMap.set(filePath, {
                pageId: targetPageId,
                componentId: tempComponentId,
            })
            setFileToComponentMap(fileCompMap)
        } else if (isPage && template) {
            // Page creation - Generate temporary ID
            const tempPageId = generateUUID()

            // Map the page file path to the page ID
            const updatedPageMap = new Map(fileToPageMap)
            updatedPageMap.set(filePath, tempPageId)
            setFileToPageMap(updatedPageMap)
        }

        // Mark that we have pending changes
        setPendingChanges(true)

        // Show success message
        onSuccess(`File ${finalFileName} created successfully`)
    }

    // Create a new folder
    const handleCreateFolder = (parentFolder: string, folderName: string) => {
        if (!folderName) return

        // Create the folder path
        const folderPath = `${parentFolder}/${folderName}`

        // Check if folder already exists
        const pathExists = Array.from(fileContentMap.keys()).some((path) => path.startsWith(folderPath + "/"))

        if (pathExists) {
            onError(`Folder ${folderName} already exists`)
            return
        }

        // Update file structure
        const newFileStructure = createFolder(fileStructure, parentFolder, folderName)
        setFileStructure(newFileStructure)

        // Show success message
        onSuccess(`Folder ${folderName} created successfully`)
    }

    // Delete file - UPDATED to remove the component/page from database
    const handleDeleteFile = (filePath: string) => {
        // Check if file exists
        if (!fileContentMap.has(filePath) || !pendingTemplate) return

        // Confirm deletion with the user
        if (!confirmFileDeletion(filePath)) {
            return // User cancelled the deletion
        }

        // Check if this is a component or page
        const isComponent = filePath.includes("/components/")
        const isPage = filePath.includes("/pages/")

        // Handle database updates - update the pending template
        if (isComponent) {
            // Get the component mapping
            const mapping = fileToComponentMap.get(filePath)
            if (mapping) {
                const { pageId, componentId } = mapping

                // Find the page and remove the component
                const pageIndex = pendingTemplate.pages.findIndex((p) => p.id === pageId)
                if (pageIndex >= 0) {
                    const page = pendingTemplate.pages[pageIndex]
                    const componentIndex = page.components.findIndex((c) => c.id === componentId)

                    if (componentIndex >= 0) {
                        // Remove the component
                        page.components.splice(componentIndex, 1)
                        console.log(`Removed component ${componentId} from page ${pageId}`)

                        // Update the pending template
                        setPendingTemplate({ ...pendingTemplate })
                    }
                }

                // Remove from component map
                const updatedCompMap = new Map(fileToComponentMap)
                updatedCompMap.delete(filePath)
                setFileToComponentMap(updatedCompMap)
            }
        } else if (isPage) {
            // Get the page ID
            const pageId = fileToPageMap.get(filePath)
            if (pageId) {
                // Find the page and remove it
                const pageIndex = pendingTemplate.pages.findIndex((p) => p.id === pageId)
                if (pageIndex >= 0) {
                    // Remove the page
                    pendingTemplate.pages.splice(pageIndex, 1)
                    console.log(`Removed page ${pageId}`)

                    // Update the pending template
                    setPendingTemplate({ ...pendingTemplate })
                }

                // Remove from page map
                const updatedPageMap = new Map(fileToPageMap)
                updatedPageMap.delete(filePath)
                setFileToPageMap(updatedPageMap)

                // Also remove all components that belong to this page
                for (const [compPath, mapping] of [...fileToComponentMap.entries()]) {
                    if (mapping.pageId === pageId) {
                        // Update content map and file structure for component
                        const updatedMap = new Map(fileContentMap)
                        updatedMap.delete(compPath)
                        setFileContentMap(updatedMap)

                        // Update component map
                        const updatedCompMap = new Map(fileToComponentMap)
                        updatedCompMap.delete(compPath)
                        setFileToComponentMap(updatedCompMap)

                        // Update file structure for component
                        const pathParts = compPath.split("/")
                        const compFileName = pathParts.pop()
                        const compFolderPath = pathParts.join("/")

                        // Remove from file structure - this will be handled below
                        console.log(`Removed component file ${compPath} associated with deleted page`)
                    }
                }
            }
        }

        // Update file content map
        const updatedMap = new Map(fileContentMap)
        updatedMap.delete(filePath)
        setFileContentMap(updatedMap)

        // Update file structure
        const pathParts = filePath.split("/")
        const fileName = pathParts.pop()
        const folderPath = pathParts.join("/")

        const newFileStructure = [...fileStructure]
        let currentLevel = newFileStructure

        for (const part of pathParts) {
            const folder = currentLevel.find((item) => item.name === part && item.type === "folder")
            if (folder && folder.children) {
                currentLevel = folder.children
            }
        }

        const fileIndex = currentLevel.findIndex((item) => item.name === fileName)
        if (fileIndex !== -1) {
            currentLevel.splice(fileIndex, 1)
        }

        setFileStructure(newFileStructure)

        // If the deleted file was selected, select another file
        if (selectedFile === filePath) {
            const nextFile = Array.from(updatedMap.keys())[0]
            if (nextFile) {
                setSelectedFile(nextFile)
                setEditorContent(updatedMap.get(nextFile)?.content || "")
            } else {
                setSelectedFile("")
                setEditorContent("")
            }
        }

        // Mark that we have pending changes
        setPendingChanges(true)

        // Show success message
        onSuccess(`File ${fileName} deleted successfully`)
    }

    // Add this function to confirm file deletion
    const confirmFileDeletion = (filePath: string): boolean => {
        return window.confirm(`Are you sure you want to delete ${filePath.split("/").pop()}?`)
    }

    // Modified handleSaveTemplate function to ensure component properties are saved

    const handleSaveTemplate = async () => {
        if (!template || !pendingTemplate) return;

        try {
            console.log("Starting template save process...");
            setSaving(true);
            setValidationErrors([]);

            // Create a deep copy of the pending template to avoid reference issues
            const updatedTemplate: Template = JSON.parse(JSON.stringify(pendingTemplate));

            // STEP 1: Process component files
            console.log("Updating component content from file changes");
            const processedComponentIds = new Set<string>();

            for (const [filePath, mapping] of fileToComponentMap.entries()) {
                const { pageId, componentId } = mapping;
                const fileContent = fileContentMap.get(filePath)?.content;

                if (fileContent) {
                    // Find the page
                    const pageIndex = updatedTemplate.pages.findIndex((p) => p.id === pageId);

                    if (pageIndex >= 0) {
                        // Try to find existing component
                        const componentIndex = updatedTemplate.pages[pageIndex].components.findIndex(
                            (c) => c.id === componentId
                        );

                        if (componentIndex >= 0) {
                            // Update existing component
                            const component = updatedTemplate.pages[pageIndex].components[componentIndex];
                            processedComponentIds.add(component.id);

                            // Update component rawCode
                            component.rawCode = fileContent;

                            // Extract properties - THIS IS THE CRITICAL PART
                            const extractedProperties = extractPropertiesFromCode(fileContent);

                            // Log information for debugging
                            console.log(`Processing component ID: ${componentId}, Type: ${component.type}`);
                            console.log(`Current Properties: ${component.properties}`);
                            console.log(`Extracted Properties: ${extractedProperties}`);

                            // Update the properties
                            if (extractedProperties && extractedProperties !== "{}") {
                                component.properties = extractedProperties;
                                console.log(`Updated properties for component ${component.type}`);
                            } else {
                                console.warn(`No properties extracted for component ${component.type}`);
                            }

                            // Update JSX content
                            const jsxContent = extractJSXContent(fileContent);
                            if (jsxContent) {
                                component.jsxContent = jsxContent;
                            }
                        } else {
                            // This is a new component that doesn't exist in the database yet
                            // Extract the component name from the file path
                            const fileName = filePath.split("/").pop() || "";
                            const componentType = fileName.replace(/\.(tsx|jsx)$/, "");

                            // Extract properties for the new component
                            const extractedProperties = extractPropertiesFromCode(fileContent);
                            console.log(`New component ${componentType}, extracted properties: ${extractedProperties}`);

                            // Create a new component
                            const newComponent: Component = {
                                id: componentId, // Use the ID from our mapping
                                type: componentType,
                                properties: extractedProperties,
                                styles: JSON.stringify({}),
                                rawCode: fileContent,
                                jsxContent: extractJSXContent(fileContent),
                                orderIndex: updatedTemplate.pages[pageIndex].components.length + 1,
                                isCustom: true,
                            };

                            // Add to the page
                            updatedTemplate.pages[pageIndex].components.push(newComponent);
                            processedComponentIds.add(newComponent.id);
                            console.log(`Added new component ${componentType} to page ${updatedTemplate.pages[pageIndex].name}`);
                        }
                    } else {
                        console.log(`Page with ID ${pageId} not found for component in file ${filePath}`);
                    }
                }
            }

            // Continue with the rest of your save function
            // ... [existing code for processing pages]

            // STEP 3: Validate the template before saving
            console.log("Validating template before saving");
            const validation = templateService.validateTemplateData(updatedTemplate);
            if (!validation.valid) {
                console.error("Template validation failed:", validation.errors);
                setValidationErrors(validation.errors);
                onError("Template validation failed. Please fix the errors and try again.");
                return;
            }

            // STEP 4: Save the updated template
            console.log("Saving template to server...");

            // Log the components being saved
            updatedTemplate.pages.forEach((page) => {
                console.log(`Page: ${page.name}`);
                page.components.forEach((comp) => {
                    console.log(`  Component: ${comp.type}, ID: ${comp.id}`);
                    console.log(`  Properties: ${comp.properties}`);
                });
            });

            const savedTemplate = await templateService.updateTemplate(template.id, updatedTemplate);

            // Update our local state with the saved template
            onUpdate(savedTemplate);
            setPendingTemplate(JSON.parse(JSON.stringify(savedTemplate)));
            onSuccess("Template updated successfully");

            // Reset pending changes flag
            setPendingChanges(false);

            console.log("Template saved successfully!");
        } catch (err) {
            console.error("Error saving template:", err);

            // Provide meaningful error message
            if (err instanceof Error) {
                onError(`Failed to save template: ${err.message}. Please check your component structure.`);
            } else {
                onError("Failed to save template. Please check your component structure.");
            }
        } finally {
            setSaving(false);
        }
    };

    // Function to manually add a component to a page
    const addComponentToPage = (pageId: string, componentType: string) => {
        if (!pendingTemplate) return

        // Find the page
        const pageIndex = pendingTemplate.pages.findIndex((p) => p.id === pageId)
        if (pageIndex < 0) return

        // Create a new component
        const newComponentId = generateUUID()
        const newComponent: Component = {
            id: newComponentId,
            type: componentType,
            properties: JSON.stringify({
                title: `${componentType} Component`,
                subtitle: "Manually added component",
            }),
            styles: JSON.stringify({}),
            orderIndex: pendingTemplate.pages[pageIndex].components.length + 1,
            isCustom: true,
        }

        // Add to the page
        pendingTemplate.pages[pageIndex].components.push(newComponent)

        // Update the pending template
        setPendingTemplate({ ...pendingTemplate })

        // Mark that we have pending changes
        setPendingChanges(true)

        // Show success message
        onSuccess(`Added ${componentType} to ${pendingTemplate.pages[pageIndex].name}`)
    }



    // Generate a UUID for new entities
    const generateUUID = (): string => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0
            const v = c === "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    // Extract JSX content from component code
    const extractJSXContent = (componentCode: string): string => {
        try {
            // Look for return statement with JSX
            const returnMatch = componentCode.match(/return\s*$$\s*([\s\S]*?)\s*$$\s*;?\s*\}/)
            if (returnMatch && returnMatch[1]) {
                return returnMatch[1].trim()
            }

            // If no return statement found, try to find JSX directly
            const jsxMatch = componentCode.match(/<[A-Za-z][^>]*>[\s\S]*<\/[A-Za-z][^>]*>/)
            if (jsxMatch) {
                return jsxMatch[0].trim()
            }

            return ""
        } catch (error) {
            console.error("Error extracting JSX content:", error)
            return ""
        }
    }

    // Updated extractPropertiesFromCode function for template-editor.tsx

    /**
     * Completely rewritten extractPropertiesFromCode function to properly extract
     * structured properties from component code
     */
    const extractPropertiesFromCode = (componentCode: string): string => {
        try {
            console.log("Extracting properties from component code");

            // Regular expression to find the props object declaration
            // This regex handles multi-line object with proper brackets counting
            const propsRegex = /const\s+props\s*=\s*({(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*});/s;
            const match = componentCode.match(propsRegex);

            if (!match || !match[1]) {
                console.log("No props object found, falling back to JSX extraction");
                return extractPropertiesFromJSX(componentCode);
            }

            // We found the props object, now we need to parse it
            const propsObjectStr = match[1];
            console.log("Found props object:", propsObjectStr.substring(0, 100) + "...");

            // Evaluate the props object
            try {
                // First, check if we have a structured format (with type, value, label, editable)
                const isStructured = propsObjectStr.includes('"type"') ||
                    propsObjectStr.includes("'type'") ||
                    propsObjectStr.includes('"value"') ||
                    propsObjectStr.includes("'value'");

                if (isStructured) {
                    console.log("Found structured props format");

                    // Replace single quotes with double quotes
                    let jsonLikeStr = propsObjectStr
                        .replace(/'/g, '"')                           // Replace single quotes
                        .replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"')  // Add quotes to keys
                        .replace(/,(\s*[}\]])/g, "$1")               // Remove trailing commas
                        .replace(/\/\/.*?(\r?\n|$)/g, "$1");         // Remove comments

                    // Try to parse the props
                    let parsed;
                    try {
                        parsed = Function('return ' + jsonLikeStr)();
                    } catch (e) {
                        console.error("Couldn't evaluate props object with Function, trying JSON.parse with cleaning", e);
                        jsonLikeStr = jsonLikeStr
                            .replace(/(\w+):/g, '"$1":')               // Add quotes to all property names
                            .replace(/:\s*([^"][^,}]*[^"])(,|})/g, ':"$1"$2') // Add quotes to unquoted values
                            .replace(/:\s*"(true|false)"/g, ':$1')     // Fix boolean values
                            .replace(/:\s*"(-?\d+\.?\d*)"/g, ':$1');   // Fix numeric values

                        try {
                            parsed = JSON.parse(jsonLikeStr);
                        } catch (e2) {
                            console.error("JSON.parse failed too", e2);
                            throw new Error("Couldn't parse structured props object");
                        }
                    }

                    // Ensure each property has the required structure
                    for (const [key, prop] of Object.entries(parsed)) {
                        if (typeof prop === 'object' && prop !== null) {
                            if (!prop.hasOwnProperty('type')) prop.type = inferType(prop.value);
                            if (!prop.hasOwnProperty('label')) prop.label = formatLabel(key);
                            if (!prop.hasOwnProperty('editable')) prop.editable = true;
                        }
                    }

                    console.log("Successfully extracted structured props:", parsed);
                    return JSON.stringify(parsed);
                } else {
                    console.log("Found simple props format, converting to structured format");

                    // For simpler props format, convert to structured
                    // Replace single quotes with double quotes
                    let jsonLikeStr = propsObjectStr
                        .replace(/'/g, '"')                           // Replace single quotes
                        .replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"')  // Add quotes to keys
                        .replace(/,(\s*[}\]])/g, "$1")               // Remove trailing commas
                        .replace(/\/\/.*?(\r?\n|$)/g, "$1");         // Remove comments

                    // Try to parse the props
                    let parsed;
                    try {
                        parsed = Function('return ' + jsonLikeStr)();
                    } catch (e) {
                        console.error("Couldn't evaluate simple props object with Function, trying JSON.parse with cleaning", e);
                        jsonLikeStr = jsonLikeStr
                            .replace(/(\w+):/g, '"$1":')               // Add quotes to all property names
                            .replace(/:\s*([^"][^,}]*[^"])(,|})/g, ':"$1"$2') // Add quotes to unquoted values
                            .replace(/:\s*"(true|false)"/g, ':$1')     // Fix boolean values
                            .replace(/:\s*"(-?\d+\.?\d*)"/g, ':$1');   // Fix numeric values

                        try {
                            parsed = JSON.parse(jsonLikeStr);
                        } catch (e2) {
                            console.error("JSON.parse failed too", e2);
                            throw new Error("Couldn't parse simple props object");
                        }
                    }

                    // Convert to structured format
                    const structured = {};
                    for (const [key, value] of Object.entries(parsed)) {
                        structured[key] = {
                            type: inferType(value),
                            value: value,
                            label: formatLabel(key),
                            editable: true
                        };
                    }

                    console.log("Converted to structured format:", structured);
                    return JSON.stringify(structured);
                }
            } catch (evaluationError) {
                console.error("Error evaluating props object:", evaluationError);
                return extractPropertiesFromJSX(componentCode);
            }
        } catch (error) {
            console.error("Error extracting properties:", error);
            return extractPropertiesFromJSX(componentCode);
        }
    };

    /**
     * Extract properties from JSX content when props object can't be parsed
     */
    const extractPropertiesFromJSX = (componentCode: string): string => {
        console.log("Attempting to extract properties from JSX");
        const properties = {};

        // Look for headings
        const headingMatches = componentCode.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gs);
        if (headingMatches && headingMatches.length > 0) {
            // Extract text content from the first heading
            const headingText = headingMatches[0].replace(/<[^>]*>/g, '').trim();
            properties.title = {
                type: "text",
                value: headingText,
                label: "Title",
                editable: true
            };
        }

        // Look for paragraphs
        const paragraphMatches = componentCode.match(/<p[^>]*>(.*?)<\/p>/gs);
        if (paragraphMatches && paragraphMatches.length > 0) {
            // Extract text content from the first paragraph
            const paragraphText = paragraphMatches[0].replace(/<[^>]*>/g, '').trim();
            properties.content = {
                type: "text",
                value: paragraphText,
                label: "Content",
                editable: true
            };
        }

        // Look for buttons
        const buttonMatches = componentCode.match(/<button[^>]*>(.*?)<\/button>/gs);
        if (buttonMatches && buttonMatches.length > 0) {
            // Extract text content from the first button
            const buttonText = buttonMatches[0].replace(/<[^>]*>/g, '').trim();
            properties.buttonText = {
                type: "text",
                value: buttonText,
                label: "Button Text",
                editable: true
            };
        }

        // Look for images
        const imgMatches = componentCode.match(/src=["'](.*?)["']/g);
        if (imgMatches && imgMatches.length > 0) {
            // Extract URL from the first image
            const imgSrc = imgMatches[0].replace(/src=["'](.*?)["']/, '$1').trim();
            properties.imageUrl = {
                type: "image",
                value: imgSrc,
                label: "Image URL",
                editable: true
            };
        }

        // If we found nothing, return a default structure
        if (Object.keys(properties).length === 0) {
            return JSON.stringify({
                title: {
                    type: "text",
                    value: "Component Title",
                    label: "Title",
                    editable: true
                },
                content: {
                    type: "text",
                    value: "Component content goes here",
                    label: "Content",
                    editable: true
                }
            });
        }

        return JSON.stringify(properties);
    };

    /**
     * Infer the type of a property value
     */
    const inferType = (value: any): string => {
        if (value === null || value === undefined) {
            return "text";
        }

        if (typeof value === 'boolean') {
            return "boolean";
        }

        if (typeof value === 'number') {
            return "number";
        }

        if (typeof value === 'string') {
            // Check if it looks like an image URL
            if (value.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)($|\?)/i) ||
                value.includes('unsplash.com') ||
                value.includes('images.')) {
                return "image";
            }

            // Check if it looks like a color
            if (value.match(/^#[0-9A-Fa-f]{3,8}$/) ||
                value.match(/^rgba?\(.*\)$/) ||
                value.match(/^hsla?\(.*\)$/)) {
                return "color";
            }

            // Check if it looks like an email
            if (value.includes('@') && value.includes('.')) {
                return "email";
            }

            // Check if it's a URL
            if (value.match(/^https?:\/\//)) {
                return "url";
            }
        }

        if (Array.isArray(value)) {
            return "array";
        }

        if (typeof value === 'object') {
            return "object";
        }

        return "text";
    };

    /**
     * Format a camelCase property key as a readable label
     */
    const formatLabel = (key: string): string => {
        if (!key) return "";

        // Handle camelCase
        const withSpaces = key.replace(/([A-Z])/g, ' $1');

        // Handle snake_case
        const formatted = withSpaces.replace(/_/g, ' ');

        // Capitalize first letter
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    /**
     * Infers the property type based on the value
     */
    const inferPropertyType = (value: any): string => {
        if (value === null || value === undefined) {
            return "text"
        }

        if (typeof value === "boolean") {
            return "boolean"
        }

        if (typeof value === "number") {
            return "number"
        }

        // Check if it's a color value (basic check for hex colors)
        if (typeof value === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(value)) {
            return "color"
        }

        // Check for image URLs (simple check)
        if (
            typeof value === "string" &&
            (value.match(/\.(jpeg|jpg|gif|png|svg)$/i) ||
                (value.startsWith("http") && value.match(/\.(jpeg|jpg|gif|png|svg)/i)))
        ) {
            return "image"
        }

        return "text"
    }

    /**
     * Formats a camelCase property key as a readable label
     */
    const formatPropertyLabel = (key: string): string => {
        if (!key) return ""

        // Insert space before each capital letter and capitalize the first letter
        const formatted = key.replace(/([A-Z])/g, " $1")
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    // Preview template in a new window
    const handlePreviewTemplate = () => {
        if (template) {
            window.open(`/templates/preview/${template.id}`, "_blank")
        }
    }

    // Prompt to save changes if navigating away with unsaved changes
    const handleBack = () => {
        if (pendingChanges) {
            if (window.confirm("You have unsaved changes. Save before going back?")) {
                handleSaveTemplate().then(() => {
                    onBack()
                })
            } else {
                onBack()
            }
        } else {
            onBack()
        }
    }

    return (
        <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-neutral-100 dark:bg-neutral-800">
                <div className="flex items-center">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <h1 className="text-lg font-semibold">{template?.name}</h1>
                    {mode === "edit" && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Editing</Badge>
                    )}
                    {mode === "preview" && (
                        <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Preview</Badge>
                    )}
                    {pendingChanges && (
                        <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                            Unsaved Changes
                        </Badge>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                                    {showPreview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{showPreview ? "Show Code" : "Show Preview"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditorTheme(editorTheme === "vs-dark" ? "vs-light" : "vs-dark")}
                    >
                        {editorTheme === "vs-dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    {mode === "edit" && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveTemplate}
                            disabled={saving}
                            className={pendingChanges ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                            {saving ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                </>
                            )}
                        </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={handlePreviewTemplate}>
                        <Globe className="h-4 w-4 mr-1" />
                        Live Preview
                    </Button>
                </div>
            </div>

            {/* Status Messages */}
            {saving && (
                <Alert className="m-2 bg-blue-50 border-blue-200 text-blue-800">
                    <AlertDescription>Saving template...</AlertDescription>
                </Alert>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <Alert className="m-2 bg-red-50 border-red-200 text-red-800">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <div>
                        <AlertDescription className="font-semibold">Please fix the following errors:</AlertDescription>
                        <ul className="list-disc pl-5 mt-2 text-sm">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </Alert>
            )}

            {/* Main Content Area */}
            <ResizablePanelGroup direction="horizontal" className="flex-1 h-[calc(100vh-56px)]">
                {/* File Explorer Panel */}
                <ResizablePanel defaultSize={15} minSize={10} maxSize={25} className="bg-neutral-50 dark:bg-neutral-900">
                    <div className="flex flex-col h-full border-r">
                        <FileExplorer
                            files={fileStructure}
                            selectedFile={selectedFile}
                            onFileSelect={handleFileSelect}
                            onCreateFile={handleCreateFile}
                            onDeleteFile={handleDeleteFile}
                            readOnly={mode === "preview"}
                        />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />

                {/* Editor/Preview Panel */}
                <ResizablePanel defaultSize={85}>
                    {showPreview ? (
                        <PreviewPanel code={editorContent} />
                    ) : (
                        <CodeEditor
                            file={selectedFile}
                            content={editorContent}
                            onChange={handleEditorChange}
                            theme={editorTheme}
                            readOnly={mode === "preview"}
                        />
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

export default TemplateEditor
