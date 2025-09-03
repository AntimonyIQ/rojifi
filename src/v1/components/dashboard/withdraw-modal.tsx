"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { WalletService } from "@/services/wallet.service";
import { fetchBankAccounts, addBankAccount, fetchBanks, verifyBankAccount } from "@/services/bank.service";
import type { BankAccount, Bank } from "@/types/bank.type";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencies = [
  { code: "NGN", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "KES", flag: "🇰🇪", name: "Kenyan Shilling" },
  { code: "GHC", flag: "🇬🇭", name: "Ghana Cedi" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
];

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const walletService = new WalletService();

  // State variables
  const [step, setStep] = useState<"withdraw" | "add-account" | "authorize" | "loading" | "success">("withdraw");
  const [bankAccountCurrency, setBankAccountCurrency] = useState("NGN");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [newAccountData, setNewAccountData] = useState({
    selectedBank: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ngnBalance, setNgnBalance] = useState("₦0");
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

  // Fetch bank accounts, banks, and NGN wallet balance on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const accounts = await fetchBankAccounts();
        setBankAccounts(accounts);
        const bankList = await fetchBanks();
        setBanks(bankList);
        const wallets = await walletService.getAllWallets();
        const ngnWallet = wallets.data.find((wallet) => wallet.currency.code === "NGN");
        setNgnBalance(ngnWallet?.formatted_balance || "₦0");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load data",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  const handleAccountNumberChange = async (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    setNewAccountData((prev) => ({
      ...prev,
      accountNumber: numericValue,
      accountName: numericValue.length < 10 ? "" : prev.accountName, // Reset accountName if incomplete
    }));

    if (numericValue.length === 10 && newAccountData.bankCode) {
      setIsVerifyingAccount(true);
      try {
        const accountName = await verifyBankAccount(newAccountData.bankCode, numericValue);
        setNewAccountData((prev) => ({
          ...prev,
          accountName,
        }));
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to verify account name",
        });
        setNewAccountData((prev) => ({
          ...prev,
          accountName: "",
        }));
      } finally {
        setIsVerifyingAccount(false);
      }
    }
  };

  const handleBankChange = (bankName: string) => {
    const selectedBank = banks.find((bank) => bank.bank_name === bankName);
    setNewAccountData((prev) => ({
      ...prev,
      selectedBank: bankName,
      bankCode: selectedBank?.bank_code || "",
      accountName: "", // Reset accountName when bank changes
    }));
  };

  const handleContinue = () => {
    if (selectedAccount && amount) {
      setStep("authorize");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a bank account and enter an amount",
      });
    }
  };

  const handleCompleteWithdrawal = async () => {
    if (transactionPin.length !== 4) {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Please enter a valid 4-digit PIN",
      });
      return;
    }

    setStep("loading");
    try {
      const numericAmount = parseFloat(amount.replace(/,/g, ""));
      await walletService.initiateWithdrawal(numericAmount, transactionPin, selectedAccount);
      setStep("success");
      toast({
        title: "Withdrawal Successful",
        description: `Your withdrawal of ₦${amount} has been processed`,
      });
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error: any) {
      setStep("authorize");
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: error.message || "An error occurred during withdrawal",
      });
    }
  };

  const handleClose = () => {
    setStep("withdraw");
    setBankAccountCurrency("NGN");
    setSelectedAccount("");
    setAmount("");
    setTransactionPin("");
    setNewAccountData({
      selectedBank: "",
      bankCode: "",
      accountNumber: "",
      accountName: "",
    });
    onClose();
  };

  const handleAddNewAccount = () => {
    setStep("add-account");
  };

  const handleSaveNewAccount = async () => {
    if (!newAccountData.selectedBank || !newAccountData.accountNumber || !newAccountData.bankCode || !newAccountData.accountName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields and verify the account",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addBankAccount({
        bankName: newAccountData.selectedBank,
        accountNumber: newAccountData.accountNumber,
        accountName: newAccountData.accountName,
        currency: bankAccountCurrency,
        bankCode: newAccountData.bankCode,
      });
      // Fetch updated bank accounts
      const updatedAccounts = await fetchBankAccounts();
      setBankAccounts(updatedAccounts);
      toast({
        title: "Bank Account Added",
        description: "Your bank account has been added successfully",
      });
      setStep("withdraw");
      setNewAccountData({
        selectedBank: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add bank account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccountDetails = bankAccounts.find((acc) => acc.id === selectedAccount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {(step === "authorize" || step === "add-account") && (
              <button
                onClick={() => setStep(step === "authorize" ? "withdraw" : "withdraw")}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-xl font-semibold">
              {step === "withdraw" && "Withdraw"}
              {step === "add-account" && "Add New Bank Account"}
              {step === "authorize" && "Authorize Withdrawal"}
              {step === "loading" && "Processing Withdrawal"}
              {step === "success" && "Withdrawal Successful"}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "withdraw" && (
            <div className="space-y-6">
              {/* Bank Account */}
              <div className="space-y-2">
                <Label htmlFor="account">Select Bank Account</Label>
                {isLoading ? (
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <p className="text-gray-500">No bank accounts available. Please add one.</p>
                ) : (
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{account.accountName}</span>
                            <span className="text-sm text-gray-500">
                              {account.bankName} • {account.accountNumber}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  onClick={handleAddNewAccount}
                  variant="outline"
                  className="w-full mt-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Bank Account
                </Button>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Withdraw</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <Input
                    id="amount"
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="pl-8 text-lg"
                  />
                </div>
                <p className="text-sm text-gray-500">Available balance: {ngnBalance}</p>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={!selectedAccount || !amount || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
              </Button>
            </div>
          )}

          {step === "add-account" && (
            <div className="space-y-6">
              {/* Currency for Bank Account */}
              <div className="space-y-2">
                <Label htmlFor="bank-currency">Currency</Label>
                <Select value={bankAccountCurrency} onValueChange={setBankAccountCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <div className="flex items-center gap-2">
                          <span>{curr.flag}</span>
                          <span>
                            {curr.name} ({curr.code})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Bank */}
              <div className="space-y-2">
                <Label htmlFor="bank">Select Bank</Label>
                <Select value={newAccountData.selectedBank} onValueChange={handleBankChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.bank_code} value={bank.bank_name}>
                        {bank.bank_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  value={newAccountData.accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                  disabled={isVerifyingAccount}
                />
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={newAccountData.accountName}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  placeholder={isVerifyingAccount ? "Verifying..." : "Name will appear after verification"}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveNewAccount}
                disabled={
                  !newAccountData.selectedBank ||
                  !newAccountData.accountNumber ||
                  !newAccountData.bankCode ||
                  !newAccountData.accountName ||
                  isLoading ||
                  isVerifyingAccount
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Bank Account"}
              </Button>
            </div>
          )}

          {step === "authorize" && selectedAccountDetails && (
            <div className="space-y-6">
              {/* Withdrawal Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Withdrawal Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₦{amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-medium">{selectedAccountDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{selectedAccountDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-medium">{selectedAccountDetails.accountNumber}</span>
                  </div>
                </div>
              </div>

              {/* Transaction PIN */}
              <div className="space-y-2">
                <Label htmlFor="pin">Transaction PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value)}
                  placeholder="Enter your 4-digit PIN"
                  maxLength={4}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {/* Complete Button */}
              <Button
                onClick={handleCompleteWithdrawal}
                disabled={transactionPin.length !== 4}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Complete Withdrawal
              </Button>
            </div>
          )}

          {step === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Withdrawal</h3>
              <p className="text-gray-600">Please wait while we process your withdrawal...</p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">Withdrawal Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your withdrawal of ₦{amount} has been processed successfully.
              </p>
              <p className="text-sm text-gray-500">
                Funds will be credited to your bank account within 1-3 business days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}