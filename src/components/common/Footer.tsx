"use client"

import { motion } from "framer-motion"

export const Footer = () => {
    return (
        <motion.footer
            className="border-t py-6 md:py-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
        >
            <div className="container mx-auto px-4 md:flex md:items-center md:justify-between md:py-6">
                <p className="text-center text-sm text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} MyApp. All rights reserved.
                </p>
                <div className="mt-4 flex justify-center space-x-6 md:mt-0">
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                        Terms
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                        Privacy
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                        Contact
                    </a>
                </div>
            </div>
        </motion.footer>
    )
}
