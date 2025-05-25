"use client"

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { RetroGrid } from "@/components/magicui/retro-grid"
import { Link } from "react-router-dom"
import { Particles } from "@/components/magicui/particles.tsx"
import { useEffect, useState, useRef } from "react"

import LightEditorPreview from "../../assets/screenshots/editor/editor-preview-light.png"
import DarkEditorPreview from "../../assets/screenshots/editor/editor-preview-dark.png"
import { useTheme } from "@/components/theme-provider"

export function HeroSection() {
  const { theme } = useTheme()
  const [imgSrc, setImgSrc] = useState(LightEditorPreview)
  const sectionRef = useRef<HTMLElement>(null)

  // Set up scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  // Set up horizontal scroll effect
  const [horizontalScrollProgress, setHorizontalScrollProgress] = useState(0)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Calculate horizontal scroll based on vertical scroll
    const newHorizontalScroll = Math.min(0, -200 * latest)
    setHorizontalScrollProgress(newHorizontalScroll)
  })

  // Transform values for different elements based on scroll progress
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, 0.4], [0, -50])

  const descriptionOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])
  const descriptionY = useTransform(scrollYProgress, [0, 0.35], [0, -30])

  const buttonsOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const buttonsY = useTransform(scrollYProgress, [0, 0.3], [0, -20])

  const imageOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -300])

  useEffect(() => {
    setImgSrc(theme === "dark" ? DarkEditorPreview : LightEditorPreview)
  }, [theme])

  return (
      <section
          ref={sectionRef}
          className="flex flex-col items-center justify-center gap-8 relative min-h-screen w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <RetroGrid />
        </div>
        <div className="absolute top-0 left-0 w-full h-1/3 overflow-hidden">
          <Particles />
        </div>

        {/* Additional blurred decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl animate-pulse"></div>
        <div
            className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-fuchsia-600/10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
        ></div>
        <div
            className="absolute top-3/4 left-1/2 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
        ></div>

        {/* Content Overlay with Horizontal Scroll */}
        <div
            className="relative z-10 mx-auto container px-4 md:px-6"
            style={{
              transform: `translateY(${horizontalScrollProgress}px)`,
              transition: "transform 0.1s ease-out",
            }}
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div className="space-y-4" style={{ opacity: titleOpacity, y: titleY }}>
              <h1 className="text-3xl font-bold tracking-tighter leading-1 sm:text-4xl md:text-5xl lg:text-7xl/none">
                Create Your Online Store in Minutes <br />
                <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
                Low Code{" "}
              </span>
                Knowledge
              </h1>
            </motion.div>

            <motion.p
                className="mx-auto max-w-4xl text-muted-foreground md:text-xl"
                style={{ opacity: descriptionOpacity, y: descriptionY }}
            >
              Choose from beautiful templates, customize to your brand, and launch your e-commerce store without coding.
            </motion.p>

            <motion.div className="space-x-4" style={{ opacity: buttonsOpacity, y: buttonsY }}>
              <Link to="/templates">
                <Button size="lg" className="text-white h-11 px-8 bg-rose-500 hover:bg-rose-600 duration-300">
                  Browse Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-11 px-8">
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Image Section with Enhanced Glassomorphism and Glow Effect */}
        <motion.div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16"
            style={{
              opacity: imageOpacity,
              y: imageY,
            }}
        >
          <div className="relative">
            {/* Increased glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-fuchsia-600/30 rounded-2xl blur-3xl transform scale-105"></div>

            {/* Glassomorphism container */}
            <div className="p-2 relative rounded-xl overflow-hidden backdrop-blur-lg border bg-white/20 border-white/10">
              <img
                  src={imgSrc || "/placeholder.svg"}
                  alt="Editor Preview"
                  className="w-full h-auto rounded-lg relative z-10"
              />
            </div>
          </div>
        </motion.div>
      </section>
  )
}
