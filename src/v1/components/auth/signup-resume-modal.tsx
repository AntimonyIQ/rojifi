import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/v1/components/ui/dialog"
import { AlertCircle, ArrowRight, X } from "lucide-react"
import { session, SignupProgress } from "@/v1/session/session"

interface SignupResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResume: (url: string) => void;
    signupProgress: SignupProgress;
}

const stageLabels = {
    'signup': 'Basic Information',
    'business-details': 'Business Details',
    'business-financials': 'Business Financials',
    'verification': 'Document Verification',
    'director': 'Director & Shareholder Information'
};

export function SignupResumeModal({ isOpen, onClose, onResume, signupProgress }: SignupResumeModalProps) {
    const [loading, setLoading] = useState(false);

    const handleResume = async () => {
        setLoading(true);
        try {
            const resumeUrl = session.getResumeUrl();
            onResume(resumeUrl);
        } catch (error) {
            console.error('Error resuming signup:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartOver = () => {
        session.clearSignupProgress();
        onClose();
        // Stay on current path - user can continue from here
    };

    const currentStageLabel = stageLabels[signupProgress.currentStage] || 'Unknown Stage';
    const completedCount = signupProgress.completedStages.length;
    const totalStages = Object.keys(stageLabels).length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <AlertCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-center text-xl font-semibold">
                        Continue Your Application?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        We found that you have an application in progress. You were last on the "{currentStageLabel}" stage.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm text-gray-500">{completedCount}/{totalStages} completed</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(completedCount / totalStages) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 text-center">
                        <p>Current stage: <span className="font-medium">{currentStageLabel}</span></p>
                        <p className="text-xs mt-1">
                            Last updated: {new Date(signupProgress.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-col gap-2">
                    <Button
                        onClick={handleResume}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? "Loading..." : "Continue Application"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleStartOver}
                        className="w-full"
                    >
                        Start Over
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full text-gray-500"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
