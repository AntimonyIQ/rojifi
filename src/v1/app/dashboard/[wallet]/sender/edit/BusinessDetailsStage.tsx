import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/v1/components/ui/card";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Button } from "@/v1/components/ui/button";
import { Building, MapPin, DollarSign } from "lucide-react";
import { ISender } from "@/v1/interface/interface";

interface BusinessDetailsStageProps {
    formData: Partial<ISender>;
    onInputChange: (field: keyof ISender, value: any) => void;
    onSave: () => Promise<void>;
    saving: boolean;
}

export const BusinessDetailsStage: React.FC<BusinessDetailsStageProps> = ({
    formData,
    onInputChange,
    onSave,
    saving
}) => {
    return (
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
                            <Label>Business Name *</Label>
                            <Input
                                value={formData.businessName || ''}
                                onChange={(e) => onInputChange('businessName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Trading Name</Label>
                            <Input
                                value={formData.tradingName || ''}
                                onChange={(e) => onInputChange('tradingName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Registration Number *</Label>
                            <Input
                                value={formData.businessRegistrationNumber || ''}
                                onChange={(e) => onInputChange('businessRegistrationNumber', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tax Identification Number</Label>
                            <Input
                                value={formData.taxIdentificationNumber || ''}
                                onChange={(e) => onInputChange('taxIdentificationNumber', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Website</Label>
                            <Input
                                value={formData.website || ''}
                                onChange={(e) => onInputChange('website', e.target.value)}
                                placeholder="https://www.company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Legal Form</Label>
                            <Input
                                value={formData.legalForm || ''}
                                onChange={(e) => onInputChange('legalForm', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Company Activity</Label>
                            <Input
                                value={formData.companyActivity || ''}
                                onChange={(e) => onInputChange('companyActivity', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Country *</Label>
                            <Input
                                value={formData.country || ''}
                                onChange={(e) => onInputChange('country', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Country of Incorporation</Label>
                            <Input
                                value={formData.countryOfIncorporation || ''}
                                onChange={(e) => onInputChange('countryOfIncorporation', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => onInputChange('email', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number *</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.phoneCountryCode || ''}
                                    onChange={(e) => onInputChange('phoneCountryCode', e.target.value)}
                                    placeholder="+234"
                                    className="w-24"
                                />
                                <Input
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => onInputChange('phoneNumber', e.target.value)}
                                    placeholder="8012345678"
                                    className="flex-1"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Percentage Ownership</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.percentageOwnership || ''}
                                onChange={(e) => onInputChange('percentageOwnership', Number(e.target.value))}
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
                            <Label>Street Address *</Label>
                            <Input
                                value={formData.streetAddress || formData.businessAddress || ''}
                                onChange={(e) => {
                                    onInputChange('streetAddress', e.target.value);
                                    onInputChange('businessAddress', e.target.value);
                                }}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Street Address 2</Label>
                            <Input
                                value={formData.streetAddress2 || ''}
                                onChange={(e) => onInputChange('streetAddress2', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City *</Label>
                            <Input
                                value={formData.city || formData.businessCity || ''}
                                onChange={(e) => {
                                    onInputChange('city', e.target.value);
                                    onInputChange('businessCity', e.target.value);
                                }}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>State *</Label>
                            <Input
                                value={formData.state || formData.businessState || ''}
                                onChange={(e) => {
                                    onInputChange('state', e.target.value);
                                    onInputChange('businessState', e.target.value);
                                }}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Region</Label>
                            <Input
                                value={formData.region || ''}
                                onChange={(e) => onInputChange('region', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                                value={formData.postalCode || formData.businessPostalCode || ''}
                                onChange={(e) => {
                                    onInputChange('postalCode', e.target.value);
                                    onInputChange('businessPostalCode', e.target.value);
                                }}
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
                                min="0"
                                value={formData.shareCapital || ''}
                                onChange={(e) => onInputChange('shareCapital', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Year Turnover</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.lastYearTurnover || ''}
                                onChange={(e) => onInputChange('lastYearTurnover', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Company Assets</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.companyAssets || ''}
                                onChange={(e) => onInputChange('companyAssets', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Monthly Volume</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.volume || ''}
                                onChange={(e) => onInputChange('volume', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected Monthly Inbound Crypto Payments</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.expectedMonthlyInboundCryptoPayments || ''}
                                onChange={(e) => onInputChange('expectedMonthlyInboundCryptoPayments', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected Monthly Outbound Crypto Payments</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.expectedMonthlyOutboundCryptoPayments || ''}
                                onChange={(e) => onInputChange('expectedMonthlyOutboundCryptoPayments', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected Monthly Inbound Fiat Payments</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.expectedMonthlyInboundFiatPayments || ''}
                                onChange={(e) => onInputChange('expectedMonthlyInboundFiatPayments', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected Monthly Outbound Fiat Payments</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.expectedMonthlyOutboundFiatPayments || ''}
                                onChange={(e) => onInputChange('expectedMonthlyOutboundFiatPayments', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Risk and Compliance */}
                    <div className="border-t pt-6">
                        <h4 className="text-md font-semibold mb-4">Risk and Compliance</h4>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label>Risk Level</Label>
                                <Input
                                    value={formData.riskLevel || ''}
                                    onChange={(e) => onInputChange('riskLevel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Additional Due Diligence Conducted</Label>
                                <Input
                                    value={formData.additionalDueDiligenceConducted || ''}
                                    onChange={(e) => onInputChange('additionalDueDiligenceConducted', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            onClick={onSave}
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            {saving ? "Saving..." : "Save Business Information"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
