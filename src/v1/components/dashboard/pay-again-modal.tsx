"use client"

import React, { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/v1/components/ui/sheet"
import { Button } from "../ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Country, ICountry } from "country-state-city";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Plus } from "lucide-react"
import PaymentDetailsDrawer from "./payment-details-view"
import { IPayment } from "@/v1/interface/interface"

export interface PayAgainModalProps {
    open: boolean
    onClose: () => void
    transaction?: IPayment | null
    onSubmit?: (payload: any) => void
}

export function PayAgainModal({ open, onClose, transaction, onSubmit }: PayAgainModalProps) {
    // amountRaw stores unformatted numeric string (e.g. "1000.50").
    const [paymentDetailsModal, setPaymentDetailsModal] = useState(false);
    const [loading, _setLoading] = useState(false);
    const [amountRaw, _setAmountRaw] = useState('')
    const [amountDisplay, setAmountDisplay] = useState('')
    const [wallet, _setWallet] = useState('')
    const [beneficiaryName, setBeneficiaryName] = useState('')
    const [beneficiaryAccount, _setBeneficiaryAccount] = useState('')
    const [beneficiaryStreetAddress, setBeneficiaryStreetAddress] = useState('')
    const [beneficiaryCity, setBeneficiaryCity] = useState('')
    const [beneficiaryPostCode, setBeneficiaryPostCode] = useState('')
    const [beneficiaryCountry, setBeneficiaryCountry] = useState('')
    const [bankName, setBankName] = useState('')
    const [swift, setSwift] = useState('')
    const [purpose, setPurpose] = useState('')
    const [invoiceNumber, setInvoiceNumber] = useState('')
    const [senderName, setSenderName] = useState('');
    const [sender, setSender] = useState('');
    const [balance, setBalance] = useState('0.00');
    const [swiftCountry, setSwiftCountry] = useState('USD');
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');

    const countries: Array<ICountry> = Country.getAllCountries();


    useEffect(() => {
        if (!open) return
        // setSender(transaction?.sender ?? '')
    }, [open, transaction])

    // TODO: Implement amount change handler
    // function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     let v = e.target.value
    //     // strip anything except digits and dot
    //     v = v.replace(/[^0-9.]/g, '')
    //     // allow only one dot
    //     const firstDot = v.indexOf('.')
    //     if (firstDot !== -1) {
    //         v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '')
    //     }
    //     // update raw and formatted display
    //     setAmountRaw(v)
    //     setAmountDisplay(formatWithCommas(v))
    // }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            // use unformatted raw amount for backend
            amount: amountRaw,
            wallet,
            beneficiaryName,
            beneficiaryAccount,
            bankName,
            swift,
            purpose,
            invoiceNumber,
            originalTransactionId: transaction?._id || (transaction as any)?.id,
        }
        console.log('Pay again payload:', payload)
        if (onSubmit) onSubmit(payload)
        onClose()
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    }

    const handleDrop = (e: React.DragEvent, _field: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            // handleInputChange("invoice", file);
            setFile(file);
            setFileName(file.name);
        }
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        _field: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            setFileName(file.name);
        }
    };

    const RenderInput = (props: {
        fieldKey: string;
        label: string;
        value: string;
        placeholder?: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
                        className={`${Image ? "pl-10" : ""} h-12`}
                        value={value}
                        onChange={onChange}
                    />
                    {Image}
                </div>
            </div>
        );
    };

    const renderUploadField = (fieldKey: string, label: string) => (
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
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, fieldKey)}
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
                    onChange={(e) => handleFileChange(e, fieldKey)}
                    id={`file-upload-${fieldKey}`}
                />
                <label
                    htmlFor={`file-upload-${fieldKey}`}
                    className="absolute inset-0 cursor-pointer"
                />
            </div>
            {file && (
                <p className="text-sm text-green-600 mt-2">
                    File uploaded: {fileName}
                </p>
            )}
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
            <SheetContent side="right" className="w-full sm:max-w-full p-0">
                <div className="p-5 h-full flex flex-col">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-lg font-semibold">Pay Again</SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 flex-1 mx-80 px-3 overflow-y-auto">
                        <RenderInput
                            fieldKey="swiftcode"
                            label="Swift/Routing Code"
                            value={swift}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                setSwift(e.target.value);
                            }}
                        />

                        <RenderInput
                            fieldKey="destinationCountry"
                            label="Beneficiary's Country"
                            value={wallet}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            Image={<img
                                src={`https://img.icons8.com/color/50/usa-circular.png`}
                                className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                            />}
                            onChange={(_e: React.ChangeEvent<HTMLInputElement>): void => { }}
                        />

                        <RenderInput
                            fieldKey="bankName"
                            label="Beneficiary's Bank"
                            value={bankName}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                setBankName(e.target.value);
                            }}
                        />

                        <div className="divide-gray-300 w-full h-[1px] bg-slate-100  "></div>

                        <div className="w-full">
                            <Label
                                htmlFor="sender"
                                className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                            >
                                Create Payment For <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Select
                                    value={sender}
                                    onValueChange={(value) => {
                                        setSender(value);
                                    }}
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

                        <RenderInput
                            fieldKey="senderName"
                            label="Senders's Name"
                            value={senderName}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                setSenderName(e.target.value);
                            }}
                        />

                        <div className="divide-gray-300 w-full h-[1px] bg-slate-100  "></div>

                        <RenderInput
                            fieldKey="currency"
                            label="Wallet (Balance)"
                            placeholder="Wallet Balance"
                            value={Number(balance).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                setBalance(e.target.value);
                            }}
                        />

                        <RenderInput
                            fieldKey="beneficiary_currency"
                            label="Beneficiary Currency"
                            placeholder="Enter Beneficiary Currency"
                            value={swiftCountry || ""}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            Image={<img
                                src={`https://img.icons8.com/color/50/usa-circular.png`}
                                className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                            />}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                setSwiftCountry(e.target.value);
                            }}
                        />

                        <RenderInput
                            fieldKey="amountDisplay"
                            label="Amount"
                            value={amountDisplay || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                            placeholder="Enter Amount To Send"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                setAmountDisplay(e.target.value);
                            }}
                        />

                        <RenderInput
                            fieldKey="beneficiaryName"
                            label="Beneficiary Name"
                            placeholder="Enter Beneficiary Name"
                            value={beneficiaryName || ""}
                            disabled={true}
                            readOnly={true}
                            type="text"
                            required={true}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                setBeneficiaryName(e.target.value);
                            }}
                        />

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <RenderInput
                                fieldKey="beneficiary_street_address"
                                label="Beneficiary Address"
                                placeholder="Beneficiary Address"
                                value={beneficiaryStreetAddress || ""}
                                disabled={true}
                                readOnly={true}
                                type="text"
                                required={true}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                    setBeneficiaryStreetAddress(e.target.value);
                                }}
                            />

                            <RenderInput
                                fieldKey="beneficiary_city"
                                label="Beneficiary City"
                                placeholder="Beneficiary City"
                                value={beneficiaryCity || ""}
                                disabled={true}
                                readOnly={true}
                                type="text"
                                required={true}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                    setBeneficiaryCity(e.target.value);
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <RenderInput
                                fieldKey="beneficiary_postcode"
                                label="Beneficiary Post code"
                                placeholder="Beneficiary Post code"
                                value={beneficiaryPostCode || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                    setBeneficiaryPostCode(e.target.value);
                                }}
                            />

                            <div className="w-full">
                                <Label
                                    htmlFor="beneficiary_country"
                                    className="block text-sm font-medium text-gray-700 mb-2">
                                    Beneficiary Country <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Select
                                        value={beneficiaryCountry}
                                        onValueChange={(value) => setBeneficiaryCountry(value)}
                                    >
                                        <SelectTrigger className="w-full flex flex-row items-center gap-2">
                                            <SelectValue
                                                className="flex flex-row items-center gap-2"
                                                placeholder="Select Beneficiary Country"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country, index) => (
                                                <SelectItem key={index} value={country.name}>
                                                    <div className="flex flex-row items-center gap-2 w-full">
                                                        <img
                                                            src={`https://flagsapi.com/${country.isoCode}/flat/64.png`}
                                                            className="rounded-full h-5 w-5"
                                                            style={{ position: "static" }}
                                                        />
                                                        {/* Use a non-breaking space for extra gap if needed */}
                                                        &nbsp;&nbsp;
                                                        {country.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {renderUploadField("invoice", "Attach Invoice")}

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

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <RenderInput
                                fieldKey="invoice_id"
                                label="Invoice Number"
                                placeholder="Invoice Number"
                                value={invoiceNumber || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                            />

                            <RenderInput
                                fieldKey="invoice_date"
                                label="Invoice Date"
                                placeholder="Invoice Date"
                                value={invoiceDate || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="date"
                                required={true}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                            />
                        </div>

                        <RenderInput
                            fieldKey="purposeOfPayment"
                            label="Purpose of Payment"
                            placeholder="State Purpose of Payment"
                            value={purpose || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                            onChange={(e) => setPurpose(e.target.value)}
                        />

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" className="text-white" onClick={(): void => setPaymentDetailsModal(true)}>Submit Payment</Button>
                        </div>
                    </form>
                </div>
            </SheetContent>
            {paymentDetailsModal && (
                <PaymentDetailsDrawer
                    open={paymentDetailsModal}
                    onClose={() => setPaymentDetailsModal(false)}
                    onEdit={() => setPaymentDetailsModal(true)}
                    details={{} as any}
                />
            )}
        </Sheet>
    )
}

export default PayAgainModal
