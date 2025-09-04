import { DashboardLayout } from "@/v1/components/dashboard/dashboard-layout"
import { BankStatementView } from "@/v1/components/dashboard/statementview"

export default function BankStatementPage() {
    return (
        <DashboardLayout>
            <BankStatementView />
        </DashboardLayout>
    )
}
