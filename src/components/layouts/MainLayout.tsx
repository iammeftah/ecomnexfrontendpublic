import type { ReactNode } from "react"
import Header from "../common/Header"
import { Toaster } from "../ui/Toaster"

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow">{children}</main>
        <Toaster />
    </div>
  )
}
