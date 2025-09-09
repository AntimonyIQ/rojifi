"use client";

import { KYBVerificationForm } from "@/v1/components/auth/verify-kyc-kyb-form";
import { SignupWrapper } from "@/v1/components/auth/signup-wrapper";

export default function KYCKYBVerificationPage() {

    return (
        <SignupWrapper currentStage="verification">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <KYBVerificationForm />
            </div>
        </SignupWrapper>
    );
}
