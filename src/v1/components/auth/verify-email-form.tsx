"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function VerifyEmailForm() {
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return // Only allow single digit

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all fields are filled
        if (newCode.every((digit) => digit !== "") && value) {
            handleSubmit(newCode)
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = async (codeToSubmit = code) => {
        if (codeToSubmit.some((digit) => digit === "")) return

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            // Redirect to success page
            router.push("/verify-email/success")
        }, 2000);
    }

    const handleResendCode = async () => {
        setIsResending(true)

        // Simulate API call
        setTimeout(() => {
            setIsResending(false)
            // Clear the form
            setCode(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()
        }, 1000)
    }

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus()
    }, [])

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
            {/* Icon */}
            <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">We emailed you a code</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                    We've sent a verification code to your email. Please enter the code below to verify your account and complete
                    the registration process. If you don't see the email in your inbox, check your spam or junk folder.
                </p>
            </div>

            {/* Code Input */}
            <div className="flex justify-center gap-3 mb-8">
                {code.map((digit, index) => (
                    <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-medium border-2 focus:border-primary"
                        disabled={isLoading}
                    />
                ))}
            </div>

            {/* Resend Code */}
            <div className="text-center text-sm text-gray-600 mb-8">
                Didn't receive your code?{" "}
                <button
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-primary hover:text-primary/80 font-medium"
                >
                    {isResending ? "Sending..." : "Resend new code"}
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary bg-primary/10">
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Verifying...
                    </div>
                </div>
            )}
        </div>
    )
}
