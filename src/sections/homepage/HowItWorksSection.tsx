"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LogIn,
  LayoutTemplate,
  Paintbrush,
  Rocket,
  KeyRound,
  Mail,
  ShieldCheck,
  Palette,
  Type,
  ImageIcon,
  Box,
  Sparkles,
  Check,
  Globe,
  ShoppingCart,
  CreditCard,
  BarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Define the steps data
const steps = [
  {
    id: "authentication",
    title: "Authentication",
    icon: LogIn,
    description: "All the authentication features you need to build your next great idea.",
  },
  {
    id: "choose-template",
    title: "Choose Template",
    icon: LayoutTemplate,
    description: "Browse our collection of beautiful, responsive templates designed for various industries.",
  },
  {
    id: "customize",
    title: "Customize",
    icon: Paintbrush,
    description: "Use our intuitive editor to customize your template with your brand colors, fonts, and content.",
  },
  {
    id: "launch",
    title: "Launch",
    icon: Rocket,
    description: "Publish your store with a single click and start selling your products online immediately.",
  },
]

// Features for each step
const features = {
  authentication: [
    {
      id: "user-login",
      title: "User Login",
      icon: LogIn,
      description: "Our authentication features offer user login, registration, and more.",
    },
    {
      id: "reset-password",
      title: "Reset Password",
      icon: KeyRound,
      description: "Allow users and customers the ability to easily set and reset their password.",
    },
    {
      id: "email-verification",
      title: "Email Verification",
      icon: Mail,
      description: "Enforce that users verify their email before gaining access to your app.",
    },
    {
      id: "two-factor",
      title: "Two-Factor Auth",
      icon: ShieldCheck,
      description: "Allow your users to secure their account with a simple 2FA implementation.",
    },
  ],
  "choose-template": [
    {
      id: "ecommerce",
      title: "E-commerce",
      icon: ShoppingCart,
      description: "Ready-to-use templates for online stores with product listings and checkout.",
    },
    {
      id: "portfolio",
      title: "Portfolio",
      icon: ImageIcon,
      description: "Showcase your work with beautiful, responsive portfolio templates.",
    },
    {
      id: "blog",
      title: "Blog",
      icon: LayoutTemplate,
      description: "Start your blog with pre-designed templates optimized for readability.",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: BarChart,
      description: "Admin dashboards with charts, tables, and data visualization components.",
    },
  ],
  customize: [
    {
      id: "colors",
      title: "Colors",
      icon: Palette,
      description: "Customize your brand colors and create a cohesive color scheme.",
    },
    {
      id: "typography",
      title: "Typography",
      icon: Type,
      description: "Choose from a wide range of fonts and typography settings.",
    },
    {
      id: "components",
      title: "Components",
      icon: Box,
      description: "Drag and drop pre-built components to quickly build your pages.",
    },
    {
      id: "effects",
      title: "Effects",
      icon: Sparkles,
      description: "Add animations and visual effects to enhance user experience.",
    },
  ],
  launch: [
    {
      id: "domain",
      title: "Domain Setup",
      icon: Globe,
      description: "Connect your custom domain and set up DNS records automatically.",
    },
    {
      id: "payments",
      title: "Payment Integration",
      icon: CreditCard,
      description: "Accept payments with popular payment gateways like Stripe and PayPal.",
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart,
      description: "Track user behavior and monitor your site's performance.",
    },
    {
      id: "seo",
      title: "SEO Tools",
      icon: Check,
      description: "Optimize your site for search engines with built-in SEO tools.",
    },
  ],
}

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(steps[0].id)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tabContainerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [progressStyle, setProgressStyle] = useState({
    width: 0,
  })

  // For parallax effect

  // Update progress indicator when active tab changes
  useEffect(() => {
    const activeIndex = steps.findIndex((step) => step.id === activeTab)

    if (activeIndex >= 0 && tabContainerRef.current) {
      // Calculate the position of the last tab to include in the progress
      const lastTabToInclude = tabRefs.current[activeIndex]

      if (lastTabToInclude) {
        // Get the right edge position of the last tab to include
        const rightEdge = lastTabToInclude.offsetLeft + lastTabToInclude.offsetWidth

        // Set the width to cover from the start to the right edge of the last tab
        setProgressStyle({
          width: rightEdge,
        })
      }
    }
  }, [activeTab])


  const currentStep = steps.find((step) => step.id === activeTab) || steps[0]
  const currentFeatures = features[activeTab as keyof typeof features]

  return (
      <section
          className="bg-white dark:bg-[#050505] text-gray-800 dark:text-white py-16 transition-colors duration-200"
      >
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 parallax-content">
            <p className="text-gray-600 dark:text-neutral-300 uppercase tracking-wider mb-2">POWER UP YOUR WORKFLOW</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4"><span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">How</span> It Works</h2>
            <p className="text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Our platform has a full-set of functionality. Each feature has been crafted to support your journey and help
              you quickly build your next great idea.
            </p>
          </div>

          {/* Tab Container */}
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation with Progressive Underline */}
            <div
                ref={tabContainerRef}
                className="relative flex justify-between border-b border-gray-200 dark:border-[#222222] mb-8 parallax-content"
            >
              {steps.map((step, index) => (
                  <button
                      key={step.id}
                      ref={(el) => {
                        tabRefs.current[index] = el
                      }}
                      onClick={() => setActiveTab(step.id)}
                      className={cn(
                          "flex items-center pb-4 px-4 transition-colors",
                          // Highlight all tabs up to and including the active one
                          index <= steps.findIndex((s) => s.id === activeTab)
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300",
                      )}
                  >
                    <step.icon className="h-5 w-5 mr-2" />
                    <span>{step.title}</span>
                  </button>
              ))}

              {/* Progressive underline indicator */}
              <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-500 dark:bg-[#3b82f6]"
                  animate={{
                    width: progressStyle.width,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
              />
            </div>

            {/* Content Area - Fixed Height */}
            <div className="h-[300px] parallax-content">
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                  <div className="grid grid-cols-12 gap-6 h-full">
                    {/* Sidebar */}
                    <div className="col-span-3 bg-gray-100 dark:bg-[#111111] rounded-lg p-6 flex flex-col shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
                        <currentStep.icon className="h-6 w-6 text-gray-700 dark:text-[#d0d0d0]" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{currentStep.title}</h3>
                      <p className="text-gray-600 dark:text-neutral-300 text-sm mb-6">{currentStep.description}</p>
                      <button className="mt-auto bg-neutral-900 hover:bg-neutral-950 dark:bg-[#1a1a1a] dark:hover:bg-[#252525] text-white py-2 rounded-md font-medium transition-colors">
                        Get Started
                      </button>
                    </div>

                    {/* Main Content - 2x2 Grid */}
                    <div className="col-span-9 grid grid-cols-2 gap-6">
                      {currentFeatures.map((feature) => (
                          <div key={feature.id} className="bg-transparent rounded-lg p-5 flex">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center mr-4">
                              <feature.icon className="h-5 w-5 text-gray-700 dark:text-[#d0d0d0]" />
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">{feature.title}</h4>
                              <p className="text-gray-600 dark:text-neutral-300 text-sm">{feature.description}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
  )
}
