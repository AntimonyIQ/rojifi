"use client"

import { useState, useEffect } from "react"
import * as htmlToImage from "html-to-image";
import { Button } from "@/v1/components/ui/button"
import { ChevronRight, CircleDot, Download, Expand, EyeOff, Plus, Repeat, Send, Wallet, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Calendar } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "@/v1/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/v1/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/v1/components/ui/dropdown-menu"
import TransactionChart from "./transactionchart"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import Loading from "../loading";
import { session, SessionData } from "@/v1/session/session";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { IResponse, ITransaction, IUser, IWallet } from "@/v1/interface/interface";
import { Fiat, Status, TransactionType } from "@/v1/enums/enums";
import Defaults from "@/v1/defaults/defaults";
import { ILoginFormProps } from "../auth/login-form";
import { useLocation, useParams } from "wouter";

export function DashboardOverview() {
    const { wallet } = useParams();
    const [_, navigate] = useLocation();
    const [hideBalances, setHideBalances] = useState(false);
    const [isLive, _setIsLive] = useState<boolean>(true);
    const [user, setUser] = useState<IUser | null>(null)
    const [loadingRates, _setLoadingRates] = useState<boolean>(false);
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState<boolean>(false);
    const [wallets, setWallets] = useState<Array<IWallet>>([])
    const [selectedCurrency, setSelectedCurrency] = useState<Fiat>(Fiat.NGN);
    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [withdrawalActivated, setWithdrawalActivated] = useState<boolean>(false);
    const [withdrawEnabled, _setWithdrawEnabled] = useState<boolean>(false);
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

        setSelectedCurrency(wallet as Fiat);
    }, [selectedCurrency]);

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

    // Render NGN first, then USD, then other currencies
    const sortedWallets = wallets.slice().sort((a, b) => {
        const priority = (c: string) => {
            if (c === Fiat.NGN) return 0;
            if (c === Fiat.USD) return 1;
            return 2;
        };
        const pa = priority(String(a.currency));
        const pb = priority(String(b.currency));
        if (pa !== pb) return pa - pb;
        return String(a.currency).localeCompare(String(b.currency));
    });

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
                                    {sortedWallets.map(tab => (
                                        <button
                                            key={tab.currency}
                                            onClick={(): void => {
                                                setSelectedCurrency(tab.currency as Fiat);
                                                navigate(`/dashboard/${tab.currency}`);
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
                                        navigate(`/dashboard/${selectedCurrency}/swap`)
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
                                                    navigate(`/dashboard/${selectedCurrency}/withdraw`);
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
                                    <h2 className="text-lg font-medium capitalize">Recent Transactions</h2>
                                </div>

                                {/* Transactions Table */}
                                <Card className="w-full">
                                    <CardContent className="p-0 w-full">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/50">
                                                    <TableHead className="w-[100px] pl-6">Type</TableHead>
                                                    <TableHead>Details</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="w-[50px] pr-6">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transactions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="py-20 text-center">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Wallet className="h-8 w-8 text-gray-400" />
                                                                <p className="text-sm text-gray-600">No transactions found</p>
                                                                <p className="text-xs text-gray-500">Your recent transactions will appear here</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    transactions.slice(0, 4).map((transaction) => (
                                                        <TableRow
                                                            key={transaction._id}
                                                            className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                // Handle transaction details view
                                                                console.log('View transaction:', transaction._id);
                                                            }}
                                                        >
                                                            <TableCell className="pl-6">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-2 rounded-full ${transaction.type === TransactionType.TRANSFER || transaction.type === TransactionType.WITHDRAWAL
                                                                        ? 'bg-red-100 text-red-600'
                                                                        : transaction.type === TransactionType.DEPOSIT
                                                                            ? 'bg-green-100 text-green-600'
                                                                            : 'bg-blue-100 text-blue-600'
                                                                        }`}>
                                                                        {transaction.type === TransactionType.TRANSFER || transaction.type === TransactionType.WITHDRAWAL ? (
                                                                            <ArrowUpRight className="h-3 w-3" />
                                                                        ) : transaction.type === TransactionType.DEPOSIT ? (
                                                                            <ArrowDownLeft className="h-3 w-3" />
                                                                        ) : (
                                                                            <Repeat className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs font-medium capitalize">
                                                                        {transaction.type || 'Payment'}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-sm">
                                                                        {transaction.beneficiaryAccountName || transaction.to || 'Payment Transfer'}
                                                                    </span>
                                                                    {transaction.beneficiaryCountry && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {transaction.beneficiaryCountry}
                                                                        </span>
                                                                    )}
                                                                    {transaction.purposeOfPayment && (
                                                                        <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                                                            {transaction.purposeOfPayment}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-sm">
                                                                        {hideBalances ? (
                                                                            "••••••••"
                                                                        ) : (
                                                                            `${activeWallet?.symbol || '$'}${Number(transaction.beneficiaryAmount || transaction.amount || 0).toLocaleString("en-US", {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2,
                                                                            })}`
                                                                        )}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {transaction.senderCurrency || transaction.wallet || selectedCurrency}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        transaction.status.toLowerCase() === "successful" || transaction.status.toLowerCase() === "completed"
                                                                            ? "default"
                                                                            : transaction.status.toLowerCase() === "pending"
                                                                                ? "secondary"
                                                                                : "destructive"
                                                                    }
                                                                    className={`text-xs ${transaction.status.toLowerCase() === "successful" || transaction.status.toLowerCase() === "completed"
                                                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                                        : transaction.status.toLowerCase() === "pending"
                                                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                                                        }`}
                                                                >
                                                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : ''}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="pr-6">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem>
                                                                            View Details
                                                                        </DropdownMenuItem>
                                                                        {transaction.receipt && (
                                                                            <DropdownMenuItem>
                                                                                Download Receipt
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuItem>
                                                                            Track Payment
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        {transactions.length > 0 && (
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
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    <div className="w-full md:w-[30%]">
                        <Card className="w-full md:min-w-md shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
                            <CardContent className="p-0 w-full">
                                {loadingRates ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loading />
                                    </div>
                                ) : (
                                    <>
                                        {/* Header Section */}
                                        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
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
                                                        className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full"
                                                    >
                                                        <CircleDot
                                                            className={isLive ? "text-green-300" : "text-red-300"}
                                                            size={16}
                                                        />
                                                    </motion.div>
                                                    <div>
                                                        <h2 className="text-lg font-semibold">Live Exchange Rates</h2>
                                                        <p className="text-xs text-blue-100 opacity-90">Real-time currency conversion</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${isLive
                                                    ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                                                    : 'bg-red-500/20 text-red-100 border border-red-400/30'
                                                    }`}>
                                                    {isLive ? 'LIVE' : 'CLOSED'}
                                                </div>
                                            </div>

                                            {!isLive && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg backdrop-blur-sm"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center mt-0.5">
                                                            <span className="text-white text-xs">!</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-orange-100">Market Closed</p>
                                                            <p className="text-xs text-orange-200/80 mt-1">
                                                                Trading hours: 9:00 AM - 6:00 PM (Lagos Time)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Rates List */}
                                        <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
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
                                                            <motion.div
                                                                key={`${base.currency}-${target.currency}`}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                                className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-200 cursor-pointer bg-white/60 backdrop-blur-sm"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="relative">
                                                                                <img
                                                                                    src={base.icon}
                                                                                    alt={base.currency}
                                                                                    className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white"
                                                                                />
                                                                            </div>
                                                                            <span className="font-semibold text-gray-800 text-sm">{base.currency}</span>
                                                                        </div>

                                                                        <motion.div
                                                                            animate={{ x: [0, 3, 0] }}
                                                                            transition={{ duration: 2, repeat: Infinity }}
                                                                            className="mx-1"
                                                                        >
                                                                            <ChevronRight size={14} className="text-blue-400 group-hover:text-blue-600" />
                                                                        </motion.div>

                                                                        <div className="flex items-center gap-2">
                                                                            <div className="relative">
                                                                                <img
                                                                                    src={target.icon}
                                                                                    alt={target.currency}
                                                                                    className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white"
                                                                                />
                                                                            </div>
                                                                            <span className="font-semibold text-gray-800 text-sm">{target.currency}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <div className="text-sm font-bold text-gray-900">
                                                                            {rate.toFixed(4)}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            per {base.symbol}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Rate change indicator (placeholder for now) */}
                                                                <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                                                        Updated now
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 py-3 bg-gray-50/50 border-t rounded-b-xl">
                                            <p className="text-xs text-gray-500 text-center">
                                                Rates update every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
                                            </p>
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
