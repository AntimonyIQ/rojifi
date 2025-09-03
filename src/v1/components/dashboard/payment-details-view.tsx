
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { UserCircle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/v1/components/ui/sheet"
import FilePreviewModal from "./file-preview-modal"
import { IPayment, IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"

export interface TransactionFee {
    amount: string
    currency: string
}

export interface PaymentDetailsProps {
    open: boolean
    onClose: () => void
    onEdit?: () => void
    details: IPayment
}

export default function PaymentDetailsDrawer({ open, onClose, onEdit, details }: PaymentDetailsProps) {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewName, setPreviewName] = useState<string | null>(null)
    const [user, setUser] = useState<IUser | null>(null)
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd && sd.user) {
            setUser(sd.user);
        }
    }, [sd]);

    const formatCurrency = (amount: string | undefined) => {
        const cleanedAmount = amount?.replace(/,/g, '') ?? "0";
        const numAmount = Number.parseFloat(cleanedAmount);
        return `${numAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const openPreview = (url?: string | null, name?: string | null) => {
        if (!url) return
        setPreviewUrl(url)
        setPreviewName(name ?? url?.split('/')?.pop() ?? 'attachment')
        setPreviewOpen(true)
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
            <SheetContent side="right" className="w-full sm:max-w-full p-0">
                <div className="p-5 h-full flex flex-col">
                    <SheetHeader className="mb-2 flex items-start justify-between w-full p-0">
                        <SheetTitle className="text-lg font-semibold">Payment Summary</SheetTitle>
                    </SheetHeader>

                    <p className="text-sm text-slate-500 mb-4">Please review the payment details below before submitting your request.</p>
                    <div className="mt-0 px-80 flex flex-col items-start gap-2 w-full overflow-y-auto">
                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">Transaction Amount</span>
                            <span className="text-gray-900 font-medium text-lg">{formatCurrency(details.beneficiaryAmount) ?? "N/A"} {details.senderCurrency}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                                <span className="text-gray-500 uppercase text-xs">wallet</span>
                                <div className="flex flex-row items-center justify-start gap-2">
                                    <img src="https://img.icons8.com/color/50/usa-circular.png" alt="" className="w-5 h-5 rounded-full" />
                                    <span className="text-gray-900 font-medium text-sm">{details.senderCurrency}</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                                <span className="text-gray-500 uppercase text-xs">USD BALANCE</span>
                                <span className="text-gray-900 font-medium text-sm">{formatCurrency(details.beneficiaryAmount)} {details.senderCurrency}</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Sender:</span>
                            <span className="text-gray-900 font-medium text-sm">{user?.fullName}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Beneficiary's Account Name:</span>
                            <span className="text-gray-900 font-medium text-sm">{details.beneficiaryAccountName}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Beneficiary's Account Number:</span>
                            <span className="text-gray-900 font-medium text-sm">{details.beneficiaryAccountNumber}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Beneficiary's Country:</span>
                            <div className="flex flex-row items-center justify-start gap-2">
                                <img src="https://img.icons8.com/color/50/usa-circular.png" alt="" className="w-5 h-5 rounded-full" />
                                <span className="text-gray-900 font-medium text-sm">{details.beneficiaryCountry}</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Beneficiary's Address:</span>
                            <span className="text-gray-900 font-medium text-sm">{details.beneficiaryAddress}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">SWIFT Code / Routing Number:</span>
                            <span className="text-gray-900 font-medium text-sm">{details.swiftCode}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Bank Name:</span>
                            <span className="text-gray-900 font-medium text-sm">{details.beneficiaryBankName}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Bank Address:</span>
                            <span className="text-gray-900 font-medium text-sm">{details.beneficiaryBankAddress}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">Attachment:</span>
                            <div className="w-full flex flex-row items-center justify-between border-2 border-dashed border-blue-500 rounded-md px-4">
                                <span className="text-gray-900 font-medium text-sm max-w-[140px] truncate" title={details.paymentInvoice}>
                                    {details.paymentInvoice}
                                </span>
                                <Button variant="link" onClick={() => openPreview(details.paymentInvoice, details.paymentInvoice)}>
                                    View
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Invoice Number:</span>
                            <span className="text-gray-900 font-medium text-sm">{details?.paymentInvoiceNumber ?? "N/A"}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Invoice Date:</span>
                            <span className="text-gray-900 font-medium text-sm">{details?.paymentInvoiceDate.toDateString() ?? "N/A"}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Purpose of Payment:</span>
                            <span className="text-gray-900 font-medium text-sm">{details?.purposeOfPayment ?? "N/A"}</span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100">
                            <span className="text-gray-500 uppercase text-xs">Created By:</span>
                            <div className="flex items-center gap-1">
                                <UserCircle size={18} />
                                <span className="text-gray-900 font-medium text-sm">{details?.createdAt.toDateString() ?? "N/A"}</span>
                            </div>
                        </div>


                    </div>

                    <SheetFooter className="mt-4 bg-white p-4 sticky bottom-0 left-0 right-0 border-t">
                        <div className="w-full flex items-center justify-end gap-2">
                            <Button variant="outline" onClick={() => onEdit && onEdit()}>Edit</Button>
                            <Button onClick={onClose} className="text-white">Confirm</Button>
                        </div>
                    </SheetFooter>
                </div>
            </SheetContent>

            <FilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} fileUrl={previewUrl ?? undefined} fileName={previewName ?? undefined} />
        </Sheet>
    )
}
