import React from "react";
import { ISender } from "@/v1/interface/interface";
import { DirectorShareholderFormComponent } from "@/v1/components/auth/director-shareholder-form-component";

interface DirectorsStageProps {
    sender: ISender | null;
}

export const DirectorsStage: React.FC<DirectorsStageProps> = ({
    sender
}) => {

    if (!sender) return null;
    return (
        <div className="space-y-6">
            <DirectorShareholderFormComponent sender={sender} />
        </div>
    );
};
