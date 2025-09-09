import { ReactNode, useEffect } from "react";
import { useParams } from "wouter";
import { SignupResumeModal } from "@/v1/components/auth/signup-resume-modal";
import { useSignupResume } from "@/v1/hooks/useSignupResume";

interface SignupWrapperProps {
    children: ReactNode;
    currentStage: 'signup' | 'business-details' | 'business-financials' | 'verification' | 'director';
}

export function SignupWrapper({ children, currentStage }: SignupWrapperProps) {
    const { id } = useParams();
    const {
        showResumeModal,
        signupProgress,
        handleResume,
        handleCloseModal,
        updateProgress
    } = useSignupResume(id);

    // Update progress when component mounts (only if not showing resume modal)
    useEffect(() => {
        if (id && !showResumeModal) {
            updateProgress(currentStage, id);
        }
    }, [id, currentStage, showResumeModal, updateProgress]);

    return (
        <>
            {children}
            {showResumeModal && signupProgress && (
                <SignupResumeModal
                    isOpen={showResumeModal}
                    onClose={handleCloseModal}
                    onResume={handleResume}
                    signupProgress={signupProgress}
                />
            )}
        </>
    );
}
