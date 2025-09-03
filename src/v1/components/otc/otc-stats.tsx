"use client"

import { motion } from "framer-motion"

export function OtcStats() {
    return (
        <section className="py-16 md:py-24 bg-blue-50">
            <div className="container">
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Traded <span className="text-primary">$1m+</span> in transactions volume to 40+ countries
                    </h2>
                    <p className="mt-4 text-muted-foreground">Rojifi supports the following countries and more:</p>

                    <div className="mt-10 grid grid-cols-3 gap-6 md:grid-cols-6">
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                                <img src="/usa-flag.png" alt="USD" width={48} height={48} className="h-full w-full object-cover" />
                            </div>
                            <span className="mt-2 text-sm font-medium">USD</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                                <img src="/uk-flag.png" alt="GBP" width={48} height={48} className="h-full w-full object-cover" />
                            </div>
                            <span className="mt-2 text-sm font-medium">GBP</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                                <img
                                    src="/nigeria-flag.png"
                                    alt="NGN"
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="mt-2 text-sm font-medium">NGN</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                                <img src="/ghana-flag.png" alt="GHS" width={48} height={48} className="h-full w-full object-cover" />
                            </div>
                            <span className="mt-2 text-sm font-medium">GHS</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                                <img
                                    src="/south-africa-flag.png"
                                    alt="ZAR"
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="mt-2 text-sm font-medium">ZAR</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-primary font-medium">40+</span>
                            </div>
                            <span className="mt-2 text-sm font-medium">More</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
