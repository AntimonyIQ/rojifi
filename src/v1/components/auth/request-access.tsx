"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Checkbox } from "@/v1/components/ui/checkbox"
import { X, ChevronsUpDownIcon, CheckIcon, ArrowUpRight } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { Textarea } from "../ui/textarea";
import countries from "../../data/country_state.json";
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
import { Status } from "@/v1/enums/enums"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/v1/components/ui/dialog"
import { Link } from "wouter"
import GlobeWrapper from "../globe"
import { Carousel, carouselItems } from "../carousel"

export function RequestAccessForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [popOpen, setPopOpen] = useState(false)
    const [countryPopover, setCountryPopover] = useState(false)
    const [isWebsiteValid, setIsWebsiteValid] = useState(true)
    const formRef = useRef<HTMLDivElement>(null)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        agreeToMarketing: false,
        phoneNumber: "",
        countryCode: "234",
        selectedCountryCode: "Nigeria", // Track specific country for phone code
        businessName: "",
        businessWebsite: "",
        address: "",
        city: "",
        postal: "",
        country: "Nigeria",
        message: "",
        volume: "",
        state: "Unknown",
    })
    // Display value for the volume input (with commas). formData.volume stores raw digits only.
    const formatNumber = (val: string) => (val ? val.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : val)
    const [displayVolume, setDisplayVolume] = useState<string>(formatNumber(formData.volume))
    const [locationData, setLocationData] = useState<any>(null)
    const [deviceInfo, setDeviceInfo] = useState<any>(null)
    const sd: SessionData = session.getUserData();

    // const isValidName = (name: string) => /^[A-Za-z]{2,}$/.test(name); // TODO: Implement name validation
    const isValidPhone = (phone: string) => /^[0-9]+$/.test(phone);
    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
    const isValidWebsite = (website: string) => {
        if (!website.trim()) return true; // Empty is valid since it's optional
        // Basic URL validation - checks for domain pattern
        const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(\.[a-zA-Z]{2,})(\/.*)?$/;
        return urlPattern.test(website);
    };

    useEffect(() => {
        getLocation();
        getDeviceInfo();
    }, []);

    // Scroll to top when error occurs
    useEffect(() => {
        if (error && formRef.current) {
            formRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [error]);

    const getDeviceInfo = () => {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const cookieEnabled = navigator.cookieEnabled;
        const onLine = navigator.onLine;
        const screen = window.screen;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Detect browser
        let browserName = "Unknown";
        let browserVersion = "Unknown";

        if (userAgent.indexOf("Chrome") > -1) {
            browserName = "Chrome";
            browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.indexOf("Firefox") > -1) {
            browserName = "Firefox";
            browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.indexOf("Safari") > -1) {
            browserName = "Safari";
            browserVersion = userAgent.match(/Safari\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.indexOf("Edge") > -1) {
            browserName = "Edge";
            browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown";
        }

        // Detect OS
        let osName = "Unknown";
        if (userAgent.indexOf("Windows") > -1) osName = "Windows";
        else if (userAgent.indexOf("Mac") > -1) osName = "macOS";
        else if (userAgent.indexOf("Linux") > -1) osName = "Linux";
        else if (userAgent.indexOf("Android") > -1) osName = "Android";
        else if (userAgent.indexOf("iOS") > -1) osName = "iOS";

        // Detect device type
        let deviceType = "Desktop";
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            deviceType = "Mobile";
        } else if (/iPad/i.test(userAgent)) {
            deviceType = "Tablet";
        }

        const info = {
            browser: {
                name: browserName,
                version: browserVersion,
                userAgent: userAgent,
                language: language,
                cookieEnabled: cookieEnabled,
                onLine: onLine
            },
            device: {
                type: deviceType,
                platform: platform,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                }
            },
            system: {
                os: osName,
                timezone: timezone,
                timestamp: new Date().toISOString()
            }
        };

        setDeviceInfo(info);
    };

    const getLocation = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/', {
                headers: { "Accept": "application/json" }
            });
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();

            if (data) {
                setLocationData(data);
            }
        } catch (error: any) {
            console.error('Unable to fetch location from IP!', error);
            // Fallback location data
            setLocationData({
                ip: "Unknown",
                city: "Unknown",
                region: "Unknown",
                country_name: "Unknown",
                error: error?.message || "Location fetch failed"
            });
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        let sanitizedValue = value;

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
                    // Only allow digits 0-9
                    sanitizedValue = value.replace(/[^0-9]/g, "");
                    // Remove country code prefix if user accidentally included it
                    const currentPrefix = String(formData.countryCode || "").replace(/^\+/, "");
                    if (currentPrefix && sanitizedValue.startsWith(currentPrefix)) {
                        sanitizedValue = sanitizedValue.slice(currentPrefix.length);
                    }
                    break;

                case "volume":
                    // Allow digits, dot, and comma. Remove all other characters.
                    sanitizedValue = value.replace(/[^0-9.,]/g, "");
                    // Replace commas with nothing, keep only one dot for decimals
                    sanitizedValue = sanitizedValue.replace(/,/g, "");
                    // If multiple dots, keep only the first
                    const parts = sanitizedValue.split(".");
                    if (parts.length > 2) {
                        sanitizedValue = parts[0] + "." + parts.slice(1).join("");
                    }
                    break;

                case "postal":
                    sanitizedValue = value.replace(/[^0-9]/g, "");
                    break;

                case "city":
                    sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
                    break;

                case "businessName":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
                    break;

                case "businessWebsite":
                    // Allow URL characters: letters, numbers, dots, slashes, hyphens, underscores, colons, question marks, equals, ampersands, hash, percent
                    // This supports: https://www.example.com, http://example.com, www.example.com, example.com/path/to/page?query=value#section
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\.\-_/:?=&%#]/g, "").toLowerCase();
                    break;

                case "address":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
                    break;

                case "message":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
                    break;
            }
        }

        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
        // If the volume field changed, also update the formatted display value.
        if (field === "volume") {
            setDisplayVolume(formatNumber(String(sanitizedValue)));
        }
        // Validate website in real-time
        if (field === "businessWebsite") {
            setIsWebsiteValid(isValidWebsite(String(sanitizedValue)));
        }
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.agreeToTerms) {
            setError("You must agree to the Terms and Conditions to proceed")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match")
            return
        }

        if (!isValidEmail(formData.email)) {
            toast.error("Enter a valid email address.");
            return;
        }

        // phone: allow only numbers, prevent duplicated prefix
        let phone = (formData.phoneNumber || "").replace(/\s+/g, "");
        // If autocomplete included the country code prefix, strip it
        const prefix = String(formData.countryCode || "").replace(/^\+/, "");
        if (prefix && phone.startsWith(prefix)) {
            phone = phone.slice(prefix.length);
        }

        if (!isValidPhone(phone) || phone.length < 4) {
            setError("Enter a valid phone number (numbers only).");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`${Defaults.API_BASE_URL}/requestaccess`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    email: formData.email,
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    middlename: formData.middleName,
                    businessName: formData.businessName,
                    businessWebsite: formData.businessWebsite,
                    phoneCode: formData.countryCode,
                    agreement: formData.agreeToTerms,
                    agreeToMarketing: formData.agreeToMarketing,
                    phoneNumber: phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postalCode: formData.postal,
                    message: formData.message,
                    weeklyVolume: Number(formData.volume || 0),
                    metadata: {
                        agreeToMarketing: formData.agreeToMarketing,
                        location: locationData,
                        device: deviceInfo,
                        submission: {
                            timestamp: new Date().toISOString(),
                            userAgent: navigator.userAgent,
                            referrer: document.referrer || "Direct",
                            url: window.location.href
                        }
                    }
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Form submitted successfully!");
                setShowSuccessModal(true);
                setFormData({
                    firstName: "",
                    lastName: "",
                    middleName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    agreeToTerms: false,
                    agreeToMarketing: false,
                    phoneNumber: "",
                    countryCode: "234",
                    selectedCountryCode: "Nigeria", // Track specific country for phone code
                    businessName: "",
                    businessWebsite: "",
                    address: "",
                    city: "",
                    postal: "",
                    country: "Nigeria",
                    message: "",
                    volume: "",
                    state: "Unknown",
                });
                setDisplayVolume("");
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit form, please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto" ref={formRef}>
                        {/* Success Modal using Dialog */}
                        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                            <DialogContent className="max-w-sm md:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-center">Request Submitted</DialogTitle>
                                    <DialogDescription className="text-center text-gray-600 font-medium">Thank you for your request! You will be notified once approved by the Rojifi team.</DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex justify-center gap-1">
                                    {/* <Button variant="outline" size="md" onClick={() => setShowSuccessModal(false)}>
                                        Cancel
                                    </Button> */}
                                    <Button size="md" onClick={() => { setShowSuccessModal(false); window.location.href = "/"; }} className="text-white">
                                        <ArrowUpRight size={16} />
                                        Back to Homepage
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Access to Rojifi Business</h1>
                            <p className="text-gray-600">Let's start with your personal credentials</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First name <span className="text-red-500">*</span>
                                    </Label>
                                    <div>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            autoComplete="given-name"
                                            required
                                            className="h-12"
                                            placeholder="First name"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last name
                                    </Label>
                                    <div>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            autoComplete="family-name"
                                            className="h-12"
                                            placeholder="Last name"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Name <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="middleName"
                                        name="middleName"
                                        type="text"
                                        autoComplete="family-name"
                                        className="h-12"
                                        placeholder="Other"
                                        value={formData.middleName}
                                        onChange={(e) => handleInputChange("middleName", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="h-12"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                size="md"
                                                aria-expanded={popOpen}
                                                className="w-28 justify-between"
                                            >
                                                <img src={`https://flagcdn.com/w320/${countries.find((country) => country.name === formData.selectedCountryCode)?.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                {formData.countryCode
                                                    ? `+${formData.countryCode}`
                                                    : "Select country..."}
                                                <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-60 p-0">
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
                                                                    const selectedCountry = countries.find(c => c.name.toLowerCase() === currentValue.toLowerCase())
                                                                    if (selectedCountry) {
                                                                        handleInputChange("countryCode", selectedCountry.phonecode)
                                                                        handleInputChange("selectedCountryCode", selectedCountry.name)
                                                                    }
                                                                    setPopOpen(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.selectedCountryCode === country.name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <img src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                                +{country.phonecode} {country.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        className="flex-1"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        placeholder="Enter Phone Number"
                                        required
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="text"
                                        autoComplete="work tel"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Name of your Business <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        autoComplete="work name"
                                        required
                                        className="h-12"
                                        placeholder="Enter your business name"
                                        value={formData.businessName}
                                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Website <span className="text-gray-400">(Optional)</span>
                                </Label>
                                <div>
                                    <Input
                                        id="businessWebsite"
                                        name="businessWebsite"
                                        type="text"
                                        autoComplete="url"
                                        className={cn(
                                            "h-12",
                                            formData.businessWebsite && !isWebsiteValid
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        )}
                                        placeholder="www.example.com"
                                        value={formData.businessWebsite}
                                        onChange={(e) => handleInputChange("businessWebsite", e.target.value)}
                                    />
                                    {formData.businessWebsite && !isWebsiteValid && (
                                        <p className="text-red-500 text-xs mt-1">Please enter a valid website URL</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                                    Volume Processed Weekly <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="volume"
                                        name="volume"
                                        type="text"
                                        autoComplete="transaction-amount"
                                        required
                                        className="h-12"
                                        placeholder="Enter volume processed weekly"
                                        value={displayVolume}
                                        onChange={(e) => handleInputChange("volume", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Address <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        autoComplete="address-level1"
                                        required
                                        className="h-12"
                                        placeholder="Enter your address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <div>
                                        <Input
                                            id="city"
                                            name="city"
                                            type="text"
                                            autoComplete="city"
                                            required
                                            className="h-12"
                                            placeholder="Enter your city"
                                            value={formData.city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="postal" className="block text-sm font-medium text-gray-700 mb-2">
                                        Postal Code <span className="text-red-500">*</span>
                                    </Label>
                                    <div>
                                        <Input
                                            id="postal"
                                            name="postal"
                                            type="text"
                                            autoComplete="postal-code"
                                            className="h-12"
                                            placeholder="Enter your postal code"
                                            value={formData.postal}
                                            required
                                            onChange={(e) => handleInputChange("postal", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 
                            <div>
                                <Label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                    State / Province <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="state"
                                        name="state"
                                        type="text"
                                        autoComplete="postal-code"
                                        className="pl-10 h-12"
                                        placeholder="Enter your state"
                                        value={formData.state}
                                        required
                                        onChange={(e) => handleInputChange("state", e.target.value)}
                                    />
                                    <MapPinHouse className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            */}

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
                                                className="w-full justify-between"
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

                            <div>
                                <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tell us more about your business <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-row !items-start !justify-start">
                                    <Textarea
                                        id="message"
                                        name="message"
                                        autoComplete="message"
                                        required
                                        className="h-12"
                                        placeholder=""
                                        value={formData.message}
                                        onChange={(e) => handleInputChange("message", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                                        required
                                    />
                                    <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                                        I agree to Rojifi's{" "}
                                        <Link href="/privacy" className="text-primary hover:text-primary/80">
                                            Privacy Policy
                                        </Link>{" "}
                                        and{" "}
                                        <Link href="#" className="text-primary hover:text-primary/80">
                                            Terms and Conditions
                                        </Link>{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                </div>
                            </div>                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                    disabled={isLoading || !formData.agreeToTerms}
                                >
                                    {isLoading ? "Sending Request..." : "Submit"}
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
    )
}