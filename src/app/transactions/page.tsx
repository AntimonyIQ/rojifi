import { motion } from "framer-motion";
import TransactionsTable from "@/components/transactions/TransactionsTable";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Wallet,
    ArrowDownToLine,
    ArrowUpFromLine,
    ChevronsRight,
    TrendingUp,
} from "lucide-react";
import {
    useFetchAllProcessorBalance,
} from "@/hooks/useStaff";
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { IPagination, IResponse, ITransaction } from "@/interface/interface";
import Defaults from "@/defaults/defaults";
import { session, SessionData } from "@/session/session";
import { Status } from "@/enums/enums";

type Processor = {
    processor: string;
    data: {
        currency: string;
        balance: number;
    }[];
};

// processor balances component
function ProcessorBalanceGrid() {
    const { data: processorBalances } = useFetchAllProcessorBalance();
    const [selectedProcessor, setSelectedProcessor] = useState<Processor | null>(
        null
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processorBalances?.map((item: Processor) => (
                <Card
                    key={item.processor}
                    onClick={() => setSelectedProcessor(item)}
                    className="p-6 cursor-pointer shadow-md hover:shadow-lg transition"
                >
                    <div className="text-center">
                        {/* <p className="text-sm text-gray-500">Processor</p> */}
                        <h3 className="text-xl font-semibold capitalize">
                            {item.processor}
                        </h3>
                    </div>
                </Card>
            ))}

            {/* Dialog */}
            <Dialog
                open={!!selectedProcessor}
                onOpenChange={() => setSelectedProcessor(null)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedProcessor?.processor.toUpperCase()} Balances
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {selectedProcessor?.data.map((currencyInfo) => (
                            <div
                                key={currencyInfo.currency}
                                className="flex items-center justify-between border p-3 rounded-md"
                            >
                                <p className="text-sm text-gray-600">{currencyInfo.currency}</p>
                                <p className="font-semibold">
                                    {currencyInfo.balance.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function TransactionsPage() {

    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    React.useEffect(() => {
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

    if (loading && transactions.length === 0) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-md" />
                            <Skeleton className="h-5 w-40" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-60 mt-2" />
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-6 w-32" />
                                        </div>
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
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
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Wallet Overview Card */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" />
                                Wallet Overview
                            </CardTitle>
                            <CardDescription>
                                Summary of wallet balances and transactions
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Balance
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center">
                                    <Wallet className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Credit
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                                    <ArrowDownToLine className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Debit
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                                    <ArrowUpFromLine className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Locked Funds
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(walletData.lockedFunds)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center">
                  <LockIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div> */}
                    </div>

                    {/* processor balances */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Processor Balances
                        </h3>
                        <ProcessorBalanceGrid />
                    </div>
                </CardContent>
            </Card>

            {/* Currency balances Cards */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Currency Balances
                            </CardTitle>
                            <CardDescription>Available funds by currency</CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger>
                                <div className="text-blue-600 text-base cursor-pointer flex items-center gap-1 hover:text-primary">
                                    View all <ChevronsRight className="size-4" />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                                <DialogHeader>
                                    <DialogTitle>All Currency Wallets Overviews</DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-1 gap-6 mt-6">
                                    {transactions?.map((wallet: any) => (
                                        <div key={wallet.currency} className="space-y-4">
                                            <h3 className="text-left font-semibold text-gray-700">
                                                {wallet.currency}
                                            </h3>

                                            {/* Total Balance */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="p-4 border rounded-xl shadow-sm bg-white flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">
                                                            Total Balance
                                                        </p>
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {wallet.total_balance}
                                                        </p>
                                                    </div>
                                                    <div className="h-10 w-10 bg-[#1A6EFF1A] rounded-full flex items-center justify-center">
                                                        <Wallet className="h-5 w-5 text-[#1A6EFF]" />
                                                    </div>
                                                </div>

                                                {/* Total Deposit */}
                                                <div className="p-4 border rounded-xl shadow-sm bg-white flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">
                                                            Total Credit
                                                        </p>
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {wallet.total_deposit}
                                                        </p>
                                                    </div>
                                                    <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                                                        <ArrowDownToLine className="h-6 w-6 text-green-600" />
                                                    </div>
                                                </div>

                                                {/* Total Withdrawal */}
                                                <div className="p-4 border rounded-xl shadow-sm bg-white flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">
                                                            Total Debit
                                                        </p>
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {wallet.total_withdraw}
                                                        </p>
                                                    </div>
                                                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                                                        <ArrowUpFromLine className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                        {transactions.slice(0, 4).map((transaction: ITransaction, index: number) => (
                            <div key={index}>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm h-full hover:shadow-md transition-shadow">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xl">
                                            {transaction.beneficiaryCurrency}
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">
                                            {transaction.beneficiaryCurrency}
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {transaction.beneficiaryCurrency}
                                            {transaction.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <TransactionsTable />
        </motion.div>
    );
}
