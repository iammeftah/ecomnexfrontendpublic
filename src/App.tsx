import { BrowserRouter as Router } from "react-router-dom"
import AppRoutes from "./routes"
import "./App.css"
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
        <Toaster position="top-right" richColors closeButton />
        <AppRoutes />
    </Router>
  )
}

export default App
