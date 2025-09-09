import { BusinessDetailsForm } from "@/v1/components/auth/business-details-form";
import { SignupWrapper } from "@/v1/components/auth/signup-wrapper";

export default function BusinessDetailsPage() {
    return (
        <SignupWrapper currentStage="business-details">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <BusinessDetailsForm />
            </div>
        </SignupWrapper>
    )
}
