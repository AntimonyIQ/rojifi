"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function MultiCurrencyCta() {
  return (
    <section className="bg-black py-24 text-white mb-[-1px]" id="contact">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Effortlessly manage high-value transactions up to $10 million with our flexible rates
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <Button
              variant="outline"
              size="lg"
               className="border-white text-black hover:bg-black hover:text-white px-8 py-6 text-base"
              asChild
            >
              <Link href="/contactus">Contact sales</Link>
            </Button>
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base" asChild>
              <Link href="/request-access">
                Request Access <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
