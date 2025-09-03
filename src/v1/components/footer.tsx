import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="border-t bg-black text-white">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-10 w-auto" color="white" />
            </Link>
            <p className="mt-4 text-sm text-gray-400">Breaking Barriers in Cross-Border Transactions</p>
            <div className="mt-6 flex gap-4">
              <Link
                href="https://www.instagram.com/rojifi_"
                className="rounded-full bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              {/**
               * TODO: Add Facebook link
               * <Link
                href="#"
                className="rounded-full bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
               */}
              <Link
                href="https://x.com/rojifi_"
                className="rounded-full bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/rojifi"
                className="rounded-full bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Products</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/multicurrency" className="hover:text-white">
                  Multi-currency Wallet
                </Link>
              </li>
              {/* <li>
                <Link href="#" className="hover:text-white">
                  Web Platform
                </Link>
              </li> */}
              <li>
                <Link href="/otc" className="hover:text-white">
                  24/7 OTC Desk
                </Link>
              </li>
              <li>
                <Link href="/cards" className="hover:text-white">
                  Virtual Expense Cards
                </Link>
              </li>
            </ul>
          </div>
          {/*
          <div>
            <h3 className="mb-4 text-lg font-medium">Use Cases</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  Financial Services
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Import/Export
                </Link>
              </li>
            </ul>
          </div>
          */}
          <div>
            <h3 className="mb-4 text-lg font-medium">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contactus" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="py-5 text-slate-500 text-[12px]">
          Rojifi Technology Inc. is a limited company registered in British Columbia, Canada. Its registered number is BC1416726. We are authorized by the Financial Transaction and Reports Analysis Centre of Canada (FINTRAC) -MSB No. M23347431
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-sm text-gray-400">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p>Copyright © 2025 Rojifi</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white">
                Security
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
