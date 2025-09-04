"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Eye, EyeOff, ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Dialog, DialogContent } from "@/v1/components/ui/dialog";
import { useToast } from "@/v1/components/ui/use-toast";
import { IUser } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
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
import { Country, ICountry } from "country-state-city";

export function SettingsView() {
    const [activeTab, setActiveTab] = useState("overview");
    const { toast } = useToast();

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "profile", label: "My Profile" },
        { id: "bank", label: "Bank Accounts" },
        { id: "security", label: "Security" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                toast({
                                    title: `Switched to ${tab.label}`,
                                    description: `You are now viewing your ${tab.label.toLowerCase()} settings`,
                                    variant: "info",
                                });
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="max-w-4xl">
                {activeTab === "overview" && <OverviewTab setActiveTab={setActiveTab} />}
                {activeTab === "profile" && <MyProfileTab />}
                {activeTab === "bank" && <BankAccountsTab />}
                {activeTab === "security" && <SecurityTab />}
            </div>
        </div>
    );
}

function MyProfileTab() {
    const { toast } = useToast();
    const [user, setUser] = useState<IUser | null>(null);
    const [formData, setFormData] = useState<Partial<IUser>>({});
    const [loading] = useState<boolean>(false); // TODO: Implement loading state
    //     const [loading] = useState<boolean>(false); // TODO: Implement loading state
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [popOpen, setPopOpen] = useState<boolean>(false);
    const sd: SessionData = session.getUserData();
    const countries: Array<ICountry> = Country.getAllCountries();

    useEffect(() => {
        if (sd) {
            setUser(sd.user);
            setFormData(sd.user);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleEnableEditing = () => {
        setIsEditing(true);
        toast({
            title: "Edit Mode",
            description: "You can now edit your profile information",
            variant: "info",
        });
    };

    const handleSaveChanges = async () => {

    };

    const handleEditAvatar = () => {
        toast({
            title: "Edit Avatar",
            description: "Avatar editing functionality will be implemented separately.",
            variant: "info",
        });
        // Placeholder for separate avatar editing flow (e.g., open a modal or navigate to another page)
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Biodata</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Personal</h4>
                        <p className="text-sm text-gray-500 mb-4">Enter your name as it appears on your authorized ID</p>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="firstname">First name *</Label>
                                <Input
                                    id="firstname"
                                    value={formData.firstname || ""}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <Label htmlFor="lastname">Last name *</Label>
                                <Input
                                    id="lastname"
                                    value={formData.lastname || ""}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    className="mt-1"
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Profile picture</Label>
                        <div className="mt-2 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.fullName}`} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <Button variant="outline" className="mt-2" onClick={handleEditAvatar}>
                                Edit Avatar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Address</h4>
                <p className="text-sm text-gray-500 mb-4">This should match your proof of address document</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="address_line_one">Address line 1 *</Label>
                        <Input
                            id="address_line_one"
                            value={formData.address || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="address_line_two">Address line 2</Label>
                        <Input
                            id="address_line_two"
                            value={formData.address || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                            id="city"
                            value={formData.city || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                            id="state"
                            value={formData.state || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="zip_code">Zip/Postal code</Label>
                        <Input
                            id="zip_code"
                            value={formData.postalCode || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="country" id="country">Country *</Label>

                        <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox" size="md"
                                    aria-expanded={popOpen}
                                    disabled={!isEditing}
                                    className="w-full justify-between"
                                >
                                    {formData.country
                                        ? countries.find((country) => country.name === formData.country)?.name
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
                                            {countries.map((country) => (
                                                <CommandItem
                                                    key={country.name}
                                                    value={country.name}
                                                    onSelect={(currentValue) => {
                                                        setFormData({ ...formData, country: currentValue });
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.country === country.name ? "opacity-100" : "opacity-0"
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

            <div className="flex justify-end gap-2">
                {!isEditing ? (
                    <Button onClick={handleEnableEditing} className="text-white">Edit Profile</Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    firstname: user?.firstname,
                                    lastname: user?.lastname,
                                    address: user?.address,
                                    city: user?.city,
                                    state: user?.state,
                                    postalCode: user?.postalCode,
                                    country: user?.country,
                                });
                                toast({
                                    title: "Changes Cancelled",
                                    description: "Profile changes have been cancelled",
                                    variant: "info",
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={handleSaveChanges}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function BankAccountsTab() {
    const { toast } = useToast();
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [banks] = useState<any[]>([]); // TODO: Implement bank management
    const [newBankAccount, setNewBankAccount] = useState({
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
        currency: "NGN",
    });
    const [loading, setLoading] = useState(false);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [bankToRemove, setBankToRemove] = useState<any | null>(null);
    const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

    useEffect(() => {

    }, []);

    const handleAccountNumberChange = async (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
        setNewBankAccount((prev) => ({
            ...prev,
            accountNumber: numericValue,
            accountName: numericValue.length < 10 ? "" : prev.accountName,
        }));

        if (numericValue.length === 10 && newBankAccount.bankCode) {
            setIsVerifyingAccount(true);
            try {
                setNewBankAccount((prev) => ({
                    ...prev,
                }));
                toast({
                    title: "Account Verified",
                    description: "Bank account name verified successfully",
                    variant: "success",
                });
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message || "Failed to verify account name",
                });
                setNewBankAccount((prev) => ({
                    ...prev,
                    accountName: "",
                }));
            } finally {
                setIsVerifyingAccount(false);
            }
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === "bankName") {
            const selectedBank = banks.find((bank) => bank.bank_name === value);
            if (!selectedBank) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Selected bank not found. Please try again.",
                });
                return;
            }
            setNewBankAccount((prev) => ({
                ...prev,
                bankName: value,
                bankCode: selectedBank.bank_code,
                accountName: "",
            }));
            toast({
                title: "Bank Selected",
                description: `Selected ${value} as the bank`,
                variant: "info",
            });
        } else {
            setNewBankAccount((prev) => ({
                ...prev,
                [name]: value,
            }));
            if (name === "currency") {
                toast({
                    title: "Currency Selected",
                    description: `Selected ${value} as the currency`,
                    variant: "info",
                });
            }
        }
    };

    const handleAddBankAccount = async () => {
        if (!newBankAccount.bankName || !newBankAccount.accountNumber || !newBankAccount.accountName || !newBankAccount.bankCode || !newBankAccount.currency) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill in all required fields and verify the account",
            });
            return;
        }

        setLoading(true);
        try {
            setNewBankAccount({ bankName: "", bankCode: "", accountNumber: "", accountName: "", currency: "NGN" });
            toast({
                title: "Bank Account Added",
                description: "Your bank account has been added successfully",
                variant: "success",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to add bank account",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBankAccount = async () => {
        if (!bankToRemove) return;

        setLoading(true);
        try {
            setBankAccounts(bankAccounts.filter((bank) => bank.id !== bankToRemove.id));
            setRemoveDialogOpen(false);
            setBankToRemove(null);
            toast({
                title: "Bank Account Removed",
                description: `Your ${bankToRemove.bankName} account has been removed`,
                variant: "destructive",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to remove bank account",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Accounts</h3>
                <p className="text-gray-600">Manage your linked bank accounts for deposits and withdrawals</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Bank Account</h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="currency">Currency *</Label>
                            <Select
                                value={newBankAccount.currency}
                                onValueChange={(value) => handleSelectChange("currency", value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="bankName">Bank Name *</Label>
                            <Select
                                value={newBankAccount.bankName}
                                onValueChange={(value) => handleSelectChange("bankName", value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select your bank" />
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

                        <div>
                            <Label htmlFor="accountNumber">Account Number *</Label>
                            <Input
                                id="accountNumber"
                                value={newBankAccount.accountNumber}
                                onChange={(e) => handleAccountNumberChange(e.target.value)}
                                placeholder="Enter 10-digit account number"
                                maxLength={10}
                                disabled={isVerifyingAccount}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="accountName">Account Name *</Label>
                            <Input
                                id="accountName"
                                value={newBankAccount.accountName}
                                readOnly
                                className="mt-1 bg-gray-50 cursor-not-allowed"
                                placeholder={isVerifyingAccount ? "Verifying..." : "Name will appear after verification"}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={handleAddBankAccount}
                            className="text-white"
                            disabled={
                                !newBankAccount.bankName ||
                                !newBankAccount.accountNumber ||
                                !newBankAccount.accountName ||
                                !newBankAccount.bankCode ||
                                !newBankAccount.currency ||
                                loading ||
                                isVerifyingAccount
                            }
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {loading ? "Adding..." : "Add Bank Account"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h4 className="font-medium text-gray-900 mb-4">Your Bank Accounts</h4>
                {loading ? (
                    <p>Loading bank accounts...</p>
                ) : bankAccounts.length === 0 ? (
                    <p>No bank accounts linked.</p>
                ) : (
                    <div className="space-y-3">
                        {bankAccounts.map((bank) => (
                            <Card key={bank.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{bank.bankName}</div>
                                            <div className="text-sm text-gray-500">{`${bank.accountNumber} • ${bank.accountName}`}</div>
                                            <div className="text-xs text-gray-400">
                                                {bank.currency ? `${bank.currency.toUpperCase()} Account` : "Currency Not Specified"}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${bank.status === "verified"
                                                    ? "bg-green-100 text-green-800"
                                                    : bank.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {bank.status
                                                    ? bank.status.charAt(0).toUpperCase() + bank.status.slice(1)
                                                    : "Unknown"}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setBankToRemove(bank);
                                                    setRemoveDialogOpen(true);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex justify-end">
                        <button onClick={() => setRemoveDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4 pb-4">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">!</span>
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-900">Remove Bank Account?</h3>

                        <p className="text-gray-600 max-w-sm">
                            Are you sure you want to remove your {bankToRemove?.bankName} account ({bankToRemove?.accountNumber})? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 w-full pt-4">
                            <Button variant="outline" className="flex-1" onClick={() => setRemoveDialogOpen(false)}>
                                No, cancel
                            </Button>
                            <Button
                                className="flex-1 text-white bg-red-600 hover:bg-red-700"
                                onClick={handleRemoveBankAccount}
                                disabled={loading}
                            >
                                {loading ? "Removing..." : "Yes, remove"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SecurityTab() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pinData, setPinData] = useState({ pin: "", password: "" });
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleUpdatePassword = async () => {
        if (!passwordData.current_password || !passwordData.new_password || !confirmPassword) {
            toast({
                title: "Error",
                description: "Please fill in all password fields",
                variant: "destructive",
            });
            return;
        }

        if (passwordData.new_password !== confirmPassword) {
            toast({
                title: "Error",
                description: "New password and confirmation do not match",
                variant: "destructive",
            });
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast({
                title: "Error",
                description: "New password must be at least 8 characters long",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            toast({
                title: "Password Updated",
                description: "Your password has been updated successfully. Please log in again.",
                variant: "success",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update password",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPinData({ ...pinData, [e.target.id]: e.target.value });
        setErrorMessage("");
    };

    const handleSetTransactionPin = async () => {
        if (!pinData.pin || !pinData.password) {
            setErrorMessage("Please enter both a PIN and your password");
            return;
        }

        if (!/^\d{4}$/.test(pinData.pin)) {
            setErrorMessage("PIN must be a 4-digit number");
            return;
        }

        setLoading(true);

    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600">Manage your account security settings and authentication methods</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <Label htmlFor="current_password">Current Password *</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={handlePasswordInputChange}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="new_password">New Password *</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={passwordData.new_password}
                                onChange={handlePasswordInputChange}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className="mt-1"
                            />
                        </div>

                        <Button
                            className="text-white"
                            onClick={() => setShowPasswordModal(true)}
                            disabled={loading || !passwordData.current_password || !passwordData.new_password || !confirmPassword}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Update Password
                        </Button>

                        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                            <DialogContent className="sm:max-w-md">
                                <div className="flex justify-end">
                                    <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center space-y-4 pb-4">
                                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">!</span>
                                    </div>

                                    <h3 className="text-2xl font-semibold text-gray-900">Update Password?</h3>

                                    <p className="text-gray-600 max-w-sm">
                                        You're about to update your password. For security, you will be logged out and need to log in again
                                        using your new password.
                                    </p>

                                    <div className="flex gap-3 w-full pt-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setShowPasswordModal(false);
                                                toast({
                                                    title: "Password Update Cancelled",
                                                    description: "Password update has been cancelled",
                                                    variant: "info",
                                                });
                                            }}
                                        >
                                            No, cancel
                                        </Button>
                                        <Button
                                            className="flex-1 text-white bg-blue-600 hover:bg-blue-700"
                                            onClick={handleUpdatePassword}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            {loading ? "Updating..." : "Yes, proceed"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Set Transaction PIN</h4>
                    <p className="text-sm text-gray-500 mb-4">Set a 4-digit PIN for secure transactions</p>

                    <div className="space-y-4 max-w-md">
                        <Button
                            className="text-white"
                            onClick={() => {
                                setShowPinModal(true);
                                toast({
                                    title: "Set PIN",
                                    description: "Opened transaction PIN setup dialog",
                                    variant: "info",
                                });
                            }}
                        >
                            Set Transaction PIN
                        </Button>

                        <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
                            <DialogContent className="sm:max-w-md">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            setShowPinModal(false);
                                            setErrorMessage("");
                                            setShowPin(false);
                                            setShowPassword(false);
                                            toast({
                                                title: "PIN Setup Cancelled",
                                                description: "Transaction PIN setup has been cancelled",
                                                variant: "info",
                                            });
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4 pb-4">
                                    <h3 className="text-2xl font-semibold text-gray-900 text-center">Set Transaction PIN</h3>

                                    <div className="relative">
                                        <Label htmlFor="pin">New PIN (4 digits) *</Label>
                                        <Input
                                            id="pin"
                                            type={showPin ? "text" : "password"}
                                            value={pinData.pin}
                                            onChange={handlePinInputChange}
                                            placeholder="Enter 4-digit PIN"
                                            className="mt-1 pr-10"
                                            maxLength={4}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(!showPin)}
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Label htmlFor="password">Current Password *</Label>
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={pinData.password}
                                            onChange={handlePinInputChange}
                                            placeholder="Enter your password"
                                            className="mt-1 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    {errorMessage && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <div className="text-sm text-red-600 text-center">{errorMessage}</div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 w-full pt-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setShowPinModal(false);
                                                setErrorMessage("");
                                                setShowPin(false);
                                                setShowPassword(false);
                                                toast({
                                                    title: "PIN Setup Cancelled",
                                                    description: "Transaction PIN setup has been cancelled",
                                                    variant: "info",
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 text-white bg-blue-600 hover:bg-blue-700"
                                            onClick={handleSetTransactionPin}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            {loading ? "Setting PIN..." : "Set PIN"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                            <DialogContent className="sm:max-w-md">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center space-y-4 pb-4">
                                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    <h3 className="text-2xl font-semibold text-gray-900">PIN Set Successfully</h3>

                                    <p className="text-gray-600 max-w-sm">
                                        Your transaction PIN has been set successfully. You can now use it for secure transactions.
                                    </p>

                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setShowSuccessModal(false)}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
    const { toast } = useToast();
    const [user, setUser] = useState<IUser | null>(null);
    const [bankCount] = useState<number | null>(null); // TODO: Implement bank count
    const [loading] = useState(true); // TODO: Implement loading state
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd) {
            setUser(sd.user);
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Profile</div>
                        <div className="mt-2 font-medium text-lg text-gray-900">{user?.fullName}</div>
                        <div className="text-xs text-gray-400 mt-1">{user?.email || "No email"}</div>
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={() => { setActiveTab("profile"); toast({ title: "Navigating", description: "Opening profile tab", variant: "info" }); }}>
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Bank Accounts</div>
                        <div className="mt-2 font-medium text-lg text-gray-900">{loading ? "Loading..." : bankCount !== null ? `${bankCount} linked` : "–"}</div>
                        <div className="text-xs text-gray-400 mt-1">Manage deposit & withdrawal accounts</div>
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={() => setActiveTab("bank")}>
                                Manage Accounts
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Security</div>
                        <div className="mt-2 font-medium text-lg text-gray-900">View & update</div>
                        <div className="text-xs text-gray-400 mt-1">Change password, set PIN and more</div>
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={() => setActiveTab("security")}>
                                Update Security
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900">Quick actions</h4>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" className="text-white" onClick={() => setActiveTab("profile")}>
                            Edit Profile
                        </Button>
                        <Button size="sm" className="text-white" onClick={() => setActiveTab("bank")}>
                            Add Bank Account
                        </Button>
                        <Button size="sm" className="text-white" onClick={() => setActiveTab("security")}>
                            Set PIN / Password
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SettingsView;