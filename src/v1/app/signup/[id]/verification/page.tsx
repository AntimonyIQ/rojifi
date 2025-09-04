"use client";

import { KYBVerificationForm } from "@/v1/components/auth/verify-kyc-kyb-form";

export default function KYCKYBVerificationPage() {

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <KYBVerificationForm />
        </div>
    );
}
