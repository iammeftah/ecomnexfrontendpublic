"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LoaderProps {
    text?: string
    speed?: number
    className?: string
    dotClassName?: string
    textClassName?: string
}

const Loader = ({ text = "Loading", speed = 500, className, dotClassName, textClassName }: LoaderProps) => {
    const [dots, setDots] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prevDots) => (prevDots >= 3 ? 0 : prevDots + 1))
        }, speed)

        return () => clearInterval(interval)
    }, [speed])

    const renderDots = () => {
        return ".".repeat(dots)
    }

    return (
        <div className={cn("flex items-center justify-center", className)}>
      <span className={cn("text-lg font-medium", textClassName)}>
        {text}
          <span className={cn("inline-block min-w-[30px] text-left", dotClassName)}>{renderDots()}</span>
      </span>
        </div>
    )
}

export default Loader
