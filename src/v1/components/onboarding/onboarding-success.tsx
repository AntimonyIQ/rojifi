"use client"

import { Button } from "@/v1/components/ui/button"
import { Link } from "wouter"

export function OnboardingSuccess() {
    return (
        <div className="max-w-md mx-auto text-center space-y-8 pt-16">
            {/* Success Icon */}
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Success!</h1>
                <p className="text-gray-600 leading-relaxed">
                    Your documents have been submitted successfully. Your account upgrade request is being reviewed. We will
                    update you on the status via email shortly. Thank you for choosing Rojifi!
                </p>
            </div>

            {/* Action Button */}
            <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                <Link href="/dashboard/NGN">Go to Dashboard</Link>
            </Button>
        </div>
    )
}
