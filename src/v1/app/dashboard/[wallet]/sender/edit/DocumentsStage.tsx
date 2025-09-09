import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Badge } from "@/v1/components/ui/badge";
import { Label } from "@/v1/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/v1/components/ui/dialog";
import { Plus, Check, X, Upload, Eye, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { ISender, ISenderDocument } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import { IResponse } from "@/v1/interface/interface";
import { Status } from "@/v1/enums/enums";

interface DocumentsStageProps {
    sender: ISender | null;
    onDocumentUploaded: (field: string, url: string) => void;
}

export const DocumentsStage: React.FC<DocumentsStageProps> = ({
    sender,
    onDocumentUploaded
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
    const [formData, setFormData] = useState<Record<string, File | null>>({});
    const [uploadedUrls, setUploadedUrls] = useState<Record<string, string | null>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

    // File viewer modal state
    const [fileViewerState, setFileViewerState] = useState<{
        isOpen: boolean;
        file: File | null;
        fieldKey: string;
        label: string;
    }>({
        isOpen: false,
        file: null,
        fieldKey: '',
        label: ''
    });

    const sd: SessionData = session.getUserData();

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 10MB';
        }
        if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
            return 'File must be JPEG, JPG, PNG, or PDF format';
        }
        return null;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const openFileViewer = (file: File, fieldKey: string, label: string) => {
        setFileViewerState({
            isOpen: true,
            file,
            fieldKey,
            label
        });
    };

    const closeFileViewer = () => {
        setFileViewerState({
            isOpen: false,
            file: null,
            fieldKey: '',
            label: ''
        });
    };

    const handleFileSelect = async (file: File, fieldKey: string) => {
        const error = validateFile(file);
        if (error) {
            setFieldErrors(prev => ({ ...prev, [fieldKey]: error }));
            return;
        }

        setFieldErrors(prev => ({ ...prev, [fieldKey]: null }));
        setFormData(prev => ({ ...prev, [fieldKey]: file }));
        setUploadingDocs(prev => ({ ...prev, [fieldKey]: true }));

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/senderKYB', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sd.session}`,
                },
                body: formData,
            });

            const data: IResponse = await response.json();

            if (data.status === Status.SUCCESS && data.data?.url) {
                setUploadedUrls(prev => ({ ...prev, [fieldKey]: data.data.url }));

                await onDocumentUploaded(fieldKey, data.data.url);
            } else {
                setFieldErrors(prev => ({ ...prev, [fieldKey]: 'Upload failed. Please try again.' }));
            }
        } catch (error) {
            console.error('Upload error:', error);
            setFieldErrors(prev => ({ ...prev, [fieldKey]: 'Upload failed. Please check your connection.' }));
        } finally {
            setUploadingDocs(prev => ({ ...prev, [fieldKey]: false }));
        }
    };

    const handleDrop = (e: React.DragEvent, fieldKey: string) => {
        e.preventDefault();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files?.[0]) {
            handleFileSelect(files[0], fieldKey);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const getDocumentByType = (type: string): ISenderDocument | undefined => {
        return sender?.documents?.find(doc => doc.name === type);
    };

    const getVerificationBadge = (smileIdStatus?: string) => {
        if (!smileIdStatus) return null;

        switch (smileIdStatus) {
            case 'verified':
                return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <Check className="h-3 w-3" />
                        Verified
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        <Clock className="h-3 w-3" />
                        Pending
                    </div>
                );
            case 'failed':
                return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        <X className="h-3 w-3" />
                        Failed
                    </div>
                );
            default:
                return null;
        }
    };

    const renderUploadArea = (docType: any) => {
        const isUploading = uploadingDocs[docType.key];
        const uploadedFile = formData[docType.key];
        const uploadedUrl = uploadedUrls[docType.key] || getDocumentByType(docType.key)?.url;
        const hasError = fieldErrors[docType.key];
        const existingDoc = getDocumentByType(docType.key);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{docType.label}</Label>
                    {existingDoc?.smileIdStatus && getVerificationBadge(existingDoc.smileIdStatus)}
                </div>

                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : hasError
                                ? 'border-red-300 bg-red-50'
                                : uploadedUrl
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDrop={(e) => handleDrop(e, docType.key)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                    ) : uploadedFile || uploadedUrl ? (
                        <div className="flex flex-col items-center space-y-3">
                            <div className="flex items-center space-x-3 w-full">
                                <div className="flex-shrink-0">
                                    {uploadedFile?.type?.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(uploadedFile)}
                                            alt="Preview"
                                            className="h-12 w-12 rounded-lg object-cover border"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                            <FileText className="h-6 w-6 text-gray-500" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {uploadedFile?.name || 'Uploaded document'}
                                    </p>
                                    {uploadedFile && (
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(uploadedFile.size)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    {uploadedFile && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openFileViewer(uploadedFile, docType.key, docType.label)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <label className="cursor-pointer">
                                        <Button type="button" variant="outline" size="sm" asChild>
                                            <span>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Replace
                                            </span>
                                        </Button>
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(file, docType.key);
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {uploadedUrl && (
                                <div className="flex items-center space-x-2 w-full pt-2 border-t">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">Successfully uploaded</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Upload className="h-6 w-6 text-gray-500" />
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-900">
                                    Drop your file here, or{' '}
                                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                                        browse
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(file, docType.key);
                                            }}
                                        />
                                    </label>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    JPEG, PNG, PDF up to 10MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {hasError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <X className="h-4 w-4" />
                        <span>{hasError}</span>
                    </div>
                )}
            </div>
        );
    }; const documentTypes = [
        {
            key: 'businessMemorandumAndArticlesOfAssociationKyc',
            label: 'Business Memorandum and Articles of Association',
            description: 'Upload your company\'s memorandum and articles of association',
            required: true
        },
        {
            key: 'businessCertificateOfIncorporationKyc',
            label: 'Certificate of Incorporation',
            description: 'Upload your company\'s certificate of incorporation',
            required: true
        },
        {
            key: 'businessCertificateOfIncorporationStatusReportKyc',
            label: 'Certificate of Incorporation Status Report',
            description: 'Upload your company\'s status report from CAC',
            required: true
        },
        {
            key: 'businessProofOfAddressKyc',
            label: 'Proof of Address',
            description: 'Upload proof of business address (utility bill or bank statement)',
            required: true
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Upload & Verification
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {documentTypes.map((docType) => {
                    const document = getDocumentByType(docType.key);
                    const smileIdStatus = document?.smileIdStatus;
                    const showUploadSection = !document || smileIdStatus === "failed";

                    return (
                        <div key={docType.key} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-medium flex items-center gap-2">
                                        {docType.label}
                                        {docType.required && <span className="text-red-500">*</span>}
                                    </h4>
                                    <p className="text-sm text-gray-600">{docType.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {document && getVerificationBadge(document.smileIdStatus)}
                                    {document && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            Uploaded
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced upload section */}
                            {showUploadSection ? (
                                <>
                                    {document && smileIdStatus === "failed" && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-red-800">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    Document verification failed. Please upload a new document.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {renderUploadArea(docType)}
                                </>
                            ) : (
                                /* Show document in review status */
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-800 font-medium">Document Under Review</p>
                                            <p className="text-blue-600 text-sm">
                                                Your document has been submitted and is currently being verified.
                                                You will be notified once the review is complete.
                                            </p>
                                            {document?.uploadedAt && (
                                                <p className="text-blue-600 text-xs mt-1">
                                                    Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        {document?.url && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(document.url, '_blank')}
                                                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Overall Status */}
                <div className="border-t pt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Document Verification Status</h4>
                        <p className="text-sm text-gray-600">
                            All required documents must be uploaded and verified before your business profile can be approved.
                            Documents are automatically verified using our secure verification system.
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-green-700">Verified</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-yellow-600" />
                                <span className="text-yellow-700">Under Review</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-red-600" />
                                <span className="text-red-700">Failed - Requires Reupload</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* File Viewer Modal */}
            <Dialog open={fileViewerState.isOpen} onOpenChange={(open) => !open && closeFileViewer()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {fileViewerState.label} - {fileViewerState.file?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {fileViewerState.file && (
                            <div className="flex justify-center">
                                {fileViewerState.file.type.startsWith('image/') ? (
                                    <img
                                        src={URL.createObjectURL(fileViewerState.file)}
                                        alt="Document preview"
                                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                    />
                                ) : fileViewerState.file.type === 'application/pdf' ? (
                                    <iframe
                                        src={URL.createObjectURL(fileViewerState.file)}
                                        className="w-full h-[60vh] rounded-lg border"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
                                        <FileText className="h-12 w-12 text-gray-400 mb-2" />
                                        <p className="text-gray-600">Preview not available for this file type</p>
                                        <p className="text-sm text-gray-500">{fileViewerState.file.name}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-gray-600">
                                <p><strong>File:</strong> {fileViewerState.file?.name}</p>
                                <p><strong>Size:</strong> {fileViewerState.file ? formatFileSize(fileViewerState.file.size) : 'N/A'}</p>
                                <p><strong>Type:</strong> {fileViewerState.file?.type || 'N/A'}</p>
                            </div>

                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={closeFileViewer}>
                                    Close
                                </Button>
                                {fileViewerState.file && (
                                    <Button
                                        onClick={() => {
                                            const url = URL.createObjectURL(fileViewerState.file!);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = fileViewerState.file!.name;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        }}
                                    >
                                        Download
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
