import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Badge } from "@/v1/components/ui/badge";
import {
    Users,
    Plus,
    Trash2,
    Edit,
    Calendar,
    Phone,
    MapPin,
    IdCard,
    CheckCircle,
    AlertCircle,
    Clock
} from "lucide-react";
import { ISender, IDirectorAndShareholder } from "@/v1/interface/interface";
import { toast } from "sonner";

interface DirectorsStageProps {
    sender: ISender | null;
    onDirectorsChange: (directors: IDirectorAndShareholder[]) => void;
    onSaveDirectors: () => Promise<void>;
    saving: boolean;
}

export const DirectorsStage: React.FC<DirectorsStageProps> = ({
    sender,
    onDirectorsChange,
    onSaveDirectors,
    saving
}) => {
    const [editingDirector, setEditingDirector] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDirector, setNewDirector] = useState<Partial<IDirectorAndShareholder>>({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        jobTitle: '',
        role: '',
        isDirector: true,
        isShareholder: false,
        shareholderPercentage: 0,
        nationality: '',
        phoneCode: '',
        phoneNumber: '',
        idType: 'passport',
        idNumber: '',
        issuedCountry: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    });

    const directors = sender?.directors || [];

    const handleAddDirector = () => {
        if (!newDirector.firstName || !newDirector.lastName || !newDirector.email) {
            toast.error("Please fill in all required fields");
            return;
        }

        const directorToAdd: IDirectorAndShareholder = {
            ...newDirector,
            senderId: sender?._id || '',
            dateOfBirth: newDirector.dateOfBirth || new Date(),
            issueDate: newDirector.issueDate || new Date(),
            expiryDate: newDirector.expiryDate || new Date(),
            idDocument: {
                name: '',
                type: '',
                url: '',
                uploadedAt: new Date(),
                smileIdStatus: 'not_submitted',
                smileIdVerifiedAt: null,
                smileIdJobId: null,
                smileIdUploadId: null
            },
            proofOfAddress: {
                name: '',
                type: '',
                url: '',
                uploadedAt: new Date(),
                smileIdStatus: 'not_submitted',
                smileIdVerifiedAt: null,
                smileIdJobId: null,
                smileIdUploadId: null
            }
        } as IDirectorAndShareholder;

        const updatedDirectors = [...directors, directorToAdd];
        onDirectorsChange(updatedDirectors);
        setShowAddForm(false);
        setNewDirector({
            firstName: '',
            lastName: '',
            middleName: '',
            email: '',
            jobTitle: '',
            role: '',
            isDirector: true,
            isShareholder: false,
            shareholderPercentage: 0,
            nationality: '',
            phoneCode: '',
            phoneNumber: '',
            idType: 'passport',
            idNumber: '',
            issuedCountry: '',
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        });
        toast.success("Director added successfully");
    };

    const handleRemoveDirector = (index: number) => {
        const updatedDirectors = directors.filter((_, i) => i !== index);
        onDirectorsChange(updatedDirectors);
        toast.success("Director removed successfully");
    };

    const handleDirectorUpdate = (index: number, field: keyof IDirectorAndShareholder, value: any) => {
        const updatedDirectors = [...directors];
        updatedDirectors[index] = { ...updatedDirectors[index], [field]: value };
        onDirectorsChange(updatedDirectors);
    };

    const getVerificationStatusBadge = (status: "verified" | "rejected" | "under_review" | "not_submitted") => {
        switch (status) {
            case "verified":
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                    </Badge>
                );
            case "under_review":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Under Review
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-gray-600">
                        Not Submitted
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Directors & Shareholders
                        </div>
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Director
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Add New Director Form */}
                    {showAddForm && (
                        <Card className="border-2 border-dashed border-primary/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Director/Shareholder</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name *</Label>
                                        <Input
                                            value={newDirector.firstName || ''}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, firstName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name *</Label>
                                        <Input
                                            value={newDirector.lastName || ''}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, lastName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Middle Name</Label>
                                        <Input
                                            value={newDirector.middleName || ''}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, middleName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={newDirector.email || ''}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            value={newDirector.jobTitle || ''}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, jobTitle: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Input
                                            value={newDirector.role || ''}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, role: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nationality</Label>
                                        <Input
                                            value={newDirector.nationality || ''}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, nationality: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newDirector.phoneCode || ''}
                                                onChange={(e) => setNewDirector(prev => ({ ...prev, phoneCode: e.target.value }))}
                                                placeholder="+234"
                                                className="w-24"
                                            />
                                            <Input
                                                value={newDirector.phoneNumber || ''}
                                                onChange={(e) => setNewDirector(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                placeholder="8012345678"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newDirector.isDirector || false}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, isDirector: e.target.checked }))}
                                        />
                                        <span>Is Director</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newDirector.isShareholder || false}
                                            onChange={(e) => setNewDirector(prev => ({ ...prev, isShareholder: e.target.checked }))}
                                        />
                                        <span>Is Shareholder</span>
                                    </label>
                                    {newDirector.isShareholder && (
                                        <div className="space-y-2">
                                            <Label>Shareholder Percentage</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={newDirector.shareholderPercentage || ''}
                                                onChange={(e) => setNewDirector(prev => ({ ...prev, shareholderPercentage: Number(e.target.value) }))}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleAddDirector} className="bg-primary hover:bg-primary/90 text-white">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Director
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Directors List */}
                    {directors.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No Directors Added</h3>
                            <p className="text-sm">Add directors and shareholders to complete your business profile.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {directors.map((director, index) => (
                                <Card key={index} className="border-l-4 border-l-primary">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-semibold">
                                                    {director.firstName} {director.middleName} {director.lastName}
                                                </h4>
                                                <p className="text-sm text-gray-600">{director.jobTitle} • {director.role}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {director.isDirector && (
                                                        <Badge variant="outline" className="text-blue-700 bg-blue-50">
                                                            Director
                                                        </Badge>
                                                    )}
                                                    {director.isShareholder && (
                                                        <Badge variant="outline" className="text-green-700 bg-green-50">
                                                            Shareholder ({director.shareholderPercentage}%)
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingDirector(editingDirector === index ? null : index)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveDirector(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{director.phoneCode} {director.phoneNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span>{director.nationality}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <IdCard className="h-4 w-4 text-gray-400" />
                                                <span>{director.idType}: {director.idNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>{director.dateOfBirth ? new Date(director.dateOfBirth).toLocaleDateString() : 'Not set'}</span>
                                            </div>
                                        </div>

                                        {/* Document Status */}
                                        <div className="mt-4 pt-4 border-t">
                                            <h5 className="font-medium mb-2">Document Verification Status</h5>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">ID Document:</span>
                                                    {getVerificationStatusBadge(director.idDocument?.smileIdStatus || 'not_submitted')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">Proof of Address:</span>
                                                    {getVerificationStatusBadge(director.proofOfAddress?.smileIdStatus || 'not_submitted')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Editing Form */}
                                        {editingDirector === index && (
                                            <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
                                                <h5 className="font-medium mb-4">Edit Director Information</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>First Name</Label>
                                                        <Input
                                                            value={director.firstName}
                                                            onChange={(e) => handleDirectorUpdate(index, 'firstName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Last Name</Label>
                                                        <Input
                                                            value={director.lastName}
                                                            onChange={(e) => handleDirectorUpdate(index, 'lastName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input
                                                            value={director.email}
                                                            onChange={(e) => handleDirectorUpdate(index, 'email', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Job Title</Label>
                                                        <Input
                                                            value={director.jobTitle || ''}
                                                            onChange={(e) => handleDirectorUpdate(index, 'jobTitle', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setEditingDirector(null)}
                                                        className="bg-primary hover:bg-primary/90 text-white"
                                                    >
                                                        Save Changes
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingDirector(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Save Button */}
                    {directors.length > 0 && (
                        <div className="flex justify-end pt-6 border-t">
                            <Button
                                onClick={onSaveDirectors}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                {saving ? "Saving..." : "Save Directors"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
