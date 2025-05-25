"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { MousePointer, ImageIcon, Type, Palette, Layers, PanelLeft, Settings, Save, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ClientEditingSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Set up scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Transform values for different elements based on scroll progress
  const rightColumnY = useTransform(scrollYProgress, [0, 1], [100, -100])
  const leftColumnOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1])
  const leftColumnY = useTransform(scrollYProgress, [0.1, 0.3], [50, 0])

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-white to-neutral-50 dark:from-[#050505] dark:to-neutral-900 overflow-hidden"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Visual Editor Preview */}
          <motion.div
            style={{
              opacity: leftColumnOpacity,
              y: leftColumnY,
            }}
            className="relative order-2 lg:order-1"
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
                    <Layers className="h-5 w-5 text-fuchsia-600" />
                    <h3 className="font-medium">Visual Editor</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                      Client
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-12 h-[350px]">
                  {/* Left Sidebar */}
                  <div className="col-span-3 border-r dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Elements</div>

                      {[
                        { icon: Type, label: "Text" },
                        { icon: ImageIcon, label: "Image" },
                        { icon: Layers, label: "Section" },
                        { icon: Button, label: "Button" },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center space-x-2 p-2 rounded-md cursor-pointer",
                            index === 1
                              ? "bg-fuchsia-500/10 text-fuchsia-600"
                              : "hover:bg-neutral-200 dark:hover:bg-neutral-800",
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="col-span-6 bg-white dark:bg-neutral-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-xs text-center space-y-4 p-4 border-2 border-dashed border-fuchsia-500/30 rounded-lg">
                        <div className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-neutral-400" />
                        </div>
                        <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded-md w-3/4 mx-auto"></div>
                        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-md w-full"></div>
                        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-md w-5/6 mx-auto"></div>

                        {/* Editing Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 opacity-0 hover:opacity-100 transition-opacity">
                          <MousePointer className="h-6 w-6 text-fuchsia-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar - Properties */}
                  <div className="col-span-3 border-l dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3">
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                        Properties
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Image Source</label>
                          <div className="flex h-8 w-full rounded-md border border-input bg-white dark:bg-neutral-800 px-3 py-1 text-sm">
                            product-image.jpg
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Alt Text</label>
                          <div className="flex h-8 w-full rounded-md border border-input bg-white dark:bg-neutral-800 px-3 py-1 text-sm">
                            Product showcase
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex h-8 rounded-md border border-input bg-white dark:bg-neutral-800 px-3 py-1 text-sm">
                              300px
                            </div>
                            <div className="flex h-8 rounded-md border border-input bg-white dark:bg-neutral-800 px-3 py-1 text-sm">
                              200px
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button size="sm" className="w-full bg-fuchsia-600 hover:bg-fuchsia-700">
                            <Check className="h-4 w-4 mr-2" />
                            Apply Changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Text Content */}
          <motion.div className="space-y-6 order-1 lg:order-2" style={{ y: rightColumnY }}>
            <Badge
              variant="outline"
              className="px-3 py-1 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10"
            >
              For Clients
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-50">
              <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
                No-Code Editing
              </span>{" "}
              for Your Clients
            </h2>

            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Empower your clients to edit their projects without any coding knowledge. Our intuitive visual editor
              makes it easy to customize templates and create stunning websites.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: MousePointer, title: "Drag & Drop", description: "Intuitive drag and drop interface" },
                { icon: Palette, title: "Style Controls", description: "Visual controls for colors and styles" },
                { icon: PanelLeft, title: "Component Library", description: "Pre-built components ready to use" },
                { icon: Settings, title: "Easy Configuration", description: "Simple settings for non-technical users" },
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-1 bg-fuchsia-500/10 p-2 rounded-md">
                    <feature.icon className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{feature.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
