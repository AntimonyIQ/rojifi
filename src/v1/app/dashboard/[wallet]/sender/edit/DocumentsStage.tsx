import React from "react";
import { ISender } from "@/v1/interface/interface";
import { KYBVerificationFormComponent } from "@/v1/components/auth/business-document-form-component";

interface DocumentsStageProps {
    sender: ISender | null;
}

export const DocumentsStage: React.FC<DocumentsStageProps> = ({
    sender
}: DocumentsStageProps) => {

    if (!sender) return null;
    return (
        <div>
            <KYBVerificationFormComponent sender={sender} />
        </div>
    );
};
