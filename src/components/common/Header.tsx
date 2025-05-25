"use client"

import * as React from "react"
import { CommandDialog } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Moon, Search, Sun, User, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context/AuthContext"
import logo_sigma from "../../assets/logos/sigma_logo.png"

export default function Header() {
  const { isAuthenticated, logout, user, hasRole } = useAuth()
  const isAdmin = isAuthenticated && hasRole("ROLE_ADMIN")

  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
    }
    return false
  })

  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true)
  const [scrollState, setScrollState] = React.useState<"top" | "scrolled">("top")
  const navigate = useNavigate()
  const location = useLocation()

  // Toggle theme
  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark")
      setIsDarkMode(!isDarkMode)
    }
  }

  // Handle keyboard shortcut for search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Handle scroll effect
  React.useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false
    let timeout: NodeJS.Timeout | null = null

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY

      // Set scrolled state for styling
      setScrollState(currentScrollY === 0 ? "top" : "scrolled")

      // Update header visibility based on scroll direction
      if (currentScrollY > 150) {
        // Only hide after scrolling a bit
        if (currentScrollY > lastScrollY) {
          // When scrolling down, hide the header
          setIsHeaderVisible(false)
        } else {
          // When scrolling up, show the header
          setIsHeaderVisible(true)
        }
      } else {
        // Always show header near the top
        setIsHeaderVisible(true)
      }

      // Clear any existing timeout
      if (timeout) {
        clearTimeout(timeout)
      }

      // Set a timeout to show the header if user stops scrolling
      timeout = setTimeout(() => {
        setIsHeaderVisible(true)
      }, 2000)

      lastScrollY = currentScrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const handleGetStarted = () => {
    navigate("/login")
  }

  // Navigation links based on role
  const getNavLinks = () => {
    // Common links for all users
    const links = [
      {
        title: "Docs",
        href: "#docs",
      },
      {
        title: "Templates",
        href: "/templates",
      },
    ]

    // Admin-specific links
    if (isAdmin) {
      links.push({
        title: "Template Manager",
        href: "/admin/templates",
      })
    }
    // Regular user links
    else if (isAuthenticated) {
      links.push({
        title: "Dashboard",
        href: "/client/dashboard",
      })
    }

    return links
  }

  const navLinks = getNavLinks()

  return (
      <>
        {/* Main header */}
        <header
            className={cn(
                "fixed w-full z-50 transition-all duration-500 ease-in-out",
                scrollState === "top" ? "bg-transparent" : "bg-background/40 backdrop-blur-md shadow-sm",
                isHeaderVisible ? "top-0" : "-top-20", // Slide up when hidden
            )}
        >
          <div
              className={cn(
                  "mx-auto flex h-16 items-center justify-between px-4 transition-all duration-500 ease-in-out",
                  scrollState === "top" ? "max-w-7xl" : "max-w-6xl",
              )}
          >
            {/* Logo and nav links */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center justify-center">
                <img src={logo_sigma} alt="Ecomnex" className="h-8 w-6"></img>
                <span className="font-bold text-xl">
                  comnex
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                  const isActive =
                      location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href))

                  return (
                      <Link key={link.href} to={link.href} className="text-sm font-medium relative group">
                        <span className={isActive ? "text-rose-500]" : ""}>{link.title}</span>
                        <span
                            className={cn(
                                "absolute -bottom-1 left-0 h-0.5 bg-rose-500 transition-all duration-300",
                                isActive ? "w-full" : "w-0 group-hover:w-full",
                            )}
                        ></span>
                      </Link>
                  )
                })}
              </nav>
            </div>

            {/* Search and actions */}
            <div className="flex items-center gap-4">
              {/* Search input */}
              <div className="hidden md:flex relative w-[300px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search documentation..."
                    className="pl-8 pr-12 h-8 bg-muted/30 rounded-lg shadow-none border-muted hover:border-input focus:border-input transition-colors"
                    onClick={() => setOpen(true)}
                    readOnly
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-sm">⌘</span>K
                </kbd>
              </div>

              {/* Theme toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User dropdown (if authenticated) */}
              {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 hidden md:flex">
                        <User className="h-4 w-4" />
                        <span className="max-w-[100px] truncate">{user?.username}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin/templates" className="cursor-pointer w-full">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Template Manager</span>
                            </Link>
                          </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                  <>
                    {/* Login link */}
                    <Link to="/login" className="text-sm font-medium relative group">
                      <span>Login</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    {/* Get Started button */}
                    <Button onClick={handleGetStarted} className="ml-2 bg-rose-500 hover:bg-rose-500/90 text-white">
                      Get Started
                    </Button>
                  </>
              )}
            </div>
          </div>
        </header>

        {/* Spacer to prevent content from being hidden under fixed header */}
        <div className="h-16"></div>

        {/* Search Dialog */}
        <CommandDialog open={open} onOpenChange={setOpen}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Type a command or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="py-6 px-4 text-center text-sm">
            {searchQuery ? <p>Searching for: {searchQuery}...</p> : <p>Type to start searching...</p>}
          </div>
        </CommandDialog>
      </>
  )
}
