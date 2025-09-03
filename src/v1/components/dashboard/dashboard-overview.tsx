"use client"

import { useState, useEffect } from "react"
import * as htmlToImage from "html-to-image";
import { Button } from "@/v1/components/ui/button"
import { ChevronRight, CircleDot, Download, Expand, EyeOff, Plus, Repeat, Send, Wallet } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import TransactionChart from "./transactionchart"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import Loading from "../loading";
import { session, SessionData } from "@/v1/session/session";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { IResponse, ITransaction, IUser, IWallet } from "@/v1/interface/interface";
import { Fiat, Status } from "@/v1/enums/enums";
import Defaults from "@/v1/defaults/defaults";
import { ILoginFormProps } from "../auth/login-form";
import { useRouter } from "wouter";
import { usePathname } from "wouter/use-browser-location";

export function DashboardOverview() {
    const router = useRouter();
    const pathname = usePathname();
    const [hideBalances, setHideBalances] = useState(false);
    const [isLive, setIsLive] = useState<boolean>(true);
    const [user, setUser] = useState<IUser | null>(null)
    const [loadingRates, setLoadingRates] = useState<boolean>(false);
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState<boolean>(false);
    const [wallets, setWallets] = useState<Array<IWallet>>([])
    const [selectedCurrency, setSelectedCurrency] = useState<Fiat>(Fiat.NGN);
    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [withdrawalActivated, setWithdrawalActivated] = useState<boolean>(false);
    const [withdrawEnabled, setWithdrawEnabled] = useState<boolean>(false);
    const [activeWallet, setActiveWallet] = useState<IWallet | undefined>(undefined);
    const [activationLoading, setActivationLoading] = useState<boolean>(false);
    const sd: SessionData = session.getUserData();

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 4;
    const totalItems = transactions.length;
    const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    useEffect(() => {

        if (sd) {
            setWallets(sd.wallets);
            setUser(sd.user || null);
            setTransactions(sd.transactions || []);
            const activeWallet: IWallet | undefined = sd.wallets.find(w => w.currency === selectedCurrency);
            setActiveWallet(activeWallet);
        }

        if (!pathname) return;
        const parts = pathname.split('/');
        const wallet = (parts[2] || '').toUpperCase();

        const currencyList = Object.values(Fiat);
        if (currencyList.includes(wallet as Fiat) && wallet !== selectedCurrency) {
            setSelectedCurrency(wallet as Fiat);
        } else if (wallet !== selectedCurrency) {
            setSelectedCurrency(Fiat.NGN);
        }
    }, [pathname, selectedCurrency]);

    const chartData = [
        { day: "Sun", value: 60, amount: "$2,500" },
        { day: "Mon", value: 80, amount: "$3,200" },
        { day: "Tue", value: 70, amount: "$4,300" },

        { day: "Wed", value: 45, amount: "$2,000" },
        { day: "Thu", value: 90, amount: "$5,000" },
        { day: "Fri", value: 85, amount: "$4,800" },
        { day: "Sat", value: 75, amount: "$3,900" },
    ];

    const rates: Record<string, number> = {
        "USD": 1,
        "EUR": 0.92,
        "NGN": 1500,
        "GBP": 0.79,
    };

    const handleDownload = async () => {
        try {
            const node = document.getElementById("screenshot");

            if (!node) {
                console.error("Screenshot element not found!");
                return;
            }

            const dataUrl = await htmlToImage.toPng(node, {
                backgroundColor: "white",
                pixelRatio: 2 // sharp output
            });

            // Trigger download instead of appending to DOM
            const link = document.createElement("a");
            link.download = "transaction-chart.png";
            link.href = dataUrl;
            link.click();

        } catch (err) {
            console.error("Oops, something went wrong!", err);
        }
    };

    const requestActivation = async () => {
        try {
            setActivationLoading(true)

            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/wallet/activate`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
                body: JSON.stringify({
                    currency: activeWallet?.currency,
                    senderId: sd.sender._id,
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {

                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: 'GET',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-rojifi-handshake': sd.client.publicKey,
                        'x-rojifi-deviceid': sd.deviceid,
                        Authorization: `Bearer ${sd.authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake) throw new Error('Unable to process response right now, please try again.');
                    const parseData: ILoginFormProps = Defaults.PARSE_DATA(userdata.data, sd.client.privateKey, userdata.handshake);

                    session.updateSession({
                        ...sd,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                    });

                    setWallets(parseData.wallets);
                    setActiveWallet(parseData.wallets.find(w => w.currency === selectedCurrency));
                    toast.success("Wallet Activation Request Sent");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Error Activating Wallet");
        } finally {
            setActivationLoading(false)
        }
    }

    const Chart = () => {
        return (
            <Card>
                <CardContent className="w-full">
                    <div className="flex items-center justify-between mb-4 pt-4">
                        <h3 className="text-lg font-medium">Payment Analysis</h3>
                        <button onClick={() => setIsStatisticsModalOpen(true)} className="text-sm text-gray-500 flex gap-1">
                            Expand <Expand className="h-4 w-4" />
                        </button>
                    </div>
                    <TransactionChart data={chartData} height={400} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6 min-w-0">
                <div className="flex flex-col md:flex-row items-center justify-between w-full">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Welcome Back, {user?.firstname}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Get a quick snapshot of your account activity and wallet balances
                        </p>
                    </div>

                    <div className="hidden md:flex items-start md:items-center gap-4">
                        <button
                            onClick={() => {
                                const newHide = !hideBalances
                                setHideBalances(newHide)
                                window.dispatchEvent(
                                    new CustomEvent("balanceVisibilityChanged", {
                                        detail: { hideBalances: newHide }
                                    })
                                )
                            }}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                            <EyeOff className="h-4 w-4" />
                            {hideBalances ? "Show Balances" : "Hide Balances"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-5">

                    <div className="flex flex-col items-start gap-5 w-full md:w-[70%]">
                        {/* Currency Tabs */}
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="w-full lg:w-auto">
                                <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
                                    {wallets.map(tab => (
                                        <button
                                            key={tab.currency}
                                            onClick={(): void => {
                                                setSelectedCurrency(tab.currency as Fiat);
                                                window.location.href = `/dashboard/${tab.currency}`;
                                            }}
                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex flex-row items-center gap-1 ${selectedCurrency === tab.currency
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                                }`}>
                                            <img src={`${tab.icon}`} alt="" width={20} height={20} />
                                            {tab.currency}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {["EUR", "GBP"].includes(selectedCurrency) ? (
                            <>
                                {activeWallet && activeWallet.requested && activeWallet.requested.find(r => r.currency === selectedCurrency && r.status === "pending") ? (
                                    <div className="w-full mt-40 flex flex-col items-center justify-center">
                                        <div className="relative flex items-center justify-center w-20 h-20">
                                            <motion.div
                                                className="absolute w-20 h-20 rounded-full bg-yellow-400 opacity-50"
                                                initial={{ scale: 0, opacity: 0.6 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    repeatType: "mirror",
                                                    ease: "easeOut"
                                                }}
                                            />
                                            <Wallet size={28} className="relative z-10 text-yellow-900" />
                                        </div>
                                        <div className="flex flex-col items-center text-center justify-center gap-2 mt-3">
                                            <h2 className="font-bold">{selectedCurrency} Wallet Request Pending</h2>
                                            <p>
                                                Your request to activate a {selectedCurrency} wallet is pending approval.<br />
                                                You will be notified once your wallet is available.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full mt-40 flex flex-col items-center justify-center">
                                        <div className="relative flex items-center justify-center w-20 h-20">
                                            {/* First ripple */}
                                            <motion.div
                                                className="absolute w-20 h-20 rounded-full bg-blue-400 opacity-50"
                                                initial={{ scale: 0, opacity: 0.6 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    repeatType: "mirror",
                                                    ease: "easeOut"
                                                }}
                                            />
                                            {/* Second ripple with delay for overlap */}
                                            <motion.div
                                                className="absolute w-20 h-20 rounded-full bg-blue-400 opacity-50"
                                                initial={{ scale: 0, opacity: 0.6 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    repeatType: "mirror",
                                                    ease: "easeOut",
                                                    delay: 0.75
                                                }}
                                            />
                                            {/* Icon always centered */}
                                            <Wallet size={28} className="relative z-10 text-blue-900" />
                                        </div>

                                        <div className="flex flex-col items-center text-center justify-center gap-2 mt-3">
                                            <h2 className="font-bold">Activate {selectedCurrency} Wallet</h2>
                                            <p>
                                                You currently have no {selectedCurrency} wallets, Create one by clicking on the <br />
                                                <span className="text-blue-500 font-medium">"Activate Wallet"</span> button,
                                                or check any of the other tabs to see your other wallets
                                            </p>
                                            <div className="flex items-center gap-2 pt-5">
                                                <Button
                                                    size="lg"
                                                    disabled={activationLoading}
                                                    onClick={requestActivation}
                                                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                                                >
                                                    {activationLoading ? "" : <Plus className="h-4 w-4" />}
                                                    <span className="hidden sm:inline">{activationLoading ? "Requesting..." : "Activate Wallet"}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Wallet Cards */}
                                {activeWallet && (
                                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between w-full">
                                        <div className="flex flex-row items-center justify-start gap-5 w-full py-3 overflow-x-auto scroll-smooth !scrollbar-hide">
                                            {/* Current Balance Card */}
                                            <div className="flex-shrink-0 px-4 py-3 rounded-lg bg-[#d3eaff] w-[300px] h-[150px] gap-4 flex flex-col items-start justify-between">
                                                <div className="flex flex-col items-start justify-start">
                                                    <div className="text-2xl">
                                                        {hideBalances
                                                            ? "•••••"
                                                            : `${activeWallet.symbol}${activeWallet.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                    </div>
                                                    <div className="text-xs uppercase">Total Balance</div>
                                                </div>
                                                {/** <Button variant="outline">View Spent</Button> */}
                                            </div>

                                            {/* Pending Payment Card */}
                                            {activeWallet.currency !== Fiat.NGN &&
                                                <div className="flex-shrink-0 px-4 py-3 rounded-lg bg-slate-300 w-[300px] h-[150px] gap-4 flex flex-col items-start justify-between">
                                                    <div className="flex flex-col items-start justify-start">
                                                        <div className="text-2xl">
                                                            {hideBalances
                                                                ? "•••••"
                                                                : `${activeWallet.symbol}${activeWallet.pending_payment_balance}`}
                                                        </div>
                                                        <div className="text-xs uppercase">Pending Payments</div>
                                                    </div>
                                                    <Button variant="outline">
                                                        <a href={`/dashboard/${selectedCurrency}/transactions`} className="text-xs uppercase">View Payments</a>
                                                    </Button>
                                                </div>
                                            }

                                            {activeWallet.currency !== Fiat.NGN &&
                                                <div className="flex-shrink-0 px-4 py-3 rounded-lg bg-[#ffe8c3] w-[300px] h-[150px] gap-4 flex flex-col items-start justify-between">
                                                    <div className="flex flex-col items-start justify-start">
                                                        <div className="text-2xl">
                                                            {hideBalances
                                                                ? "•••••"
                                                                : `15`}
                                                        </div>
                                                        <div className="text-xs uppercase">Total Recipient</div>
                                                    </div>
                                                    <Button variant="outline">
                                                        <a href={`/dashboard/${selectedCurrency}/beneficiary`} className="text-xs uppercase">View Recipient</a>
                                                    </Button>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-row items-center justify-start gap-2">
                                    <a href={`/dashboard/${selectedCurrency}/deposit`} className="flex flex-row items-center justify-center text-center py-2 gap-2 hover:bg-slate-50 capitalize border rounded-lg px-5 bg-white">
                                        <Plus className="h-4 w-4" /> Deposit
                                    </a>
                                    <Button variant="outline" onClick={(): void => {
                                        window.location.href = `/dashboard/${selectedCurrency}/swap`
                                    }} disabled={!isLive}>
                                        <a href={`/dashboard/${selectedCurrency}/swap`} className="flex flex-row items-center justify-center gap-2">
                                            <Repeat className="h-4 w-4" /> Swap
                                        </a>
                                    </Button>
                                    {selectedCurrency === Fiat.NGN ? (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="text-white"
                                            onClick={() => {
                                                if (selectedCurrency === Fiat.NGN && withdrawEnabled === false) {
                                                    setWithdrawalActivated(true);
                                                } else {
                                                    window.location.href = `/dashboard/${selectedCurrency}/withdraw`;
                                                }
                                            }}>
                                            <Send className="h-4 w-4" /> Withdraw
                                        </Button>
                                    ) : (
                                        <Button variant="default" size="sm" className="text-white">
                                            <a href={`/dashboard/${selectedCurrency}/payment`} className="flex flex-row items-center justify-center gap-2">
                                                <Send className="h-4 w-4" /> Transfer
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                <div className="w-full">
                                    <Chart />
                                </div>

                                <div className="mt-5">
                                    <h2 className="text-lg font-medium capitalize">Wallet history</h2>
                                </div>

                                {/* Transactions Table */}
                                <Card className="w-full">
                                    <CardContent className="p-0 w-full">
                                        <div className="overflow-x-auto w-full">
                                            <table className="w-full">
                                                <thead className="border-b border-gray-200 bg-gray-50">
                                                    <tr>
                                                        {/*
                                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Amount</th>
                                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Beneficiary</th>
                                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Date</th>
                                                            */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.length === 0 && (
                                                        <tr>
                                                            <td colSpan={3} className="py-20 px-6 text-sm text-gray-600 text-center">
                                                                No transactions found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {transactions.length > 0 && transactions.slice(0, 4).map((transaction) => (
                                                        <tr
                                                            key={transaction._id}
                                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                            onClick={() => { }}
                                                        >
                                                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                                {hideBalances
                                                                    ? "••••••••"
                                                                    : `${Number(transaction.amount).toLocaleString("en-US", {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    })}`}
                                                            </td>
                                                            <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{transaction.createdAt.toDateString()}</td>
                                                            <td className="py-4 px-6">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status.toLowerCase() === "successful"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : transaction.status.toLowerCase() === "pending"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-red-100 text-red-800"
                                                                        }`}
                                                                >
                                                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                                            <div className="text-sm text-gray-700">
                                                Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <span className="text-sm text-gray-700 px-2">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    <div className="w-full md:w-[30%]">
                        <Card className="w-full md:min-w-md">
                            <CardContent className="p-6 border rounded-xl space-y-6 w-full">
                                {loadingRates ? (
                                    <div className="m-40"><Loading /></div>
                                ) : (
                                    <>
                                        {/** Swap Title & Rate */}
                                        <div className="flex flex-col items-center justify-center mb-4 gap-2">
                                            <h2 className="text-xl font-medium text-gray-900">
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
                                                        size={15}
                                                    />
                                                </motion.div>
                                                Live Rates
                                            </h2>
                                            {!isLive && (
                                                <div className="w-full flex flex-col items-start justify-start pt-5 bg-orange-100 border border-orange-500 rounded-lg p-2">
                                                    <p className="text-sm text-orange-500">Please Note...</p>
                                                    <p className="text-xs text-orange-500">
                                                        Trade is currently closed. The rates displayed below are for information purposes and cannot currently be used for trading. Trade hours are between 9am to 6pm Lagos time.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rate List */}
                                        <div className="divide-y divide-gray-200 border rounded-lg">
                                            {wallets.map((base) =>
                                                wallets
                                                    .filter((target) => target.currency !== base.currency)
                                                    .map((target) => {
                                                        // ❌ Skip USD→NGN, EUR→NGN, GBP→NGN
                                                        if (base.currency !== Fiat.NGN && target.currency === Fiat.NGN) {
                                                            return null;
                                                        }

                                                        const rate = (1 / rates[base.currency]) * rates[target.currency];

                                                        return (
                                                            <div
                                                                key={`${base.currency}-${target.currency}`}
                                                                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition"
                                                            >
                                                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                                    <span>
                                                                        <img src={base.icon} alt="" width={18} height={18} />
                                                                    </span>
                                                                    <span>{base.currency}</span>
                                                                    <ChevronRight size={16} className="text-gray-400" />
                                                                    <span>
                                                                        <img src={target.icon} alt="" width={18} height={18} />
                                                                    </span>
                                                                    <span>{target.currency}</span>
                                                                </div>
                                                                <span className="text-gray-600 text-sm">
                                                                    1 {base.symbol} ≈ {rate.toFixed(4)} {target.symbol}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>

            </div>

            <Dialog open={isStatisticsModalOpen} onOpenChange={setIsStatisticsModalOpen}>
                <DialogContent className="max-w-4xl">
                    <div id="screenshot">
                        <div className="w-full flex flex-row items-center justify-between">
                            <DialogTitle>Transaction Statistics</DialogTitle>
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                        <TransactionChart data={chartData} height={400} />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={withdrawalActivated} onOpenChange={setWithdrawalActivated}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate {selectedCurrency} Withdrawal</DialogTitle>
                        <DialogDescription>
                            {selectedCurrency} Withdrawal is currently disabled. Click on <span className="text-blue-500">"Contact Support"</span> to enable withdrawals.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setWithdrawalActivated(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button className="text-white" onClick={() => {
                            setWithdrawalActivated(false);
                            toast.success(`${selectedCurrency} withdrawal request sent`);
                        }}>
                            Contact Support
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
