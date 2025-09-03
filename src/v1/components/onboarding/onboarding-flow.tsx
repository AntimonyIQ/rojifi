"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { OnboardingWelcome } from "./onboarding-welcome"
import { OnboardingPersonalInfo } from "./onboarding-personal-info"
import { OnboardingAddress } from "./onboarding-address"
import { OnboardingVerify } from "./onboarding-verify"
import { OnboardingSuccess } from "./onboarding-success"
import { motion } from "framer-motion"
import { IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session";
import { Link } from "wouter"

const logoVariants: any = {
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

export function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({
        personalInfo: {
            firstname: "",
            lastname: "",
            phoneNumber: "",
            countryCode: "+234",
            dateOfBirth: "",
        },
        address: {
            address_line_one: "",
            address_line_two: "",
            country: "",
            state: "",
            city: "",
            zip_code: "",
        },
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true)
                const user: IUser | null = sd.user || null;
                if (user) {
                    // Extract country code and phone number
                    let countryCode = "+234"
                    let phoneNumber = ""
                    if (user.phoneNumber) {
                        // Assume phone starts with a country code (e.g., +2347012345678)
                        const phoneMatch = user.phoneNumber.match(/^(\+\d{1,4})(\d+)$/)
                        if (phoneMatch) {
                            countryCode = phoneMatch[1]
                            phoneNumber = phoneMatch[2]
                        } else {
                            phoneNumber = user.phoneNumber
                        }
                    }

                    setFormData({
                        personalInfo: {
                            firstname: user.firstname || "",
                            lastname: user.lastname || "",
                            phoneNumber,
                            countryCode,
                            dateOfBirth: "", // Not in User interface, kept empty
                        },
                        address: {
                            address_line_one: user.address || "",
                            address_line_two: user.address || "",
                            country: user.country || "",
                            state: user.state || "",
                            city: user.city || "",
                            zip_code: user.postalCode || "",
                        },
                    })
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch user data")
            } finally {
                setLoading(false)
            }
        }
        fetchUserData()
    }, [])

    const updateFormData = (section: string, data: any) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section as keyof typeof prev], ...data },
        }))
    }

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, 4))
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    const steps = [
        <OnboardingWelcome key="welcome" onNext={nextStep} />,
        <OnboardingPersonalInfo
            key="personal"
            data={formData.personalInfo}
            onUpdate={(data) => updateFormData("personalInfo", data)}
            onNext={nextStep}
            onPrev={prevStep}
        />,
        <OnboardingAddress
            key="address"
            data={formData.address}
            personalInfo={formData.personalInfo}
            onUpdate={(data) => updateFormData("address", data)}
            onNext={nextStep}
            onPrev={prevStep}
        />,
        <OnboardingVerify
            key="verify"
            onNext={nextStep}
            onPrev={prevStep}
        />,
        <OnboardingSuccess key="success" />,
    ]

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-background">
            <motion.div variants={logoVariants} animate="animate">
                <Logo className="h-16 w-auto" />
            </motion.div>
        </div>
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
    }

    return (
        <div className="min-h-screen">
            <header className="flex items-center justify-between p-6">
                <Logo className="h-8 w-auto" />
                <Link href="/dashboard/NGN" className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </Link>
            </header>
            <div className="container mx-auto px-4 pb-8">{steps[currentStep]}</div>
        </div>
    )
}