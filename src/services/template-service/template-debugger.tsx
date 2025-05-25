// template-debugger.ts
// A utility to help diagnose issues with template data

/**
 * Template Debug Utility
 *
 * This utility provides functions to help diagnose issues with template data,
 * including validation, structure checking, and data inspection.
 */

import type { Template, Page, Component } from "@/services/template-service/templateService";

export class TemplateDebugger {
    /**
     * Validate a template structure and report any issues
     */
    static validateTemplate(template: Partial<Template>): { valid: boolean; issues: string[] } {
        const issues: string[] = [];

        // Check basic properties
        if (!template.id) issues.push("Template is missing ID");
        if (!template.name) issues.push("Template is missing name");

        // Check content
        if (template.content) {
            try {
                if (typeof template.content === "string") {
                    JSON.parse(template.content);
                }
            } catch (e) {
                issues.push("Template content is not valid JSON");
            }
        } else {
            issues.push("Template is missing content");
        }

        // Check pages
        if (!template.pages || template.pages.length === 0) {
            issues.push("Template has no pages");
        } else {
            // Check home page
            const homePages = template.pages.filter(p => p.isHomePage);
            if (homePages.length === 0) {
                issues.push("Template has no home page");
            } else if (homePages.length > 1) {
                issues.push(`Template has ${homePages.length} home pages (should have exactly 1)`);
            }

            // Validate each page
            template.pages.forEach((page, idx) => {
                const pageIssues = this.validatePage(page);
                if (pageIssues.length > 0) {
                    issues.push(`Issues with page ${idx + 1} (${page.name || 'unnamed'}):`);
                    pageIssues.forEach(issue => issues.push(`  - ${issue}`));
                }
            });

            // Check for duplicate page IDs
            const pageIds = template.pages.map(p => p.id).filter(Boolean);
            const duplicatePageIds = pageIds.filter((id, idx) => pageIds.indexOf(id) !== idx);
            if (duplicatePageIds.length > 0) {
                issues.push(`Template has duplicate page IDs: ${duplicatePageIds.join(', ')}`);
            }
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Validate a page structure
     */
    static validatePage(page: Page): string[] {
        const issues: string[] = [];

        // Check basic properties
        if (!page.id) issues.push("Page is missing ID");
        if (!page.name) issues.push("Page is missing name");
        if (!page.path) issues.push("Page is missing path");

        // Check components
        if (!page.components) {
            issues.push("Page has no components array");
        } else {
            // Validate each component
            page.components.forEach((component, idx) => {
                const componentIssues = this.validateComponent(component);
                if (componentIssues.length > 0) {
                    issues.push(`Issues with component ${idx + 1} (${component.type || 'unknown'}):`);
                    componentIssues.forEach(issue => issues.push(`  - ${issue}`));
                }
            });

            // Check for duplicate component IDs
            const componentIds = page.components.map(c => c.id).filter(Boolean);
            const duplicateComponentIds = componentIds.filter((id, idx) => componentIds.indexOf(id) !== idx);
            if (duplicateComponentIds.length > 0) {
                issues.push(`Page has duplicate component IDs: ${duplicateComponentIds.join(', ')}`);
            }

            // Check for proper ordering
            const orderIndices = page.components.map(c => c.orderIndex);
            const hasDuplicateOrders = orderIndices.some((order, idx) =>
                orderIndices.indexOf(order) !== idx
            );

            if (hasDuplicateOrders) {
                issues.push(`Page has components with duplicate order indices`);
            }
        }

        return issues;
    }

    /**
     * Validate a component structure
     */
    static validateComponent(component: Component): string[] {
        const issues: string[] = [];

        // Check basic properties
        if (!component.id) issues.push("Component is missing ID");
        if (!component.type) issues.push("Component is missing type");

        // Check properties
        if (!component.properties) {
            issues.push("Component is missing properties");
        } else {
            try {
                if (typeof component.properties === "string") {
                    JSON.parse(component.properties);
                }
            } catch (e) {
                issues.push("Component properties is not valid JSON");
            }
        }

        // Check styles if present
        if (component.styles) {
            try {
                if (typeof component.styles === "string") {
                    JSON.parse(component.styles);
                }
            } catch (e) {
                issues.push("Component styles is not valid JSON");
            }
        }

        return issues;
    }

    /**
     * Create a detailed report of a template's structure
     */
    static generateTemplateReport(template: Partial<Template>): string {
        let report = '--- TEMPLATE REPORT ---\n\n';

        // Basic template info
        report += `Template: ${template.name || 'unnamed'} (ID: ${template.id || 'none'})\n`;
        report += `Description: ${template.description || 'none'}\n`;
        report += `Status: ${template.isActive ? 'Active' : 'Inactive'}, ${template.isDefault ? 'Default' : 'Not Default'}\n`;
        report += `Created: ${template.createdAt || 'unknown'}\n\n`;

        // Content
        report += 'Content:\n';
        try {
            const content = typeof template.content === 'string'
                ? JSON.parse(template.content)
                : template.content;
            report += JSON.stringify(content, null, 2) + '\n\n';
        } catch (e) {
            report += `[INVALID JSON: ${e}]\n\n`;
        }

        // Pages
        report += `Pages (${template.pages?.length || 0}):\n`;
        if (template.pages && template.pages.length > 0) {
            template.pages.forEach((page, idx) => {
                report += `  ${idx + 1}. ${page.name || 'unnamed'} (ID: ${page.id || 'none'})\n`;
                report += `     Path: ${page.path || 'none'}\n`;
                report += `     Home Page: ${page.isHomePage ? 'Yes' : 'No'}\n`;
                report += `     Components (${page.components?.length || 0}):\n`;

                if (page.components && page.components.length > 0) {
                    page.components.forEach((component, cIdx) => {
                        report += `       ${cIdx + 1}. ${component.type || 'unknown'} (ID: ${component.id || 'none'})\n`;
                        report += `          Order: ${component.orderIndex}\n`;
                        report += `          Custom: ${component.isCustom ? 'Yes' : 'No'}\n`;

                        try {
                            const props = typeof component.properties === 'string'
                                ? JSON.parse(component.properties)
                                : component.properties;
                            report += `          Properties: ${JSON.stringify(props, null, 2).split('\n').join('\n          ')}\n`;
                        } catch (e) {
                            report += `          Properties: [INVALID JSON: ${e}]\n`;
                        }

                        if (component.styles) {
                            try {
                                const styles = typeof component.styles === 'string'
                                    ? JSON.parse(component.styles)
                                    : component.styles;
                                report += `          Styles: ${JSON.stringify(styles, null, 2).split('\n').join('\n          ')}\n`;
                            } catch (e) {
                                report += `          Styles: [INVALID JSON: ${e}]\n`;
                            }
                        }

                        report += '\n';
                    });
                } else {
                    report += '       No components\n\n';
                }
            });
        } else {
            report += '  No pages\n\n';
        }

        return report;
    }

    /**
     * Log the detailed template structure to the console
     */
    static logTemplateStructure(template: Partial<Template>): void {
        console.group('Template Structure');

        console.log('Template:', {
            id: template.id,
            name: template.name,
            description: template.description,
            isActive: template.isActive,
            isDefault: template.isDefault,
            createdAt: template.createdAt
        });

        try {
            console.log('Content:', typeof template.content === 'string'
                ? JSON.parse(template.content)
                : template.content);
        } catch (e) {
            console.error('Invalid content JSON:', e);
        }

        console.group('Pages');
        if (template.pages && template.pages.length > 0) {
            template.pages.forEach((page, idx) => {
                console.group(`Page ${idx + 1}: ${page.name}`);
                console.log({
                    id: page.id,
                    path: page.path,
                    isHomePage: page.isHomePage
                });

                console.group('Components');
                if (page.components && page.components.length > 0) {
                    page.components.forEach((component, cIdx) => {
                        console.group(`Component ${cIdx + 1}: ${component.type}`);
                        console.log({
                            id: component.id,
                            orderIndex: component.orderIndex,
                            isCustom: component.isCustom
                        });

                        try {
                            console.log('Properties:', typeof component.properties === 'string'
                                ? JSON.parse(component.properties)
                                : component.properties);
                        } catch (e) {
                            console.error('Invalid properties JSON:', e);
                        }

                        if (component.styles) {
                            try {
                                console.log('Styles:', typeof component.styles === 'string'
                                    ? JSON.parse(component.styles)
                                    : component.styles);
                            } catch (e) {
                                console.error('Invalid styles JSON:', e);
                            }
                        }

                        console.groupEnd();
                    });
                } else {
                    console.log('No components');
                }
                console.groupEnd(); // Components

                console.groupEnd(); // Page
            });
        } else {
            console.log('No pages');
        }
        console.groupEnd(); // Pages

        console.groupEnd(); // Template Structure
    }

    /**
     * Fix common template issues automatically
     */
    static fixTemplateIssues(template: Partial<Template>): Partial<Template> {
        // Create a deep copy to avoid modifying the original
        const fixedTemplate = JSON.parse(JSON.stringify(template));

        // Fix template ID if missing
        if (!fixedTemplate.id) {
            fixedTemplate.id = this.generateId();
        }

        // Fix template content if invalid
        if (fixedTemplate.content) {
            try {
                if (typeof fixedTemplate.content === 'string') {
                    JSON.parse(fixedTemplate.content);
                }
            } catch (e) {
                // Reset to default content
                fixedTemplate.content = JSON.stringify({
                    theme: 'default',
                    primaryColor: '#3b82f6',
                    secondaryColor: '#f59e0b',
                    fontFamily: 'Inter, sans-serif',
                    layout: 'default'
                });
            }
        } else {
            // Create default content if missing
            fixedTemplate.content = JSON.stringify({
                theme: 'default',
                primaryColor: '#3b82f6',
                secondaryColor: '#f59e0b',
                fontFamily: 'Inter, sans-serif',
                layout: 'default'
            });
        }

        // Fix pages
        if (!fixedTemplate.pages || !Array.isArray(fixedTemplate.pages)) {
            fixedTemplate.pages = [{
                id: this.generateId(),
                name: 'Home',
                path: '/',
                isHomePage: true,
                components: []
            }];
        } else {
            // Track fixed page IDs to avoid duplicates
            const pageIds = new Set<string>();

            fixedTemplate.pages = fixedTemplate.pages.map(page => {
                // Fix page ID if missing or duplicate
                if (!page.id || pageIds.has(page.id)) {
                    page.id = this.generateId();
                }
                pageIds.add(page.id);

                // Fix page name if missing
                if (!page.name) {
                    page.name = 'Unnamed Page';
                }

                // Fix page path if missing
                if (!page.path) {
                    page.path = page.name === 'Home' ? '/' : `/${page.name.toLowerCase().replace(/\s+/g, '-')}`;
                }

                // Fix components
                if (!page.components || !Array.isArray(page.components)) {
                    page.components = [];
                } else {
                    // Track fixed component IDs to avoid duplicates
                    const componentIds = new Set<string>();

                    page.components = page.components.map((component, idx) => {
                        // Fix component ID if missing or duplicate
                        if (!component.id || componentIds.has(component.id)) {
                            component.id = this.generateId();
                        }
                        componentIds.add(component.id);

                        // Fix component type if missing
                        if (!component.type) {
                            component.type = 'Component';
                        }

                        // Fix component properties if invalid
                        if (!component.properties) {
                            component.properties = JSON.stringify({});
                        } else {
                            try {
                                if (typeof component.properties === 'string') {
                                    JSON.parse(component.properties);
                                } else {
                                    component.properties = JSON.stringify(component.properties);
                                }
                            } catch (e) {
                                component.properties = JSON.stringify({});
                            }
                        }

                        // Fix component styles if invalid
                        if (component.styles) {
                            try {
                                if (typeof component.styles === 'string') {
                                    JSON.parse(component.styles);
                                } else {
                                    component.styles = JSON.stringify(component.styles);
                                }
                            } catch (e) {
                                component.styles = JSON.stringify({});
                            }
                        }

                        // Fix order index if missing
                        if (component.orderIndex === undefined || component.orderIndex === null) {
                            component.orderIndex = idx;
                        }

                        // Fix isCustom if missing
                        if (component.isCustom === undefined) {
                            component.isCustom = true;
                        }

                        return component;
                    });
                }

                return page;
            });

            // Ensure at least one page is marked as home page
            const hasHomePage = fixedTemplate.pages.some(page => page.isHomePage);
            if (!hasHomePage && fixedTemplate.pages.length > 0) {
                fixedTemplate.pages[0].isHomePage = true;
            }
        }

        return fixedTemplate;
    }

    /**
     * Generate a simple ID
     */
    private static generateId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
