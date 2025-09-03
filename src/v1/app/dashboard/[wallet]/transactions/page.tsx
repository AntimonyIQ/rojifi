import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TransactionsView } from "@/components/dashboard/transactions-view"

export default function TransactionsPage() {
    return (
        <DashboardLayout>
            <TransactionsView />
        </DashboardLayout>
    )
}
