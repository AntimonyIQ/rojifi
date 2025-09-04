
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import Loading from "../loading";
import EmptyTransaction from "../emptytx";
import { ArrowUpRight, MoreVertical, Repeat, Search, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/v1/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "../ui/input";
import PayAgainModal from "./pay-again-modal";
import { ITransaction } from "@/v1/interface/interface";

export function BeneficiaryView() {
    // const [hideBalances] = useState(false); // TODO: Implement balance hiding
    const [totalItems] = useState(0); // TODO: Implement pagination
    const [totalPages] = useState(1); // TODO: Implement pagination
    const [loading, setLoading] = useState<boolean>(true);
    const [beneficiaries, setBeneficiaries] = useState<ITransaction[]>([
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All");
    // const [currencyFilter] = useState("All"); // TODO: Implement currency filtering
    const itemsPerPage = 10;
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    // const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [payAgainOpen, setPayAgainOpen] = useState(false);
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

    const statusTabs = ["All"];

    useEffect(() => {
        fetchBeneficiaries();
    }, [currentPage]);

    const fetchBeneficiaries = async () => {
        try {
            setLoading(true);

        } catch (error) {
            console.error("Error fetching transaction history:", error);
        } finally {
            setLoading(false);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    // TODO: Implement view details, pay again, and delete functionality
    /* const handleViewDetails = (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();
        // Open transaction modal for the selected beneficiary
        if (selectedTransaction) {
            setIsTransactionModalOpen(true);
        }
    }

    const handlePayAgain = (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();
        // Open transaction modal for the selected beneficiary to pay again
        if (selectedTransaction) {
            setIsTransactionModalOpen(true);
        }
    };

    const handleDelete = (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();
        if (selectedTransaction) {
            setBeneficiaryToDelete(selectedTransaction);
            setShowDeleteDialog(true);
        }
    }; */

    const openDeleteDialog = (beneficiary: ITransaction, event?: Event) => {
        if (event) {
            try {
                event.preventDefault();
                event.stopPropagation();
            } catch (e) { }
        }
        setBeneficiaryToDelete(beneficiary);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!beneficiaryToDelete) return;
        try {
            // TODO: call API to delete beneficiary via walletService when available
            setBeneficiaries((prev) => prev.filter((b) => b._id !== beneficiaryToDelete.id));
            toast.success("Beneficiary deleted successfully");
        } catch (err) {
            console.error("Error deleting beneficiary:", err);
            toast.error("Failed to delete beneficiary");
        } finally {
            setShowDeleteDialog(false);
            setBeneficiaryToDelete(null);
        }
    };

    const handlePayAgainSubmit = async (_data: any) => {
        try {
            // TODO: call API to pay again via walletService when available
            toast.success("Payment initiated successfully");
        } catch (err) {
            console.error("Error initiating payment:", err);
            toast.error("Failed to initiate payment");
        } finally {
            setPayAgainOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Beneficiary</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your beneficiaries history across all beneficiaries
                    </p>
                </div>
            </div>

            {/* Beneficiaries Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">All Beneficiaries</h2>
                </div>

                {/* Status Tabs and Currency Filter */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
                            {statusTabs.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1); // Reset to first page when filter changes
                                        fetchBeneficiaries();
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
                        <div className="py-4 flex flex-row items-center gap-2">
                            <div className="relative">
                                <Input
                                    placeholder="Search Beneficiary"
                                    className="w-full md:w-[300px]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoComplete="off"
                                />
                                <Search size={20} className="absolute right-2 top-2 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-end gap-4">
                    </div>

                </div>

                {/* Transaction loading */}
                {loading && <div className="py-40"><Loading /></div>}

                {/* Empty Transaction */}
                {!loading && beneficiaries.length === 0 &&
                    <div className="py-20"><EmptyTransaction statusFilter={statusFilter} onClick={(): void => { }} /></div>
                }

                {/* Beneficiaries Table */}
                {!loading && beneficiaries.length > 0 &&
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Account Name</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Account number / IBAN</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Bank Name</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Country</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {beneficiaries.map((beneficiary) => (
                                            <tr
                                                key={beneficiary._id}
                                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                                <td className="py-4 px-6 text-sm text-gray-900 font-medium whitespace-nowrap max-w-xs truncate" title={beneficiary.beneficiaryAccountName}>
                                                    {beneficiary.beneficiaryAccountName}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate" title={beneficiary.beneficiaryAccountNumber}>
                                                    {beneficiary.beneficiaryAccountNumber}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate" title={beneficiary.beneficiaryBankName}>
                                                    {beneficiary.beneficiaryBankName}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate" title={beneficiary.beneficiaryCountry}>
                                                    {beneficiary.beneficiaryCountry}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="flex flex-col items-center justify-center w-full text-sm">
                                                                <MoreVertical size={20} className=" text-gray-600" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="py-3" onSelect={() => {
                                                                setSelectedTransaction(beneficiary);
                                                                setViewDetailsOpen(true);
                                                            }}>
                                                                <ArrowUpRight size={20} className="mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="py-3" onSelect={(): void => setPayAgainOpen(true)}>
                                                                <Repeat size={20} className="mr-2" />
                                                                Pay again
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="py-3 text-red-700 hover:" onSelect={(e) => openDeleteDialog(beneficiary, e)}>
                                                                <Trash size={20} className="mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                }

                {/* View Details dialog */}
                <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Beneficiary Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase">Account Name</div>
                                <div className="font-medium text-gray-900">{selectedTransaction?.beneficiary_fullname ?? "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase">Account Number / IBAN</div>
                                <div className="font-medium text-gray-900">{selectedTransaction?.beneficiary_account ?? "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase">Bank Name</div>
                                <div className="font-medium text-gray-900">{selectedTransaction?.bank_name ?? "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase">Country</div>
                                <div className="font-medium text-gray-900">{selectedTransaction?.beneficiary_country ?? "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase">Swift Code</div>
                                <div className="font-medium text-gray-900">{selectedTransaction?.swift_code ?? "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase">Beneficiary Address</div>
                                <div className="font-medium text-gray-900">{selectedTransaction?.beneficiary_address ?? "N/A"}</div>
                            </div>
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
                                Close
                            </Button>
                            <Button variant="default" className="text-white" onClick={() => {
                                setViewDetailsOpen(false)
                                setPayAgainOpen(true)
                            }}>
                                <ArrowUpRight size={20} />
                                Pay Again
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete beneficiary</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{beneficiaryToDelete?.beneficiary_fullname}</strong>? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setBeneficiaryToDelete(null); }}>
                                Cancel
                            </Button>
                            <Button className="bg-red-600 text-white" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>

            <PayAgainModal open={payAgainOpen} onClose={() => setPayAgainOpen(false)} transaction={beneficiaries[0]} onSubmit={handlePayAgainSubmit} />

        </div >
    );
}