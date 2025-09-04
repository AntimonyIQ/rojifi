import { DashboardLayout } from "@/v1/components/dashboard/dashboard-layout"
import { TransactionsView } from "@/v1/components/dashboard/transactions-view"

export default function TransactionsPage() {
    return (
        <DashboardLayout>
            <TransactionsView />
        </DashboardLayout>
    )
}
