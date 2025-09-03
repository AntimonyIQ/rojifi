import { motion } from "framer-motion";
// @ts-ignore
import { Users, CreditCard, DollarSign, UserCheck, Receipt, ReceiptText, ArrowUpRight } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
// @ts-ignore
import RevenueChart from "@/components/dashboard/RevenueChart";
import TransactionVolumeChart from "@/components/dashboard/TransactionVolumeChart";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
// @ts-ignore
import { useQueries } from "@tanstack/react-query";
// @ts-ignore
import { fetchDashboardStats, fetchRecentTransactions, fetchChartData, } from "@/services/api";
import { useFetchDashboardOverview } from "@/hooks/useStaff";
import { ITransaction } from "@/interface/interface";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Country, ICountry } from "country-state-city";

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const { data: dashboardData, isLoading: statsLoading } =
        useFetchDashboardOverview();

    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    useEffect(() => {
        fetchTransactions();
    }, [currentDate]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {

            setTransactions([]);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total Users"
                    value={dashboardData?.total_users.toLocaleString() || "0"}
                    percentageChange={dashboardData?.user_growth || 0}
                    icon={Users}
                    iconColor="text-green-500"
                    iconBgColor="bg-green-50"
                    loading={statsLoading}
                />

                <KpiCard
                    title="Total Daily Transactions"
                    value={dashboardData?.total_transactions?.toLocaleString() || "0"}
                    percentageChange={dashboardData?.transaction_growth || 0}
                    icon={ArrowUpRight}
                    iconColor="text-blue-500"
                    iconBgColor="bg-blue-50"
                    loading={statsLoading}
                    fieldKey="Transaction"
                />

                <KpiCard
                    title="Total Transactions"
                    value={dashboardData?.total_transactions?.toLocaleString() || "0"}
                    percentageChange={dashboardData?.transaction_growth || 0}
                    icon={ArrowUpRight}
                    iconColor="text-blue-500"
                    iconBgColor="bg-blue-50"
                    loading={statsLoading}
                    fieldKey="Transaction"
                />

                <KpiCard
                    title="Active Users"
                    value={dashboardData?.active_users.toLocaleString() || "0"}
                    percentageChange={dashboardData?.active_user_growth || 0}
                    icon={UserCheck}
                    iconColor="text-purple-500"
                    iconBgColor="bg-purple-50"
                    loading={statsLoading}
                />
            </div>

            {/** Dialog modal to show total transactions for each currency */}
            <div>
                <Dialog open={openDetails} onOpenChange={setOpenDetails}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Total Transactions</DialogTitle>
                            <DialogDescription>
                                View the total transactions for each currency.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline">Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <TransactionVolumeChart />
            </div>

            <RecentTransactionsTable
                transactions={transactions}
                loading={loading}
            />
        </motion.div>
    );
}
