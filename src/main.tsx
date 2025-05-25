import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import "./App.css"
import { AuthProvider } from "./contexts/auth-context/AuthContext.tsx"
import AppRoutes from "@/routes.tsx";
import {BrowserRouter as Router} from "react-router";
import {ThemeProvider} from "@/components/theme-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
