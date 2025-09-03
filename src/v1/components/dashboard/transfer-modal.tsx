"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { X, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { fetchTransferBanks, initiateTransfer, verifyInternationalAccount } from "@/services/bank.service"
import { WalletService } from "@/services/wallet.service"
import { Bank } from "@/types/bank.type"
import { Wallet } from "@/types/wallet.type"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
}

const currencyFlags: { [key: string]: string } = {
  NGN: "🇳🇬",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  KES: "🇰🇪",
  GHS: "🇬🇭",
  ZAR: "🇿🇦",
  UGX: "🇺🇬",
  CAD: "🇨🇦",
  XAF: "🇨🇲",
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const [step, setStep] = useState<"transfer" | "confirmation" | "processing" | "success">("transfer")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("")
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [formData, setFormData] = useState({
    achCode: "",
    receiptUrl: "",
    bankCode: "",
    sortCode: "",
    accountNumber: "",
    iban: "",
    selectedBank: "",
    bankCodeForTransfer: "",
    beneficiaryName: "",
    narration: "",
    amount: "",
    transactionPin: "",
  })
  const [transferError, setTransferError] = useState<string | null>(null)
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [isLoadingWallets, setIsLoadingWallets] = useState(false)
  const [isVerifyingBeneficiary, setIsVerifyingBeneficiary] = useState(false)
  const { toast } = useToast()
  const walletService = new WalletService()

  // Fetch wallets on component mount
  useEffect(() => {
    setIsLoadingWallets(true)
    walletService.getAllWallets()
      .then((response) => {
        setWallets(response.data)
        if (response.data.length > 0) {
          setSelectedCurrency(response.data[0].currency.code)
        }
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch wallets",
        })
      })
      .finally(() => setIsLoadingWallets(false))
  }, [])

  // Fetch banks when currency changes for African currencies
  useEffect(() => {
    if (["NGN", "KES", "GHS", "ZAR", "UGX", "XAF"].includes(selectedCurrency)) {
      setIsLoadingBanks(true)
      const currencyId = wallets.find((w) => w.currency.code === selectedCurrency)?.currency.id
      if (currencyId) {
        fetchTransferBanks(currencyId)
          .then((bankList) => {
            setBanks(bankList)
            setFormData((prev) => ({ ...prev, selectedBank: "", bankCodeForTransfer: "", beneficiaryName: "", iban: "" }))
          })
          .catch((error) => {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to fetch banks",
            })
          })
          .finally(() => setIsLoadingBanks(false))
      } else {
        setBanks([])
        setIsLoadingBanks(false)
      }
    } else {
      setBanks([])
      setFormData((prev) => ({ ...prev, selectedBank: "", bankCodeForTransfer: "", beneficiaryName: "", iban: "" }))
    }
  }, [selectedCurrency, wallets])

  // Verify beneficiary name for all currencies
  useEffect(() => {
    let isMounted = true
    const verifyBeneficiary = async () => {
      if (!formData.accountNumber || formData.accountNumber.length < 8) {
        if (isMounted) setFormData((prev) => ({ ...prev, beneficiaryName: "" }))
        return
      }

      setIsVerifyingBeneficiary(true)
      try {
        let beneficiaryName = ""
        let bankCode = ""
        const currencyId = wallets.find((w) => w.currency.code === selectedCurrency)?.currency.id
        if (!currencyId) {
          throw new Error("Selected currency not found")
        }

        if (["USD"].includes(selectedCurrency)) {
          bankCode = formData.bankCode
        } else if (["EUR", "GBP", "CAD"].includes(selectedCurrency)) {
          bankCode = formData.sortCode
        } else if (["NGN", "KES", "GHS", "ZAR", "UGX", "XAF"].includes(selectedCurrency)) {
          bankCode = formData.bankCodeForTransfer
        }

        if (bankCode) {
          const iban = ["EUR", "GBP", "CAD"].includes(selectedCurrency) ? formData.iban : undefined
          beneficiaryName = await verifyInternationalAccount(bankCode, formData.accountNumber, currencyId, iban)
        }

        if (isMounted) {
          setFormData((prev) => ({ ...prev, beneficiaryName }))
        }
      } catch (error: any) {
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: error.message || "Failed to verify beneficiary name",
          })
          setFormData((prev) => ({ ...prev, beneficiaryName: "" }))
        }
      } finally {
        if (isMounted) setIsVerifyingBeneficiary(false)
      }
    }

    verifyBeneficiary()
    return () => { isMounted = false }
  }, [formData.accountNumber, formData.bankCode, formData.sortCode, formData.bankCodeForTransfer, formData.iban, selectedCurrency, wallets])

  const formatAmount = (value: string) => {
    const number = value.replace(/,/g, "")
    if (isNaN(Number(number))) return value
    return Number(number).toLocaleString()
  }

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value)
    setFormData((prev) => ({ ...prev, amount: formatted }))
  }, [])

  const getNumericAmount = useCallback(() => {
    return Number(formData.amount.replace(/,/g, "")) || 0
  }, [formData.amount])

  const parseBalance = (formattedBalance: string): number => {
    const cleanBalance = formattedBalance.replace(/[^0-9.]/g, "")
    return Number(cleanBalance) || 0
  }

  const getWalletBalance = useCallback((currencyCode: string): { numeric: number; formatted: string } => {
    const wallet = wallets.find((w) => w.currency.code === currencyCode)
    return {
      numeric: wallet ? parseBalance(wallet.formatted_balance) : 0,
      formatted: wallet?.formatted_balance || "0.00",
    }
  }, [wallets])

  // Memoize insufficient balance check to avoid unnecessary toast calls
  const hasInsufficientBalance = useMemo(() => {
    const amount = getNumericAmount()
    const balance = getWalletBalance(selectedCurrency).numeric
    return amount > balance
  }, [getNumericAmount, getWalletBalance, selectedCurrency])

  // Handle insufficient balance toast in an effect
  useEffect(() => {
    if (hasInsufficientBalance && getNumericAmount() > 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCurrency} in your wallet`,
      })
    }
  }, [hasInsufficientBalance, selectedCurrency, getNumericAmount, toast])

  const resetForm = useCallback(() => {
    setStep("transfer")
    setSelectedCurrency(wallets[0]?.currency.code || "")
    setBanks([])
    setFormData({
      achCode: "",
      receiptUrl: "",
      bankCode: "",
      sortCode: "",
      accountNumber: "",
      iban: "",
      selectedBank: "",
      bankCodeForTransfer: "",
      beneficiaryName: "",
      narration: "",
      amount: "",
      transactionPin: "",
    })
    setTransferError(null)
  }, [wallets])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const isFormValid = useCallback(() => {
    if (!formData.amount || getNumericAmount() <= 0 || hasInsufficientBalance) return false

    switch (selectedCurrency) {
      case "USD":
        return formData.achCode && formData.receiptUrl && formData.bankCode && formData.accountNumber && formData.beneficiaryName
      case "EUR":
      case "GBP":
      case "CAD":
        return formData.sortCode && formData.accountNumber && formData.iban && formData.beneficiaryName
      case "NGN":
      case "KES":
      case "GHS":
      case "ZAR":
      case "UGX":
      case "XAF":
        return formData.selectedBank && formData.accountNumber && formData.beneficiaryName
      default:
        return false
    }
  }, [formData, getNumericAmount, hasInsufficientBalance, selectedCurrency])

  const handleConfirm = useCallback(async () => {
    if (formData.transactionPin.length !== 4) {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Please enter a valid 4-digit PIN",
      })
      return
    }

    setStep("processing")
    try {
      const currencyId = wallets.find((w) => w.currency.code === selectedCurrency)?.currency.id
      if (!currencyId) {
        throw new Error("Selected currency not found")
      }

      const transferPayload: any = {
        amount: getNumericAmount(),
        currency: currencyId,
        pin: formData.transactionPin,
        narration: formData.narration || "Transfer from wallet",
        account_number: formData.accountNumber,
        bank_code: ["USD"].includes(selectedCurrency)
          ? formData.bankCode
          : ["EUR", "GBP", "CAD"].includes(selectedCurrency)
          ? formData.sortCode
          : formData.bankCodeForTransfer,
        beneficiary_name: formData.beneficiaryName,
        bank_name: formData.selectedBank || "",
      }

    if (["EUR", "GBP", "CAD"].includes(selectedCurrency)) {
        transferPayload.iban = formData.iban
      }

      await initiateTransfer(transferPayload)
      setStep("success")
      toast({
        title: "Transfer Successful 🎉",
        description: `Your transfer of ${formData.amount} ${selectedCurrency} has been processed successfully.`,
      })

      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (error: any) {
      setStep("confirmation")
      setTransferError(error.message || "An error occurred while processing your transfer")
    }
  }, [formData, selectedCurrency, wallets, getNumericAmount, handleClose, toast])

  // Memoize the bank selection handler
  const handleBankSelect = useCallback((value: string) => {
    const selectedBank = banks.find((bank) => bank.bank_name === value)
    setFormData((prev) => ({
      ...prev,
      selectedBank: value,
      bankCodeForTransfer: selectedBank?.bank_code || "",
    }))
  }, [banks])

  // Render currency-specific fields
  const renderCurrencySpecificFields = useCallback(() => {
    switch (selectedCurrency) {
      case "USD":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="achCode">ACH Code</Label>
              <Input
                id="achCode"
                placeholder="Enter ACH routing number"
                value={formData.achCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, achCode: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptUrl">Receipt URL</Label>
              <Input
                id="receiptUrl"
                placeholder="Enter receipt URL for transaction reason"
                value={formData.receiptUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, receiptUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankCode">Bank Code</Label>
              <Input
                id="bankCode"
                placeholder="Enter bank SWIFT/routing code"
                value={formData.bankCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankCode: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter recipient account number"
                value={formData.accountNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                disabled={isVerifyingBeneficiary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
              <Input
                id="beneficiaryName"
                value={formData.beneficiaryName}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
                placeholder={isVerifyingBeneficiary ? "Verifying..." : "Name will appear after entering account details"}
              />
            </div>
          </>
        )

      case "EUR":
      case "GBP":
      case "CAD":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="sortCode">Sort Code</Label>
              <Input
                id="sortCode"
                placeholder="Enter sort code"
                value={formData.sortCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortCode: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                placeholder="Enter IBAN (e.g., GB21CLJU04130768223896)"
                value={formData.iban}
                onChange={(e) => setFormData((prev) => ({ ...prev, iban: e.target.value }))}
                disabled={isVerifyingBeneficiary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter recipient account number"
                value={formData.accountNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                disabled={isVerifyingBeneficiary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
              <Input
                id="beneficiaryName"
                value={formData.beneficiaryName}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
                placeholder={isVerifyingBeneficiary ? "Verifying..." : "Name will appear after entering account details"}
              />
            </div>
          </>
        )

      case "NGN":
      case "KES":
      case "GHS":
      case "ZAR":
      case "UGX":
      case "XAF":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="bank">Select Bank</Label>
              <Select
                value={formData.selectedBank}
                onValueChange={handleBankSelect}
                disabled={isLoadingBanks || banks.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingBanks ? "Loading banks..." : "Choose a bank"} />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.bank_name} value={bank.bank_name}>
                      {bank.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter recipient account number"
                value={formData.accountNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                disabled={isVerifyingBeneficiary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
              <Input
                id="beneficiaryName"
                value={formData.beneficiaryName}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
                placeholder={isVerifyingBeneficiary ? "Verifying..." : "Name will appear after entering account details"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="narration">Narration (Optional)</Label>
              <Textarea
                id="narration"
                placeholder="Enter transaction description (optional)"
                value={formData.narration}
                onChange={(e) => setFormData((prev) => ({ ...prev, narration: e.target.value }))}
                rows={3}
              />
            </div>
          </>
        )

      default:
        return null
    }
  }, [selectedCurrency, formData, banks, isLoadingBanks, isVerifyingBeneficiary, handleBankSelect])

  // Define handleContinue before the early return
  const handleContinue = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    if (!isFormValid()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill all required fields correctly before continuing.",
      })
      return
    }
    setStep("confirmation")
  }, [isFormValid, toast])

  // Early return after all hooks
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-y-auto">
        {step === "transfer" && (
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Transfer Funds</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Select Currency</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                  disabled={isLoadingWallets || wallets.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingWallets ? "Loading currencies..." : "Select a currency"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.currency.id} value={wallet.currency.code}>
                        <div className="flex items-center gap-2">
                          <span>{currencyFlags[wallet.currency.code] || ''}</span>
                          <span>{wallet.currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderCurrencySpecificFields()}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Transfer</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className={hasInsufficientBalance ? "border-red-300 focus:border-red-500" : ""}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {selectedCurrency}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Available: {currencyFlags[selectedCurrency] || ''} {getWalletBalance(selectedCurrency).formatted}{' '}
                    {selectedCurrency}
                  </span>
                  {hasInsufficientBalance && <span className="text-red-500 font-medium">Insufficient balance</span>}
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!isFormValid() || isVerifyingBeneficiary}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "confirmation" && (
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep("transfer")} className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold">Confirm Transfer</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Transfer Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">
                      {currencyFlags[selectedCurrency] || ''} {selectedCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {formData.amount} {selectedCurrency}
                    </span>
                  </div>

                  {selectedCurrency === "USD" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ACH Code:</span>
                        <span className="font-medium">{formData.achCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Code:</span>
                        <span className="font-medium">{formData.bankCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium">{formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Beneficiary:</span>
                        <span className="font-medium">{formData.beneficiaryName}</span>
                      </div>
                    </>
                  )}

                  {["EUR", "GBP", "CAD"].includes(selectedCurrency) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sort Code:</span>
                        <span className="font-medium">{formData.sortCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IBAN:</span>
                        <span className="font-medium">{formData.iban}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium">{formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Beneficiary:</span>
                        <span className="font-medium">{formData.beneficiaryName}</span>
                      </div>
                    </>
                  )}

                  {["NGN", "KES", "GHS", "ZAR", "UGX", "XAF"].includes(selectedCurrency) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{formData.selectedBank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium">{formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Beneficiary:</span>
                        <span className="font-medium">{formData.beneficiaryName}</span>
                      </div>
                      {formData.narration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Narration:</span>
                          <span className="font-medium">{formData.narration}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">Transaction PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  value={formData.transactionPin}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, transactionPin: e.target.value.replace(/\D/g, "") }))
                  }
                />
              </div>

              {transferError && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-red-500 text-lg font-medium text-center">
                    {transferError}
                  </div>
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={formData.transactionPin.length !== 4}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Complete Transfer
              </Button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Transfer</h3>
            <p className="text-gray-600">Please wait while we process your transfer...</p>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Transfer Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your transfer of {formData.amount} {selectedCurrency} has been processed successfully.
            </p>
            <p className="text-sm text-gray-500">The funds will be credited within 1-3 business days.</p>
          </div>
        )}
      </div>
    </div>
  )
}