"use client"

import { motion } from "framer-motion"

export function AboutValues() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              What's <span className="text-primary">most important</span> to us?
              <div className="inline-block ml-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline">
                  <path d="M12 2L8 8L12 6L16 8L12 2Z" fill="currentColor" />
                  <path d="M12 6L8 8L12 10L16 8L12 6Z" fill="currentColor" />
                  <path d="M12 10L8 8L12 12L16 8L12 10Z" fill="currentColor" />
                </svg>
              </div>
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl font-bold text-primary">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    Transforming the Way Businesses Handle Cross-border Transactions
                  </h3>
                  <p className="text-muted-foreground">
                    At Rojifi, we are committed to revolutionizing the way businesses manage cross-border payments. Our
                    innovative solutions are designed to streamline international transactions, making global expansion
                    more accessible and efficient for businesses of all sizes.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl font-bold text-primary">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Simplifying and Enhancing Global Financial Operations</h3>
                  <p className="text-muted-foreground">
                    Our mission is to simplify global financial operations by offering a comprehensive suite of
                    services. From competitive foreign exchange rates to seamless multi-currency transactions, we
                    empower businesses to thrive in an interconnected world.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
