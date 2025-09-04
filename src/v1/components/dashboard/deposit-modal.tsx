import { useState, useEffect } from "react"
import { X, Copy, Check, Info } from "lucide-react"
import { Button } from "@/v1/components/ui/button"
import { useToast } from "@/v1/components/ui/use-toast"

interface DepositModalProps {
    isOpen: boolean
    onClose: () => void
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [virtualAccount, _setVirtualAccount] = useState<any | null>(null)
    const [loading, _setLoading] = useState<boolean>(false)
    const [error, _setError] = useState<string | null>(null)
    const { success, error: toastError } = useToast()

    // Fetch virtual account when modal opens
    useEffect(() => {
        if (isOpen) {

        }
    }, [isOpen])

    if (!isOpen) return null

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            success("Copied to Clipboard", `${field === "all" ? "All details" : field} copied successfully`)
            setTimeout(() => setCopiedField(null), 2000)
        } catch (err) {
            console.error("Failed to copy text: ", err)
            toastError("Copy Failed", "Could not copy to clipboard")
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Fund Your Wallet Via Bank Transfer</h2>
                        <p className="text-gray-600 mt-2">Deposit funds into the designated bank account.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-6">
                            <p className="text-gray-600">Loading account details...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-6 text-red-600">
                            <p>{error}</p>
                        </div>
                    ) : virtualAccount ? (
                        <>
                            {/* Account Details */}
                            <div className="border border-gray-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Details</h3>

                                <div className="space-y-6">
                                    {/* Account Name */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 font-medium">Account name</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 font-medium">{virtualAccount.accountName}</span>
                                            <button
                                                onClick={() => copyToClipboard(virtualAccount.accountName, "Account Name")}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                {copiedField === "Account Name" ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account Number */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 font-medium">Account number</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 font-medium font-mono">{virtualAccount.accountNumber}</span>
                                            <button
                                                onClick={() => copyToClipboard(virtualAccount.accountNumber, "Account Number")}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                {copiedField === "Account Number" ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bank Name */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 font-medium">Bank name</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 font-medium">{virtualAccount.bankName}</span>
                                            <button
                                                onClick={() => copyToClipboard(virtualAccount.bankName, "Bank Name")}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                {copiedField === "Bank Name" ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Information */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium">Transaction Fee Notice</p>
                                    <p className="mt-1">A 3% processing fee will be deducted from your deposit amount.</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() =>
                                        copyToClipboard(
                                            `Account Name: ${virtualAccount.accountName}\nAccount Number: ${virtualAccount.accountNumber}\nBank: ${virtualAccount.bankName}`,
                                            "all"
                                        )
                                    }
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {copiedField === "all" ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied All Details
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy All Details
                                        </>
                                    )}
                                </Button>
                                <Button onClick={onClose} className="flex-1 text-white bg-primary hover:bg-primary/90">
                                    Done
                                </Button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    )
}