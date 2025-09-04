"use client";

import React from "react";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import {
    Globe,
    Plus,
    X,
    CheckIcon,
    ChevronsUpDownIcon,
    Check,
    ExternalLink
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Country, ICountry } from "country-state-city";
import PaymentDetailsDrawer from "./payment-details-view";
import Loading from "../loading";
import { cn } from "@/v1/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/v1/components/ui/calendar"
import Defaults from "@/v1/defaults/defaults";
import { IPayment, IResponse, ISender, IWallet } from "@/v1/interface/interface";
import { Fiat, Status, TransactionStatus } from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";
import { Link } from "wouter";

interface IIBan {
    id: string;
    account_number: string;
    national_bank_code: string;
    national_branch_code: string;
    swift: {
        id: string;
        address: string;
        postcode: string;
        branch_name: string;
        branch_code: string;
        country: {
            id: string;
            name: string;
        };
        city: {
            id: string;
            country_id: string;
            name: string;
        };
        bank: {
            id: string;
            country_id: string;
            code: string;
            name: string;
        };
    };
    country: {
        id: string;
        name: string;
    };
}

interface PaymentViewState {
    swiftmodal: boolean;
    loading: boolean;
    dragActive: boolean;
    focused: boolean;
    formdata: IPayment | null;
    ibanLoading: boolean;
    ibanDetails: IIBan | null;
    paymentDetailsModal: boolean;
    popOpen: boolean;
    wallets: Array<IWallet>;
    selectedWallet: IWallet | null;
    sender: ISender | null;
    fileUpload: File | null;
    uploadError: string;
    uploading: boolean;
}

class SwiftOrRouting extends React.Component<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formdata: IPayment;
    onChange: (field: string, value: string) => void;
}> {
    render(): React.ReactNode {
        const { open, onOpenChange, formdata, onChange } = this.props;
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl bg-slate-950">
                    <div className="flex flex-col gap-5 w-full">
                        <div className="flex items-center justify-end">
                            <Button
                                variant="outline"
                                className="bg-transparent"
                                onClick={(): void => onOpenChange(false)}
                            >
                                <X size={26} className="text-white" />
                            </Button>
                        </div>
                        <div className="mt-4 flex flex-col items-start w-full gap-5">
                            <div className="w-full flex flex-col items-center justify-center gap-2">
                                <DialogTitle className="font-bold text-white">
                                    Enter SWIFT Code / Routing Number
                                </DialogTitle>
                                <p className="text-slate-200">
                                    This will help us determine the right country you're sending
                                    to
                                </p>
                            </div>
                            <div className="flex flex-col gap-4 w-full">
                                <div className="relative bg-slate-950">
                                    <Input
                                        id="swiftcode_modal"
                                        name="swiftcode"
                                        type="text"
                                        required
                                        className="pl-10 h-12 bg-slate-950 text-slate-50"
                                        placeholder="SWIFT Code / Routing Number"
                                        value={formdata?.swiftCode}
                                        onChange={(e): void =>
                                            onChange("swiftCode", e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    className="text-white"
                                    variant="default"
                                    size="lg"
                                    onClick={(): void => onOpenChange(false)}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
}

export class PaymentView extends React.Component<unknown, PaymentViewState> {

    private sd: SessionData;

    // European countries (ISO 3166-1 alpha-2) + Middle East 
    private ibanlist: Array<string> = [
        // Europe
        "AL", "AD", "AM", "AT", "AZ", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GR", "HU", "IS", "IE", "IT", "KZ", "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA", "GB", "VA",
        // Middle East
        "AE", "BH", "EG", "IR", "IQ", "IL", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "SY", "YE"
    ];

    private countries: Array<ICountry> = Country.getAllCountries();

    constructor(props: unknown) {
        super(props);
        this.state = {
            swiftmodal: false,
            popOpen: false,
            loading: false,
            dragActive: false,
            ibanDetails: null,
            focused: false,
            ibanLoading: false,
            paymentDetailsModal: false,
            wallets: [],
            sender: null,
            selectedWallet: null,
            formdata: null,
            fileUpload: null,
            uploadError: "",
            uploading: false
        };
        this.sd = session.getUserData();
    }

    componentDidMount(): void {
        if (this.sd) {
            this.setState({ sender: this.sd.sender, wallets: this.sd.wallets });
            const draftPayment: IPayment = {
                ...this.sd.draftPayment,
                sender: this.sd.sender ? this.sd.sender._id : '',
                senderWallet: this.sd.activeWallet,
                senderName: this.sd.sender ? this.sd.sender.businessName : '',
                status: TransactionStatus.PENDING,
                rojifiId: ""
            };

            session.updateSession({ ...this.sd, draftPayment: draftPayment });
        }
    }

    private setSwiftModal = (open: boolean): void => {
        this.setState({ swiftmodal: open });
    };

    // TODO: Implement file upload functionality
    /* private uploadFile = async (file: File): Promise<void> => {
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        const { formdata } = this.state;
        // reset field error
        // setFieldErrors(prev => ({ ...prev, [fieldKey]: null }));

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            this.setState({ uploadError: `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` });
            return;
        }

        try {
            this.setState({ uploadError: "" });

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
                    'x-rojifi-handshake': this.sd.client?.publicKey || '',
                    'x-rojifi-deviceid': this.sd.deviceid || '',
                },
                body: form,
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error || 'Upload failed');
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process upload response right now, please try again.');
                const parseData: { url: string } = Defaults.PARSE_DATA(data.data, this.sd.client.privateKey, data.handshake);
                // keep formData file as-is (already set)
                this.setState({
                    formdata: {
                        ...formdata,
                        paymentInvoice: parseData.url
                    } as IPayment,
                })
            }
        } catch (err: any) {
            this.setState({ uploadError: err.message || 'File upload failed' });
        } finally {
            this.setState({ uploading: false });
        }
    } */

    private handleInputChange = (
        field: string,
        value: string | boolean | File
    ): void => {
        let sanitizedValue: string | boolean | File = value;

        if (typeof value === "string") {
            switch (field) {
                case "firstName":
                case "lastName":
                case "middleName":
                    sanitizedValue = value.replace(/[^a-zA-Z]/g, "");
                    break;
                case "email":
                    sanitizedValue = value.replace(/\s+/g, "").toLowerCase();
                    sanitizedValue = sanitizedValue.replace(/[^a-z0-9@._-]/g, "");
                    break;
                case "phoneNumber":
                case "volume":
                    sanitizedValue = value.replace(/[^0-9]/g, "");
                    break;
                case "beneficiary_amount":
                    sanitizedValue = value.replace(/[^0-9.]/g, "");
                    break;
                case "swiftcode":
                    sanitizedValue = value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 11);
                    if (sanitizedValue.length === 8 || sanitizedValue.length === 11) {
                        this.fetchSwiftDetails(sanitizedValue);
                    }
                    break;
                case "iban":
                    sanitizedValue = value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 34);
                    if (sanitizedValue.length > 18) {
                        this.fetchIbanDetails(sanitizedValue);
                    }
                    break;
                default:
                    break;
            }
        }

        /*
formdata: {
                // ...(prev.formdata ?? {}),
                ...this.state.formdata,
                // [field]: sanitizedValue,
                rojifiId: (prev.formdata?.rojifiId ?? ""),
                sender: (prev.formdata?.sender ?? ""),
                senderWallet: (prev.formdata?.senderWallet ?? ""),
                senderName: (prev.formdata?.senderName ?? ""),
                status: (prev.formdata?.status ?? "pending"),
                // Add other required IPayment fields here with default values if needed
            },
        */

        this.setState((prev) => ({
            formdata: {
                ...(prev.formdata ?? {}),
                [field]: sanitizedValue,
                rojifiId: (prev.formdata?.rojifiId ?? ""),
                sender: (prev.formdata?.sender ?? ""),
                senderWallet: (prev.formdata?.senderWallet ?? ""),
                senderName: (prev.formdata?.senderName ?? ""),
                status: (prev.formdata?.status ?? "pending"),
            } as IPayment,
        }));
    };

    private fetchSwiftDetails = async (swiftCode: string): Promise<void> => {
        try {
            this.setState({ loading: true });
            Defaults.LOGIN_STATUS();;

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/swift/${swiftCode}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': this.sd.client.publicKey,
                    'x-rojifi-deviceid': this.sd.deviceid,
                    Authorization: `Bearer ${this.sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {

                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.sd.client.privateKey, data.handshake);

                console.log("Parsed SWIFT Details:", parseData);

                this.setState({

                });
            }
        } catch (error) {
            console.error("Failed to fetch SWIFT details:", error);
        } finally {
            this.setState({ loading: false });
        }
    };

    private fetchIbanDetails = async (iban: string): Promise<void> => {
        try {
            this.setState({ ibanLoading: true });
            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/iban/${iban}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': this.sd.client.publicKey,
                    'x-rojifi-deviceid': this.sd.deviceid,
                    Authorization: `Bearer ${this.sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.sd.client.privateKey, data.handshake);
                console.log("Parsed IBAN Details:", parseData);

                this.setState({
                    ibanDetails: parseData,
                });
            }
        } catch (error: any) {
            console.error("Failed to fetch IBAN details:", error);
        } finally {
            this.setState({ ibanLoading: false });
        }
    };

    // TODO: Implement transaction submission
    /* private submitTransaction = async (iban: string): Promise<void> => {
        try {
            this.setState({ ibanLoading: true });
            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/init`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': this.sd.client.publicKey,
                    'x-rojifi-deviceid': this.sd.deviceid,
                    Authorization: `Bearer ${this.sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.sd.client.privateKey, data.handshake);
                console.log("Parsed IBAN Details:", parseData);

                this.setState({
                    ibanDetails: parseData,
                });
            }
        } catch (error: any) {
            console.error("Failed to fetch IBAN details:", error);
        } finally {
            this.setState({ ibanLoading: false });
        }
    }; */

    private handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            dragActive: e.type === "dragenter" || e.type === "dragover",
        });
    };

    private handleDrop = (e: React.DragEvent, _field: string) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ dragActive: false });

        const file = e.dataTransfer.files?.[0];
        if (file) {
            this.handleInputChange("invoice", file);
        }
    };

    private handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        _field: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            this.handleInputChange("invoice", file);
        }
    };

    private renderUploadField = ({ fieldKey, label, }: { fieldKey: string; label: string; }) => {
        const { formdata, fileUpload, uploadError } = this.state;
        return (
            <div key={fieldKey} className="w-full">
                <Label className="block text-lg font-bold text-gray-700 mb-2">
                    {label} <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-500">
                    (please attach invoice or any related document that shows the purpose of
                    this payment. Also note that data should match beneficiary details to
                    avoid delays)
                </p>
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${this.state.dragActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-300"
                        }`}
                    onDragEnter={this.handleDrag}
                    onDragLeave={this.handleDrag}
                    onDragOver={this.handleDrag}
                    onDrop={(e) => this.handleDrop(e, fieldKey)}
                    tabIndex={0}
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">
                        Drag & drop or click to choose files
                    </p>
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
                        onChange={(e) => this.handleFileChange(e, fieldKey)}
                        id={`file-upload-${fieldKey}`}
                    />
                    <label
                        htmlFor={`file-upload-${fieldKey}`}
                        className="absolute inset-0 cursor-pointer"
                    />
                </div>
                {this.state.formdata?.paymentInvoice && (
                    <p className="text-sm text-green-600 mt-2">
                        File uploaded: {this.state.formdata.paymentInvoice}
                    </p>
                )}
                {/* per-field states: uploading, selected, uploaded, errors */}
                <div className="mt-3">
                    {fileUpload ? (
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
                    ) : formdata?.paymentInvoice ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-green-600">
                                <Check className="h-4 w-4" />
                                <p className="text-sm font-medium">Uploaded</p>
                            </div>
                            <p className="text-sm text-gray-700 truncate">{(fileUpload as any as File)?.name ?? 'file'}</p>

                            <a
                                href={formdata.paymentInvoice || '#'}
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
                                    this.setState({
                                        fileUpload: null,
                                        uploadError: "",
                                        formdata: {
                                            ...formdata,
                                            paymentInvoice: "",
                                            rojifiId: formdata?.rojifiId ?? "",
                                            sender: formdata?.sender ?? "",
                                            senderWallet: formdata?.senderWallet ?? "",
                                            senderName: formdata?.senderName ?? "",
                                            status: formdata?.status ?? "pending",
                                        } as IPayment
                                    })
                                }}
                                className="ml-2 text-red-500 hover:text-red-600"
                                aria-label={`Remove ${fieldKey}`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : fileUpload ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11" />
                                        <polyline points="17 8 12 3 7 8" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-700">Selected: {(fileUpload as File)?.name}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    this.setState({
                                        fileUpload: null,
                                        uploadError: ""
                                    })
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

                    {uploadError && (
                        <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                    )}
                </div>
            </div >
        );
    }

    // Add a simple validation map and method
    private validators: Record<string, (value: string) => boolean> = {
        beneficiary_name: (value) => /^[A-Za-z\s]+$/.test(value) && value.length > 2,
        // Accepts numbers, English letters, Chinese characters, spaces, comma, period, hyphen
        beneficiary_street_address: (value) =>
            /^[A-Za-z0-9\s,.\-，。－\u4e00-\u9fa5]+$/.test(value) && value.length > 5,
        beneficiary_email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        beneficiary_phone: (value) => /^\d{7,15}$/.test(value),
        beneficiary_amount: (value) => /^\d+(\.\d{1,2})?$/.test(value),
        invoice_id: (value) => /^[A-Za-z0-9_-]+$/.test(value) && value.length > 0,
        // Add more validators as needed
        iban: (value) => /^[A-Za-z0-9]+$/.test(value) && value.length > 15,
        beneficiary_city: (value) => /^[A-Za-z\s]+$/.test(value) && value.length > 2,
        beneficiary_postcode: (value) => /^\d{5}$/.test(value),
        beneficiary_country: (value) => /^[A-Za-z\s]+$/.test(value) && value.length > 2,
        account_number: (value) => /^[A-Za-z0-9]+$/.test(value) && value.length > 5,
        purposeOfPayment: (value) => /^[A-Za-z0-9\s,.\-]+$/.test(value) && value.length > 5,
    };

    private isFieldValid = (fieldKey: string, value: string): boolean => {
        const validator = this.validators[fieldKey];
        return validator ? validator(value) : true;
    };

    private RenderInput = (props: {
        fieldKey: string;
        label: string;
        value: string;
        placeholder?: string;
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        disabled?: boolean;
        readOnly?: boolean;
        type?: React.HTMLInputTypeAttribute;
        Image?: React.ReactNode;
        required?: boolean;
    }) => {
        const {
            fieldKey,
            label,
            value,
            placeholder,
            onChange,
            disabled = false,
            readOnly = false,
            type = "text",
            Image,
            required,
        } = props;

        const isValid = this.isFieldValid(fieldKey, value);

        return (
            <div key={fieldKey} className="w-full">
                <Label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                    <Input
                        id={fieldKey}
                        name={fieldKey}
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        readOnly={readOnly}
                        className={`${Image ? "pl-10" : ""} h-12 ${this.state.focused && !isValid ? "border-2 border-red-500" : ""}`}
                        value={value}
                        onFocus={() => this.setState({ focused: true })}
                        onBlur={() => this.setState({ focused: false })}
                        onChange={(e) => {
                            this.handleInputChange(fieldKey, e.target.value);
                            if (onChange) { onChange(e); }
                        }}
                    />
                    {Image}
                </div>
                {this.state.focused && !isValid && (
                    <span className="text-xs text-red-500">Invalid value</span>
                )}
            </div>
        );
    };

    // RenderPaymentDetails moved to reusable component PaymentDetailsDrawer

    render(): React.ReactNode {
        const { swiftmodal, formdata, loading, paymentDetailsModal, popOpen, wallets, selectedWallet } = this.state;
        // Unused: fileUpload, sender

        return (
            <div className="space-y-6 sm:px-[200px] lg:px-[300px]">
                {/* Overview Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Create New Payment
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Request a new payment for approval.
                        </p>
                    </div>
                </div>

                {/* Currency Selection */}
                <div>
                    <Label
                        htmlFor="currency"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Select Currency <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formdata?.senderCurrency || ""}
                        onValueChange={(value): void => {
                            this.handleInputChange("senderCurrency", value);
                            const selectedWallet: IWallet | undefined = wallets.find(wallet => wallet.currency === value);
                            if (selectedWallet) {
                                this.setState({ selectedWallet });
                            }
                            if (value === Fiat.USD) {
                                this.setSwiftModal(true);
                            }
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Payment Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            {wallets
                                .filter(wallet => wallet.currency !== Fiat.NGN)
                                .map((wallet, index) => (
                                    <SelectItem key={index} value={wallet.currency}>
                                        <div className="flex flex-row items-center gap-2">
                                            <img src={wallet.icon} alt={`${wallet.currency} icon`} className="w-5 h-5 rounded-full" />
                                            {wallet.currency}
                                        </div>
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>

                {formdata?.senderCurrency === "USD" && (
                    <this.RenderInput
                        fieldKey="swiftCode"
                        label="Swift/Routing Code"
                        value={formdata.swiftCode}
                        disabled={true}
                        readOnly={true}
                        type="text"
                        required={true}
                    />
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center w-full mt-80">
                        <Loading />
                    </div>
                )}

                {formdata?.senderCurrency && formdata?.swiftCode && formdata?.swiftCode.length > 7 && !loading && (
                    <div className="flex flex-col items-center gap-4 w-full pb-20">
                        <this.RenderInput
                            fieldKey="destinationCountry"
                            label="Beneficiary's Country"
                            value={formdata.beneficiaryCountry || ""}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            Image={formdata.beneficiaryCountryCode ? (
                                <img
                                    src={`https://flagsapi.com/${formdata.beneficiaryCountryCode}/flat/64.png`}
                                    className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                                />
                            ) : (
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            )}
                        />

                        <this.RenderInput
                            fieldKey="beneficiaryAccountName"
                            label="Bank Name"
                            placeholder="Bank Name"
                            value={formdata.beneficiaryAccountName || ""}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                        />

                        <div className="divide-gray-300 w-full h-[1px] bg-slate-300  "></div>

                        <div className="w-full">
                            <Label
                                htmlFor="sender"
                                className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                            >
                                Create Payment For <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Select
                                    value={formdata.sender}
                                    onValueChange={(value) =>
                                        this.handleInputChange("country", value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Business A (My Sender)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Business A">
                                            Business A (My Sender)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="w-full">
                            <Label
                                htmlFor="sender_name"
                                className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                            >
                                Sender Name <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Select
                                    value={formdata.senderName}
                                    onValueChange={(value) =>
                                        this.handleInputChange("senderName", value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="AntimonyIQ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AntimonyIQ">
                                            AntimonyIQ
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="divide-gray-300 w-full h-[1px] bg-slate-300  "></div>

                        <this.RenderInput
                            fieldKey="currency"
                            label="Wallet (Balance)"
                            placeholder="Wallet Balance"
                            value={Number(selectedWallet?.balance).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                        />

                        <this.RenderInput
                            fieldKey="beneficiaryCountry"
                            label="Beneficiary Country"
                            placeholder="Enter Beneficiary Country"
                            value={formdata.beneficiaryCountry || ""}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            Image={<img
                                src={`https://flagsapi.com/${formdata.beneficiaryCountryCode}/flat/64.png`}
                                className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                            />}
                        />

                        <this.RenderInput
                            fieldKey="beneficiaryAmount"
                            label="Amount"
                            value={formdata.beneficiaryAmount || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                            placeholder="Enter Amount To Send"
                        />

                        <div className="w-full">
                            <Label
                                htmlFor="senaccount_typeder"
                                className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                            >
                                Recipient Account <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Select
                                    value={formdata.beneficiaryAccountType}
                                    onValueChange={(value) =>
                                        this.handleInputChange("beneficiaryAccountType", value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Business" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <this.RenderInput
                            fieldKey="beneficiaryAccountName"
                            label="Beneficiary Name"
                            placeholder="Enter Beneficiary Name"
                            value={formdata.beneficiaryAccountName || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />

                        {this.ibanlist.includes(formdata.beneficiaryCountry || "") ? (
                            <this.RenderInput
                                fieldKey="beneficiaryIban"
                                label="IBAN"
                                placeholder="Enter IBAN"
                                value={formdata.beneficiaryIban || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        ) : (
                            <this.RenderInput
                                fieldKey="beneficiaryAccountNumber"
                                label="Beneficiary Account Number"
                                placeholder="Enter Beneficiary Account Number"
                                value={formdata.beneficiaryAccountNumber || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        )}

                        {formdata.beneficiaryCountryCode === "IN" && (
                            <this.RenderInput
                                fieldKey="beneficiaryIFSC"
                                label="Beneficiary IFSC Code"
                                placeholder="Enter IFSC Code"
                                value={formdata.beneficiaryIFSC || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        )}

                        {["US", "PR", "AS", "GU", "MP", "VI"].includes(formdata.beneficiaryCountryCode || "") && (
                            <this.RenderInput
                                fieldKey="beneficiaryAbaRoutingNumber"
                                label="Beneficiary ABA / Routing number"
                                placeholder="Enter ABA / Routing number"
                                value={formdata.beneficiaryAbaRoutingNumber || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        )}

                        {formdata.beneficiaryCountryCode === "AU" && (
                            <this.RenderInput
                                fieldKey="beneficiaryBankStateBranch"
                                label="Beneficiary Bank-State-Branch (BSB) number"
                                placeholder="Enter Bank-State-Branch (BSB) number"
                                value={formdata.beneficiaryBankStateBranch || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        )}

                        {formdata.beneficiaryCountryCode === "CA" && (
                            <this.RenderInput
                                fieldKey="beneficiaryInstitutionNumber"
                                label="Institution number (Bank code)"
                                placeholder="Enter Institution number (Bank code)"
                                value={formdata.beneficiaryInstitutionNumber || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        )}

                        {formdata.beneficiaryCountryCode === "CA" && (
                            <this.RenderInput
                                fieldKey="beneficiaryTransitNumber"
                                label="Transit number (Branch code)"
                                placeholder="Enter Transit number (Branch code)"
                                value={formdata.beneficiaryTransitNumber || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        )}

                        {formdata.beneficiaryCountryCode === "ZA" && (
                            <this.RenderInput
                                fieldKey="beneficiaryRoutingCode"
                                label="Beneficiary Routing code."
                                placeholder="Enter Routing number"
                                value={formdata.beneficiaryRoutingCode || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <this.RenderInput
                                fieldKey="beneficiaryAddress"
                                label="Beneficiary Address"
                                placeholder="Beneficiary Address"
                                value={formdata.beneficiaryAddress || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />

                            <this.RenderInput
                                fieldKey="beneficiaryCity"
                                label="Beneficiary City"
                                placeholder="Beneficiary City"
                                value={formdata.beneficiaryCity || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <this.RenderInput
                                fieldKey="beneficiaryPostalCode"
                                label="Beneficiary Post code"
                                placeholder="Beneficiary Post code"
                                value={formdata.beneficiaryPostalCode || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                            />

                            <div className="w-full">
                                <Label
                                    htmlFor="beneficiary_country"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Beneficiary Country <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Popover open={popOpen} onOpenChange={() => this.setState({ popOpen: !popOpen })}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox" size="md"
                                                aria-expanded={popOpen}
                                                className="w-full justify-between"
                                            >
                                                {formdata.beneficiaryCountry
                                                    ? this.countries.find((country) => country.name === formdata.beneficiaryCountry)?.name
                                                    : "Select country..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search framework..." />
                                                <CommandList>
                                                    <CommandEmpty>No country found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {this.countries.map((country) => (
                                                            <CommandItem
                                                                key={country.name}
                                                                value={country.name}
                                                                onSelect={(currentValue) => {
                                                                    this.setState({ formdata: { ...formdata, beneficiaryCountry: currentValue } })

                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formdata.beneficiaryCountry === country.name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <img src={`https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                                {country.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>


                        <div className="divide-gray-300 w-full h-[1px] bg-slate-300  "></div>

                        <this.renderUploadField
                            fieldKey="paymentInvoice"
                            label="Attach Invoice"
                        />

                        <div className="w-full">
                            <Label
                                htmlFor="beneficiary_city"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Invoice
                            </Label>
                            <p className="text-sm text-orange-700">
                                (Ensure to use an invoice number that matches the one in the
                                uploaded invoice. Using an incorrect/exhausted invoice number
                                may cause delays in processing your payment)
                            </p>
                        </div>

                        <this.RenderInput
                            fieldKey="paymentInvoiceNumber"
                            label="Invoice Number"
                            placeholder="Invoice Number"
                            value={formdata.paymentInvoiceNumber || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />

                        <div className="w-full">
                            <Label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700 mb-2">
                                Invoice Date <span className="text-red-500">*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        data-empty={!formdata.paymentInvoiceDate}
                                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon />
                                        {formdata.paymentInvoiceDate ? format(formdata.paymentInvoiceDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={formdata.paymentInvoiceDate} onSelect={(date) => {
                                        this.setState((prev) => ({
                                            formdata: {
                                                ...prev.formdata,
                                                paymentInvoiceDate: date || new Date(),
                                            } as IPayment
                                        }));
                                    }} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <this.RenderInput
                            fieldKey="purposeOfPayment"
                            label="Purpose of Payment"
                            placeholder="State Purpose of Payment"
                            value={formdata.purposeOfPayment || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />

                        <div className="w-full flex flex-row items-center justify-between gap-2">
                            <Link
                                href="/dashboard/NGN"
                                className="text-primary hover:underline border-[2px] border-primary rounded-md px-4 py-2 inline-block text-center w-full"
                            >
                                Cancel
                            </Link>
                            <Button
                                className="text-white w-full"
                                variant="default"
                                size="lg"
                                onClick={(): void => this.setState({ paymentDetailsModal: true })}
                            >
                                Create Payment
                            </Button>
                        </div>
                    </div>
                )}

                <SwiftOrRouting
                    open={swiftmodal}
                    onOpenChange={this.setSwiftModal}
                    formdata={formdata as IPayment}
                    onChange={(field, value): void =>
                        this.handleInputChange(field, value)
                    }
                />

                {paymentDetailsModal && (
                    <PaymentDetailsDrawer
                        open={paymentDetailsModal}
                        onClose={() => this.setState({ paymentDetailsModal: false })}
                        onEdit={() => this.setState({ paymentDetailsModal: true })}
                        details={{
                            ...formdata as IPayment,
                        }}
                    />
                )}
            </div>
        );
    }
}
