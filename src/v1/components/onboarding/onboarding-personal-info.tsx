"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select"
import { OnboardingProgress } from "./onboarding-progress"
import { OnboardingSidebar } from "./onboarding-sidebar"

interface OnboardingPersonalInfoProps {
    data: {
        firstname: string;
        lastname: string;
        phoneNumber: string;
        countryCode: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onPrev: () => void;
}

export function OnboardingPersonalInfo({ data, onUpdate, onNext }: OnboardingPersonalInfoProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Initialize country code to +234 if not set
    useEffect(() => {
        if (!data.countryCode) {
            onUpdate({ countryCode: "+234" })
        }
    }, [data.countryCode, onUpdate])

    // Process phone number when editing (remove +234 or 234 if present)
    useEffect(() => {
        if (data.phoneNumber && data.countryCode) {
            let cleanedPhone = data.phoneNumber
            const countryCodeWithoutPlus = data.countryCode.replace("", "") // e.g., "234"

            // Remove country code if present (e.g., +234 or 234)
            if (cleanedPhone.startsWith(`+${countryCodeWithoutPlus}`)) {
                cleanedPhone = cleanedPhone.replace(`+${countryCodeWithoutPlus}`, "")
            } else if (cleanedPhone.startsWith(countryCodeWithoutPlus)) {
                cleanedPhone = cleanedPhone.replace(countryCodeWithoutPlus, "")
            }

            // Update phoneNumber only if it has changed to avoid infinite loops
            if (cleanedPhone !== data.phoneNumber) {
                onUpdate({ phoneNumber: cleanedPhone })
            }
        }
    }, [data.phoneNumber, data.countryCode, onUpdate])

    const handleInputChange = (field: string, value: string) => {
        onUpdate({ [field]: value })
    }

    const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {

        const phone = countryCode.replace("+", "") + phoneNumber
        const phoneRegex = /^\d{7,15}$/
        return phoneRegex.test(phone)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate phone number
        if (!validatePhoneNumber(data.phoneNumber, data.countryCode)) {
            setError("Please enter a valid phone number (e.g., 9080108473 for +234)")
            setLoading(false)
            return
        }

        try {

            onNext()
        } catch (err: any) {
            setError(err.message || "Failed to save information. Please check your phone number.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <OnboardingProgress currentStep={1} />

            <div className="grid lg:grid-cols-[300px,1fr] gap-8 mt-8">
                <OnboardingSidebar currentStep={1} />

                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                        <p className="text-gray-600">Please enter your details as they appear on your ID</p>
                    </div>

                    {error && <p className="text-red-500">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="firstname"
                                    value={data.firstname}
                                    onChange={(e) => handleInputChange("firstname", e.target.value)}
                                    placeholder="Johnny"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="lastname"
                                    value={data.lastname}
                                    onChange={(e) => handleInputChange("lastname", e.target.value)}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Select value={data.countryCode} onValueChange={(value) => handleInputChange("countryCode", value)}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="+234">🇳🇬 +234</SelectItem>
                                        {/* <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem> */}
                                    </SelectContent>
                                </Select>
                                <Input
                                    className="flex-1"
                                    value={data.phoneNumber}
                                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                    placeholder="09080108473"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Next"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}