"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, ArrowUpRight, CheckCircle, CircleDot, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Loading from "../loading";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { session, SessionData } from "@/session/session";
import { IWallet } from "@/interface/interface";
import { Fiat } from "@/enums/enums";


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

    const pathname = usePathname()
    const parts = pathname ? pathname.split('/') : []
    const wallet = (parts[2] || 'NGN').toUpperCase()

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

    const getRate = () => {
        if (!rates[fromCurrency] || !rates[toCurrency]) return null;
        const rate = (1 / rates[fromCurrency]) * rates[toCurrency];
        return rate.toFixed(4);
    };

    // New helper that returns the rate for: 1 {toCurrency} ≈ X {fromCurrency}
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

    const activateCurrency = () => {
        if (pendingCurrency) {
            pendingCurrency.activated = true; // (in real app, call API here)
            setShowDialog(false);
            setPendingCurrency(null);
        }
    };

    // Derived flags for enabling/disabling confirm
    const fromBalance = currencies.find((c) => c.currency === fromCurrency)?.balance ?? 0;
    const isInsufficientBalance = amount > fromBalance;
    const canConfirmSwap = !loading && !isInsufficientBalance && amount > 0;

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Swap</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Convert your assets seamlessly with our swap feature
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setHideBalances(!hideBalances)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <EyeOff className="h-4 w-4" />
                        Hide Balances
                    </button>
                </div>
            </div>

            {/* Swap Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    {!loading && (
                        <h2 className="text-xl font-medium text-gray-900 flex flex-row items-center gap-2 justify-start">
                            {fromCurrency} <ArrowLeftRight size={18} /> {toCurrency}
                        </h2>
                    )}
                </div>

                <div className="w-full flex flex-col md:flex-row items-start justify-center pt-5 gap-5">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-6 border rounded-xl space-y-6">
                            {loading ? (
                                <div className="m-40"><Loading /></div>
                            ) : (
                                <>
                                    {/** Swap Title & Rate */}
                                    <div className="flex flex-col items-center justify-center mb-4 gap-2">
                                        <h2 className="text-xl font-medium text-gray-900">Swap Currencies</h2>
                                        <p className="text-sm text-gray-500 border rounded-full px-4 py-2 flex flex-row items-center justify-center gap-2">
                                            <motion.div
                                                animate={{
                                                    opacity: [1, 0.3, 1], // fade in & out
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                                className="inline-block mr-1"
                                            >
                                                <CircleDot
                                                    className={isLive ? "text-green-500" : "text-red-500"}
                                                    size={12}
                                                />
                                            </motion.div>
                                            {/* Rate: 1 {fromCurrency} ≈ {getRate()} {toCurrency} */}
                                            Rate: 1 {toCurrency} ≈ {getRateReversed()} {fromCurrency}
                                        </p>
                                    </div>

                                    {/* From Currency */}
                                    <div className="space-y-2">
                                        <div className="w-full flex flex-row items-center justify-between gap-2">
                                            <label className="text-sm font-medium text-gray-700">From</label>
                                            <div className="flex flex-row items-center justify-center gap-2">
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Balance: {hideBalances
                                                        ? "•••••"
                                                        : (() => {
                                                            const currency = currencies.find((c) => c.currency === fromCurrency);
                                                            if (!currency) return "N/A";
                                                            return `${currency.symbol}${currency.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                                        })()
                                                    }
                                                </p>
                                                <div
                                                    className="text-xs text-blue-500 border border-blue-500 rounded-full cursor-pointer px-2"
                                                    onClick={() => setAmount(currencies.find((c) => c.currency === fromCurrency)?.balance ?? 0)}>
                                                    max
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={fromCurrency}
                                                onValueChange={handleFromChange}
                                            >
                                                <SelectTrigger className="w-28">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currencies.map((c) => (
                                                        <SelectItem key={c.currency} value={c.currency} >
                                                            <div className="!flex !flex-row !items-center gap-1">
                                                                <img src={c.icon} alt="" width={18} height={18} />
                                                                {c.currency}
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
                                                    // Only allow numbers and up to one decimal point
                                                    const val = e.target.value.replace(/,/g, "");
                                                    if (/^\d*\.?\d{0,2}$/.test(val)) {
                                                        setAmount(val === "" ? 0 : Number(val));
                                                    }
                                                }}
                                                className="flex-1"
                                                inputMode="decimal"
                                                pattern="^\d*\.?\d{0,2}$"
                                            />
                                        </div>
                                    </div>

                                    {/* Swap Button */}
                                    <div className="flex justify-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleSwap}
                                            className="rounded-full border shadow-sm"
                                        >
                                            <ArrowLeftRight className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {/* To Currency */}
                                    <div className="space-y-2">
                                        <div className="w-full flex flex-row items-center justify-between gap-2">
                                            <label className="text-sm font-medium text-gray-700">To</label>
                                            <div className="flex flex-row items-center justify-center gap-2">
                                                <p className="text-sm text-gray-500 mt-1">
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
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={toCurrency}
                                                onValueChange={handleToChange}
                                            >
                                                <SelectTrigger className="w-28">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currencies
                                                        .filter((c) => c.currency !== Fiat.NGN)
                                                        .map((c) => (
                                                            <SelectItem key={c.currency} value={c.currency}>
                                                                <div className="!flex !flex-row !items-center gap-1">
                                                                    <img src={c.icon} alt="" width={18} height={18} />
                                                                    {c.currency}
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
                                                        // Extract symbol and number
                                                        const match = converted.match(/^(\D*)([\d,.]+)/);
                                                        if (!match) return converted;
                                                        const symbol = match[1];
                                                        const num = match[2].replace(/,/g, "");
                                                        const formatted = Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                        return `${symbol}${formatted}`;
                                                    })()
                                                }
                                                placeholder="0.00"
                                                className="flex-1 bg-gray-50"
                                                inputMode="decimal"
                                                pattern="^\d*\.?\d{0,2}$"
                                            />
                                        </div>
                                    </div>

                                    {/* Confirm Button */}
                                    <div className="w-full flex flex-row items-center justify-start gap-2 pt-5">
                                        <Link href={`/dashboard/${wallet}`} className="flex flex-col items-center text-center justify-center py-2 hover:bg-slate-50 gap-2 w-full capitalize border rounded-lg">
                                            Cancel
                                        </Link>
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-white"
                                            disabled={!canConfirmSwap}
                                            title={loading ? "Loading rates..." : isInsufficientBalance ? "Insufficient balance" : amount <= 0 ? "Enter amount" : "Confirm Swap"}
                                            onClick={() => {
                                                if (!canConfirmSwap) return;
                                                performSwap();
                                                setSuccessfulSwap(true);
                                            }}
                                        >
                                            Confirm Swap
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate Currency</DialogTitle>
                        <DialogDescription>
                            <div className="flex flex-row items-center gap-1 mb-4">
                                <img src={pendingCurrency?.icon} alt="" width={20} height={20} />
                                {pendingCurrency?.currency} is not yet activated. Would you like to activate it now?
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDialog(false);
                                setPendingCurrency(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button className="text-white">
                            <Link href={`/dashboard/${pendingCurrency?.currency}`} className="flex items-center gap-2">
                                <ArrowUpRight size={16} />
                                Activate
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={successfulSwap} onOpenChange={setSuccessfulSwap}>
                <DialogContent>
                    <DialogHeader className="w-full flex flex-col items-center justify-center text-center gap-1">
                        <DialogTitle className="flex flex-col items-center justify-center gap-6 mt-5">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <CheckCircle size={54} className="text-green-500" />
                            </motion.div>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="font-semibold text-lg"
                            >
                                Swap Successfully
                            </motion.span>
                            {/** <ConfettiExplosion zIndex={300} force={0.6} duration={5500} particleCount={80} width={500} /> */}
                        </DialogTitle>
                        <DialogDescription>
                            Your swap has been completed successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSuccessfulSwap(false);
                                setPendingCurrency(null);
                            }}
                        >
                            Close
                        </Button>
                        <Button className="text-white">
                            <Link href={`/dashboard/${wallet}`} className="flex items-center gap-2">
                                Dashboard
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


