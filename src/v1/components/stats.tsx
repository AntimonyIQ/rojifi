export function Stats() {
    return (
        <section className="py-12 md:py-16 md:pt-0">
            <div className="container">
                <div className="px-1 md:px-[80px] py-2 md:py-1 border-spacing-6">
                    <div className="overflow-hidden rounded-tr-xl md:rounded-tr-3xl rounded-tl-xl md:rounded-tl-3xl border-[2px] md:h-auto">

                        {/* Desktop Image */}
                        <img
                            src="/dashboard.png"
                            alt="Dashboard"
                            className="hidden md:block relative -top-[2px] left-[2px]"
                        />

                        {/* Mobile Image */}
                        <img
                            src="/dashboard.png"
                            alt="Dashboard Mobile"
                            className="block md:hidden relative -top-[2px] right-[0px] left-[2px]"
                        />

                    </div>
                </div>
            </div>
        </section>
    )
}



/*
export function Stats() {
    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="container">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Optimize Your Market for Peak Performance</h2>
                        <p className="mt-4 text-muted-foreground">
                            We enhance market efficiency to ensure peak performance and smooth, seamless transactions.
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <motion.div
                            className="flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-4xl font-bold">1M+</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Active users across our platform</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span className="text-sm text-muted-foreground">Users</span>
                        </motion.div>
                        <motion.div
                            className="flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-4xl font-bold">$600M</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Total transaction volume processed</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span className="text-sm text-muted-foreground">Transactions Completed</span>
                        </motion.div>
                        <motion.div
                            className="flex flex-col sm:col-span-2"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-4xl font-bold">99.5%</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Percentage of successful transactions</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span className="text-sm text-muted-foreground">Success Rate</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

*/
