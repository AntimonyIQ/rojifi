import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Calendar,
    DollarSign,
    Check,
    EllipsisVertical,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionDetailsDialog from "./TransactionDetailsDialog";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { IPagination, IResponse, ITransaction } from "@/interface/interface";
import Defaults from "@/defaults/defaults";
import { session, SessionData } from "@/session/session";
import { Status } from "@/enums/enums";

export default function TransactionsTable() {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [search, setSearch] = useState("");
    const [isTransactionReversing, _setIsTransactionReversing] = useState<boolean>(false);
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [amountFilter, setAmountFilter] = useState<string>("");
    const [currencyFilter, setCurrencyFilter] = useState<string>("");
    const [selectedTransaction, setSelectedTransaction] =
        useState<ITransaction | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const itemsPerPage = 10;

    const [editOpen, setEditOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<any>();

    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // const [searchQuery, setSearchQuery] = useState<string>("");
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd) {
            fetchTransactions();
        }
    }, [sd]);

    const fetchTransactions = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();
            const url: string = `${Defaults.API_BASE_URL}/admin/transaction/list?page=${pagination.page}&limit=${pagination.limit}`;

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

    useEffect(() => {
        if (selectedTransaction?.status) {
            setSelectedStatus(selectedTransaction.status);
        }
    }, [selectedTransaction]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
                return "bg-red-100 text-red-800";
            case "cancelled":
                return "bg-gray-100 text-gray-800";
            case "successful":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-orange-100 text-orange-800";
        }
    };

    const handleOpenDetails = (transaction: ITransaction) => {
        setSelectedTransaction(transaction);
        // console.log("Selected transaction:", transaction);
        setDetailsOpen(true);
    };

    const handleOpenEditDialog = (transaction: ITransaction) => {
        setSelectedTransaction(transaction);
        setEditOpen(true);
    };

    const handleUpdate = () => {
    };

    const handleResetFilters = () => {
        setDate(undefined);
        setStatusFilter("");
        setAmountFilter("");
        setCurrencyFilter("");
        setFiltersOpen(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            "bg-green-100 text-green-700",
            "bg-blue-100 text-blue-700",
            "bg-purple-100 text-purple-700",
            "bg-indigo-100 text-indigo-700",
            "bg-pink-100 text-pink-700",
        ];

        // Simple hash function to get consistent color for a name
        const hash = name.split("").reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);

        return colors[hash % colors.length];
    };

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-32" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-10 w-10" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Skeleton className="h-4 w-10" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-10" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-10" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="ml-3">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32 mt-1" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-48" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            Transactions
                        </CardTitle>
                        <div className="flex w-full md:w-auto gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search transactions..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm">Filter Transactions</h4>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Date Range</p>
                                            <div className={cn("grid gap-2")}>
                                                <CalendarComponent
                                                    initialFocus
                                                    mode="range"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    numberOfMonths={1}
                                                    className="rounded-md border"
                                                />
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResetFilters}
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex items-center gap-1"
                                                onClick={() => setFiltersOpen(false)}
                                            >
                                                <Check className="h-4 w-4" /> Apply Filters
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {/* Status Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 mr-4">
                            <Badge
                                variant={statusFilter === "" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setStatusFilter("")}
                            >
                                All
                            </Badge>
                            <Badge
                                variant={statusFilter === "successful" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setStatusFilter("successful")}
                            >
                                Successful
                            </Badge>
                            <Badge
                                variant={statusFilter === "pending" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setStatusFilter("pending")}
                            >
                                Pending
                            </Badge>
                            <Badge
                                variant={statusFilter === "failed" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setStatusFilter("failed")}
                            >
                                Failed
                            </Badge>
                        </div>

                        {/* Currency Filter Pills - shown on right side */}
                        <div className="flex flex-wrap items-center gap-2 ml-auto">
                            <span className="text-xs text-gray-500">Currency:</span>
                            <Badge
                                variant={currencyFilter === "" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setCurrencyFilter("")}
                            >
                                All
                            </Badge>
                            <Badge
                                variant={currencyFilter ? "default" : "outline"}
                                className="cursor-pointer"
                            >
                                Demo
                            </Badge>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(date || amountFilter) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {date && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(date.from!, "MMM d, yyyy")} -{" "}
                                    {date.to ? format(date.to, "MMM d, yyyy") : "Present"}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-1 p-0"
                                        onClick={() => setDate(undefined)}
                                    >
                                        <span className="sr-only">Remove</span>
                                        &times;
                                    </Button>
                                </Badge>
                            )}
                            {amountFilter && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    Amount:{" "}
                                    {amountFilter === "lt1000"
                                        ? "< $1,000"
                                        : amountFilter === "1000-5000"
                                            ? "$1,000 - $5,000"
                                            : "> $5,000"}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-1 p-0"
                                        onClick={() => setAmountFilter("")}
                                    >
                                        <span className="sr-only">Remove</span>
                                        &times;
                                    </Button>
                                </Badge>
                            )}
                            {(date || amountFilter) && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="h-6 px-2"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((transaction) => (
                                        <TableRow key={transaction._id}>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {transaction.reference}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${getAvatarColor(
                                                            transaction.userId.fullName
                                                        )}`}
                                                    >
                                                        {getInitials(transaction.userId.fullName)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {transaction.userId.fullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {transaction.userId.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transaction.beneficiaryCurrency}
                                                {transaction.amount}
                                                {/* {parseFloat(transaction.amount).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )} */}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    className={`font-medium ${getStatusColor(
                                                        transaction.status
                                                    )}`}
                                                >
                                                    {transaction.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap capitalize">
                                                {transaction.type}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(
                                                    new Date(transaction.createdAt),
                                                    "MMM d, yyyy"
                                                )}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="text-primary hover:text-primary/80 p-0 h-auto"
                                                        >
                                                            <EllipsisVertical className="w-5 h-5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-32 p-2 space-y-2"
                                                        align="end"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start text-sm"
                                                            onClick={() => handleOpenDetails(transaction)}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start text-sm"
                                                            onClick={() => handleOpenEditDialog(transaction)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </PopoverContent>
                                                </Popover>

                                                {/* Edit Dialog */}
                                                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Transaction Status</DialogTitle>
                                                        </DialogHeader>

                                                        <div className="space-y-4">
                                                            <label className="text-sm font-medium text-gray-700">
                                                                Status
                                                            </label>
                                                            <Select
                                                                value={selectedStatus}
                                                                onValueChange={(value) =>
                                                                    setSelectedStatus(value)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="successful">
                                                                        Successful
                                                                    </SelectItem>
                                                                    <SelectItem value="pending">
                                                                        Pending
                                                                    </SelectItem>
                                                                    <SelectItem value="failed">Failed</SelectItem>
                                                                    <SelectItem value="reversed">
                                                                        Reversed
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <DialogFooter>
                                                            <Button
                                                                onClick={handleUpdate}
                                                                disabled={isTransactionReversing}
                                                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isTransactionReversing
                                                                    ? "Updating status..."
                                                                    : "Update status"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="text-sm text-gray-700">
                                Showing{" "}
                                <span className="font-medium">
                                    {transactions && transactions.length > 0
                                        ? (currentPage - 1) * itemsPerPage + 1
                                        : 0}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, pagination.total)}
                                </span>{" "}
                                of <span className="font-medium">{pagination.total}</span> transactions
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    disabled={currentPage >= Math.ceil(pagination.total / itemsPerPage)}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <TransactionDetailsDialog
                transaction={selectedTransaction}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </>
    );
}
