
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { EyeOff } from "lucide-react";
import { TransactionDetailsDrawer } from "./transaction-details-modal";
import Loading from "../loading";
import EmptyTransaction from "../emptytx";
import { ITransaction } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";

interface ICurrency {
    name: string;
    icon: string;
}

enum Owners {
    EVERYONE = "Everyone",
    ME = "Me",
    TEAM = "Teammates"
}

/*
        {
            id: "txn_987654",
            reference: "REF-20240612-CHASE",
            amount: "1500.00",
            type: "credit",
            status: "processing",
            created_at: new Date().toISOString(),
            completed_date: new Date().toISOString(), // new Date().toLocaleDateString("en-GB"),
            reference_beneficiary: "REF-20240612-CHASE",
            wallet: "USD",
            sender_fullname: "Cecilia & Jacin Enterprise",
            beneficiary_fullname: "Foshan City Chihu Furniture Co., LTD",
            beneficiary_account: "1234567890",
            beneficiary_country: "USA",
            beneficiary_address: "270 Park Ave, New York, NY 10017",
            beneficiary_email: "support@chase.com",
            beneficiary_phone: "+1 800-935-9935",
            swift_code: "CHASUS33",
            bank_name: "JPMORGAN CHASE BANK, N.A., NEW YORK BRANCH (ORGANIZED UNDER THE LAWS OF THE STATE OF NEW YORK WITH LIMITED LIABILITY)",
            bank_address: "270 Park Ave, New York, NY 10017",
            attachment: "https://cdn.pixabay.com/photo/2025/08/04/14/58/tools-9754352_1280.jpg",
            invoice_number: "INV-20240612-001",
            invoice_date: new Date().toLocaleDateString("en-GB"),
            purpose_of_transaction: "Payment for services",
            tracking_number: "TRK-20240612-CHASE",
            processed_date: new Date().toISOString(),
            initiated_date: new Date().toISOString(),
            created_by: "John Doe",
            receipt: "https://bitcoin.org/bitcoin.pdf",
            mt103: "https://bitcoin.org/bitcoin.pdf",
            fees: [
                {
                    amount: "10.00",
                    currency: "USD"
                }
            ]
        }
*/


export function TransactionsView() {
    const [hideBalances, setHideBalances] = useState(false);
    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState<boolean>(false);
    const sd: SessionData = session.getUserData();

    // const walletService = new WalletService();

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("Successful");
    const [currencyFilter, setCurrencyFilter] = useState("All");
    const itemsPerPage = 10;
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const statusTabs = ["Successful", "Processing", "Pending", "Failed"];
    const owners = Object.values(Owners);
    const currencies: Array<ICurrency> = [
        { name: "NGN", icon: "https://img.icons8.com/color/50/nigeria-circular.png" },
        { name: "USD", icon: "https://img.icons8.com/color/50/usa-circular.png" },
        { name: "EUR", icon: "https://img.icons8.com/fluency/48/euro-pound-exchange.png" },
        { name: "GBP", icon: "https://img.icons8.com/color/50/british-pound--v1.png" },
    ];

    useEffect(() => {
        if (sd) {
            setTransactions(sd.transactions);
        }
    }, [transactions, sd]);

    const handleTransactionClick = (transaction: any) => {
        const formattedTransaction = {
            id: transaction.id,
            reference: transaction.reference ?? "N/A",
            amount: transaction.amount ?? "0",
            merchant_fee: transaction.merchant_fee ?? "0",
            net_amount: transaction.net_amount ?? "0",
            description: transaction.description ?? "No description",
            type: transaction.type ?? "unknown",
            status: transaction.status ?? "unknown",
            currency: transaction.currency ?? { code: "NGN", decimal_place: 2 },
            created_at: transaction.created_at ?? new Date().toISOString(),
        };
        setSelectedTransaction(formattedTransaction);
        setIsTransactionModalOpen(true);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

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
                                        setCurrentPage(1); // Reset to first page when filter changes
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
                                    setCurrentPage(1);
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

                        {/* Currency Filter */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Made By:</label>
                            <Select
                                value={currencyFilter}
                                onValueChange={(value) => {
                                    setCurrencyFilter(value);
                                    setCurrentPage(1);
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

                {/* Transaction loading */}
                {loading && <div className="py-40"><Loading /></div>}

                {/* Empty Transaction */}
                {!loading && transactions.length === 0 &&
                    <div className="py-20"><EmptyTransaction statusFilter={statusFilter} onClick={(): void => { }} /></div>
                }

                {/* Transactions Table */}
                {!loading && transactions.length > 0 &&
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Amount</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Beneficiary</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr
                                                key={transaction._id}
                                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleTransactionClick(transaction)}
                                            >
                                                <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                    {hideBalances
                                                        ? "••••••••"
                                                        : `${parseFloat(transaction.amount || "0").toLocaleString("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{transaction.beneficiaryAccountName}</td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{transaction.createdAt.toString()}</td>
                                                {/*
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
                                                */}
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