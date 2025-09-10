import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { ArrowLeft, ChevronsUpDownIcon, CheckIcon, CalendarIcon, AlertCircle, ArrowUpRight, Check } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { session, SessionData } from "@/v1/session/session"
import { toast } from "sonner"
import Defaults from "@/v1/defaults/defaults"
import { IRequestAccess, IResponse } from "@/v1/interface/interface"
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
    { value: "Partnership", label: "Partnership, Business Name" },
    { value: "Sole_Proprietorship", label: "Sole Proprietorship, Business Name" },
    { value: "LTD", label: "LTD (Private Limited Company)" },
    { value: "PLC", label: "PLC (Public Limited Company)" },
    { value: "OTHERS", label: "Others" },
]

export function BusinessDetailsForm() {
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isNotApprove, setIsNotApprove] = useState(false)
    const errorRef = useRef<HTMLDivElement>(null)

    const [countryPopover, setCountryPopover] = useState(false)
    const [activityPopover, setActivityPopover] = useState(false)
    const [legalFormPopover, setLegalFormPopover] = useState(false)
    const [registrationDatePopover, setRegistrationDatePopover] = useState(false)

    const [formData, setFormData] = useState({
        // Company basic info
        name: "",
        country: "Nigeria",
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
    })

    const { id } = useParams()
    const sd: SessionData = session.getUserData()

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
                const parseData: IRequestAccess = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setCompleted(parseData.completed);
                setFormData((prev) => ({
                    ...prev,
                    name: parseData.businessName || "",
                    tradingName: parseData.businessName || "",
                    country: parseData.country || "",
                    website: parseData.businessWebsite || "",
                }));
            }
        } catch (error: any) {
            setError(error.message || "Failed to verify authorization");
            setIsNotApprove(true);
        } finally {
            setIsLoading(false);
        }
    }

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
            // formData.tradingName.trim() !== "" &&
            formData.registrationDate !== undefined
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
                    sanitizedValue = value
                        .replace(/[^a-zA-Z0-9\-\/_\s]/g, "")
                        .replace(/\s+/g, " ");
                    break
                case "website":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\.\-_/:?=&%#]/g, "").toLowerCase()
                    break
                case "streetAddress":
                case "streetAddress2":
                case "city":
                case "state":
                case "region":
                case "country":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "")
                    break
                case "postalCode":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "")
                    break
            }
        }

        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setError(null)

        if (!isFormValid()) {
            setError("Please fill in all required fields")
            // Auto-scroll to error message
            setTimeout(() => {
                errorRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 100)
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
                    onboardingDate: format(new Date(), 'yyyy-MM-dd'), // Set to current date
                    registeredAddress: {
                        streetAddress: formData.streetAddress,
                        streetAddress2: formData.streetAddress2,
                        city: formData.city,
                        state: formData.state,
                        region: formData.region,
                        country: formData.country,
                        postalCode: formData.postalCode
                    },
                },
                tradingName: formData.tradingName
            }

            // API call to save business details
            const res = await fetch(`${Defaults.API_BASE_URL}/auth/business`, {
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
                window.location.href = `/signup/${id}/business-financials`;
            }
        } catch (err: any) {
            setError(err.message || "Failed to save business details")
            // Auto-scroll to error message
            setTimeout(() => {
                errorRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 100)
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) {
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

    if (completed) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="p-6 max-w-md mx-auto text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Submission Received</h2>
                    <p className="text-gray-600 mb-4">You have successfully submitted your documents. They are under review — you will be notified once the review is complete.</p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            Back to Homepage
                        </Button>
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
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                    className="text-gray-600"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Link href="/" className="flex items-center space-x-2">
                                    <Logo className="h-8 w-auto" />
                                </Link>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h1>
                            <p className="text-gray-600">Complete your business information</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div ref={errorRef} className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-md border border-red-200">
                                    {error}
                                </div>
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
                                        Trading Name (If different from company name)
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
                                        Company Registration Number <span className="text-red-500">*</span>
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
                                        type="text"
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
                                                        {legalForms
                                                            .filter(form => ['Partnership', 'Sole_Proprietorship', 'LTD', 'OTHERS'].includes(form.value))
                                                            .map((form) => (
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
                                {/*
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
                                */}

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
                                            Company Registration Date <span className="text-red-500">*</span>
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
                                                    captionLayout="dropdown"
                                                    selected={formData.registrationDate}
                                                    onSelect={(date) => {
                                                        handleInputChange("registrationDate", date!)
                                                        setRegistrationDatePopover(false)
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/** Onboarding Date */}
                                    {/*
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
                                    */}
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Business Registered Address</h3>

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

                                <div>
                                    <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Popover open={countryPopover} onOpenChange={() => setCountryPopover(!countryPopover)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    size="md"
                                                    aria-expanded={countryPopover}
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    <div className="flex flex-row items-center gap-2">
                                                        <img src={`https://flagcdn.com/w320/${countries.find((country) => country.name === formData.country)?.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                        {formData.country
                                                            ? countries.find((country) => country.name === formData.country)?.name
                                                            : "Select country..."}
                                                    </div>
                                                    <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search country..." />
                                                    <CommandList>
                                                        <CommandEmpty>No country found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {countries.map((country, index) => (
                                                                <CommandItem
                                                                    key={`${country.name}-${index}`}
                                                                    value={country.name}
                                                                    onSelect={(currentValue) => {
                                                                        handleInputChange("country", currentValue)
                                                                        setCountryPopover(false)
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.country === country.name ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <img src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
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

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary text-white hover:bg-primary/90"
                                disabled={loading || !isFormValid()}
                            >
                                {loading ? "Saving..." : "Continue"}
                            </Button>

                            <div className="text-center text-sm text-gray-600">
                                Need help? <Link href="/help" className="text-primary hover:underline">Contact support</Link>
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

export default BusinessDetailsForm
