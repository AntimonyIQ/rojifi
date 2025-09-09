import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { session, SignupProgress, ENABLE_SIGNUP_PROGRESS_TRACKING } from "@/v1/session/session";

export function useSignupResume(currentRojifiId?: string) {
    const [, navigate] = useLocation();
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [signupProgress, setSignupProgress] = useState<SignupProgress | undefined>();

    useEffect(() => {
        // Early return if feature is disabled
        if (!ENABLE_SIGNUP_PROGRESS_TRACKING) return;

        const progress = session.getSignupProgress();

        if (progress && session.hasSignupProgress(currentRojifiId)) {
            // If user is on a different signup flow (different rojifiId), don't show modal
            if (currentRojifiId && progress.rojifiId !== currentRojifiId) {
                return;
            }

            setSignupProgress(progress);
            setShowResumeModal(true);
        }
    }, [currentRojifiId]);

    const handleResume = (url: string) => {
        setShowResumeModal(false);
        navigate(url);
    };

    const handleCloseModal = () => {
        setShowResumeModal(false);
    };

    const updateProgress = (stage: SignupProgress['currentStage'], rojifiId: string) => {
        // Early return if feature is disabled
        if (!ENABLE_SIGNUP_PROGRESS_TRACKING) return;

        if (signupProgress && signupProgress.rojifiId === rojifiId) {
            session.updateSignupStage(stage);
        } else {
            session.setSignupProgress(rojifiId, stage);
        }
    };

    const clearProgress = () => {
        session.clearSignupProgress();
        setSignupProgress(undefined);
    };

    const completeSignup = () => {
        session.clearSignupProgress();
        setSignupProgress(undefined);
    };

    return {
        showResumeModal,
        signupProgress,
        handleResume,
        handleCloseModal,
        updateProgress,
        clearProgress,
        completeSignup
    };
}
