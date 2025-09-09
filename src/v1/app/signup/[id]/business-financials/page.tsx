import { BusinessFinancialsForm } from "@/v1/components/auth/business-financials-form";
import { SignupWrapper } from "@/v1/components/auth/signup-wrapper";

export default function BusinessFinancialsPage() {
    return (
        <SignupWrapper currentStage="business-financials">
            <BusinessFinancialsForm />
        </SignupWrapper>
    );
}
