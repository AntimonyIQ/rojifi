import { DashboardLayout } from "@/v1/components/dashboard/dashboard-layout"
import { PaymentView } from "@/v1/components/dashboard/payment"

export default function PaymentPage() {
    return (
        <DashboardLayout>
            <PaymentView />
        </DashboardLayout>
    )
}
