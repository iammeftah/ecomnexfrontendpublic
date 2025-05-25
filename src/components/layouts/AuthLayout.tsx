import type { ReactNode } from "react"
import Loader from "../common/loader"
import { Toaster } from "../ui/Toaster"

interface AuthLayoutProps {
    children: ReactNode
    isLoading?: boolean
}

const AuthLayout = ({ children, isLoading = false }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="grow flex items-center justify-center">
                {isLoading ? <Loader speed={400} className="text-xl" /> : children}
            </main>
            <Toaster />
        </div>
    )
}

export default AuthLayout
