"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Wallet, ArrowLeftRight, Settings } from "lucide-react"

const navigationBase = [
    { name: "Overview", href: "", icon: BarChart3 },
    { name: "Wallet", href: "wallet", icon: Wallet },
    { name: "Transactions", href: "transactions", icon: ArrowLeftRight },
    { name: "Settings", href: "settings", icon: Settings },
]

export const BottomNavigation = () => {
    const pathname = usePathname()
    const parts = pathname ? pathname.split('/') : []
    const wallet = (parts[2] || 'NGN').toUpperCase()
    const basePath = `/dashboard/${wallet}`

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <nav className="flex">
                {navigationBase.map((item) => {
                    const href = item.href ? `${basePath}/${item.href}` : basePath
                    const isActive = pathname === href || pathname?.startsWith(href + '/')
                    return (
                        <Link
                            key={item.name}
                            href={href}
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${isActive ? "text-primary bg-blue-50" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <item.icon className={`h-5 w-5 mb-1 ${isActive ? "text-primary" : "text-gray-400"}`} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
