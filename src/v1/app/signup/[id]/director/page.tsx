import { DirectorShareholderForm } from "@/v1/components/auth/director-shareholder-form";
import { SignupWrapper } from "@/v1/components/auth/signup-wrapper";

export default function DirectorPage() {
    return (
        <SignupWrapper currentStage="director">
            <DirectorShareholderForm />
        </SignupWrapper>
    );
}
