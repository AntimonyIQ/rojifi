"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function VerifyEmailSuccess() {
    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
            {/* Icon */}
            <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center relative">
                    <div className="w-16 h-16 bg-primary/20 rounded-full absolute"></div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Email verified successfully</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Your email has been verified. You're now ready to explore all the features and benefits of our platform.
                    Welcome aboard!
                </p>
            </div>

            {/* Action Button */}
            <div className="space-y-4">
                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                    <Link href="/login">Return to login</Link>
                </Button>
            </div>
        </div>
    );
}
