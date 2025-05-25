import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    // This is important for client-side routing to work properly
    open: true,
  },
  preview: {
    host: true,
  },
  // Ensure proper handling of dynamic imports
  build: {
    sourcemap: true,
    outDir: "dist",
    assetsDir: "assets",
    // Ensure proper handling of client-side routing
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
})
