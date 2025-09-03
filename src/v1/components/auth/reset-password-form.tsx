"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"
import { resetPassword } from "@/v1/services/auth.service" // Import the auth service function
import { Link, useSearchParams } from "wouter"

export function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match")
            return
        }

        if (!token) {
            setError("Invalid or missing reset token")
            return
        }

        setIsLoading(true)

        try {
            await resetPassword(token, formData.password)
            setIsLoading(false)
            setIsSuccess(true)
        } catch (err: any) {
            setIsLoading(false)
            setError(err.message || "Failed to reset password")
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-md mx-auto text-center">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center relative">
                        <div className="w-12 h-12 bg-primary/20 rounded-full absolute"></div>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" fill="white" />
                            <path
                                d="M8 12L12 16L16 10"
                                stroke="#0C4592"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Success</h1>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                        Your password has been successfully reset! You can now log in using your new password.
                    </p>
                </div>

                {/* Action Button */}
                <Button asChild className="w-full max-w-xs h-12 bg-primary hover:bg-primary/90 text-white">
                    <Link href="/login">Return to login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Content */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Reset password</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Almost done. Enter your new password and you're good to go.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <div>
                    <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            className="pl-10 pr-10 h-12"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                        </button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            className="pl-10 pr-10 h-12"
                            placeholder="Password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                        {isLoading ? "Resetting password..." : "Reset password"}
                    </Button>
                </div>
            </form>
        </div>
    )
}