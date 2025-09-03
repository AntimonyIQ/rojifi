"use client"

import { Button } from "@/v1/components/ui/button"
import { User, FileText } from "lucide-react"

interface OnboardingWelcomeProps {
    onNext: () => void
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
    return (
        <div className="max-w-2xl mx-auto text-center space-y-12">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Getting Started
                    <br />
                    With Rojifi
                </h1>
            </div>

            <div className="space-y-8">
                <div className="flex items-start gap-4 text-left">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                        <p className="text-gray-600">
                            Let us get to know you. We kindly ask you to share some basic information about yourself and your address.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 text-left">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification</h3>
                        <p className="text-gray-600">
                            Verify your identity using Smile ID to complete your account setup.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <Button onClick={onNext} className="w-full max-w-md h-12 bg-primary hover:bg-primary/90 text-white">
                    Begin
                </Button>
            </div>
        </div>
    )
}