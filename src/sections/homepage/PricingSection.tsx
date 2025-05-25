"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small businesses and freelancers",
    price: { monthly: 29, yearly: 290 },
    features: [
      "5 active templates",
      "10 client projects",
      "Basic template editor",
      "Client visual editor",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    description: "Ideal for agencies and growing businesses",
    price: { monthly: 79, yearly: 790 },
    features: [
      "20 active templates",
      "Unlimited client projects",
      "Advanced template editor",
      "Client visual editor",
      "Custom domain support",
      "Priority support",
      "White labeling",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large agencies and organizations",
    price: { monthly: 199, yearly: 1990 },
    features: [
      "Unlimited active templates",
      "Unlimited client projects",
      "Advanced template editor",
      "Client visual editor",
      "Custom domain support",
      "24/7 priority support",
      "White labeling",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
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
      className="py-24 bg-gradient-to-b from-white to-neutral-50 dark:from-[#050505] dark:to-neutral-900 overflow-hidden"
    >
      <motion.div className="container mx-auto max-w-6xl px-4" style={{ y }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-950 dark:text-neutral-50">
            Simple,{" "}
            <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-8">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>

          <div className="flex items-center justify-center space-x-2 mb-8">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "text-sm font-medium",
                billingCycle === "monthly"
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400",
              )}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "text-sm font-medium",
                billingCycle === "yearly"
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400",
              )}
            >
              Yearly{" "}
              <Badge variant="outline" className="ml-1.5 bg-green-500/10 text-green-600 border-green-500/30">
                Save 20%
              </Badge>
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "overflow-hidden border backdrop-blur-sm transition-all duration-300",
                plan.popular
                  ? "border-fuchsia-500/50 bg-white/90 dark:bg-neutral-900/90 shadow-lg shadow-fuchsia-500/10 scale-105 z-10"
                  : "bg-white/80 dark:bg-neutral-900/80 hover:shadow-md",
              )}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white text-xs font-medium text-center py-1">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="pt-6 pb-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{plan.description}</p>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                    ${billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                <Button
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-gradient-to-r from-orange-500 to-fuchsia-600 hover:from-orange-600 hover:to-fuchsia-700"
                      : "bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700",
                  )}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
