import { useState, useEffect } from "react"
import { Button } from "@/v1/components/ui/button"
import { Label } from "@/v1/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/v1/components/ui/dialog"
import { X, Plus, Check, Eye, AlertCircle } from "lucide-react"
import Defaults from "@/v1/defaults/defaults"
import { IResponse, ISender } from "@/v1/interface/interface"
import { Status, WhichDocument } from "@/v1/enums/enums"
import { session, SessionData } from "@/v1/session/session"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

interface BusinessDetailsStageProps {
    sender: Partial<ISender>;
}

export function KYBVerificationFormComponent({ sender }: BusinessDetailsStageProps) {
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, File | null>>({
        cacCertOfIncoporation: null,
        memorandumArticlesOfAssociation: null,
        cacStatusReport: null,
        proofOfAddress: null,
    });
    // per-field uploading state
    const [fieldUploading, setFieldUploading] = useState<Record<string, boolean>>({
        cacCertOfIncoporation: false,
        memorandumArticlesOfAssociation: false,
        cacStatusReport: false,
        proofOfAddress: false,
    });
    // store uploaded urls returned by backend for each field
    const [uploadedUrls, setUploadedUrls] = useState<Record<string, string | null>>({
        cacCertOfIncoporation: null,
        memorandumArticlesOfAssociation: null,
        cacStatusReport: null,
        proofOfAddress: null,
    });
    // per-field error
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({
        cacCertOfIncoporation: null,
        memorandumArticlesOfAssociation: null,
        cacStatusReport: null,
        proofOfAddress: null,
    });
    // file viewer modal state
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

    useEffect(() => {
        setUploadedUrls({
            ...uploadedUrls,
            cacCertOfIncoporation: sender.documents?.find(doc => doc.which === WhichDocument.CERTIFICATE_INCORPORATION)?.url || null,
            memorandumArticlesOfAssociation: sender.documents?.find(doc => doc.which === WhichDocument.MEMORANDUM_ARTICLES)?.url || null,
            cacStatusReport: sender.documents?.find(doc => doc.which === WhichDocument.INCORPORATION_STATUS)?.url || null,
            proofOfAddress: sender.documents?.find(doc => doc.which === WhichDocument.PROOF_ADDRESS)?.url || null,
        })
    }, []);

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
            // set file immediately and start upload
            setFormData(prev => ({ ...prev, [field]: file }));
            uploadFile(file, field);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            uploadFile(file, field);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // handle server submission here
            setError(null);
            setLoading(true);

            // Prepare documents array from uploaded URLs
            const documents = [];

            // CAC Certificate of Incorporation (required)
            if (uploadedUrls.cacCertOfIncoporation) {
                documents.push({
                    which: WhichDocument.CERTIFICATE_INCORPORATION,
                    name: formData.cacCertOfIncoporation?.name || "CAC Certificate of Incorporation",
                    type: formData.cacCertOfIncoporation?.type || "application/pdf",
                    url: uploadedUrls.cacCertOfIncoporation,
                    size: formData.cacCertOfIncoporation?.size,
                    isRequired: true
                });
            }

            // Memorandum & Articles of Association (optional)
            if (uploadedUrls.memorandumArticlesOfAssociation) {
                documents.push({
                    which: WhichDocument.MEMORANDUM_ARTICLES,
                    name: formData.memorandumArticlesOfAssociation?.name || "Memorandum & Articles of Association",
                    type: formData.memorandumArticlesOfAssociation?.type || "application/pdf",
                    url: uploadedUrls.memorandumArticlesOfAssociation,
                    size: formData.memorandumArticlesOfAssociation?.size,
                    isRequired: false
                });
            }

            // CAC Status Report (required)
            if (uploadedUrls.cacStatusReport) {
                documents.push({
                    which: WhichDocument.INCORPORATION_STATUS,
                    name: formData.cacStatusReport?.name || "CAC Status Report",
                    type: formData.cacStatusReport?.type || "application/pdf",
                    url: uploadedUrls.cacStatusReport,
                    size: formData.cacStatusReport?.size,
                    isRequired: true
                });
            }

            // Proof of Address (required)
            if (uploadedUrls.proofOfAddress) {
                documents.push({
                    which: WhichDocument.PROOF_ADDRESS,
                    name: formData.proofOfAddress?.name || "Proof of Address",
                    type: formData.proofOfAddress?.type || "application/pdf",
                    url: uploadedUrls.proofOfAddress,
                    size: formData.proofOfAddress?.size,
                    isRequired: true
                });
            }

            // Validate required documents
            const requiredDocs = ['cacCertOfIncoporation', 'cacStatusReport', 'proofOfAddress'];
            const missingRequired = requiredDocs.filter(docType => !uploadedUrls[docType]);

            if (missingRequired.length > 0) {
                throw new Error(`Missing required documents: ${missingRequired.join(', ')}`);
            }

            if (documents.length === 0) {
                throw new Error("At least one document is required");
            }

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/docs`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'Content-Type': 'application/json',
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    documents: documents
                })
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Documents Uploaded Successfully, You will be redirected to login.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to upload documents");
        } finally {
            setLoading(false);
        }
    };

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    const uploadFile = async (file: File, fieldKey: string): Promise<void> => {
        // reset field error
        setFieldErrors(prev => ({ ...prev, [fieldKey]: null }));

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setFieldErrors(prev => ({ ...prev, [fieldKey]: `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` }));
            return;
        }

        try {
            setFieldUploading(prev => ({ ...prev, [fieldKey]: true }));

            const form = new FormData();
            form.append('file', file);

            // clone headers and remove content-type so browser sets boundary
            const headers: Record<string, string> = { ...Defaults.HEADERS } as Record<string, string>;
            if (headers['Content-Type']) delete headers['Content-Type'];
            if (headers['content-type']) delete headers['content-type'];

            const res = await fetch(`${Defaults.API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'x-rojifi-handshake': sd?.client?.publicKey || '',
                    'x-rojifi-deviceid': sd?.deviceid || '',
                },
                body: form,
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error || 'Upload failed');
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process upload response right now, please try again.');
                const parseData: { url: string } = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                // store returned url for the field
                setUploadedUrls(prev => ({ ...prev, [fieldKey]: parseData.url }));
                // keep formData file as-is (already set)
                console.log(`File uploaded for ${fieldKey}: `, parseData.url);
            }
        } catch (err: any) {
            setFieldErrors(prev => ({ ...prev, [fieldKey]: err.message || 'File upload failed' }));
        } finally {
            setFieldUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    }

    // Helper to clear the native file input so selecting the same file again triggers onChange
    const clearFileInput = (fieldKey: string) => {
        try {
            const el = document.getElementById(`file-upload-${fieldKey}`) as HTMLInputElement | null;
            if (el) {
                el.value = '';
            }
        } catch (e) {
            // ignore
        }
    }

    // File Viewer Modal Component
    const FileViewerModal = ({ file, isOpen, onClose, onDelete, label }: {
        file: File | null;
        isOpen: boolean;
        onClose: () => void;
        onDelete: () => void;
        label: string;
    }) => {
        const [fileUrl, setFileUrl] = useState<string | null>(null);

        useEffect(() => {
            if (file && isOpen) {
                const url = URL.createObjectURL(file);
                setFileUrl(url);

                // Cleanup function to revoke the object URL
                return () => {
                    URL.revokeObjectURL(url);
                    setFileUrl(null);
                };
            }
        }, [file, isOpen]);

        const handleDelete = () => {
            onDelete();
            onClose();
        };

        const renderFileContent = () => {
            if (!file || !fileUrl) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No file to display</p>
                    </div>
                );
            }

            const fileType = file.type.toLowerCase();
            const fileName = file.name;

            // Handle images
            if (fileType.startsWith('image/')) {
                return (
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain mx-auto"
                    />
                );
            }

            // Handle PDFs using browser's built-in PDF viewer
            if (fileType === 'application/pdf') {
                return (
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-0"
                        title={fileName ?? "pdf-preview"}
                    />
                );
            }

            // Handle other documents - show download option
            if (fileType.includes('document') ||
                fileType.includes('spreadsheet') ||
                fileType.includes('presentation')) {

                return (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="text-6xl text-blue-500">📄</div>
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-700">{fileName}</p>
                            <p className="text-sm text-gray-500">Document preview</p>
                            <p className="text-xs text-gray-400 mt-2">File size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <a
                                href={fileUrl}
                                download={fileName}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Download Document
                            </a>
                        </div>
                    </div>
                );
            }

            // Fallback for other file types
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-6xl text-gray-300">📄</div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-700">{fileName}</p>
                        <p className="text-sm text-gray-500">Preview not available for this file type</p>
                        <p className="text-xs text-gray-400 mt-2">File size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
            );
        };

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] p-0 flex flex-col">
                    <DialogHeader className="p-6 pb-2 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-lg font-semibold">
                                    {label}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-600">
                                    {file?.name} ({file ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB)
                                </DialogDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/**
                                 * 
                                 * <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>

                                 */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClose}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 p-6 pt-2 overflow-hidden min-h-0">
                        <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
                            {renderFileContent()}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const renderUploadField = (fieldKey: string, label: string, required: boolean) => (
        <div key={fieldKey}>
            <Label className="block text-lg font-bold text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</Label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, fieldKey)}
                tabIndex={0}
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">Drag & drop or click to choose files</p>
                <p className="text-sm text-gray-500 mb-2">JPEG, PNG, and PDF formats</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    Max file size: 2 MB
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, fieldKey)}
                    id={`file-upload-${fieldKey}`}
                />
                <label htmlFor={`file-upload-${fieldKey}`} className="absolute inset-0 cursor-pointer" />
            </div>
            {/* per-field states: uploading, selected, uploaded, errors */}
            <div className="mt-3">
                {fieldUploading[fieldKey] ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600">Uploading...</p>
                            <p className="text-xs text-gray-400">Preparing file</p>
                        </div>

                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-2 bg-primary rounded-full"
                                style={{
                                    width: '30%',
                                    transform: 'translateX(-100%)',
                                    animation: 'upload-slide 1.2s linear infinite'
                                }}
                            />
                        </div>

                        <style>{`
                            @keyframes upload-slide {
                                0% { transform: translateX(-120%); }
                                50% { transform: translateX(20%); }
                                100% { transform: translateX(120%); }
                            }
                        `}</style>
                    </div>
                ) : uploadedUrls[fieldKey] ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <p className="text-sm font-medium">Uploaded</p>
                        </div>
                        <p className="text-sm text-gray-700 truncate">{formData[fieldKey]?.name ?? 'file'}</p>

                        <button
                            type="button"
                            onClick={() => {
                                setFileViewerState({
                                    isOpen: true,
                                    file: formData[fieldKey],
                                    fieldKey,
                                    label
                                });
                            }}
                            className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            aria-label={`View uploaded ${fieldKey}`}
                        >
                            <Eye className="h-4 w-4" />
                            View
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                // remove uploaded file
                                setFormData(prev => ({ ...prev, [fieldKey]: null }));
                                setUploadedUrls(prev => ({ ...prev, [fieldKey]: null }));
                                setFieldErrors(prev => ({ ...prev, [fieldKey]: null }));
                                clearFileInput(fieldKey);
                            }}
                            className="ml-2 text-red-500 hover:text-red-600"
                            aria-label={`Remove ${fieldKey}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : formData[fieldKey] ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11" />
                                    <polyline points="17 8 12 3 7 8" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-700">Selected: {formData[fieldKey]?.name}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                // allow removing before upload completes or before user reselects
                                setFormData(prev => ({ ...prev, [fieldKey]: null }));
                                setFieldErrors(prev => ({ ...prev, [fieldKey]: null }));
                                clearFileInput(fieldKey);
                            }}
                            className="ml-auto text-red-500 hover:text-red-600"
                            aria-label={`Remove ${fieldKey}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No file selected</p>
                )}

                {fieldErrors[fieldKey] && (
                    <p className="text-sm text-red-500 mt-2">{fieldErrors[fieldKey]}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <form className="space-y-6 w-full" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    {renderUploadField("cacCertOfIncoporation", "CAC Certificate of Incorporation", true)}
                    {renderUploadField("memorandumArticlesOfAssociation", "Memorandum & Articles of Association (Memart)", false)}
                    {renderUploadField("cacStatusReport", "CAC Status Report", true)}
                    {renderUploadField("proofOfAddress", "Business Proof of Address (Recent Utility Bill, Bank Statement, Etc...)", true)}

                    <Alert variant="default" className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <AlertTitle className="text-sm">Note: Proof of Address requirement</AlertTitle>
                        <AlertDescription>
                            Kindly ensure the Proof of Address document matches the company's operations address.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                            {loading ? "Loading..." : "Continue"}
                        </Button>
                    </div>

                </form>
            </div>

            {/* File Viewer Modal */}
            <FileViewerModal
                file={fileViewerState.file}
                isOpen={fileViewerState.isOpen}
                onClose={() => setFileViewerState(prev => ({ ...prev, isOpen: false }))}
                onDelete={() => {
                    const fieldKey = fileViewerState.fieldKey;
                    setFormData(prev => ({ ...prev, [fieldKey]: null }));
                    setUploadedUrls(prev => ({ ...prev, [fieldKey]: null }));
                    setFieldErrors(prev => ({ ...prev, [fieldKey]: null }));
                    clearFileInput(fieldKey);
                    setFileViewerState(prev => ({ ...prev, isOpen: false }));
                }}
                label={fileViewerState.label}
            />
        </div>
    );
}
