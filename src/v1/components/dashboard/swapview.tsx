"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/v1/components/ui/card";
import { ArrowLeftRight, ArrowUpRight, CheckCircle, CircleDot, EyeOff } from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import Loading from "../loading";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/v1/components/ui/dialog";
import { session, SessionData } from "@/v1/session/session";
import { IWallet } from "@/v1/interface/interface";
import { Fiat } from "@/v1/enums/enums";
import { usePathname } from "wouter/use-browser-location";
import { Link } from "wouter";


export function SwapView() {
    const [hideBalances, setHideBalances] = useState(false);
    const [fromCurrency, setFromCurrency] = useState<string>(Fiat.USD);
    const [toCurrency, setToCurrency] = useState<string>(Fiat.EUR);
    const [amount, setAmount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLive, setIsLive] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState(false);
    const [pendingCurrency, setPendingCurrency] = useState<IWallet | null>(null);
    const [successfulSwap, setSuccessfulSwap] = useState<boolean>(false);
    const [currencies, setCurrencies] = useState<Array<IWallet>>([]);

    const pathname = usePathname();
    const parts = pathname ? pathname.split('/') : [];
    const wallet = (parts[2] || Fiat.NGN).toUpperCase();

    const [rates, setRates] = useState<Record<string, number>>({
        "USD": 1,
        "EUR": 0.92,
        "NGN": 1540,
        "GBP": 0.79,
    });

    // Fetch live rates on mount
    useEffect(() => {
        const fetchRates = async () => {
            setLoading(true);
            try {
                const s: SessionData | undefined = session?.getUserData();
                if (s) {
                    setCurrencies(s.wallets);
                    setFromCurrency(wallet);
                }

                const res = await fetch("https://open.er-api.com/v6/latest/USD");
                const data = await res.json();
                if (data.result === "success" && data.rates) {
                    setRates((prev) => ({
                        ...prev,
                        ...data.rates,
                    }));
                    setIsLive(true);
                } else {
                    setIsLive(false);
                }
            } catch (err) {
                setIsLive(false);
            } finally {
                setLoading(false);
            }
        };
        fetchRates();
        const interval = setInterval(fetchRates, 60 * 1000); // 1 minute
        return () => clearInterval(interval);
    }, []);

    const handleSwap = () => {
        const oldFrom = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(oldFrom);
        // Optionally swap the amount field as well
    };
    // Actual swap logic
    const performSwap = () => {
        if (!rates[fromCurrency] || !rates[toCurrency]) return;
        if (amount <= 0) return;
        // Find indices
        const fromIdx = currencies.findIndex((c) => c.currency === fromCurrency);
        const toIdx = currencies.findIndex((c) => c.currency === toCurrency);
        if (fromIdx === -1 || toIdx === -1) return;
        // Calculate converted amount
        const baseAmountInUSD = amount / rates[fromCurrency];
        const converted = baseAmountInUSD * rates[toCurrency];
        // Check sufficient balance
        if (currencies[fromIdx].balance < amount) return;
        // Update balances
        const updated = currencies.map((c, idx) => {
            if (idx === fromIdx) {
                return { ...c, balance: c.balance - amount };
            }
            if (idx === toIdx) {
                return { ...c, balance: c.balance + converted };
            }
            return c;
        });
        setCurrencies(updated);
    };

    const getConverted = () => {
        if (!rates[fromCurrency] || !rates[toCurrency]) return "";
        if (amount <= 0) return "";
        const baseAmountInUSD = amount / rates[fromCurrency]; // normalize to USD
        const converted = baseAmountInUSD * rates[toCurrency];
        const symbol = currencies.find((c) => c.currency === toCurrency)?.symbol || "";
        return `${symbol}${converted.toFixed(2)}`;
    };

    const getRateReversed = () => {
        if (!rates[fromCurrency] || !rates[toCurrency]) return null;
        const rate = (1 / rates[toCurrency]) * rates[fromCurrency];
        return rate.toFixed(4);
    };

    // Helper to prevent same currency selection
    const handleFromChange = (val: string) => {
        const selected = currencies.find((c) => c.currency === val);
        if (selected && !selected.activated) {
            setPendingCurrency(selected);
            setShowDialog(true);
            return;
        }
        setFromCurrency(val);
        if (val === toCurrency) {
            const newTo = currencies.find((c) => c.currency !== val && c.currency !== Fiat.NGN)?.currency || Fiat.USD;
            setToCurrency(newTo);
        }
    };

    const handleToChange = (val: string) => {
        const selected = currencies.find((c) => c.currency === val);
        if (selected && !selected.activated) {
            setPendingCurrency(selected);
            setShowDialog(true);
            return;
        }
        setToCurrency(val);
        if (val === fromCurrency) {
            const newFrom = currencies.find((c) => c.currency !== val)?.currency || Fiat.USD;
            setFromCurrency(newFrom);
        }
    };

    const fromBalance = currencies.find((c) => c.currency === fromCurrency)?.balance ?? 0;
    const isInsufficientBalance = amount > fromBalance;
    const canConfirmSwap = !loading && !isInsufficientBalance && amount > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Premium Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: [0, 180, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            >
                                <ArrowLeftRight className="h-5 w-5 text-white" />
                            </motion.div>
                            <div className="text-left">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Currency Swap
                                </h1>
                                <p className="text-sm text-gray-600">Exchange currencies instantly at live rates</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setHideBalances(!hideBalances)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-gray-100/70 hover:bg-gray-200/70 rounded-full transition-all"
                        >
                            <EyeOff className="h-4 w-4" />
                            {hideBalances ? "Show" : "Hide"}
                        </button>
                    </div>
                </motion.div>

                {/* Main Swap Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loading />
                                </div>
                            ) : (
                                <>
                                    {/* Header with Rate */}
                                    <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                        <div className="text-center space-y-3">
                                            <h2 className="text-xl font-semibold">Exchange Rate</h2>
                                            <motion.div
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                className="inline-flex items-center gap-3 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm"
                                            >
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        opacity: [1, 0.7, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                >
                                                    <CircleDot
                                                        className={isLive ? "text-green-300" : "text-red-300"}
                                                        size={14}
                                                    />
                                                </motion.div>
                                                <span className="text-sm font-medium">
                                                    1 {toCurrency} ≈ {getRateReversed()} {fromCurrency}
                                                </span>
                                                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${isLive
                                                    ? 'bg-green-500/30 text-green-100'
                                                    : 'bg-red-500/30 text-red-100'
                                                    }`}>
                                                    {isLive ? 'LIVE' : 'OFFLINE'}
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Swap Form */}
                                    <div className="px-8 py-8 space-y-8">
                                        {/* From Currency */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    From
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm text-gray-600">
                                                        Balance: {hideBalances
                                                            ? "•••••"
                                                            : (() => {
                                                                const currency = currencies.find((c) => c.currency === fromCurrency);
                                                                if (!currency) return "N/A";
                                                                return `${currency.symbol}${currency.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                                            })()
                                                        }
                                                    </p>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-all"
                                                        onClick={() => setAmount(currencies.find((c) => c.currency === fromCurrency)?.balance ?? 0)}
                                                    >
                                                        MAX
                                                    </motion.button>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                                                    <Select value={fromCurrency} onValueChange={handleFromChange}>
                                                        <SelectTrigger className="w-32 border-0 bg-white shadow-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {currencies.map((c) => (
                                                                <SelectItem key={c.currency} value={c.currency}>
                                                                    <div className="flex items-center gap-2">
                                                                        <img src={c.icon} alt="" className="w-5 h-5 rounded-full" />
                                                                        <span className="font-medium">{c.currency}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="text"
                                                        placeholder="0.00"
                                                        value={amount ? amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/,/g, "");
                                                            if (/^\d*\.?\d{0,2}$/.test(val)) {
                                                                setAmount(val === "" ? 0 : Number(val));
                                                            }
                                                        }}
                                                        className="border-0 bg-transparent text-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                                                        inputMode="decimal"
                                                    />
                                                </div>
                                                {isInsufficientBalance && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-xs text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                        Insufficient balance
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Swap Button */}
                                        <div className="flex justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 180 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handleSwap}
                                                className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                <ArrowLeftRight className="h-6 w-6" />
                                            </motion.button>
                                        </div>

                                        {/* To Currency */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                    To
                                                </label>
                                                <p className="text-sm text-gray-600">
                                                    Balance: {hideBalances
                                                        ? "•••••"
                                                        : (() => {
                                                            const currency = currencies.find((c) => c.currency === toCurrency);
                                                            if (!currency) return "N/A";
                                                            return `${currency.symbol}${currency.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                                        })()
                                                    }
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50/50 rounded-2xl border border-indigo-200">
                                                    <Select value={toCurrency} onValueChange={handleToChange}>
                                                        <SelectTrigger className="w-32 border-0 bg-white shadow-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {currencies
                                                                .filter((c) => c.currency !== Fiat.NGN)
                                                                .map((c) => (
                                                                    <SelectItem key={c.currency} value={c.currency}>
                                                                        <div className="flex items-center gap-2">
                                                                            <img src={c.icon} alt="" className="w-5 h-5 rounded-full" />
                                                                            <span className="font-medium">{c.currency}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            (() => {
                                                                const converted = getConverted();
                                                                const match = converted.match(/^(\D*)([\d,.]+)/);
                                                                if (!match) return converted;
                                                                const symbol = match[1];
                                                                const num = match[2].replace(/,/g, "");
                                                                const formatted = Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                                return `${symbol}${formatted}`;
                                                            })()
                                                        }
                                                        placeholder="0.00"
                                                        className="border-0 bg-transparent text-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 pt-4">
                                            <Link
                                                href={`/dashboard/${wallet}`}
                                                className="flex-1"
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full py-4 px-6 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition-all"
                                                >
                                                    Cancel
                                                </motion.button>
                                            </Link>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={!canConfirmSwap}
                                                onClick={() => {
                                                    if (!canConfirmSwap) return;
                                                    performSwap();
                                                    setSuccessfulSwap(true);
                                                }}
                                                className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300"
                                            >
                                                {loading ? "Loading..." : isInsufficientBalance ? "Insufficient Balance" : amount <= 0 ? "Enter Amount" : "Confirm Swap"}
                                            </motion.button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Additional Info Cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Instant Exchange</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Your currencies are exchanged instantly at the current market rate with no hidden fees.
                            </p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CircleDot className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Live Rates</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Real-time exchange rates updated every 30 seconds to ensure you get the best value.
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Enhanced Dialogs */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Activate Currency</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <img src={pendingCurrency?.icon} alt="" className="w-6 h-6 rounded-full" />
                                <span className="font-medium">{pendingCurrency?.currency}</span>
                            </div>
                            This currency is not yet activated in your account. Would you like to activate it now?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDialog(false);
                                setPendingCurrency(null);
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                            <Link href={`/dashboard/${pendingCurrency?.currency}`} className="flex items-center justify-center gap-2 w-full">
                                <ArrowUpRight size={16} />
                                Activate Now
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={successfulSwap} onOpenChange={setSuccessfulSwap}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="mx-auto"
                        >
                            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle size={32} className="text-white" />
                            </div>
                        </motion.div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                Swap Successful!
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Your currency exchange has been completed successfully. The funds are now available in your account.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:flex-row pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSuccessfulSwap(false);
                                setPendingCurrency(null);
                            }}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                            <Link href={`/dashboard/${wallet}`} className="flex items-center justify-center gap-2 w-full">
                                View Dashboard
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


