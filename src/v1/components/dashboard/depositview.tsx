"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/v1/components/ui/card";
import { CheckCircle, TrendingUp, Shield, Clock, Copy, ArrowDown, Building, Network, Wallet2, Info, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { Button } from "@/v1/components/ui/button";
// import QRCode from "react-qr-code";
import { QRCode } from 'react-qrcode-logo';
import { toast } from "sonner";
import Loading from "../loading";
import { session, SessionData } from "@/v1/session/session";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/v1/components/ui/dialog";
import { motion } from "framer-motion";
import { IWallet } from "@/v1/interface/interface";
import { Fiat } from "@/v1/enums/enums";
import { usePathname } from "wouter/use-browser-location";

export function DepositView() {
    const ss: SessionData = session.getUserData();
    const [selectedCurrency, setSelectedCurrency] = useState<IWallet | null>(null);
    const [usdToken, setUsdToken] = useState("USDT");
    const [network, setNetwork] = useState("BNB");
    const [_selectedDepositOption, setSelectedDepositOption] = useState<any>(null);

    const [successfulDeposit, setSuccessfulDeposit] = useState(false);
    const [depositAmount, setDepositAmount] = useState("1,000.00");

    // refs to hold timer ids so we can clean them up
    const intervalRef = useRef<number | null>(null);
    const autoCloseRef = useRef<number | null>(null);

    const pathname = usePathname()
    const parts = pathname ? pathname.split('/') : []
    const wallet = (parts[2] || Fiat.NGN).toUpperCase()

    useEffect(() => {
        // set the active wallet from the session data
        const wallets: Array<IWallet> = ss.wallets || [];
        const sel = wallets.find(w => w.currency === wallet) || null;
        setSelectedCurrency(sel);

        // set a sensible default for the usdToken select when the wallet changes
        if (sel && Array.isArray(sel.deposit) && sel.deposit.length > 0) {
            const first = sel.deposit[0] as any;
            const defaultVal = first.institution ?? first.currency ?? first.network ?? usdToken;
            setUsdToken(defaultVal);
            setSelectedDepositOption(first);
        }
    }, [wallet]);

    // Get unique cryptocurrencies (no duplicates)
    const getUniqueCryptocurrencies = () => {
        if (!selectedCurrency?.deposit) return [];

        const uniqueCryptos = selectedCurrency.deposit.reduce((acc: any[], token: any) => {
            const existing = acc.find(item => item.currency === token.currency);
            if (!existing) {
                acc.push(token);
            }
            return acc;
        }, []);

        return uniqueCryptos;
    };

    // Get networks for selected cryptocurrency
    const getNetworksForCrypto = (cryptoCurrency: string) => {
        if (!selectedCurrency?.deposit) return [];

        return selectedCurrency.deposit.filter(token => token.currency === cryptoCurrency);
    };

    // Handle cryptocurrency selection
    const handleCryptoChange = (cryptoValue: string) => {
        setUsdToken(cryptoValue);
        const networks = getNetworksForCrypto(cryptoValue);
        if (networks.length > 0) {
            setNetwork(networks[0].network);
            setSelectedDepositOption(networks[0]);
        }
    };

    // Handle network selection
    const handleNetworkChange = (networkValue: string) => {
        setNetwork(networkValue);
        const depositOption = selectedCurrency?.deposit.find(
            token => token.currency === usdToken && token.network === networkValue
        );
        if (depositOption) {
            setSelectedDepositOption(depositOption);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    // Get the deposit address or account details
    const getDepositDetails = () => {
        if (selectedCurrency?.currency === Fiat.NGN) {
            const bankOption = selectedCurrency.deposit.find(d => d.institution === usdToken);
            return {
                label: "Account Number",
                value: bankOption?.accountNumber || "0123456789",
                accountName: "John Doe",
                institution: bankOption?.institution || "First Bank",
                icon: bankOption?.icon
            };
        } else {
            const cryptoOption = selectedCurrency?.deposit.find(
                d => d.currency === usdToken && d.network === network
            );
            return {
                label: `${network} Address`,
                value: cryptoOption?.address || "0x1234abcd5678ef901234abcd5678ef90abcdef12",
                network: network,
                currency: usdToken,
                icon: cryptoOption?.icon
            };
        }
    };

    const simulateDeposit = () => {
        // generate a mock deposit amount between 50,000 and 10,000,000
        const amount = Math.random() * (10_000_000 - 50_000) + 50_000;
        const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
        setDepositAmount(formatted);
        setSuccessfulDeposit(true);

        // clear any existing auto-close timeout then set a new one for 30s
        if (autoCloseRef.current) {
            clearTimeout(autoCloseRef.current);
        }
        autoCloseRef.current = window.setTimeout(() => {
            setSuccessfulDeposit(false);
            autoCloseRef.current = null;
        }, 30_000);
    };

    useEffect(() => {
        // start simulating deposits every 60 seconds
        intervalRef.current = window.setInterval(() => {
            simulateDeposit();
        }, 60_000);

        // cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (autoCloseRef.current) {
                clearTimeout(autoCloseRef.current);
                autoCloseRef.current = null;
            }
        };
    }, []);

    const depositDetails = getDepositDetails();

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
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                    rotateY: [0, 180, 360]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                            >
                                <ArrowDown className="h-5 w-5 text-white" />
                            </motion.div>
                            <div className="text-left">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Deposit {selectedCurrency?.currency}
                                </h1>
                                <p className="text-sm text-gray-500">Fund your wallet securely</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-emerald-700">Secure</span>
                        </div>
                    </div>
                </motion.div>

                {/* Main Deposit Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {/* Header Section */}
                            <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                            <img src={selectedCurrency?.icon} alt="" className="w-7 h-7 rounded-full" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Deposit {selectedCurrency?.currency}</h2>
                                            <p className="text-emerald-100 text-sm">
                                                {selectedCurrency?.currency === Fiat.NGN ? 'Bank Transfer' : 'Cryptocurrency'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-100 text-sm">Current Balance</p>
                                        <p className="text-xl font-bold">{selectedCurrency?.symbol}{selectedCurrency?.balance.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8">
                                {selectedCurrency?.currency === Fiat.NGN ? (
                                    /* NGN Bank Deposit Section */
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-emerald-600" />
                                                    Select Bank
                                                </label>
                                                <Select value={usdToken} onValueChange={setUsdToken}>
                                                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 transition-colors">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedCurrency?.deposit.map((token, idx) => (
                                                            <SelectItem key={idx} value={token.institution}>
                                                                <div className="flex items-center gap-3">
                                                                    <img src={token.icon} alt="" width={20} height={20} className="rounded-full" />
                                                                    <span className="font-medium">{token.institution}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm text-blue-800">
                                                        <p className="font-medium mb-1">Important Notice</p>
                                                        <p>Only send funds from a Nigerian bank account registered in your name. Third-party transfers will be rejected.</p>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700">Account Number</label>
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                                        <span className="flex-1 font-mono text-lg font-semibold">{depositDetails.value}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(depositDetails.value)}
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700">Account Name</label>
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                                        <span className="flex-1 font-semibold">{depositDetails.accountName}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(depositDetails.accountName!)}
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                <Loading />
                                                <span>Monitoring for incoming deposits...</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center lg:justify-end">
                                            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                                                <QRCode
                                                    value={depositDetails.value}
                                                    size={220}
                                                    logoImage="/favicon.png"
                                                    logoPaddingRadius={120}
                                                    logoWidth={45}
                                                    removeQrCodeBehindLogo={true}
                                                    qrStyle="squares"
                                                    eyeRadius={8}
                                                />
                                                <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                                                    Scan to copy account number
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Cryptocurrency Deposit Section */
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Wallet2 className="h-4 w-4 text-emerald-600" />
                                                        Cryptocurrency
                                                    </label>
                                                    <Select value={usdToken} onValueChange={handleCryptoChange}>
                                                        <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 transition-colors">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getUniqueCryptocurrencies().map((token, idx) => (
                                                                <SelectItem key={idx} value={token.currency}>
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={token.icon} alt="" width={20} height={20} className="rounded-full" />
                                                                        <span className="font-medium">{token.currency}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Network className="h-4 w-4 text-emerald-600" />
                                                        Network
                                                    </label>
                                                    <Select value={network} onValueChange={handleNetworkChange}>
                                                        <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 transition-colors">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getNetworksForCrypto(usdToken).map((token, idx) => (
                                                                <SelectItem key={idx} value={token.network}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                                                            <span className="text-white text-xs font-bold">{token.network.charAt(0)}</span>
                                                                        </div>
                                                                        <span className="font-medium">{token.network}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm text-amber-800">
                                                        <p className="font-medium mb-1">Network Warning</p>
                                                        <p>Only send <span className="font-semibold">{usdToken}</span> on the <span className="font-semibold">{network}</span> network. Wrong network transfers cannot be recovered.</p>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700">Deposit Address</label>
                                                <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                                    <span className="flex-1 font-mono text-sm break-all">{depositDetails.value}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopy(depositDetails.value)}
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 flex-shrink-0"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                <Loading />
                                                <span>Monitoring blockchain for deposits...</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center lg:justify-end">
                                            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                                                <QRCode
                                                    value={depositDetails.value}
                                                    size={220}
                                                    logoImage="/favicon.png"
                                                    logoPaddingRadius={120}
                                                    logoWidth={45}
                                                    removeQrCodeBehindLogo={true}
                                                    qrStyle="squares"
                                                    eyeRadius={8}
                                                />
                                                <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                                                    Scan to copy address
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-800">Secure Deposits</h3>
                            </div>
                            <p className="text-sm text-gray-600">Bank-grade security with multi-layer encryption and fraud protection.</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-800">Instant Processing</h3>
                            </div>
                            <p className="text-sm text-gray-600">Funds are credited immediately upon confirmation of your deposit.</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-800">Low Fees</h3>
                            </div>
                            <p className="text-sm text-gray-600">Competitive rates with transparent pricing and no hidden charges.</p>
                        </Card>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 max-w-4xl mx-auto">
                    <Button
                        variant="outline"
                        className="px-8 py-3 h-auto border-2 hover:bg-gray-50"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                    <Button
                        className="px-8 py-3 h-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        onClick={() => window.location.href = `/dashboard/${wallet}`}
                    >
                        View Dashboard
                    </Button>
                </div>
            </div>

            {/* Enhanced Success Dialog */}
            <Dialog open={successfulDeposit} onOpenChange={setSuccessfulDeposit}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="mx-auto"
                        >
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                        </motion.div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl font-bold">Deposit Successful!</DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Your {selectedCurrency?.currency} wallet has been credited with {selectedCurrency?.symbol}{depositAmount}.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:flex-row pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setSuccessfulDeposit(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                            onClick={() => window.location.href = `/dashboard/${wallet}`}
                        >
                            View Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
