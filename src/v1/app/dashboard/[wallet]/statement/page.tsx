import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BankStatementView } from "@/components/dashboard/statementview"

export default function BankStatementPage() {
    return (
        <DashboardLayout>
            <BankStatementView />
        </DashboardLayout>
    )
}
