"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Badge } from "@/v1/components/ui/badge";
import { Progress } from "@/v1/components/ui/progress";
import Loading from "@/v1/components/loading";
import { session, SessionData } from "@/v1/session/session";
import { ISender, IDirectorAndShareholder, IResponse } from "@/v1/interface/interface";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import Defaults from "@/v1/defaults/defaults";
import { Status } from "@/v1/enums/enums";

// Import the new stage components
import { BusinessDetailsStage } from "./BusinessDetailsStage";
import { DocumentsStage } from "./DocumentsStage";
import { DirectorsStage } from "./DirectorsStage";

enum EditStages {
    BUSINESS_INFO = 1,
    DOCUMENTS = 2,
    DIRECTORS = 3
}

export default function EditSenderPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [currentStage, setCurrentStage] = useState<number>(EditStages.BUSINESS_INFO);
    const [sender, setSender] = useState<ISender | null>(null);
    const [formData, setFormData] = useState<Partial<ISender>>({});

    const { wallet } = useParams();
    const [, navigate] = useLocation();
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd?.sender) {
            setSender(sd.sender);
            setFormData(sd.sender);
            setLoading(false);
        }
    }, [sd]);

    const handleInputChange = (field: keyof ISender, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDirectorsChange = (directors: IDirectorAndShareholder[]) => {
        setFormData(prev => ({
            ...prev,
            directors
        }));
    };

    const saveBusinessInfo = async () => {
        try {
            setSaving(true);

            const businessData = {
                mainCompany: {
                    name: formData.businessName,
                    country: formData.country,
                    registrationNumber: formData.businessRegistrationNumber,
                    website: formData.website,
                    legalForm: formData.legalForm,
                    companyActivity: formData.companyActivity,
                    registrationDate: formData.registrationDate,
                    onboardingDate: formData.onboardingDate,
                    registeredAddress: {
                        streetAddress: formData.streetAddress,
                        streetAddress2: formData.streetAddress2,
                        city: formData.city,
                        state: formData.state,
                        region: formData.region,
                        country: formData.country,
                        postalCode: formData.postalCode
                    },
                    shareCapital: formData.shareCapital,
                    lastYearTurnover: formData.lastYearTurnover,
                    companyAssets: formData.companyAssets,
                    expectedMonthlyInboundCryptoPayments: formData.expectedMonthlyInboundCryptoPayments,
                    expectedMonthlyOutboundCryptoPayments: formData.expectedMonthlyOutboundCryptoPayments,
                    expectedMonthlyInboundFiatPayments: formData.expectedMonthlyInboundFiatPayments,
                    expectedMonthlyOutboundFiatPayments: formData.expectedMonthlyOutboundFiatPayments,
                    riskLevel: formData.riskLevel,
                    additionalDueDiligenceConducted: formData.additionalDueDiligenceConducted,
                    requestedNilosServices: formData.requestedNilosServices,
                    sourceOfWealth: formData.sourceOfWealth,
                    anticipatedSourceOfFundsOnNilos: formData.anticipatedSourceOfFundsOnNilos,
                    actualOperationsAndRegisteredAddressesMatch: formData.actualOperationsAndRegisteredAddressesMatch,
                    companyProvideRegulatedFinancialServices: formData.companyProvideRegulatedFinancialServices,
                    directorOrBeneficialOwnerIsPEPOrUSPerson: formData.directorOrBeneficialOwnerIsPEPOrUSPerson
                },
                tradingName: formData.tradingName,
                immediateApprove: formData.immediateApprove
            };

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/business-details`, {
                method: 'PUT',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: sender?.rojifiId,
                    businessData
                })
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Business information saved successfully!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save business information");
        } finally {
            setSaving(false);
        }
    };

    const saveDirectors = async () => {
        try {
            setSaving(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/directors`, {
                method: 'PUT',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: sender?.rojifiId,
                    directors: formData.directors
                })
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Directors saved successfully!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save directors");
        } finally {
            setSaving(false);
        }
    };

    const handleDocumentUploaded = (field: string, url: string) => {
        // Document upload handled by DocumentsStage component
        console.log(`Document uploaded for ${field}: ${url}`);
    };

    const proceedToNextStage = () => {
        if (currentStage < 3) {
            setCurrentStage(currentStage + 1);
        }
    };

    const goToPreviousStage = () => {
        if (currentStage > 1) {
            setCurrentStage(currentStage - 1);
        }
    };

    const completeEdit = () => {
        navigate(`/dashboard/${wallet}/businessprofile`);
        toast.success("Business profile updated successfully!");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/${wallet}/businessprofile`)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Profile
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Business Information</h1>
                            <p className="text-gray-600">{sender?.businessName}</p>
                        </div>
                    </div>
                    <Badge className="px-3 py-1 bg-blue-100 text-blue-800">
                        {sender?.status}
                    </Badge>
                </motion.div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">
                                    Stage {currentStage} of 3
                                </span>
                            </div>
                            <Progress value={(currentStage / 3) * 100} className="w-full" />
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span className={currentStage >= 1 ? "text-primary font-medium" : ""}>
                                    Business Details
                                </span>
                                <span className={currentStage >= 2 ? "text-primary font-medium" : ""}>
                                    Documents
                                </span>
                                <span className={currentStage >= 3 ? "text-primary font-medium" : ""}>
                                    Directors
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stage Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {currentStage === EditStages.BUSINESS_INFO && (
                        <BusinessDetailsStage
                            formData={formData}
                            onInputChange={handleInputChange}
                            onSave={saveBusinessInfo}
                            saving={saving}
                        />
                    )}

                    {currentStage === EditStages.DOCUMENTS && (
                        <DocumentsStage
                            sender={sender}
                            onDocumentUploaded={handleDocumentUploaded}
                        />
                    )}

                    {currentStage === EditStages.DIRECTORS && (
                        <DirectorsStage
                            sender={sender}
                            onDirectorsChange={handleDirectorsChange}
                            onSaveDirectors={saveDirectors}
                            saving={saving}
                        />
                    )}
                </motion.div>

                {/* Navigation Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    {currentStage > 1 && (
                                        <Button variant="outline" onClick={goToPreviousStage}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {currentStage < 3 && (
                                        <Button onClick={proceedToNextStage} className="bg-primary hover:bg-primary/90 text-white">
                                            Next
                                            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                        </Button>
                                    )}
                                    {currentStage === EditStages.DIRECTORS && (
                                        <Button onClick={completeEdit} className="bg-green-600 hover:bg-green-700 text-white">
                                            <Check className="h-4 w-4 mr-2" />
                                            Complete
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
