"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    quote:
      "Ecomnex has transformed how we create websites for our clients. The template system saves us hours of development time.",
    author: "Sarah Johnson",
    role: "Web Developer",
    company: "DigitalCraft",
    avatar: "/woman-profile.png",
  },
  {
    quote:
      "As someone with no coding experience, I was able to create and customize my online store in just a few hours. Incredible!",
    author: "Michael Chen",
    role: "Small Business Owner",
    company: "Urban Threads",
    avatar: "/man-profile.png",
  },
  {
    quote: "The admin controls are powerful yet intuitive. Managing templates and client access is a breeze.",
    author: "Jessica Williams",
    role: "Digital Agency Owner",
    company: "Pixel Perfect",
    avatar: "/woman-profile-two.png",
  },
  {
    quote:
      "We've reduced our website development time by 70% while improving client satisfaction. Ecomnex is a game-changer.",
    author: "David Rodriguez",
    role: "Marketing Director",
    company: "Growth Ventures",
    avatar: "/man-profile-2.png",
  },
]

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Set up scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Transform values for parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-[#050505] overflow-hidden"
    >
      <motion.div className="container mx-auto max-w-6xl px-4" style={{ y }}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-950 dark:text-neutral-50">
            Trusted by{" "}
            <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
              Agencies
            </span>{" "}
            and{" "}
            <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
              Businesses
            </span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            See what our customers have to say about how Ecomnex has transformed their website development process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={cn(
                "overflow-hidden border bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm",
                "shadow-md hover:shadow-xl transition-shadow duration-300",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="mr-4">
                    <Quote className="h-8 w-8 text-orange-500/30" />
                  </div>
                  <div>
                    <p className="text-neutral-700 dark:text-neutral-300 mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-amber-500" />
                      ))}
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} />
                        <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{testimonial.author}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {testimonial.role}, {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
