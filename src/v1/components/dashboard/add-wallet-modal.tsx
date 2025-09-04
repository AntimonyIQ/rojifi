"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/v1/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select"
import { Button } from "@/v1/components/ui/button"
import { Loader2, Check } from "lucide-react"
import { useToast } from "@/v1/components/ui/use-toast"

type AddWalletModalProps = {
    isOpen: boolean
    onClose: () => void
    existingWallets: any[]
    onAddWallet?: (currency: string) => void
}

export function AddWalletModal({ isOpen, onClose, existingWallets, onAddWallet }: AddWalletModalProps) {
    const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>("")
    const [currencies, _setCurrencies] = useState<any[]>([])
    const [error, setError] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isFetchingCurrencies, _setIsFetchingCurrencies] = useState(false)
    const { toast } = useToast()

    // Fetch currencies when the modal opens
    useEffect(() => {

    }, [isOpen, toast])

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedCurrencyId("")
            setError("")
            setIsLoading(false)
            setIsSuccess(false)
        }
    }, [isOpen])

    // Auto-close after success
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                onClose()
                const currencyDetails = currencies.find((c) => c.id === selectedCurrencyId)
                toast({
                    title: "Wallet Created",
                    description: `Your ${currencyDetails?.country_code ? getFlagEmoji(currencyDetails.country_code) : ""} ${currencyDetails?.code || ""} wallet is ready to use`,
                })
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isSuccess, onClose, selectedCurrencyId, toast, currencies])

    // Helper function to get flag emoji from country code
    const getFlagEmoji = (countryCode: string) => {
        return countryCode
            .toUpperCase()
            .split("")
            .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
            .join("")
    }

    const handleCreateWallet = async () => {
        const selectedCurrency = currencies.find((c) => c.id === selectedCurrencyId)
        if (!selectedCurrency) {
            setError("Please select a valid currency")
            return
        }

        // Check if wallet already exists
        if (existingWallets.some((wallet) => wallet.currency.code === selectedCurrency.code)) {
            setError(`You already have a ${selectedCurrency.code} wallet`)
            toast({
                title: "Wallet Already Exists",
                description: `You already have a ${selectedCurrency.code} wallet`,
                variant: "destructive",
            })
            return
        }

        setError("")
        setIsLoading(true)

        try {
            setIsLoading(false)
            setIsSuccess(true)
            if (onAddWallet) {
                onAddWallet(selectedCurrency.code)
            }
        } catch (error: any) {
            setIsLoading(false)
            setError(error.message || "Failed to create wallet")
            toast({
                title: "Error",
                description: error.message || "Failed to create wallet",
                variant: "destructive",
            })
        }
    }

    // Filter out currencies that already have wallets
    const availableOptions = currencies.filter(
        (currency) => !existingWallets.some((wallet) => wallet.currency.code === currency.code),
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Wallet</DialogTitle>
                </DialogHeader>

                {isFetchingCurrencies && (
                    <div className="py-12 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-900">Loading currencies...</p>
                        <p className="text-sm text-gray-500">This will only take a moment</p>
                    </div>
                )}

                {!isFetchingCurrencies && !isLoading && !isSuccess && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Select Currency</label>
                            <Select value={selectedCurrencyId} onValueChange={setSelectedCurrencyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableOptions.length > 0 ? (
                                        availableOptions.map((currency) => (
                                            <SelectItem key={currency.id} value={currency.id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{getFlagEmoji(currency.country_code)}</span>
                                                    <span>
                                                        {currency.code} - {currency.name}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-gray-500">You already have all available currency wallets</div>
                                    )}
                                </SelectContent>
                            </Select>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <p className="text-xs text-gray-500 mt-1">Select a currency to create a new wallet</p>
                        </div>

                        <Button
                            onClick={handleCreateWallet}
                            disabled={!selectedCurrencyId || availableOptions.length === 0}
                            className="w-full text-white"
                        >
                            Create Wallet
                        </Button>
                    </div>
                )}

                {isLoading && (
                    <div className="py-12 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-900">Creating your wallet...</p>
                        <p className="text-sm text-gray-500">This will only take a moment</p>
                    </div>
                )}

                {isSuccess && (
                    <div className="py-12 flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {Array.from({ length: 50 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute animate-confetti"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 3}s`,
                                        animationDuration: `${3 + Math.random() * 2}s`,
                                    }}
                                >
                                    {["🎉", "🎊", "✨", "🌟", "💫"][Math.floor(Math.random() * 5)]}
                                </div>
                            ))}
                        </div>

                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">Wallet Created Successfully!</p>
                        <p className="text-sm text-gray-500 text-center mt-1">
                            Your new {currencies.find((c) => c.id === selectedCurrencyId)?.country_code ? getFlagEmoji(currencies.find((c) => c.id === selectedCurrencyId)!.country_code) : ""} {currencies.find((c) => c.id === selectedCurrencyId)?.code || ""} wallet is ready to use
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

