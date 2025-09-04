"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BarChart3, ArrowLeftRight, Settings, LogOut, X, CreditCard, Coins, Group, ReceiptText, Briefcase, LucideSend, Star, ChevronDown, CheckIcon } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { Button } from "../ui/button"
import { ISender, IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"
import Defaults from "@/v1/defaults/defaults"
import { IResponse } from "@/v1/interface/interface"
import { cn } from "@/v1/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover"
import { Status } from "@/v1/enums/enums"
import { Badge } from "../ui/badge"
import { usePathname } from "wouter/use-browser-location"

interface DashboardSidebarProps {
    open: boolean
    setOpen: (open: boolean) => void
}

const navigationBase = [
    { name: "Overview", href: "", icon: BarChart3, dashboard: true },
    { name: "Transactions", href: "transactions", icon: ArrowLeftRight, dashboard: true },
    { name: "Business Profile", href: "businessprofile", icon: Briefcase, dashboard: true },
    { name: "Teams", href: "teams", icon: Group, dashboard: true },
    { name: "Sender", href: "sender", icon: LucideSend, dashboard: true },
    { name: "OTC Desk", href: "otc", icon: Coins, dashboard: true },
    { name: "Virtual USD Cards", href: "virtualcard", icon: CreditCard, dashboard: true },
    { name: "Beneficiary", href: "beneficiary", icon: Star, dashboard: true },
    { name: "Bank Statement", href: "statement", icon: ReceiptText, dashboard: true },
    { name: "Settings", href: "settings", icon: Settings, dashboard: true },
]

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ open, setOpen }) => {
    const pathname = usePathname()
    const [senders, setSenders] = useState<Array<ISender>>([])
    const [popOpen, setPopOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [user, setUser] = useState<IUser | null>(null)
    const [sender, setSender] = useState<ISender | null>(null)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const sd: SessionData = session.getUserData()

    useEffect(() => {
        setUser(sd.user || null)
        setSender(sd.sender || null)
        fetchSenders()
    }, [sd.user, sd.sender])

    const handleLogout = () => {
        setShowLogoutDialog(true);
    }

    const confirmLogout = async () => {
        setShowLogoutDialog(false);
        session.logout();
        window.location.href = '/login';
    }

    const cancelLogout = () => {
        setShowLogoutDialog(false)
    }

    const fetchSenders = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/all`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');
                const parseData: Array<ISender> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setSenders(parseData);
            }
        } catch (error: any) {
            console.error("Error fetching senders:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Mobile overlay */}
            {open && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <LogOut className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Confirm Logout</h3>
                        <p className="text-sm text-gray-600 mb-6 text-center">
                            Are you sure you want to log out of your account? You'll need to sign in again to access your dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div
                className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                {/* Logo Header */}
                <div className="px-6 border-b border-gray-200 h-[73px] flex items-center justify-between">
                    <a href="/dashboard/NGN">
                        <Logo className="h-8 w-auto" />
                    </a>
                    <button onClick={() => setOpen(false)} className="lg:hidden p-2 rounded-md hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div>
                    <nav className="flex-1 px-4 pt-6">
                        <ul className="space-y-2">
                            <li >
                                <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            size="md"
                                            aria-expanded={popOpen}
                                            className="w-full justify-between"
                                        >
                                            <div className="flex flex-row items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                {sender?.businessName}
                                            </div>
                                            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search senders..." />
                                            <CommandList>
                                                {loading && <div className="p-2 text-center text-sm text-gray-500">Loading...</div>}
                                                {!loading && senders.length === 0 && <CommandEmpty>No sender found.</CommandEmpty>}
                                                {!loading && senders.length > 0 && (
                                                    <CommandGroup>
                                                        {senders.map((org) => (
                                                            <CommandItem
                                                                key={org.businessName}
                                                                value={org.businessName}
                                                                onSelect={(currentValue) => {
                                                                    const sender: ISender | undefined = senders.find(s => s.businessName === currentValue);
                                                                    if (sender) {
                                                                        session.updateSession({
                                                                            ...sd,
                                                                            sender: sender
                                                                        })
                                                                        setSender(sender);
                                                                    }
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        sender?.businessName === org.businessName ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {org.businessName}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-6 py-6">
                    <ul className="space-y-2">
                        {navigationBase.map((item: { name: string; href: string; icon: any; dashboard: boolean }) => {
                            let href
                            if (item.dashboard) {
                                const currency = (pathname?.split('/')[2] || 'NGN').toUpperCase()
                                if (item.name === "Overview") {
                                    href = `/dashboard/NGN`
                                } else {
                                    href = `/dashboard/${currency}${item.href ? `/${item.href}` : ''}`
                                }
                            } else {
                                href = item.href
                            }
                            const isActive = item.name === "Overview"
                                ? pathname === href
                                : pathname === href || pathname?.startsWith(href + '/')
                            return (
                                <li key={item.name}>
                                    <a
                                        href={href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setOpen(false);
                                            // Force a full page navigation which can be faster than client-side routing in some cases
                                            window.location.href = href;
                                        }}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-blue-50 text-primary border-l-4 border-primary"
                                            : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex flex-row items-center justify-between w-full">
                                            <div className="flex flex-row items-center gap-2">
                                                <item.icon className="h-5 w-5" />
                                                {item.name}
                                            </div>
                                            {item.name === "Sender" && sender?.businessVerificationCompleted === false && (
                                                <Badge variant='destructive' className="text-white">1</Badge>
                                            )}
                                        </div>
                                    </a>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="border-t border-gray-200 p-4">
                    {user ? (
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.fullName}`}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{user.fullName}</div>
                                <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No user data</div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}