"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Lock, X, MailOpen, Clipboard } from "lucide-react"
import { Status } from "@/v1/enums/enums"
import { IResponse } from "@/v1/interface/interface"
import Defaults from "@/v1/defaults/defaults"
import { session, SessionData } from "@/v1/session/session"

interface OTPVerificationFormProps {
    email: string
    isOpen: boolean
    onClose: () => void;
    onSuccess: () => void;
    id: string;
}

export function OTPVerificationModal({ email, isOpen, onClose, id, onSuccess }: OTPVerificationFormProps) {
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const sd: SessionData = session.getUserData();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email) {
            setIsLoading(false)
            setError("Email is required for verification")
            return
        }

        try {
            setIsLoading(true)

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/email/verify`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    email: email,
                    otp: otp
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || "Invalid OTP. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
                {/* Close Button (optional) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-3 text-gray-500 hover:text-gray-800"
                >
                    <X size={20} />
                </button>

                <>
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                            <MailOpen size={24} color="white" />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-2 text-center">Enter OTP</h2>
                    <p className="text-gray-600 text-sm mb-4 text-center">
                        We've sent a one-time password to your email. Enter it below to continue.
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Input
                                id="otp"
                                name="otp"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                autoComplete="off"
                                required
                                className="pl-10 pr-12 h-12 text-center"
                                placeholder="Enter 4-digit OTP"
                                value={otp}
                                maxLength={4}
                                onChange={(e) => {
                                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 4);
                                    setOtp(onlyDigits);
                                }}
                            />
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const text = await navigator.clipboard.readText();
                                        const onlyDigits = (text || "").replace(/\D/g, "").slice(0, 4);
                                        if (onlyDigits.length === 0) {
                                            setError("Clipboard has no digits to paste");
                                            return;
                                        }
                                        setOtp(onlyDigits);
                                        setError(null);
                                    } catch (err) {
                                        setError("Unable to read from clipboard");
                                    }
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                aria-label="Paste from clipboard"
                            >
                                <Clipboard className="h-5 w-5" />
                            </button>
                        </div>


                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                            disabled={isLoading || !email}
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>
                </>
            </div>
        </div>
    )
}
