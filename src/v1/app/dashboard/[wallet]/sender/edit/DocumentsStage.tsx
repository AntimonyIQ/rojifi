import React from "react";
import { ISender } from "@/v1/interface/interface";
import { KYBVerificationFormComponent } from "@/v1/components/auth/business-document-form-component";

interface DocumentsStageProps {
    sender: ISender | null;
    onDocumentUploaded: (field: string, url: string) => void;
}

export const DocumentsStage: React.FC<DocumentsStageProps> = ({
    sender
}) => {


    return (
        <div>
            <KYBVerificationFormComponent sender={sender} />
        </div>
    );
};
