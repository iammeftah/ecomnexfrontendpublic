"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface ParallaxBackgroundProps {
  className?: string
  intensity?: number
  children?: React.ReactNode
}

export function ParallaxBackground({ className = "", intensity = 1, children }: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * intensity])

  return (
    <motion.div ref={ref} style={{ y }} className={`absolute inset-0 ${className}`}>
      {children || (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-fuchsia-600/5 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"></div>
        </>
      )}
    </motion.div>
  )
}
