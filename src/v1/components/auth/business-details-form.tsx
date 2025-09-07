import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Checkbox } from "@/v1/components/ui/checkbox"
import { X, ChevronsUpDownIcon, CheckIcon, CalendarIcon, AlertCircle, ArrowUpRight } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { Textarea } from "../ui/textarea"
import { session, SessionData } from "@/v1/session/session"
import { toast } from "sonner"
import Defaults from "@/v1/defaults/defaults"
import { IResponse } from "@/v1/interface/interface"
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
import {
    Calendar,
} from "@/v1/components/ui/calendar"
import { Status } from "@/v1/enums/enums"
import { Link, useParams } from "wouter"
import GlobeWrapper from "../globe"
import { Carousel, carouselItems } from "../carousel"
import { motion, Variants } from "framer-motion"
import { format } from "date-fns"
import countries from "../../data/country_state.json";

const logoVariants: Variants = {
    animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.7, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
}

const companyActivities = [
    { value: "agriculture_forestry_and_fishing", label: "Agriculture, Forestry and Fishing" },
    { value: "mining_and_quarrying", label: "Mining and Quarrying" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "electricity_gas_steam", label: "Electricity, Gas, Steam and Air Conditioning Supply" },
    { value: "water_supply", label: "Water Supply; Sewerage, Waste Management" },
    { value: "construction", label: "Construction" },
    { value: "wholesale_retail_trade", label: "Wholesale and Retail Trade" },
    { value: "transportation_storage", label: "Transportation and Storage" },
    { value: "accommodation_food", label: "Accommodation and Food Service Activities" },
    { value: "information_communication", label: "Information and Communication" },
    { value: "financial_insurance", label: "Financial and Insurance Activities" },
    { value: "real_estate", label: "Real Estate Activities" },
    { value: "professional_scientific", label: "Professional, Scientific and Technical Activities" },
    { value: "administrative_support", label: "Administrative and Support Service Activities" },
    { value: "public_administration", label: "Public Administration and Defence" },
    { value: "education", label: "Education" },
    { value: "health_social_work", label: "Human Health and Social Work Activities" },
    { value: "arts_entertainment", label: "Arts, Entertainment and Recreation" },
    { value: "other_service_activities", label: "Other Service Activities" }
]

const legalForms = [
    { value: "SARL", label: "SARL (Limited Liability Company)" },
    { value: "SA", label: "SA (Public Limited Company)" },
    { value: "SAS", label: "SAS (Simplified Joint Stock Company)" },
    { value: "SASU", label: "SASU (Single Shareholder SAS)" },
    { value: "EURL", label: "EURL (Single Member SARL)" },
    { value: "SNC", label: "SNC (General Partnership)" },
    { value: "LLC", label: "LLC (Limited Liability Company)" },
    { value: "Corporation", label: "Corporation" },
    { value: "Partnership", label: "Partnership" },
    { value: "Sole_Proprietorship", label: "Sole Proprietorship" },
    { value: "LTD", label: "LTD (Private Limited Company)" },
    { value: "PLC", label: "PLC (Public Limited Company)" }
]

const requestedServices = [
    { value: "fx_crossborder_payments", label: "FX Cross-border Payments" },
    { value: "virtual_ibans", label: "Virtual IBANs" },
    { value: "digital_assets", label: "Digital Assets" },
    { value: "payment_processing", label: "Payment Processing" },
    { value: "treasury_management", label: "Treasury Management" },
    { value: "compliance_services", label: "Compliance Services" }
]

const sourceOfWealthOptions = [
    { value: "sales_revenue_business_earnings", label: "Sales Revenue/Business Earnings" },
    { value: "investors_funds", label: "Investors Funds" },
    { value: "company_treasury", label: "Company Treasury" },
    { value: "crowdfunding", label: "Crowdfunding" },
    { value: "investment_returns", label: "Investment Returns" },
    { value: "loan_debt_financing", label: "Loan/Debt Financing" },
    { value: "ico", label: "ICO (Initial Coin Offering)" },
    { value: "grant", label: "Grant" },
    { value: "other", label: "Other" }
]

const anticipatedSourceOptions = [
    { value: "sales_revenue_business_earnings", label: "Sales Revenue/Business Earnings" },
    { value: "customer_funds", label: "Customer Funds" },
    { value: "investors_funds", label: "Investors Funds" },
    { value: "company_treasury", label: "Company Treasury" },
    { value: "crowdfunding", label: "Crowdfunding" },
    { value: "investment_returns", label: "Investment Returns" },
    { value: "loan_debt_financing", label: "Loan/Debt Financing" },
    { value: "ico", label: "ICO (Initial Coin Offering)" },
    { value: "grant", label: "Grant" },
    { value: "other", label: "Other" }
]

const riskLevels = [
    { value: "low_risk", label: "Low Risk" },
    { value: "medium_risk", label: "Medium Risk" },
    { value: "high_risk", label: "High Risk" }
]

const companyStatuses = [
    { value: "live", label: "Live" },
    { value: "closed", label: "Closed" },
    { value: "not_reported", label: "Not Reported" }
]

export function BusinessDetailsForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isNotApprove, setIsNotApprove] = useState(false)

    // Popover states
    const [countryPopover, setCountryPopover] = useState(false)
    const [activityPopover, setActivityPopover] = useState(false)
    const [legalFormPopover, setLegalFormPopover] = useState(false)
    const [statusPopover, setStatusPopover] = useState(false)
    const [riskLevelPopover, setRiskLevelPopover] = useState(false)
    const [registrationDatePopover, setRegistrationDatePopover] = useState(false)
    const [onboardingDatePopover, setOnboardingDatePopover] = useState(false)

    const [formData, setFormData] = useState({
        // Company basic info
        name: "",
        country: "",
        registrationNumber: "",
        website: "",
        legalForm: "",
        companyActivity: "",
        status: "",
        registrationDate: undefined as Date | undefined,
        onboardingDate: undefined as Date | undefined,
        tradingName: "",

        // Address
        streetAddress: "",
        streetAddress2: "",
        city: "",
        state: "",
        region: "",
        postalCode: "",

        // Financial info
        shareCapital: "",
        lastYearTurnover: "",
        companyAssets: "",
        expectedMonthlyInboundCryptoPayments: "",
        expectedMonthlyOutboundCryptoPayments: "",
        expectedMonthlyInboundFiatPayments: "",
        expectedMonthlyOutboundFiatPayments: "",

        // Risk and compliance
        riskLevel: "",
        additionalDueDiligenceConducted: "",

        // Multi-select arrays
        requestedNilosServices: [] as string[],
        sourceOfWealth: [] as string[],
        anticipatedSourceOfFundsOnNilos: [] as string[],

        // Boolean fields
        actualOperationsAndRegisteredAddressesMatch: false,
        companyProvideRegulatedFinancialServices: false,
        directorOrBeneficialOwnerIsPEPOrUSPerson: false,
        immediateApprove: false
    })

    const { id } = useParams()
    const sd: SessionData = session.getUserData()

    // Load and verify user authorization
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/requestaccess/approved/${id}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                // User is authorized, continue
            }
        } catch (error: any) {
            setError(error.message || "Failed to verify authorization");
            setIsNotApprove(true);
        } finally {
            setIsLoading(false);
        }
    }

    // Format number helper
    const formatNumber = (val: string) => (val ? val.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : val)

    // Check if all required fields are filled
    const isFormValid = () => {
        return (
            formData.name.trim() !== "" &&
            formData.country.trim() !== "" &&
            formData.registrationNumber.trim() !== "" &&
            formData.legalForm.trim() !== "" &&
            formData.companyActivity.trim() !== "" &&
            formData.streetAddress.trim() !== "" &&
            formData.city.trim() !== "" &&
            formData.state.trim() !== "" &&
            formData.postalCode.trim() !== "" &&
            formData.shareCapital.trim() !== "" &&
            formData.riskLevel.trim() !== "" &&
            formData.tradingName.trim() !== "" &&
            formData.requestedNilosServices.length > 0 &&
            formData.sourceOfWealth.length > 0 &&
            formData.anticipatedSourceOfFundsOnNilos.length > 0 &&
            formData.registrationDate !== undefined &&
            formData.onboardingDate !== undefined
        )
    }

    const handleInputChange = (field: string, value: string | boolean | Date | string[]) => {
        let sanitizedValue = value

        if (typeof value === "string") {
            switch (field) {
                case "name":
                case "tradingName":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "")
                    break
                case "registrationNumber":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "")
                    break
                case "website":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\.\-_/:?=&%#]/g, "").toLowerCase()
                    break
                case "streetAddress":
                case "streetAddress2":
                case "city":
                case "state":
                case "region":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "")
                    break
                case "postalCode":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "")
                    break
                case "shareCapital":
                case "lastYearTurnover":
                case "companyAssets":
                case "expectedMonthlyInboundCryptoPayments":
                case "expectedMonthlyOutboundCryptoPayments":
                case "expectedMonthlyInboundFiatPayments":
                case "expectedMonthlyOutboundFiatPayments":
                    // Allow only numbers and remove any non-digit characters
                    sanitizedValue = value.replace(/[^0-9]/g, "")
                    break
                case "additionalDueDiligenceConducted":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "")
                    break
            }
        }

        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
        setError(null)
    }

    const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
        setFormData((prev) => {
            const currentArray = prev[field as keyof typeof prev] as string[]
            if (checked) {
                return { ...prev, [field]: [...currentArray, value] }
            } else {
                return { ...prev, [field]: currentArray.filter(item => item !== value) }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!isFormValid()) {
            setError("Please fill in all required fields")
            return
        }

        setLoading(true)

        try {
            const businessData = {
                mainCompany: {
                    name: formData.name,
                    country: formData.country,
                    registrationNumber: formData.registrationNumber,
                    website: formData.website,
                    legalForm: formData.legalForm,
                    companyActivity: formData.companyActivity,
                    registrationDate: formData.registrationDate ? format(formData.registrationDate, 'yyyy-MM-dd') : "",
                    onboardingDate: formData.onboardingDate ? format(formData.onboardingDate, 'yyyy-MM-dd') : "",
                    registeredAddress: {
                        streetAddress: formData.streetAddress,
                        streetAddress2: formData.streetAddress2,
                        city: formData.city,
                        state: formData.state,
                        region: formData.region,
                        country: formData.country,
                        postalCode: formData.postalCode
                    },
                    shareCapital: parseInt(formData.shareCapital) || 0,
                    lastYearTurnover: parseInt(formData.lastYearTurnover) || 0,
                    companyAssets: parseInt(formData.companyAssets) || 0,
                    expectedMonthlyInboundCryptoPayments: parseInt(formData.expectedMonthlyInboundCryptoPayments) || 0,
                    expectedMonthlyOutboundCryptoPayments: parseInt(formData.expectedMonthlyOutboundCryptoPayments) || 0,
                    expectedMonthlyInboundFiatPayments: parseInt(formData.expectedMonthlyInboundFiatPayments) || 0,
                    expectedMonthlyOutboundFiatPayments: parseInt(formData.expectedMonthlyOutboundFiatPayments) || 0,
                    riskLevel: formData.riskLevel,
                    additionalDueDiligenceConducted: formData.additionalDueDiligenceConducted,
                    requestedNilosServices: formData.requestedNilosServices,
                    sourceOfWealth: formData.sourceOfWealth,
                    anticipatedSourceOfFundsOnNilos: formData.anticipatedSourceOfFundsOnNilos,
                    actualOperationsAndRegisteredAddressesMatch: formData.actualOperationsAndRegisteredAddressesMatch,
                    companyProvideRegulatedFinancialServices: formData.companyProvideRegulatedFinancialServices,
                    directorOrBeneficialOwnerIsPEPOrUSPerson: formData.directorOrBeneficialOwnerIsPEPOrUSPerson,
                    status: "live"
                },
                tradingName: formData.tradingName,
                immediateApprove: formData.immediateApprove
            }

            // API call to save business details
            const res = await fetch(`${Defaults.API_BASE_URL}/auth/business-details`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    businessData
                })
            })

            const data: IResponse = await res.json()
            if (data.status === Status.ERROR) throw new Error(data.message || data.error)
            if (data.status === Status.SUCCESS) {
                toast.success("Business details saved successfully!")
                window.location.href = `/signup/${id}/verification`
            }
        } catch (err: any) {
            setError(err.message || "Failed to save business details")
        } finally {
            setLoading(false)
        }
    }

    if (loading || isLoading) {
        return (
            <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-white">
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <motion.div variants={logoVariants} animate="animate">
                        <Logo className="h-16 w-auto" />
                    </motion.div>
                </div>
            </div>
        )
    }

    if (isNotApprove) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center max-w-lg px-6">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900">Request access required</h2>
                    <p className="mt-2 text-gray-600">You currently don't have access to this page. Please request access to continue.</p>
                    <div className="mt-6">
                        <Link href="/request-access" className="inline-flex">
                            <Button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white">
                                <ArrowUpRight size={18} />
                                Request Access
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <Link href="/" className="flex items-center space-x-2">
                                <Logo className="h-8 w-auto" />
                            </Link>
                            <Link href="/" className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </Link>
                        </div>

                        {/* Form Content */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h1>
                            <p className="text-gray-600">Complete your business information</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            {/* Company Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>

                                <div>
                                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter company name"
                                        value={formData.name}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tradingName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Trading Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tradingName"
                                        name="tradingName"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter Trading Name"
                                        value={formData.tradingName}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("tradingName", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Registration Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="registrationNumber"
                                        name="registrationNumber"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter registration number"
                                        value={formData.registrationNumber}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                                        Website <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        type="url"
                                        className="h-12"
                                        placeholder="https://www.company.com"
                                        value={formData.website}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("website", e.target.value)}
                                    />
                                </div>

                                {/* Legal Form Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Legal Form <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={legalFormPopover} onOpenChange={setLegalFormPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.legalForm
                                                    ? legalForms.find((form) => form.value === formData.legalForm)?.label
                                                    : "Select legal form..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search legal form..." />
                                                <CommandList>
                                                    <CommandEmpty>No legal form found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {legalForms.map((form) => (
                                                            <CommandItem
                                                                key={form.value}
                                                                value={form.label}
                                                                onSelect={() => {
                                                                    handleInputChange("legalForm", form.value)
                                                                    setLegalFormPopover(false)
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.legalForm === form.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {form.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Company Status Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Status <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={statusPopover} onOpenChange={setStatusPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.status
                                                    ? companyStatuses.find((status) => status.value === formData.status)?.label
                                                    : "Select status..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search status..." />
                                                <CommandList>
                                                    <CommandEmpty>No status found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {companyStatuses.map((status) => (
                                                            <CommandItem
                                                                key={status.value}
                                                                value={status.label}
                                                                onSelect={() => {
                                                                    handleInputChange("status", status.value)
                                                                    setStatusPopover(false)
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.status === status.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {status.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Company Activity Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Activity <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={activityPopover} onOpenChange={setActivityPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.companyActivity
                                                    ? companyActivities.find((activity) => activity.value === formData.companyActivity)?.label
                                                    : "Select company activity..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search activity..." />
                                                <CommandList>
                                                    <CommandEmpty>No activity found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {companyActivities.map((activity) => (
                                                            <CommandItem
                                                                key={activity.value}
                                                                value={activity.label}
                                                                onSelect={() => {
                                                                    handleInputChange("companyActivity", activity.value)
                                                                    setActivityPopover(false)
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.companyActivity === activity.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {activity.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Date Fields */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Registration Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={registrationDatePopover} onOpenChange={setRegistrationDatePopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12 justify-start text-left font-normal"
                                                    disabled={loading}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.registrationDate ? format(formData.registrationDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="buttons"
                                                    selected={formData.registrationDate}
                                                    onSelect={(date) => {
                                                        handleInputChange("registrationDate", date!)
                                                        setRegistrationDatePopover(false)
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Onboarding Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={onboardingDatePopover} onOpenChange={setOnboardingDatePopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12 justify-start text-left font-normal"
                                                    disabled={loading}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.onboardingDate ? format(formData.onboardingDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    selected={formData.onboardingDate}
                                                    onSelect={(date) => {
                                                        handleInputChange("onboardingDate", date!)
                                                        setOnboardingDatePopover(false)
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Registered Address</h3>

                                <div>
                                    <Label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="streetAddress"
                                        name="streetAddress"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter street address"
                                        value={formData.streetAddress}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="streetAddress2" className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address 2 <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="streetAddress2"
                                        name="streetAddress2"
                                        type="text"
                                        className="h-12"
                                        placeholder="Apartment, suite, unit, etc."
                                        value={formData.streetAddress2}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("streetAddress2", e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                            City <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter city"
                                            value={formData.city}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                            State/Province <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter state"
                                            value={formData.state}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("state", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                                            Region <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="region"
                                            name="region"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter region"
                                            value={formData.region}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("region", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                                            Postal Code <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="postalCode"
                                            name="postalCode"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter postal code"
                                            value={formData.postalCode}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>

                                <div>
                                    <Label htmlFor="shareCapital" className="block text-sm font-medium text-gray-700 mb-2">
                                        Share Capital <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="shareCapital"
                                        name="shareCapital"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter share capital"
                                        value={formatNumber(formData.shareCapital)}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("shareCapital", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="lastYearTurnover" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Year Turnover <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="lastYearTurnover"
                                        name="lastYearTurnover"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter last year turnover"
                                        value={formatNumber(formData.lastYearTurnover)}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("lastYearTurnover", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="companyAssets" className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Assets <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="companyAssets"
                                        name="companyAssets"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter company assets"
                                        value={formatNumber(formData.companyAssets)}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("companyAssets", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                {/* Expected Monthly Payments */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="expectedMonthlyInboundCryptoPayments" className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Inbound Crypto <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="expectedMonthlyInboundCryptoPayments"
                                            name="expectedMonthlyInboundCryptoPayments"
                                            type="text"
                                            className="h-12"
                                            placeholder="Amount"
                                            value={formatNumber(formData.expectedMonthlyInboundCryptoPayments)}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("expectedMonthlyInboundCryptoPayments", e.target.value.replace(/,/g, ""))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="expectedMonthlyOutboundCryptoPayments" className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Outbound Crypto <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="expectedMonthlyOutboundCryptoPayments"
                                            name="expectedMonthlyOutboundCryptoPayments"
                                            type="text"
                                            className="h-12"
                                            placeholder="Amount"
                                            value={formatNumber(formData.expectedMonthlyOutboundCryptoPayments)}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("expectedMonthlyOutboundCryptoPayments", e.target.value.replace(/,/g, ""))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="expectedMonthlyInboundFiatPayments" className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Inbound Fiat <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="expectedMonthlyInboundFiatPayments"
                                            name="expectedMonthlyInboundFiatPayments"
                                            type="text"
                                            className="h-12"
                                            placeholder="Amount"
                                            value={formatNumber(formData.expectedMonthlyInboundFiatPayments)}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("expectedMonthlyInboundFiatPayments", e.target.value.replace(/,/g, ""))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="expectedMonthlyOutboundFiatPayments" className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Outbound Fiat <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="expectedMonthlyOutboundFiatPayments"
                                            name="expectedMonthlyOutboundFiatPayments"
                                            type="text"
                                            className="h-12"
                                            placeholder="Amount"
                                            value={formatNumber(formData.expectedMonthlyOutboundFiatPayments)}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("expectedMonthlyOutboundFiatPayments", e.target.value.replace(/,/g, ""))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Risk and Compliance */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Risk and Compliance</h3>

                                {/* Risk Level Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Risk Level <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={riskLevelPopover} onOpenChange={setRiskLevelPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.riskLevel
                                                    ? riskLevels.find((level) => level.value === formData.riskLevel)?.label
                                                    : "Select risk level..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search risk level..." />
                                                <CommandList>
                                                    <CommandEmpty>No risk level found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {riskLevels.map((level) => (
                                                            <CommandItem
                                                                key={level.value}
                                                                value={level.label}
                                                                onSelect={() => {
                                                                    handleInputChange("riskLevel", level.value)
                                                                    setRiskLevelPopover(false)
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.riskLevel === level.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {level.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <Label htmlFor="additionalDueDiligenceConducted" className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Due Diligence <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Textarea
                                        id="additionalDueDiligenceConducted"
                                        name="additionalDueDiligenceConducted"
                                        className="h-20"
                                        placeholder="Describe any additional due diligence conducted"
                                        value={formData.additionalDueDiligenceConducted}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("additionalDueDiligenceConducted", e.target.value)}
                                    />
                                </div>

                                {/* Boolean checkboxes */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="actualOperationsAndRegisteredAddressesMatch"
                                            checked={formData.actualOperationsAndRegisteredAddressesMatch}
                                            disabled={loading}
                                            onCheckedChange={(checked) => handleInputChange("actualOperationsAndRegisteredAddressesMatch", checked)}
                                        />
                                        <Label htmlFor="actualOperationsAndRegisteredAddressesMatch" className="text-sm text-gray-600">
                                            Actual operations and registered addresses match
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="companyProvideRegulatedFinancialServices"
                                            checked={formData.companyProvideRegulatedFinancialServices}
                                            disabled={loading}
                                            onCheckedChange={(checked) => handleInputChange("companyProvideRegulatedFinancialServices", checked)}
                                        />
                                        <Label htmlFor="companyProvideRegulatedFinancialServices" className="text-sm text-gray-600">
                                            Company provides regulated financial services
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="directorOrBeneficialOwnerIsPEPOrUSPerson"
                                            checked={formData.directorOrBeneficialOwnerIsPEPOrUSPerson}
                                            disabled={loading}
                                            onCheckedChange={(checked) => handleInputChange("directorOrBeneficialOwnerIsPEPOrUSPerson", checked)}
                                        />
                                        <Label htmlFor="directorOrBeneficialOwnerIsPEPOrUSPerson" className="text-sm text-gray-600">
                                            Director or beneficial owner is PEP or US person
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="immediateApprove"
                                            checked={formData.immediateApprove}
                                            disabled={loading}
                                            onCheckedChange={(checked) => handleInputChange("immediateApprove", checked)}
                                        />
                                        <Label htmlFor="immediateApprove" className="text-sm text-gray-600">
                                            Request immediate approval
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Services Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Requested Services</h3>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select requested Nilos services <span className="text-red-500">*</span>
                                </Label>
                                <div className="space-y-2">
                                    {requestedServices.map((service) => (
                                        <div key={service.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`service-${service.value}`}
                                                checked={formData.requestedNilosServices.includes(service.value)}
                                                disabled={loading}
                                                onCheckedChange={(checked) => handleMultiSelectChange("requestedNilosServices", service.value, checked as boolean)}
                                            />
                                            <Label htmlFor={`service-${service.value}`} className="text-sm text-gray-600">
                                                {service.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Source of Wealth */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Source of Wealth</h3>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select source of wealth <span className="text-red-500">*</span>
                                </Label>
                                <div className="space-y-2">
                                    {sourceOfWealthOptions.map((source) => (
                                        <div key={source.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`wealth-${source.value}`}
                                                checked={formData.sourceOfWealth.includes(source.value)}
                                                disabled={loading}
                                                onCheckedChange={(checked) => handleMultiSelectChange("sourceOfWealth", source.value, checked as boolean)}
                                            />
                                            <Label htmlFor={`wealth-${source.value}`} className="text-sm text-gray-600">
                                                {source.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Anticipated Source of Funds */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Anticipated Source of Funds</h3>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select anticipated source of funds on Nilos <span className="text-red-500">*</span>
                                </Label>
                                <div className="space-y-2">
                                    {anticipatedSourceOptions.map((source) => (
                                        <div key={source.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`anticipated-${source.value}`}
                                                checked={formData.anticipatedSourceOfFundsOnNilos.includes(source.value)}
                                                disabled={loading}
                                                onCheckedChange={(checked) => handleMultiSelectChange("anticipatedSourceOfFundsOnNilos", source.value, checked as boolean)}
                                            />
                                            <Label htmlFor={`anticipated-${source.value}`} className="text-sm text-gray-600">
                                                {source.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                    disabled={loading || !isFormValid()}
                                >
                                    {loading ? "Saving..." : "Continue to Verification"}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Need help?{" "}
                                <Link href="/help" className="text-primary hover:text-primary/80 font-medium">
                                    Contact Support
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
    )
}
