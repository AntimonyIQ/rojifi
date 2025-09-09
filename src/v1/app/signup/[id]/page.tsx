import { SignupForm } from "@/v1/components/auth/signup-form";
import { SignupWrapper } from "@/v1/components/auth/signup-wrapper";

export default function SignupPage() {

    return (
        <SignupWrapper currentStage="signup">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <SignupForm />
            </div>
        </SignupWrapper>
    )
}
