"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Code, Save, ToggleLeft, Database, Users, FileCode, Settings, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Safari } from "@/components/magicui/safari"

export function AdminFeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Set up scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Transform values for different elements based on scroll progress
  const leftColumnY = useTransform(scrollYProgress, [0, 1], [100, -100])
  const rightColumnOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1])
  const rightColumnY = useTransform(scrollYProgress, [0.1, 0.3], [50, 0])

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-[#050505] overflow-hidden"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div className="space-y-6" style={{ y: leftColumnY }}>
            <Badge
              variant="outline"
              className="px-3 py-1 border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10"
            >
              For Administrators
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-50">
              Powerful{" "}
              <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
                Template Management
              </span>{" "}
              for Admins
            </h2>

            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Create, edit, and manage templates with our intuitive admin interface. Control which templates are
              available to your clients and customize every aspect of the user experience.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: Code, title: "Code Editor", description: "Built-in code editor with syntax highlighting" },
                { icon: Save, title: "Auto-Save", description: "Changes are automatically saved to the database" },
                {
                  icon: ToggleLeft,
                  title: "Template Control",
                  description: "Activate or deactivate templates with one click",
                },
                {
                  icon: Database,
                  title: "Database Integration",
                  description: "Store templates securely in your database",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-1 bg-orange-500/10 p-2 rounded-md">
                    <feature.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{feature.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Admin Dashboard Preview */}
          <motion.div
            style={{
              opacity: rightColumnOpacity,
              y: rightColumnY,
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-orange-500/20 rounded-2xl blur-3xl transform scale-105"></div>

            <Card
              className={cn(
                "relative z-10 overflow-hidden border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm",
                "shadow-xl dark:shadow-neutral-950/20",
              )}
            >
              <CardContent className="p-0">
                <div className="p-4 border-b dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Layers className="h-5 w-5 text-orange-500" />
                    <h3 className="font-medium">Template Manager</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      Admin
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileCode className="h-4 w-4 text-fuchsia-600" />
                          <span className="font-medium">E-commerce Basic</span>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                          <span className="absolute h-4 w-4 rounded-full bg-white transform translate-x-6"></span>
                        </div>
                      </div>
                      <Safari
                        imageSrc="/ecommerce-template-preview.png"
                        url="ecomnex.ma/templates/ecommerce-basic"
                        className="w-full h-32 rounded-md overflow-hidden"
                      />
                    </div>

                    <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileCode className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">Portfolio Pro</span>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-300 dark:bg-neutral-700">
                          <span className="absolute h-4 w-4 rounded-full bg-white transform translate-x-1"></span>
                        </div>
                      </div>
                      <Safari
                        imageSrc="/portfolio-template-preview.png"
                        url="ecomnex.ma/templates/portfolio-pro"
                        className="w-full h-32 rounded-md overflow-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-neutral-500" />
                      <span>Template Settings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-neutral-500" />
                      <span className="text-sm">12 Active Users</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
