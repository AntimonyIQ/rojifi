"use client"

import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Label } from "@/v1/components/ui/label"
import { X, Plus, Check, ExternalLink } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { Carousel, carouselItems } from "../carousel"
import GlobeWrapper from "../globe"
import Defaults from "@/v1/defaults/defaults"
import { IResponse } from "@/v1/interface/interface"
import { Status } from "@/v1/enums/enums"
import { session, SessionData } from "@/v1/session/session"
import { toast } from "sonner"
import { Link, useParams } from "wouter"

export function KYBVerificationForm() {
    const [dragActive, setDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
    const sd: SessionData = session.getUserData();

    const { id } = useParams();

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
            setIsLoading(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/docs`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    cacCertOfIncoporation: uploadedUrls.cacCertOfIncoporation,
                    memorandumArticlesOfAssociation: uploadedUrls.memorandumArticlesOfAssociation,
                    cacStatusReport: uploadedUrls.cacStatusReport,
                    proofOfAddress: uploadedUrls.proofOfAddress,
                })
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Documents Uploaded Successfully, You will be redirected to login.");
                window.location.href = "/login";
            };
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setIsLoading(false);
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
            }
        } catch (err: any) {
            setFieldErrors(prev => ({ ...prev, [fieldKey]: err.message || 'File upload failed' }));
        } finally {
            setFieldUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    }

    const renderUploadField = (fieldKey: string, label: string) => (
        <div key={fieldKey}>
            <Label className="block text-lg font-bold text-gray-700 mb-2">{label}</Label>
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

                        <a
                            href={uploadedUrls[fieldKey] || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            aria-label={`View uploaded ${fieldKey}`}
                        >
                            View
                            <ExternalLink className="h-4 w-4" />
                        </a>

                        <button
                            type="button"
                            onClick={() => {
                                // remove uploaded file
                                setFormData(prev => ({ ...prev, [fieldKey]: null }));
                                setUploadedUrls(prev => ({ ...prev, [fieldKey]: null }));
                                setFieldErrors(prev => ({ ...prev, [fieldKey]: null }));
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
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <Link href="/" className="flex items-center space-x-2">
                                <Logo className="h-8 w-auto" />
                            </Link>
                            <Link href="/" className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </Link>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC/KYB Verification</h1>
                            <p className="text-gray-600">We need to verify your details for compliance and protection.</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            {renderUploadField("cacCertOfIncoporation", "CAC Certificate of Incorporation")}
                            {renderUploadField("memorandumArticlesOfAssociation", "Memorandum & Articles of Association (Memart)")}
                            {renderUploadField("cacStatusReport", "CAC Status Report")}
                            {renderUploadField("proofOfAddress", "Proof of Address (Recent Utility Bill)")}

                            <div className="space-y-4">
                                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                                    {isLoading ? "Submitting..." : "Submit"}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Have an account?{" "}
                                <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-[60%] hidden md:block h-full px-10 py-1 bg-primary relative">
                    <div className="mt-12">
                        <Carousel data={carouselItems} interval={4000} />
                    </div>
                    <div className="absolute bottom-5 left-5 px-5 right-0 flex justify-start items-center mt-6 text-white text-lg z-10">
                        &copy; {new Date().getFullYear()} Rojifi. All rights reserved.
                    </div>
                    <div className="absolute -bottom-40 -right-40 flex justify-center items-center mt-6">
                        <GlobeWrapper />
                    </div>
                </div>
            </div>
        </div>
    );
}
