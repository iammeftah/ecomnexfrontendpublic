"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Particles } from "@/components/magicui/particles"

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Set up scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Transform values for parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-[#050505] relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Particles />
      </div>

      <motion.div className="container relative z-10 mx-auto max-w-6xl px-4" style={{ y }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-gradient-to-r from-orange-500/10 to-fuchsia-600/10 border border-orange-500/20">
            <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
              Start creating today
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-neutral-950 dark:text-neutral-50">
            Ready to transform your{" "}
            <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
              website development
            </span>{" "}
            process?
          </h2>

          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
            Join thousands of agencies and businesses who are already using Ecomnex to create stunning websites without
            coding.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="w-full h-12" />
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-orange-500 to-fuchsia-600 hover:from-orange-600 hover:to-fuchsia-700"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
            Free 14-day trial. No credit card required.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
