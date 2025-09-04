"use client"

import { DashboardLayout } from "@/v1/components/dashboard/dashboard-layout"
import { DashboardOverview } from "@/v1/components/dashboard/dashboard-overview"

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <DashboardOverview />
        </DashboardLayout>
    )
}