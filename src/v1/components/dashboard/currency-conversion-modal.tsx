"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/v1/components/ui/dialog"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select"
import { X, ArrowUpDown, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Wallet } from "@/v1/types/wallet.type"
import { WalletService } from "@/v1/services/wallet.service"
import { DialogTitle } from "@radix-ui/react-dialog"

interface CurrencyConversionModalProps {
    isOpen: boolean
    onClose: () => void
    wallets: Wallet[]
    initialFromCurrency?: string
    initialToCurrency?: string
    initialAmount?: string
    startAtConfirmation?: boolean
}

interface SwapFeeResponse {
    fee: number
    amount: number
    rate: string
    from_currency: string
    to_currency: string
    swap_amount: number
}

interface ExchangeRate {
    id: string
    rate: string
    base_currency: {
        id: string
        name: string
        code: string
        country: string
        decimal_place: number
    }
    target_currency: {
        id: string
        name: string
        code: string
        country: string
        decimal_place: number
    }
}

type ModalState = "convert" | "confirm" | "loading" | "success" | "error"

export function CurrencyConversionModal({
    isOpen,
    onClose,
    wallets,
    initialFromCurrency = "USD",
    initialToCurrency = "NGN",
    initialAmount = "",
    startAtConfirmation = false,
}: CurrencyConversionModalProps) {
    const [modalState, setModalState] = useState<ModalState>(startAtConfirmation ? "confirm" : "convert")
    const [fromCurrency, setFromCurrency] = useState(initialFromCurrency)
    const [toCurrency, setToCurrency] = useState(initialToCurrency)
    const [amount, setAmount] = useState(initialAmount)
    const [showConfetti, setShowConfetti] = useState(false)
    const [swapFees, setSwapFees] = useState<SwapFeeResponse | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
    const [isLoadingRates, setIsLoadingRates] = useState(false)

    const walletService = new WalletService()

    // Fetch exchange rates on mount
    useEffect(() => {
        const fetchExchangeRates = async () => {
            setIsLoadingRates(true)
            try {
                const response = await walletService.getExchangeRates()
                setExchangeRates(response.data)
                setErrorMessage(null)
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "Failed to fetch exchange rates")
                setExchangeRates([])
            } finally {
                setIsLoadingRates(false)
            }
        }

        if (isOpen) {
            fetchExchangeRates()
        }
    }, [isOpen])

    // Parse wallet balance by removing currency symbols and handling formatting
    const getWalletBalance = (currency: string) => {
        const wallet = wallets.find((w) => w.currency.code === currency)
        if (!wallet) return 0
        // Remove currency symbols and any non-numeric characters except decimal point
        const balanceStr = wallet.formatted_balance.replace(/[^0-9.]/g, '')
        return parseFloat(balanceStr) || 0
    }

    const getFlag = (currency: string) => {
        const currencyInfo = {
            NGN: "🇳🇬",
            USD: "🇺🇸",
            EUR: "🇪🇺",
            GBP: "🇬🇧",
            KES: "🇰🇪",
            GHS: "🇬🇭",
            ZAR: "🇿🇦",
            UGX: "🇺🇬",
            CAD: "🇨🇦",
            XAF: "🇨🇲",
        }
        return currencyInfo[currency as keyof typeof currencyInfo] || "🏳️"
    }

    const getSymbol = (currency: string) => {
        const currencyInfo = {
            NGN: "₦",
            USD: "$",
            EUR: "€",
            GBP: "£",
            KES: "KSh",
            GHS: "₵",
            ZAR: "R",
            UGX: "USh",
            CAD: "$",
            XAF: "FCFA",
        }
        return currencyInfo[currency as keyof typeof currencyInfo] || "$"
    }

    // Get available target currencies for the selected fromCurrency
    const getAvailableTargetCurrencies = () => {
        if (!fromCurrency) return []
        const availableCurrencies = exchangeRates
            .filter(
                (rate) =>
                    rate.base_currency.code === fromCurrency ||
                    rate.target_currency.code === fromCurrency
            )
            .map((rate) =>
                rate.base_currency.code === fromCurrency
                    ? rate.target_currency.code
                    : rate.base_currency.code
            )
        // Only include currencies that are in the user's wallet
        return wallets
            .filter((wallet) => availableCurrencies.includes(wallet.currency.code))
            .map((wallet) => wallet.currency.code)
            .filter((code) => code !== fromCurrency)
    }

    // Ensure toCurrency is valid when fromCurrency or exchangeRates change
    useEffect(() => {
        const availableTargets = getAvailableTargetCurrencies()
        if (availableTargets.length > 0 && !availableTargets.includes(toCurrency)) {
            setToCurrency(availableTargets[0])
        }
    }, [fromCurrency, exchangeRates])

    // Fetch swap fees when amount and currencies are set
    useEffect(() => {
        const fetchFees = async () => {
            if (!amount || Number.parseFloat(amount) <= 0 || fromCurrency === toCurrency) {
                setSwapFees(null)
                setErrorMessage(null)
                return
            }

            try {
                const fromCurrencyId = wallets.find((w) => w.currency.code === fromCurrency)?.currency.id
                const toCurrencyId = wallets.find((w) => w.currency.code === toCurrency)?.currency.id

                if (!fromCurrencyId || !toCurrencyId) {
                    setErrorMessage("Invalid currency selection")
                    setSwapFees(null)
                    return
                }

                const fees = await walletService.getSwapFees(
                    fromCurrencyId,
                    toCurrencyId,
                    Number.parseFloat(amount)
                )
                // Validate API response
                if (
                    typeof fees.fee !== 'number' ||
                    typeof fees.swap_amount !== 'number' ||
                    typeof fees.rate !== 'string' ||
                    isNaN(parseFloat(fees.rate))
                ) {
                    throw new Error("Invalid fee, swap amount, or rate from API")
                }
                setSwapFees(fees)
                setErrorMessage(null)
            } catch (error) {
                setSwapFees(null)
                setErrorMessage(error instanceof Error ? error.message : "Failed to fetch swap fees")
            }
        }

        fetchFees()
    }, [amount, fromCurrency, toCurrency, wallets])

    const getExchangeRate = () => {
        return swapFees && Number.isFinite(parseFloat(swapFees.rate))
            ? parseFloat(swapFees.rate)
            : 0
    }

    const getConvertedAmount = () => {
        return swapFees && Number.isFinite(swapFees.swap_amount) ? swapFees.swap_amount : 0
    }

    const handleSwapCurrencies = () => {
        const availableTargets = getAvailableTargetCurrencies()
        if (availableTargets.includes(fromCurrency)) {
            const temp = fromCurrency
            setFromCurrency(toCurrency)
            setToCurrency(temp)
        }
    }

    const handleConvert = () => {
        if (!amount || Number.parseFloat(amount) <= 0) return
        if (Number.parseFloat(amount) > getWalletBalance(fromCurrency)) return
        if (!swapFees) return
        setModalState("confirm")
    }

    const handleConfirmSwap = async () => {
        setModalState("loading")
        setErrorMessage(null)

        try {
            const fromCurrencyId = wallets.find((w) => w.currency.code === fromCurrency)?.currency.id
            const toCurrencyId = wallets.find((w) => w.currency.code === toCurrency)?.currency.id

            if (!fromCurrencyId || !toCurrencyId) {
                setErrorMessage("Invalid currency selection")
                setModalState("confirm")
                return
            }

            await walletService.performSwap(
                Number.parseFloat(amount),
                fromCurrencyId,
                toCurrencyId
            )
            setModalState("success")
            setShowConfetti(true)

            // Hide confetti after 3 seconds
            setTimeout(() => {
                setShowConfetti(false)
            }, 3000)
        } catch (error) {
            setModalState("error")
            setErrorMessage(error instanceof Error ? error.message : "Failed to perform swap")
        }
    }

    const handleClose = () => {
        setModalState(startAtConfirmation ? "confirm" : "convert")
        if (!startAtConfirmation) {
            setAmount("")
        }
        setSwapFees(null)
        setErrorMessage(null)
        setShowConfetti(false)
        onClose()
    }

    const isValidAmount =
        amount && Number.parseFloat(amount) > 0 && Number.parseFloat(amount) <= getWalletBalance(fromCurrency)

    // Confetti effect
    useEffect(() => {
        if (showConfetti) {
            const confettiCount = 50
            const confettiElements: HTMLElement[] = []

            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement("div")
                confetti.style.position = "fixed"
                confetti.style.left = Math.random() * 100 + "vw"
                confetti.style.top = "-10px"
                confetti.style.width = "10px"
                confetti.style.height = "10px"
                confetti.style.backgroundColor = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"][
                    Math.floor(Math.random() * 5)
                ]
                confetti.style.pointerEvents = "none"
                confetti.style.zIndex = "9999"
                confetti.style.borderRadius = "50%"
                confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`

                document.body.appendChild(confetti)
                confettiElements.push(confetti)
            }

            // Add CSS animation
            const style = document.createElement("style")
            style.textContent = `
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `
            document.head.appendChild(style)

            // Cleanup
            const cleanup = setTimeout(() => {
                confettiElements.forEach((el) => el.remove())
                style.remove()
            }, 5000)

            return () => {
                clearTimeout(cleanup)
                confettiElements.forEach((el) => el.remove())
                style.remove()
            }
        }
    }, [showConfetti])

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md p-0 gap-0">
                {modalState === "convert" && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <DialogTitle>Convert Currency</DialogTitle>

                                <p className="text-sm text-gray-500 mt-1">Swiftly exchange your currency for other pairs</p>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Convert</label>
                                <div className="flex gap-3">
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="flex-1 text-lg"
                                        disabled={isLoadingRates}
                                    />
                                    <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={isLoadingRates}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wallets.map((wallet) => (
                                                <SelectItem key={wallet.id} value={wallet.currency.code}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{getFlag(wallet.currency.code)}</span>
                                                        <span>{wallet.currency.code}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Balance: {getFlag(fromCurrency)} {getWalletBalance(fromCurrency).toLocaleString()} {fromCurrency}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={handleSwapCurrencies}
                                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                                    disabled={isLoadingRates}
                                >
                                    <ArrowUpDown className="h-5 w-5 text-blue-600" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">To</label>
                                <div className="flex gap-3">
                                    <Input
                                        type="text"
                                        value={swapFees ? getConvertedAmount().toLocaleString() : ""}
                                        readOnly
                                        className="flex-1 text-lg bg-gray-50"
                                        placeholder="0.00"
                                    />
                                    <Select value={toCurrency} onValueChange={setToCurrency} disabled={isLoadingRates}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getAvailableTargetCurrencies().map((code) => (
                                                <SelectItem key={code} value={code}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{getFlag(code)}</span>
                                                        <span>{code}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Balance: {getFlag(toCurrency)} {getWalletBalance(toCurrency).toLocaleString()} {toCurrency}
                                </div>
                            </div>
                        </div>

                        {isLoadingRates ? (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 text-orange-800">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Loading exchange rates...</span>
                                </div>
                            </div>
                        ) : amount && isValidAmount && swapFees ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="text-sm text-blue-800">
                                    <div className="font-medium">Exchange Details</div>
                                    <div>
                                        1 {fromCurrency} = {getExchangeRate().toLocaleString()} {toCurrency}
                                    </div>
                                    <div>
                                        Fee: {getSymbol(fromCurrency)} {swapFees.fee.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 text-orange-800">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">
                                        {!amount
                                            ? "Enter an amount and select a currency to view the exchange rate"
                                            : Number.parseFloat(amount) > getWalletBalance(fromCurrency)
                                                ? "Insufficient balance"
                                                : errorMessage || "Enter a valid amount or wait for exchange details"}
                                    </span>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleConvert}
                            disabled={!isValidAmount || !swapFees || isLoadingRates}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                        >
                            Swap
                        </Button>
                    </div>
                )}

                {modalState === "confirm" && swapFees && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">Confirm Swap</h2>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-2">You're swapping</div>
                                <div className="text-2xl font-semibold text-gray-900">
                                    {getFlag(fromCurrency)} {Number.parseFloat(amount).toLocaleString()} {fromCurrency}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ArrowUpDown className="h-6 w-6 text-gray-400" />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-2">You'll receive</div>
                                <div className="text-2xl font-semibold text-gray-900">
                                    {getFlag(toCurrency)} {getConvertedAmount().toLocaleString()} {toCurrency}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Exchange Rate</span>
                                    <span className="text-gray-900">
                                        1 {fromCurrency} = {getExchangeRate().toLocaleString()} {toCurrency}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-600">Processing Fee</span>
                                    <span className="text-gray-900">
                                        {swapFees ? `${getSymbol(fromCurrency)} ${swapFees.fee.toLocaleString()}` : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setModalState("convert")} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleConfirmSwap} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                Confirm Swap
                            </Button>
                        </div>
                    </div>
                )}

                {modalState === "confirm" && !swapFees && (
                    <div className="p-6 text-center">
                        <div className="mb-6">
                            <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Confirm</h2>
                            <p className="text-gray-500">Exchange details are not available. Please try again.</p>
                        </div>
                        <Button onClick={() => setModalState("convert")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Back
                        </Button>
                    </div>
                )}

                {modalState === "loading" && (
                    <div className="p-6 text-center">
                        <div className="mb-6">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Swap</h2>
                            <p className="text-gray-500">Please wait while we process your currency exchange...</p>
                        </div>
                    </div>
                )}

                {modalState === "success" && (
                    <div className="p-6 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Swap Successful! 🎉</h2>
                            <p className="text-gray-500 mb-4">Your currency has been successfully exchanged</p>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <div className="text-sm text-green-800">
                                    <div className="font-medium mb-2">Transaction Complete</div>
                                    <div>
                                        Swapped {getFlag(fromCurrency)} {Number.parseFloat(amount).toLocaleString()} {fromCurrency}
                                    </div>
                                    <div>
                                        Received {getFlag(toCurrency)} {getConvertedAmount().toLocaleString()} {toCurrency}
                                    </div>
                                    <div>
                                        Fee: {swapFees ? `${getSymbol(fromCurrency)} ${swapFees.fee.toLocaleString()}` : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Done
                        </Button>
                    </div>
                )}

                {modalState === "error" && (
                    <div className="p-6 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Swap Failed</h2>
                            <p className="text-gray-500 mb-4">{errorMessage || "An error occurred during the swap."}</p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setModalState("convert")} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleConfirmSwap} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}