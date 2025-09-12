import React from "react";
import { ISender } from "@/v1/interface/interface";
import BusinessDetailsFormPlain from "@/v1/components/auth/business-details-form-plain";

interface BusinessDetailsStageProps {
    formData: Partial<ISender>;
}

export const BusinessDetailsStage: React.FC<BusinessDetailsStageProps> = (
    { formData }
) => {
    return (
        <div className="space-y-6">
            {/* Business Information Form */}
            <BusinessDetailsFormPlain
                sender={formData}
            />
        </div>
    );
};
