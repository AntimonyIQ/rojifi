"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AboutVision() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <motion.div
            className="rounded-xl overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl w-[300px] h-[300px] overflow-hidden bg-lime-200">
                <Image
                  src="/vision3.png?height=250&width=250&query=business handshake"
                  alt="Business handshake"
                  width={200}
                  height={200}
                  className="w-full h-full object-center"
                />
              </div>
              <div className="rounded-xl w-[300px] h-[300px] overflow-hidden">
                <Image
                  src="/vision1.jpeg?height=300&width=300&query=team collaboration in office"
                  alt="Team collaboration in office"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-primary text-sm font-medium mb-4">Our Vision</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Expanding Global Reach with Seamless Financial Tools
            </h2>
            <p className="text-muted-foreground">
              We envision a future where businesses can expand their reach across borders effortlessly. Our seamless
              financial tools are designed to remove the complexities of international trade, enabling companies to
              connect and grow globally with confidence.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
