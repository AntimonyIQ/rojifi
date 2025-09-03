"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ArrowLeftRight, Send, Plus, Menu, ArrowDownLeft, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "./dashboard-sidebar"
import { BottomNavigation } from "./bottom-navigation"
import Link from "next/link"
import { session, SessionData } from "@/session/session"
import { ISender, IUser, IWallet } from "@/interface/interface"
import { Fiat } from "@/enums/enums"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [wallets, setWallets] = useState<Array<IWallet>>([]);
    const [activeWallet, setActiveWallet] = useState<IWallet | undefined>(undefined);
    const [selectedCurrency, setSelectedCurrency] = useState<Fiat>(Fiat.NGN);
    const [user, setUser] = useState<IUser | null>(null);
    const [sender, setSender] = useState<ISender | null>(null);
    const sd: SessionData = session.getUserData();

    const pathname = usePathname()

    useEffect(() => {
        if (sd) {
            setUser(sd.user);
            setWallets(sd.wallets);
            setSender(sd.sender);

            // If your route is /dashboard/[wallet], you can use usePathname() to get the current path.
            // Extract the wallet param from the path.
            if (!pathname) return
            // Example: /dashboard/USD/payment
            const match = pathname.match(/^\/dashboard\/([^\/]+)/)
            const wallet: Fiat | null = match ? match[1].toUpperCase() as Fiat : null
            if (wallet && [Fiat.NGN, Fiat.USD, Fiat.EUR, Fiat.GBP].includes(wallet) && wallet !== selectedCurrency) {
                setSelectedCurrency(wallet)
            }

            const activeWallet: IWallet | undefined = wallets.find(w => w.currency === selectedCurrency);
            setActiveWallet(activeWallet);
        }
    }, [pathname, sender])

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden relative">
            <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 p-4 lg:p-6 h-[73px] flex items-center flex-shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="text-left hidden">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M3 10H21"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    Balance
                                </div>
                                <div className="text-xl lg:text-2xl font-semibold text-gray-900">
                                    {activeWallet?.balance || "0.00"}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3">
                            <Button
                                size="sm"
                                id="top-button"
                                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                                <Link href={`/dashboard/${selectedCurrency}/payment`} className="flex flex-row items-center justify-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Create Payment</span>
                                </Link>
                            </Button>
                        </div>
                        <div className="hidden items-center gap-2 lg:gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex items-center gap-2"
                                onClick={() => { }}
                            >
                                <ArrowLeftRight className="h-4 w-4" />
                                <span className="hidden md:inline">Swap</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex items-center gap-2"
                                onClick={() => { }}
                            >
                                <Send className="h-4 w-4" />
                                <span className="hidden md:inline">Transfer</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex items-center gap-2"
                                onClick={() => { }}
                            >
                                <ArrowDownLeft className="h-4 w-4" />
                                <span className="hidden md:inline">Withdraw</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="sm:hidden p-2"
                                onClick={() => { }}
                                title="Swap"
                            >
                                <ArrowLeftRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="sm:hidden p-2"
                                onClick={() => { }}
                                title="Transfer"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="sm:hidden p-2"
                                onClick={() => { }}
                                title="Withdraw"
                            >
                                <ArrowDownLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                                onClick={() => { }}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Deposit</span>
                            </Button>
                        </div>
                    </div>
                    {sender?.businessVerificationCompleted === false && (
                        <div className=" absolute bg-[#ffe7c8] h-5 left-[250px] right-0 top-[70px] border-b border-yellow-700 flex flex-row items-center justify-between px-4">
                            <span className="text-xs text-gray-700">KYC Verification Failed, Click here to review.</span>
                            <Link href={`/dashboard/${selectedCurrency}/sender`} className="text-xs font-medium text-gray-900 underline">Verify Now</Link>
                        </div>
                    )}
                </header>
                <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">{children}</main>
                <BottomNavigation />
            </div>
            {/** {modalProps && <KYCModal isOpen={true} {...modalProps} />} */}
        </div>
    )
}