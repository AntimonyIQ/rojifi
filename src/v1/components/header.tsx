"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/logo"
import { MultiCurrencyWalletIcon, OTCDeskIcon, VirtualCardIcon } from "./product-icons"
import { AboutUsIcon, BlogIcon, HelpIcon } from "./company-icons"
import { setAuthToken } from "@/services/auth.service"
import { IUser } from "@/interface/interface"
import { session } from "@/session/session"

interface HeaderProps {
    isLoggedIn: boolean
    user?: IUser | null
}

export function Header({ isLoggedIn }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Logo className="h-10 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
                                Products <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute left-0 top-full hidden w-[600px] rounded-md border bg-background p-6 shadow-lg group-hover:block">
                                <h3 className="text-lg font-medium mb-4">Products</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <Link
                                        href="/multicurrency"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <MultiCurrencyWalletIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">Multi-Currency Wallet</h4>
                                            <p className="text-sm text-muted-foreground">Local and global currencies for your business</p>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/otc"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <OTCDeskIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">OTC Desk</h4>
                                            <p className="text-sm text-muted-foreground">High value transactions at competitive rates</p>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/cards"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <VirtualCardIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">Virtual USD Cards</h4>
                                            <p className="text-sm text-muted-foreground">Cards you can trust for your online payments</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
                                Company <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute left-0 top-full hidden w-[600px] rounded-md border bg-background p-6 shadow-lg group-hover:block">
                                <h3 className="text-lg font-medium mb-4">Company</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <Link
                                        href="/about"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <AboutUsIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">About Us</h4>
                                            <p className="text-sm text-muted-foreground">Rojifi is a B2B cross-border payment provider</p>
                                        </div>
                                    </Link>
                                    <Link href="#" className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50">
                                        <BlogIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">Blog</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Stay informed on our latest updates and blog posts
                                            </p>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/help"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <HelpIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">Help</h4>
                                            <p className="text-sm text-muted-foreground">Get assistance and answers to your questions</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                            Rates
                        </Link>
                        <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                            Blog
                        </Link>
                        {isLoggedIn && (
                            <Link href="/dashboard/NGN" className="text-sm font-medium transition-colors hover:text-primary">
                                Dashboard
                            </Link>
                        )}
                    </nav>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <Button asChild className="text-white">
                                <Link href="/dashboard/NGN">Dashboard</Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    session.logout();
                                    window.location.href = "/login"
                                }}
                            >
                                Sign out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="link">
                                <Link href="/contactus">Contact Us</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button asChild className="text-white">
                                <Link href="/request-access">Request Access</Link>
                            </Button>
                        </>
                    )}
                </div>
                <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border/40"
                    >
                        <div className="container py-4 space-y-4">
                            <div className="space-y-2">
                                <div className="font-medium">Products</div>
                                <nav className="grid gap-1 pl-4">
                                    <div className="flex items-center gap-2 py-1">
                                        <MultiCurrencyWalletIcon className="h-5 w-5" />
                                        <Link href="/multicurrency" className="text-sm hover:text-primary">
                                            Multi-currency Wallet
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2 py-1">
                                        <OTCDeskIcon className="h-5 w-5" />
                                        <Link href="/otc" className="text-sm hover:text-primary">
                                            OTC Desk
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2 py-1">
                                        <VirtualCardIcon className="h-5 w-5" />
                                        <Link href="/cards" className="text-sm hover:text-primary">
                                            Virtual USD Cards
                                        </Link>
                                    </div>
                                </nav>
                            </div>
                            <div className="space-y-2">
                                <div className="font-medium">Company</div>
                                <nav className="grid gap-1 pl-4">
                                    <div className="flex items-center gap-2 py-1">
                                        <AboutUsIcon className="h-5 w-5" />
                                        <Link href="/about" className="text-sm hover:text-primary">
                                            About Us
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2 py-1">
                                        <BlogIcon className="h-5 w-5" />
                                        <Link href="#" className="text-sm hover:text-primary">
                                            Blog
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2 py-1">
                                        <HelpIcon className="h-5 w-5" />
                                        <Link href="/help" className="text-sm hover:text-primary">
                                            Help
                                        </Link>
                                    </div>
                                </nav>
                            </div>
                            <Link href="#" className="block text-sm font-medium hover:text-primary">
                                Rates
                            </Link>
                            {isLoggedIn && (
                                <Link href="/dashboard/NGN" className="block text-sm font-medium hover:text-primary">
                                    Dashboard
                                </Link>
                            )}
                            <div className="flex flex-col gap-2 pt-2">
                                {isLoggedIn ? (
                                    <>
                                        <Button asChild className="w-full text-white">
                                            <Link href="/dashboard/NGN">Dashboard</Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                session.logout();
                                                window.location.href = "/login"
                                            }}
                                        >
                                            Sign out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" asChild className="w-full">
                                            <Link href="/contactus">Contact Us</Link>
                                        </Button>
                                        <Button variant="outline" asChild className="w-full">
                                            <Link href="/login">Sign in</Link>
                                        </Button>
                                        <Button asChild className="w-full text-white">
                                            <Link href="/request-access">Request Access</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}