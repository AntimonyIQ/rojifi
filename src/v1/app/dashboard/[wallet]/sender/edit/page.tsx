"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Badge } from "@/v1/components/ui/badge";
import { Progress } from "@/v1/components/ui/progress";
import {
    Building,
    FileText,
    Save,
    ArrowLeft,
    ArrowRight,
    Upload,
    Check,
    Eye,
    MapPin,
    DollarSign
} from "lucide-react";
import { ISender, IResponse } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import { Status } from "@/v1/enums/enums";
import Defaults from "@/v1/defaults/defaults";
import { toast } from "sonner";
import { useParams, Link } from "wouter";
import Loading from "@/v1/components/loading";

enum EditStages {
    BUSINESS_INFO = 1,
    DOCUMENTS = 2
}

export default function EditSenderPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [currentStage, setCurrentStage] = useState<number>(EditStages.BUSINESS_INFO);
    const [sender, setSender] = useState<ISender | null>(null);
    const [formData, setFormData] = useState<Partial<ISender>>({});

    // Document upload states
    const [dragActive, setDragActive] = useState(false);
    const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
    const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

    const { wallet } = useParams();
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd?.sender) {
            setSender(sd.sender);
            setFormData(sd.sender);
            setDocumentUrls({
                businessMemorandumAndArticlesOfAssociationKyc: sd.sender.businessMemorandumAndArticlesOfAssociationKyc || '',
                businessCertificateOfIncorporationKyc: sd.sender.businessCertificateOfIncorporationKyc || '',
                businessCertificateOfIncorporationStatusReportKyc: sd.sender.businessCertificateOfIncorporationStatusReportKyc || '',
                businessProofOfAddressKyc: sd.sender.businessProofOfAddressKyc || ''
            });
            setLoading(false);
        }
    }, [sd]);

    const handleInputChange = (field: keyof ISender, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
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

    const handleFileUpload = async (file: File, field: string) => {
        try {
            setUploadingDocs(prev => ({ ...prev, [field]: true }));

            const formData = new FormData();
            formData.append('file', file);
            formData.append('rojifiId', sender?.rojifiId || '');
            formData.append('type', field);

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/upload-document`, {
                method: 'POST',
                headers: {
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: formData
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                setDocumentUrls(prev => ({ ...prev, [field]: data.data.url }));
                toast.success("Document uploaded successfully!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to upload document");
        } finally {
            setUploadingDocs(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file, field);
        }
    };

    const proceedToNextStage = () => {
        if (currentStage < 2) {
            setCurrentStage(currentStage + 1);
        }
    };

    const goToPreviousStage = () => {
        if (currentStage > 1) {
            setCurrentStage(currentStage - 1);
        }
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
                        <Link href={`/dashboard/${wallet}/businessprofile`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Profile
                            </Button>
                        </Link>
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
                                    Stage {currentStage} of 2
                                </span>
                            </div>
                            <Progress value={(currentStage / 2) * 100} className="w-full" />
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span className={currentStage >= 1 ? "text-primary font-medium" : ""}>
                                    Business Information
                                </span>
                                <span className={currentStage >= 2 ? "text-primary font-medium" : ""}>
                                    Document Upload
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
                        <div className="space-y-6">
                            {/* Business Information Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Business Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Business Name</Label>
                                            <Input
                                                value={formData.businessName || ''}
                                                onChange={(e) => handleInputChange('businessName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Trading Name</Label>
                                            <Input
                                                value={formData.tradingName || ''}
                                                onChange={(e) => handleInputChange('tradingName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Registration Number</Label>
                                            <Input
                                                value={formData.businessRegistrationNumber || ''}
                                                onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Website</Label>
                                            <Input
                                                value={formData.website || ''}
                                                onChange={(e) => handleInputChange('website', e.target.value)}
                                                placeholder="https://www.company.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Legal Form</Label>
                                            <Input
                                                value={formData.legalForm || ''}
                                                onChange={(e) => handleInputChange('legalForm', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Company Activity</Label>
                                            <Input
                                                value={formData.companyActivity || ''}
                                                onChange={(e) => handleInputChange('companyActivity', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Country</Label>
                                            <Input
                                                value={formData.country || ''}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Country of Incorporation</Label>
                                            <Input
                                                value={formData.countryOfIncorporation || ''}
                                                onChange={(e) => handleInputChange('countryOfIncorporation', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Address Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Street Address</Label>
                                            <Input
                                                value={formData.streetAddress || ''}
                                                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Street Address 2</Label>
                                            <Input
                                                value={formData.streetAddress2 || ''}
                                                onChange={(e) => handleInputChange('streetAddress2', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input
                                                value={formData.city || ''}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <Input
                                                value={formData.state || ''}
                                                onChange={(e) => handleInputChange('state', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Region</Label>
                                            <Input
                                                value={formData.region || ''}
                                                onChange={(e) => handleInputChange('region', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Postal Code</Label>
                                            <Input
                                                value={formData.postalCode || ''}
                                                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Financial Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Share Capital</Label>
                                            <Input
                                                type="number"
                                                value={formData.shareCapital || ''}
                                                onChange={(e) => handleInputChange('shareCapital', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Year Turnover</Label>
                                            <Input
                                                type="number"
                                                value={formData.lastYearTurnover || ''}
                                                onChange={(e) => handleInputChange('lastYearTurnover', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Company Assets</Label>
                                            <Input
                                                type="number"
                                                value={formData.companyAssets || ''}
                                                onChange={(e) => handleInputChange('companyAssets', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Monthly Volume</Label>
                                            <Input
                                                type="number"
                                                value={formData.volume || ''}
                                                onChange={(e) => handleInputChange('volume', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {currentStage === EditStages.DOCUMENTS && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Document Upload
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    {
                                        key: 'businessMemorandumAndArticlesOfAssociationKyc',
                                        label: 'Business Memorandum and Articles of Association',
                                        description: 'Upload your company\'s memorandum and articles of association'
                                    },
                                    {
                                        key: 'businessCertificateOfIncorporationKyc',
                                        label: 'Certificate of Incorporation',
                                        description: 'Upload your company\'s certificate of incorporation'
                                    },
                                    {
                                        key: 'businessCertificateOfIncorporationStatusReportKyc',
                                        label: 'Certificate of Incorporation Status Report',
                                        description: 'Upload your company\'s status report from CAC'
                                    },
                                    {
                                        key: 'businessProofOfAddressKyc',
                                        label: 'Proof of Address',
                                        description: 'Upload proof of business address (utility bill or bank statement)'
                                    }
                                ].map((doc) => (
                                    <div key={doc.key} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-medium">{doc.label}</h4>
                                                <p className="text-sm text-gray-600">{doc.description}</p>
                                            </div>
                                            {documentUrls[doc.key] && (
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    Uploaded
                                                </Badge>
                                            )}
                                        </div>

                                        {documentUrls[doc.key] ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(documentUrls[doc.key], '_blank')}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Document
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById(`file-${doc.key}`)?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Replace
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={(e) => handleDrop(e, doc.key)}
                                                onClick={() => document.getElementById(`file-${doc.key}`)?.click()}
                                            >
                                                {uploadingDocs[doc.key] ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                        <span className="ml-2">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm text-gray-600">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            PDF, JPG, PNG up to 10MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        <input
                                            id={`file-${doc.key}`}
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, doc.key);
                                            }}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
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
                                    {currentStage === EditStages.BUSINESS_INFO && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={saveBusinessInfo}
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save
                                                    </>
                                                )}
                                            </Button>
                                            <Button onClick={proceedToNextStage}>
                                                Next
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </>
                                    )}
                                    {currentStage === EditStages.DOCUMENTS && (
                                        <Button
                                            onClick={() => {
                                                toast.success("All changes saved successfully!");
                                                window.location.href = `/dashboard/${wallet}/businessprofile`;
                                            }}
                                        >
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
