"use client"

import { motion } from "framer-motion"

export function AboutMission() {
    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container">
                <div className="grid gap-12 md:grid-cols-2 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-primary text-sm font-medium mb-4">Our Mission</div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                            Innovating Global Financial Solutions
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Our mission is to deliver innovative, reliable, and cost-effective financial solutions. We empower
                            businesses to operate efficiently on a global scale, providing the tools and services necessary for
                            success in an interconnected world.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="text-primary font-bold text-lg">01</div>
                                <div>
                                    <h3 className="font-semibold mb-2">Cross-Border Transactions</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Fast, secure, and cost-effective solutions to help you expand your business globally.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-primary font-bold text-lg">02</div>
                                <div>
                                    <h3 className="font-semibold mb-2">Competitive Exchange Rates</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Optimize your finances with favorable rates and multi-currency support.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-primary font-bold text-lg">03</div>
                                <div>
                                    <h3 className="font-semibold mb-2">Seamless Settlements</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Say goodbye to lengthy settlement processes and enjoy smooth, efficient transactions.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-primary font-bold text-lg">04</div>
                                <div>
                                    <h3 className="font-semibold mb-2">Virtual Cards</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Experience the convenience of borderless transactions with our on-demand virtual cards.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="rounded-xl overflow-hidden"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <img
                            src="/smiling-businessman-office.png"
                            alt="Smiling businessman in office"
                            width={600}
                            height={600}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
