"use client"

import { motion } from "framer-motion"
import { Button } from "@/v1/components/ui/button"
import { ArrowRight, Wallet, RefreshCw, Globe } from "lucide-react"
import { Link } from "wouter"

export function MultiCurrencyFeatures() {
    return (
        <section className="py-16 md:py-24" id="create-wallet">
            <div className="container">
                <motion.div
                    className="text-center mx-auto max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm text-primary mb-4">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2 h-4 w-4"
                        >
                            <path
                                d="M12 3H4C2.89543 3 2 3.89543 2 5V11C2 12.1046 2.89543 13 4 13H12C13.1046 13 14 12.1046 14 11V5C14 3.89543 13.1046 3 12 3Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Multi-currency Wallet
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simplified Cross-Border Transactions</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our multi-currency wallet simplifies international payments for businesses, allowing them to handle
                        transactions in various currencies with ease.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-base" asChild>
                            <Link href="/request-access">
                                Create wallet <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                <div className="mt-16">
                    <motion.div
                        className="rounded-xl bg-blue-50 p-8 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="rounded-xl bg-white overflow-hidden shadow-lg">
                            <div className="p-6 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-primary"
                                    >
                                        <path
                                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span className="font-semibold text-primary">Rojifi</span>
                                </div>
                                <div className="flex-1"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Balance</span>
                                    <div className="h-6 w-32 bg-blue-100 rounded-md"></div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-[250px,1fr] border-t">
                                <div className="border-r p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border-l-4 border-primary">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-primary"
                                            >
                                                <path
                                                    d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M10 13.75C12.0711 13.75 13.75 12.0711 13.75 10C13.75 7.92893 12.0711 6.25 10 6.25C7.92893 6.25 6.25 7.92893 6.25 10C6.25 12.0711 7.92893 13.75 10 13.75Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M17.5 10H13.75"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M6.25 10H2.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M10 6.25V2.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M10 17.5V13.75"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium">Overview</span>
                                        </div>

                                        <div className="flex items-center gap-2 p-2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-500"
                                            >
                                                <path
                                                    d="M15 5H5C3.89543 5 3 5.89543 3 7V13C3 14.1046 3.89543 15 5 15H15C16.1046 15 17 14.1046 17 13V7C17 5.89543 16.1046 5 15 5Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M3 9H17"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M7 12H8"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span className="text-sm">Cards</span>
                                            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                Coming soon
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 p-2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-500"
                                            >
                                                <path
                                                    d="M10 10C12.0711 10 13.75 8.32107 13.75 6.25C13.75 4.17893 12.0711 2.5 10 2.5C7.92893 2.5 6.25 4.17893 6.25 6.25C6.25 8.32107 7.92893 10 10 10Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M4.375 17.5C4.375 14.6066 6.85661 12.5 10 12.5C13.1434 12.5 15.625 14.6066 15.625 17.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span className="text-sm">Beneficiaries</span>
                                        </div>

                                        <div className="flex items-center gap-2 p-2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-500"
                                            >
                                                <path
                                                    d="M10 13.125C11.7259 13.125 13.125 11.7259 13.125 10C13.125 8.27411 11.7259 6.875 10 6.875C8.27411 6.875 6.875 8.27411 6.875 10C6.875 11.7259 8.27411 13.125 10 13.125Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M16.25 10C16.25 13.4518 13.4518 16.25 10 16.25C6.54822 16.25 3.75 13.4518 3.75 10C3.75 6.54822 6.54822 3.75 10 3.75C13.4518 3.75 16.25 6.54822 16.25 10Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span className="text-sm">Team</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold">Overview</h3>
                                    <div className="mt-6 flex items-center gap-2">
                                        <button className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-sm">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-primary"
                                            >
                                                <path
                                                    d="M10 5V15"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M5 10H15"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            Add Wallet
                                        </button>
                                        <span className="text-xs text-gray-500">Create up to 10 currency wallets</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-[1fr,1fr] lg:gap-12" id="features">
                    <motion.div
                        className="rounded-xl overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <img
                            src="/business-man.png"
                            alt="Business person using laptop"
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    <motion.div
                        className="grid gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <Wallet className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold">Topup your wallet</h3>
                            <p className="mt-2 text-muted-foreground">
                                Create multiple wallets and fund them in your local currency. Hold NGN, USD, EUR, GBP and ZAR for
                                limitless business transactions.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <RefreshCw className="h-10 w-10 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold">Seamless Currencies Conversion</h3>
                            <p className="mt-2 text-muted-foreground">
                                Effortlessly swap currencies and receive instant deposits to your wallet. View the latest rates to
                                ensure you get the best value for each transaction.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <Globe className="h-10 w-10 text-amber-500 mb-4" />
                            <h3 className="text-xl font-bold">Payout to international bank accounts</h3>
                            <p className="mt-2 text-muted-foreground">
                                Send and receive money directly to local and international bank accounts. Enjoy
                                competitive rates for transactions to and from Nigeria, Ghana, Asia, the US, the UK, and Europe.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
