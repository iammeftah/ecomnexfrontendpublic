// Updated template-renderer-service.ts

import type { Component, Page, Template } from "@/services/template-service/templateService"

class TemplateRendererService {
    /**
     * Gets a page from the template by its path
     */
    getPage(template: Template, pagePath: string): Page | null {
        console.log(`Searching for page with path: ${pagePath}`);

        // Normalize path: ensure it starts with "/"
        let normalizedPath = pagePath;
        if (!normalizedPath.startsWith("/")) {
            normalizedPath = "/" + normalizedPath;
        }

        // Handle root path as special case
        if (normalizedPath === "/") {
            console.log("Looking for home page");
            return this.getHomePage(template);
        }

        // Find page by path
        const foundPage = template.pages.find((page) => {
            // Normalize page path for comparison
            let pagePath = page.path;
            if (!pagePath.startsWith("/")) {
                pagePath = "/" + pagePath;
            }

            console.log(`Comparing ${normalizedPath} with ${pagePath}`);
            return pagePath === normalizedPath;
        });

        if (foundPage) {
            console.log(`Found page: ${foundPage.name}`);
            return foundPage;
        }

        console.log("Page not found by path");
        return null;
    }

    /**
     * Gets the home page from the template
     */
    getHomePage(template: Template): Page | null {
        // First, try to find a page marked as home
        const homePage = template.pages.find((page) => page.isHomePage);

        if (homePage) {
            console.log(`Found home page: ${homePage.name}`);
            return homePage;
        }

        // If no page is marked as home, try to find a page with the root path
        const rootPage = template.pages.find((page) => page.path === "/" || page.path === "");

        if (rootPage) {
            console.log(`Found root path page: ${rootPage.name}`);
            return rootPage;
        }

        // If no home or root page found, look for a page named "Home"
        const namedHomePage = template.pages.find((page) =>
            page.name.toLowerCase() === "home"
        );

        if (namedHomePage) {
            console.log(`Found page named Home: ${namedHomePage.name}`);
            return namedHomePage;
        }

        // If still no home page, return the first page as a fallback
        if (template.pages.length > 0) {
            console.log(`No home page found, using first page: ${template.pages[0].name}`);
            return template.pages[0];
        }

        console.log("No pages found in template");
        return null;
    }

    /**
     * Gets the components for a page in order
     */
    getOrderedComponents(page: Page): Component[] {
        if (!page.components || page.components.length === 0) {
            return [];
        }

        // Sort components by orderIndex
        return [...page.components].sort((a, b) => a.orderIndex - b.orderIndex);
    }
}

export const templateRendererService = new TemplateRendererService()
