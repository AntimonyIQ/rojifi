import { BusinessProfileView } from "@/v1/components/dashboard/businessprofile"
import { DashboardLayout } from "@/v1/components/dashboard/dashboard-layout"

export default function BusinessProfilePage() {
    return (
        <DashboardLayout>
            <BusinessProfileView />
        </DashboardLayout>
    )
}
