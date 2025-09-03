
import { motion } from "framer-motion"
import { Button } from "@/v1/components/ui/button"
import "../app/hero-image.css"
import "../app/button-styles.css"
import { Link } from "wouter"

interface HeroProps {
    isLoggedIn: boolean
}

export function Hero({ isLoggedIn }: HeroProps) {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 -z-10 flex items-start justify-center overflow-hidden">
                <div className="hero-image-container">
                    <img src="/flags-background.png" alt="" className="hero-image" aria-hidden="true" />
                </div>
            </div>

            {/* Content positioned lower on the page */}
            <div className="container relative z-10 mt-32 md:mt-40 lg:mt-48">
                <div className="mx-auto max-w-3xl text-center">
                    <motion.h1
                        className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Breaking Barriers in Cross-Border Transactions
                    </motion.h1>
                    <motion.p
                        className="mt-6 text-lg text-muted-foreground md:text-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Empower your business to pay and collect local and international currencies across 80+ countries worldwide
                        with our advanced financial services.
                    </motion.p>
                    <motion.div
                        className="mt-10 flex flex-wrap justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Button variant="outline" size="lg" asChild className="px-8 py-6 text-base btn-outline-primary">
                            <Link href="/contactus">Contact Us</Link>
                        </Button>
                        <Button size="lg" asChild className="px-8 py-6 text-base btn-primary-white">
                            <Link href={isLoggedIn ? "/dashboard/NGN" : "/request-access"}>
                                {isLoggedIn ? "Dashboard" : "Request Access"}
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}