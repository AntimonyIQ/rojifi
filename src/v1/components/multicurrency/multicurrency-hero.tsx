"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function MultiCurrencyHero() {
  return (
    <section className="bg-blue-50 py-16 md:py-24">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Expand your market with{" "}
              <span className="text-primary">
                multi-currency
                <br />
                payments
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground flex items-start gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mt-0.5 flex-shrink-0"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                Seamlessly grow your global presence by making secure, efficient cross-border payments with ease.
              </span>
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-base" asChild>
                <Link href="#create-wallet">
                  Get started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="rounded-xl bg-white p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="rounded-xl bg-white overflow-hidden">
              <div className="p-4 flex justify-between items-center">
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
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">Balance</span>
                  <span className="font-bold text-lg">$250,000.00</span>
                </div>
              </div>

              <div className="mt-4 p-4">
                <h3 className="font-semibold text-lg">Overview</h3>
                <div className="mt-4 space-y-2">
                  <div className="h-8 bg-blue-100 rounded-md"></div>
                  <div className="h-8 bg-gray-100 rounded-md"></div>
                  <div className="h-8 bg-gray-100 rounded-md"></div>
                  <div className="h-8 bg-gray-100 rounded-md"></div>
                  <div className="h-8 bg-gray-100 rounded-md"></div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-green-800">Upgrade to a business account</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-500"
                      >
                        <path
                          d="M8 10L12 14L16 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2">
                    <button className="px-4 py-1 border border-gray-300 rounded-md text-sm">Switch to business</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
