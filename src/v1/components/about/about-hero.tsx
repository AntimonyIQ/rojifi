"use client"

import { motion } from "framer-motion"

export function AboutHero() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            About <span className="text-primary">Rojifi</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We're revolutionizing cross-border payments and empowering businesses to expand globally with innovative
            financial solutions.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
