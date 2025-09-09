import { useEffect, useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { Badge } from "@/v1/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/v1/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/v1/components/ui/dropdown-menu";
import { EyeOff, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Calendar, Repeat, Wallet, Search, X, Filter } from "lucide-react";
import { TransactionDetailsDrawer } from "./transaction-details-modal";
import Loading from "../loading";
import { IPagination, IResponse, ITransaction } from "@/v1/interface/interface";
import { Status, TransactionType } from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";
import { Input } from "@/v1/components/ui/input";
// import { useLocation, useParams } from "wouter";

interface ICurrency {
    name: string;
    icon: string;
}

enum Owners {
    EVERYONE = "Everyone",
    ME = "Me",
    TEAM = "Teammates"
}

export function TransactionsView() {
    // const { wallet } = useParams();
    // const [_, _navigate] = useLocation();
    const [hideBalances, setHideBalances] = useState(false);
    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    const [statusFilter, setStatusFilter] = useState("Successful");
    const [currencyFilter, setCurrencyFilter] = useState("All");
    const [ownerFilter, setOwnerFilter] = useState("Everyone");
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // New filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    const statusTabs = ["Successful", "Processing", "Pending", "Failed"];
    const owners = Object.values(Owners);
    const currencies: Array<ICurrency> = [
        { name: "All", icon: "https://img.icons8.com/color/50/worldwide-location.png" },
        { name: "NGN", icon: "https://img.icons8.com/color/50/nigeria-circular.png" },
        { name: "USD", icon: "https://img.icons8.com/color/50/usa-circular.png" },
        { name: "EUR", icon: "https://img.icons8.com/fluency/48/euro-pound-exchange.png" },
        { name: "GBP", icon: "https://img.icons8.com/color/50/british-pound--v1.png" },
    ];

    useEffect(() => {
        if (sd) {
            fetchTransactions();
        }
    }, [statusFilter, currencyFilter, searchQuery, startDate, endDate, pagination.page, sd]);

    // Update active filters count
    useEffect(() => {
        let count = 0;
        if (statusFilter !== "Successful") count++;
        if (currencyFilter !== "All") count++;
        if (searchQuery.trim()) count++;
        if (startDate) count++;
        if (endDate) count++;
        setActiveFiltersCount(count);
    }, [statusFilter, currencyFilter, searchQuery, startDate, endDate]);

    const fetchTransactions = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();

            // Build query parameters
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                includePagination: "true"
            });

            // Add filters
            if (statusFilter !== "Successful") {
                params.append("status", statusFilter.toLowerCase());
            }
            if (currencyFilter !== "All") {
                params.append("wallet", currencyFilter);
            }
            if (searchQuery.trim()) {
                params.append("search", searchQuery.trim());
            }
            if (startDate) {
                params.append("startDate", startDate);
            }
            if (endDate) {
                params.append("endDate", endDate);
            }

            const url: string = `${Defaults.API_BASE_URL}/transaction/?${params.toString()}`;

            const res = await fetch(url, {
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
                if (!data.handshake) throw new Error('Unable to process transaction response right now, please try again.');
                const parseData: Array<ITransaction> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setTransactions(parseData);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransactionClick = (_transaction: any) => {
        setIsTransactionModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your transaction history across different currencies
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

            {/* Transactions Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">All Transactions</h2>
                    {transactions.length > 0 && (
                        <Button variant="outline" size="sm">
                            Export Transactions
                        </Button>
                    )}
                </div>

                {/* Status Tabs and Currency Filter */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="w-full lg:w-auto">
                        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
                            {statusTabs.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setPagination((prev) => ({ ...prev, page: 1 }));
                                    }}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === status
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:flex flex-row items-center justify-end gap-4">
                        {/* Currency Filter */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Currency:</label>
                            <Select
                                value={currencyFilter}
                                onValueChange={(value) => {
                                    setCurrencyFilter(value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                }}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((currency) => (
                                        <SelectItem key={currency.name} value={currency.name}>
                                            <div className="flex items-center gap-2">
                                                <img src={currency.icon} alt="" width={20} height={20} />
                                                {currency.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Made By Filter */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Made By:</label>
                            <Select
                                value={ownerFilter}
                                onValueChange={(value) => {
                                    setOwnerFilter(value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                }}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Everyone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {owners.map((owner) => (
                                        <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </div>

                {/* Search and Advanced Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    {/* Search Input */}
                    <div className="relative flex-1 lg:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search transactions by reference, name, bank..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Date Range Filters */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setStatusFilter("Successful");
                                setCurrencyFilter("All");
                                setSearchQuery("");
                                setStartDate("");
                                setEndDate("");
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="flex items-center gap-2 whitespace-nowrap"
                        >
                            <Filter className="h-4 w-4" />
                            Clear Filters ({activeFiltersCount})
                        </Button>
                    )}
                </div>

                {/* Transaction loading */}
                {loading && <div className="py-40"><Loading /></div>}

                {/* Empty Transaction */}
                {!loading && transactions.length === 0 &&
                    <Card className="w-full">
                        <CardContent className="p-0 w-full">
                            <div className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Wallet className="h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">No {statusFilter.toLowerCase()} transactions found</p>
                                    <p className="text-xs text-gray-500">Your transaction history will appear here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                }

                {/* Transactions Table */}
                {!loading && transactions.length > 0 &&
                    <Card>
                        <CardContent className="p-0">
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
                                    {transactions.map((transaction) => (
                                        <TableRow
                                            key={transaction._id}
                                            className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                            onClick={() => handleTransactionClick(transaction)}
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
                                                            `$${Number(transaction.beneficiaryAmount || transaction.amount || 0).toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}`
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {transaction.senderCurrency || transaction.wallet || 'USD'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        transaction.status.toLowerCase() === "successful" || transaction.status.toLowerCase() === "completed"
                                                            ? "default"
                                                            : transaction.status.toLowerCase() === "pending" || transaction.status.toLowerCase() === "processing"
                                                                ? "secondary"
                                                                : "destructive"
                                                    }
                                                    className={`text-xs ${transaction.status.toLowerCase() === "successful" || transaction.status.toLowerCase() === "completed"
                                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                        : transaction.status.toLowerCase() === "pending" || transaction.status.toLowerCase() === "processing"
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
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-700 px-2">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, pagination.totalPages) }))}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                }
            </div>

            {/* Transaction Details Modal */}
            {transactions[0] && (
                <TransactionDetailsDrawer
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    transaction={transactions[0]}
                />
            )}
        </div>
    );
}