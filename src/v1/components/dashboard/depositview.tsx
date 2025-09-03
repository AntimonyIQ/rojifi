"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/v1/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { Button } from "@/v1/components/ui/button";
import { Copy } from "lucide-react";
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
        }
    }, [wallet]);

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

    // human-friendly network labels used in the UI disclaimer
    const networkLabelMap: Record<string, string> = {
        BNB: 'Binance Smart Chain (BEP20)',
        TRX: 'Tron (TRC20)',
        ETH: 'Ethereum (ERC20)',
        Matic: 'Polygon (ERC20-compatible)',
        Solana: 'Solana (SPL)'
    };
    const networkLabel = networkLabelMap[network] || network;

    // short names for titles and sample deposit addresses per network
    const shortNetworkNameMap: Record<string, string> = {
        BNB: 'Binance Smart Chain',
        TRX: 'Tron',
        ETH: 'Ethereum',
        Matic: 'Polygon',
        Solana: 'Solana'
    };

    const sampleAddressMap: Record<string, string> = {
        // BEP20/Ethereum-style addresses
        BNB: '0xBnbBnbBnbBnbBnbBnbBnbBnbBnbBnbBnbBnbBnb1',
        ETH: '0x1234abcd5678ef901234abcd5678ef90abcdef12',
        Matic: '0xMaticMaticMaticMaticMaticMaticMaticMatic1',
        // Tron and Solana style samples
        TRX: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        Solana: 'So11111111111111111111111111111111111111112'
    };

    const depositLabel = `${shortNetworkNameMap[network] || network} Deposit Address`;
    const depositAddress = sampleAddressMap[network] || sampleAddressMap['ETH'];

    const accNum = "0123456789";
    const accName = "John Doe";

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Make Deposit</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Deposit funds into your account to start using our services
                    </p>
                </div>
            </div>

            {/* Deposit Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900 flex flex-row items-center gap-1">
                        Deposit
                        <img src={selectedCurrency?.icon} alt="" width={18} height={18} />
                        {selectedCurrency?.currency}
                    </h2>
                </div>

                <div className="w-full flex flex-col items-center justify-center pt-5">
                    <Card className="w-full max-w-3xl">
                        <CardContent className="p-6 border rounded-xl space-y-6">
                            {selectedCurrency?.currency === Fiat.NGN && (
                                <div className="space-y-6 w-full flex flex-col md:flex-row items-start justify-between gap-5">
                                    <div className="flex flex-col items-start gap-3">

                                        <div className="w-full">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Select Bank
                                            </p>
                                            <Select value={usdToken} onValueChange={setUsdToken}>
                                                <SelectTrigger className="w-32 md:w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="w-full">
                                                    {selectedCurrency && selectedCurrency.deposit.map((token, idx) => (
                                                        <SelectItem key={idx} value={token.institution}>
                                                            <div className="!flex !flex-row !items-center gap-2">
                                                                <img src={token.icon} alt="" width={18} height={18} className="rounded-full" />
                                                                {token.institution}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                            ℹ️ Please ensure you are depositing funds from a Nigerian bank account registered in your name. Deposits from third-party accounts or other sources may be rejected and cannot be recovered. Double-check your account details before transferring funds.
                                        </p>

                                        <div className="flex flex-row items-center justify-center md:hidden w-full ">
                                            <div className="flex justify-center">
                                                <QRCode
                                                    value={accNum}
                                                    size={200}
                                                    logoImage="/favicon.png"   // path to your logo
                                                    logoPaddingRadius={120}
                                                    logoWidth={40}              // adjust size
                                                    removeQrCodeBehindLogo={true}
                                                    qrStyle="squares"           // or 'dots'
                                                    eyeRadius={4}               // rounded edges
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 w-full">
                                            <p className="font-medium">Banking Deposit Account</p>
                                            <div className="flex items-center justify-between gap-2 bg-gray-50 border p-2 rounded-lg">
                                                <span className="truncate">{accNum}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleCopy(accNum)}
                                                >
                                                    <Copy size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 w-full">
                                            <p className="font-medium">Account Name</p>
                                            <div className="flex items-center justify-between gap-2 bg-gray-50 border p-2 rounded-lg">
                                                <span className="truncate">{accName}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleCopy(accName)}
                                                >
                                                    <Copy size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="flex flex-row items-center justify-start gap-1 text-sm text-gray-500 w-full">
                                                <span><Loading /></span>
                                                Detecting Deposit Transaction...
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="flex justify-center">
                                            <QRCode
                                                value={accNum}
                                                size={200}
                                                logoImage="/favicon.png"   // path to your logo
                                                logoPaddingRadius={120}
                                                logoWidth={40}              // adjust size
                                                removeQrCodeBehindLogo={true}
                                                qrStyle="squares"           // or 'dots'
                                                eyeRadius={4}               // rounded edges
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCurrency?.currency === Fiat.USD && (
                                <div className="space-y-6 w-full flex flex-col md:flex-row items-start justify-between gap-5">
                                    <div className="flex flex-col items-start gap-3">

                                        <div className="w-full">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Select Stablecoin
                                            </p>
                                            <Select value={usdToken} onValueChange={setUsdToken}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="w-full">
                                                    {selectedCurrency && selectedCurrency.deposit.map((token, idx) => (
                                                        <SelectItem key={idx} value={token.currency}>
                                                            <div className="!flex !flex-row !items-center gap-1">
                                                                <img src={token.icon} alt="" width={18} height={18} />
                                                                {token.currency}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="w-full">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Select Network
                                            </p>
                                            <Select value={network} onValueChange={setNetwork}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="w-full">
                                                    {selectedCurrency && selectedCurrency.deposit.map((token, idx) => (
                                                        <SelectItem key={idx} value={token.network}>
                                                            <div className="!flex !flex-row !items-center gap-1">
                                                                <img src={token.icon} alt="" width={18} height={18} />
                                                                {token.network}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 p-3 rounded-lg w-full">
                                            ⚠️ Send only <span className="font-semibold">{usdToken}</span> on {networkLabel}. Transfers via other networks will not be credited and cannot be recovered. Confirm the selected network in your wallet or exchange before sending.
                                        </p>

                                        <div className="flex flex-row items-center justify-center md:hidden w-full ">
                                            <div className="flex justify-center">
                                                <QRCode
                                                    value={depositAddress}
                                                    size={200}
                                                    logoImage="/favicon.png"   // path to your logo
                                                    logoPaddingRadius={120}
                                                    logoWidth={40}              // adjust size
                                                    removeQrCodeBehindLogo={true}
                                                    qrStyle="squares"           // or 'dots'
                                                    eyeRadius={4}               // rounded edges
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 w-full">
                                            <p className="font-medium">{depositLabel}</p>
                                            <div className="flex items-center justify-between gap-2 bg-gray-50 border p-2 rounded-lg">
                                                <span className="truncate text-xs md:text-base">{depositAddress}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleCopy(depositAddress)}
                                                >
                                                    <Copy size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="flex flex-row items-center justify-start gap-1 text-sm text-gray-500 w-full">
                                                <span><Loading /></span>
                                                Detecting Deposit Transaction...
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="flex justify-center">
                                            <QRCode
                                                value={depositAddress}
                                                size={200}
                                                logoImage="/favicon.png"   // path to your logo
                                                logoPaddingRadius={120}
                                                logoWidth={40}              // adjust size
                                                removeQrCodeBehindLogo={true}
                                                qrStyle="squares"           // or 'dots'
                                                eyeRadius={4}               // rounded edges
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TODO: EUR Deposit (instructions pending) */}
                            {/* {selectedCurrency.name === "EUR" && (
                                <div>EUR Deposit Instructions Here</div>
                            )} */}

                            {/* TODO: GBP Deposit (instructions pending) */}
                            {/* {selectedCurrency.name === "GBP" && (
                                <div>GBP Deposit Instructions Here</div>
                            )} */}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between w-full max-w-3xl mt-6">
                        <a href={`/dashboard/${wallet}`} className="bg-black hover:bg-slate-800 text-white capitalize px-10 py-2 rounded-lg">
                            cancel
                        </a>
                    </div>
                </div>
            </div>

            <Dialog open={successfulDeposit} onOpenChange={setSuccessfulDeposit}>
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
                                Deposit Successful
                            </motion.span>
                            {/** <ConfettiExplosion zIndex={300} force={0.6} duration={5500} particleCount={80} width={500} /> */}
                        </DialogTitle>
                        <DialogDescription>
                            Your USD wallet has been credited with ${depositAmount}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSuccessfulDeposit(false);
                            }}
                        >
                            Close
                        </Button>
                        <Button className="text-white">
                            <a href={`/dashboard/${wallet}`} className="flex items-center gap-2">
                                Dashboard
                            </a>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
