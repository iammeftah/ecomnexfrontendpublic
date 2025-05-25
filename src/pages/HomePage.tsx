"use client"

import { HeroSection } from "@/sections/homepage/HeroSection"
import { HowItWorksSection } from "@/sections/homepage/HowItWorksSection"
import { KeyFeaturesSection } from "@/sections/homepage/KeyFeaturesSection"
import { AdminFeaturesSection } from "@/sections/homepage/AdminFeaturesSection"
import { ClientEditingSection } from "@/sections/homepage/ClientEditingSection"
import { TestimonialsSection } from "@/sections/homepage/TestimonialsSection"
import { PricingSection } from "@/sections/homepage/PricingSection"
import { CTASection } from "@/sections/homepage/CTASection"

const HomePage = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    return (
        <div className="w-full">
            {/* Hero Section */}
            <HeroSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Key Features Section */}
            <KeyFeaturesSection />

            {/* Admin Features Section - NEW */}
            <AdminFeaturesSection />

            {/* Client Editing Section - NEW */}
            <ClientEditingSection />

            {/* Testimonials Section - NEW */}
            <TestimonialsSection />

            {/* Pricing Section - NEW */}
            <PricingSection />

            {/* Call to Action Section - NEW */}
            <CTASection />
        </div>
    )
}

export default HomePage
