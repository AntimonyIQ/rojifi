import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { toast } from "sonner";
import Defaults from "@/v1/defaults/defaults";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/v1/components/ui/command";
import { Calendar } from "@/v1/components/ui/calendar";
import { ChevronsUpDownIcon, CheckIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/v1/lib/utils";
import countries from "../../data/country_state.json";
import { ISender } from "@/v1/interface/interface";

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

interface BusinessDetailsStageProps {
    sender: Partial<ISender>;
}

export default function BusinessDetailsFormPlain({ sender }: BusinessDetailsStageProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const errorRef = useRef<HTMLDivElement>(null);
    // refs and widths for popovers so we can match PopoverContent width to trigger
    const legalTriggerRef = useRef<HTMLButtonElement | null>(null);
    const [legalTriggerWidth, setLegalTriggerWidth] = useState<number | null>(null);
    const activityTriggerRef = useRef<HTMLButtonElement | null>(null);
    const [activityTriggerWidth, setActivityTriggerWidth] = useState<number | null>(null);

    const [countryPopover, setCountryPopover] = useState(false);
    const [activityPopover, setActivityPopover] = useState(false);
    const [legalFormPopover, setLegalFormPopover] = useState(false);
    const [registrationDatePopover, setRegistrationDatePopover] = useState(false);

    const [formData, setFormData] = useState({
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
        streetAddress: "",
        streetAddress2: "",
        city: "",
        state: "",
        region: "",
        postalCode: "",
    });

    useEffect(() => {
        setFormData({
            ...formData,
            name: sender?.businessName || "",
            country: sender?.country || "Nigeria",
            registrationNumber: sender?.businessRegistrationNumber || "",
            website: sender?.website || "",
            legalForm: sender?.legalForm || "",
            companyActivity: sender?.companyActivity || "",
            registrationDate: sender?.registrationDate ? new Date(sender.registrationDate) : undefined,
            tradingName: sender?.tradingName || "",
            streetAddress: sender?.streetAddress || "",
            streetAddress2: sender?.streetAddress2 || "",
            city: sender?.city || "",
            state: sender?.state || "",
            region: sender?.region || "",
            postalCode: sender?.postalCode || "",
        });
    }, [sender]);

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
            formData.registrationDate !== undefined
        );
    };

    const handleInputChange = (field: string, value: any) => {
        let sanitizedValue = value;
        if (typeof value === "string") {
            switch (field) {
                case "name":
                case "tradingName":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
                    break;
                case "registrationNumber":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\-\/_\s]/g, "").replace(/\s+/g, " ");
                    break;
                case "website":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\.\-_/:?=&%#]/g, "").toLowerCase();
                    break;
                case "streetAddress":
                case "streetAddress2":
                case "city":
                case "state":
                case "region":
                case "country":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
                    break;
                case "postalCode":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
                    break;
            }
        }

        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
        setError(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setError(null);

        if (!isFormValid()) {
            setError("Please fill in all required fields");
            setTimeout(() => {
                errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
            return;
        }

        setLoading(true);
        try {
            const businessData = {
                mainCompany: {
                    name: formData.name,
                    country: formData.country,
                    registrationNumber: formData.registrationNumber,
                    website: formData.website,
                    legalForm: formData.legalForm,
                    companyActivity: formData.companyActivity,
                    registrationDate: formData.registrationDate ? format(formData.registrationDate, "yyyy-MM-dd") : "",
                    onboardingDate: format(new Date(), "yyyy-MM-dd"),
                    registeredAddress: {
                        streetAddress: formData.streetAddress,
                        streetAddress2: formData.streetAddress2,
                        city: formData.city,
                        state: formData.state,
                        region: formData.region,
                        country: formData.country,
                        postalCode: formData.postalCode,
                    },
                },
                tradingName: formData.tradingName,
            };

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/business`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ businessData }),
            });

            const data = await res.json();
            if (data?.status === "ERROR") throw new Error(data.message || data.error || "Save failed");
            toast.success("Business details saved successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to save business details");
            setTimeout(() => {
                errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {error && (
                <div ref={errorRef} className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 mb-8 w-full">

                <div>
                    <Label>Company Name <span className="text-red-500">*</span></Label>
                    <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} className="h-12" />
                </div>

                <div>
                    <Label>Trading Name</Label>
                    <Input value={formData.tradingName} onChange={(e) => handleInputChange("tradingName", e.target.value)} className="h-12" />
                </div>

                <div>
                    <Label>Company Registration Number <span className="text-red-500">*</span></Label>
                    <Input value={formData.registrationNumber} onChange={(e) => handleInputChange("registrationNumber", e.target.value)} className="h-12" />
                </div>

                <div>
                    <Label>Website <span className="text-gray-400">(Optional)</span></Label>
                    <Input value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} className="h-12" />
                </div>

                {/* Legal Form Selection */}
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Legal Form <span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={legalFormPopover}
                        onOpenChange={(open) => {
                            setLegalFormPopover(open);
                            // measure trigger width when opening so PopoverContent can match
                            if (open && legalTriggerRef.current) {
                                const rect = legalTriggerRef.current.getBoundingClientRect();
                                setLegalTriggerWidth(Math.round(rect.width));
                            }
                        }}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                ref={legalTriggerRef}
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
                        <PopoverContent className="p-0" style={legalTriggerWidth ? { width: `${legalTriggerWidth}px` } : undefined}>
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

                {/* Company Activity Selection */}
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Activity <span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={activityPopover}
                        onOpenChange={(open) => {
                            setActivityPopover(open);
                            if (open && activityTriggerRef.current) {
                                // prefer offsetWidth which matches the rendered button width
                                setActivityTriggerWidth(activityTriggerRef.current.offsetWidth);
                            }
                        }}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                ref={activityTriggerRef}
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
                        <PopoverContent className="p-0" style={activityTriggerWidth ? { width: `${activityTriggerWidth}px` } : undefined}>
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

                <div>
                    <Label>Company Registration Date <span className="text-red-500">*</span></Label>
                    <Popover open={registrationDatePopover} onOpenChange={setRegistrationDatePopover}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-start text-left font-normal" disabled={loading}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.registrationDate ? format(formData.registrationDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" captionLayout="dropdown" selected={formData.registrationDate} onSelect={(date) => { handleInputChange("registrationDate", date!); setRegistrationDatePopover(false); }} />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label>Street Address <span className="text-red-500">*</span></Label>
                    <Input value={formData.streetAddress} onChange={(e) => handleInputChange("streetAddress", e.target.value)} className="h-12" />
                </div>

                <div>
                    <Label>Street Address 2 <span className="text-gray-400">(Optional)</span></Label>
                    <Input value={formData.streetAddress2} onChange={(e) => handleInputChange("streetAddress2", e.target.value)} className="h-12" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>City <span className="text-red-500">*</span></Label>
                        <Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} className="h-12" />
                    </div>

                    <div>
                        <Label>State/Province <span className="text-red-500">*</span></Label>
                        <Input value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} className="h-12" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Region <span className="text-gray-400">(Optional)</span></Label>
                        <Input value={formData.region} onChange={(e) => handleInputChange("region", e.target.value)} className="h-12" />
                    </div>

                    <div>
                        <Label>Postal Code <span className="text-red-500">*</span></Label>
                        <Input value={formData.postalCode} onChange={(e) => handleInputChange("postalCode", e.target.value)} className="h-12" />
                    </div>
                </div>

                <div>
                    <Label>Country <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                        <Popover open={countryPopover} onOpenChange={() => setCountryPopover(!countryPopover)}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" size="md" aria-expanded={countryPopover} className="w-full h-12 justify-between" disabled={loading}>
                                    <div className="flex flex-row items-center gap-2">
                                        <img src={`https://flagcdn.com/w320/${countries.find((country) => country.name === formData.country)?.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
                                        {formData.country ? countries.find((country) => country.name === formData.country)?.name : "Select country..."}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup>
                                            {countries.map((country, index) => (
                                                <CommandItem key={`${country.name}-${index}`} value={country.name} onSelect={(currentValue) => { handleInputChange("country", currentValue); setCountryPopover(false); }}>
                                                    <CheckIcon className={cn("mr-2 h-4 w-4", formData.country === country.name ? "opacity-100" : "opacity-0")} />
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

                <div className="pt-4 md:col-span-2">
                    <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-primary/90 md:col-span-2" disabled={loading || !isFormValid()}>{loading ? "Saving..." : "Save"}</Button>
                </div>
            </form>
        </div>
    );
}
