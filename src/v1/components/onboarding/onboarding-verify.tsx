"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/v1/components/ui/button"
import { OnboardingProgress } from "./onboarding-progress"
import { OnboardingSidebar } from "./onboarding-sidebar"
import { KYCInitResponse } from "@/v1/services/auth.service"
import { API_BASE_URL, PARTNER_ID } from "@/v1/utils/constant"
import Script from "next/script"
import { IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"

declare global {
    interface Window {
        SmileIdentity?: any
    }
}

interface OnboardingVerifyProps {
    onNext: () => void
    onPrev: () => void
}

export function OnboardingVerify({ onNext, onPrev }: OnboardingVerifyProps) {
    const [loading, _setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [sdkLoaded, setSdkLoaded] = useState(false)
    const [user, setUser] = useState<IUser | null>(null)
    const [kycData, _setKycData] = useState<KYCInitResponse['data'] | null>(null)
    const initializedRef = useRef(false)
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        setUser(sd.user || null);
    }, []);

    const initializeWidget = () => {
        if (!window.SmileIdentity) {
            setError("SmileIdentity SDK not loaded")
            return
        }

        if (!token) {
            setError("No token available")
            return
        }

        if (!user || !kycData) {
            setError("Required data not loaded")
            return
        }

        if (initializedRef.current) return

        initializedRef.current = true

        try {
            window.SmileIdentity({
                token,
                product: "biometric_kyc",
                callback_url: `${API_BASE_URL}/kyc/smile-id-webhook`,
                environment: "live",
                id_selection: {
                    "NG": ["BVN"]
                },
                consent_required: {
                    "NG": ["BVN"]
                },
                partner_details: {
                    partner_id: PARTNER_ID || "7236",
                    name: "Rojifi",
                    logo_url: "https://res.cloudinary.com/alero/image/upload/v1750424073/eye2cff1zhipknrg7pot.png",
                    policy_url: "https://your-app.com/privacy-policy",
                    theme_color: "#0000FF",
                },
                partner_params: {
                    job_id: kycData.job_id,
                    user_id: kycData.user_id,
                    job_type: 1
                },
                onSuccess: () => {
                    localStorage.removeItem("smileIDToken")
                    onNext()
                },
                onError: (error: any) => {
                    setError(`Verification failed: ${error.message || 'Please try again'}`)
                    localStorage.removeItem("smileIDToken")
                    initializedRef.current = false
                },
                onClose: () => {
                    initializedRef.current = false
                }
            })
        } catch (err: any) {
            setError(`Failed to start verification: ${err.message}`)
            initializedRef.current = false
        }
    }

    useEffect(() => {
        if (sdkLoaded && token && user && kycData) {
            initializeWidget()
        }
    }, [sdkLoaded, token, user, kycData])

    return (
        <>
            <Script
                src="https://cdn.smileidentity.com/inline/v1/js/script.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                    setSdkLoaded(true)
                }}
                onError={() => {
                    setError("Failed to load Smile ID SDK")
                }}
            />

            <div className="max-w-6xl mx-auto">
                <OnboardingProgress currentStep={3} />

                <div className="grid lg:grid-cols-[300px,1fr] gap-8 mt-8">
                    <OnboardingSidebar currentStep={3} />

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
                            <p className="text-gray-600">
                                We use Smile ID to securely verify your identity. This process takes about 2-3 minutes.
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-red-600 font-medium">{error}</p>
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        onClick={() => { }}
                                        variant="ghost"
                                        className="text-red-600 hover:bg-red-100"
                                        size="sm"
                                    >
                                        Retry Token Fetch
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            localStorage.removeItem('smileIDToken')
                                            setToken(null)
                                        }}
                                        variant="ghost"
                                        className="text-red-600 hover:bg-red-100"
                                        size="sm"
                                    >
                                        Clear Token and Retry
                                    </Button>
                                    <Button
                                        onClick={initializeWidget}
                                        variant="ghost"
                                        className="text-red-600 hover:bg-red-100"
                                        size="sm"
                                        disabled={!token || !user || !kycData}
                                    >
                                        Retry Verification
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div
                            id="smileid-container"
                            className="w-full h-[500px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="text-center space-y-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                                    <p className="text-gray-500">
                                        {!token ? "Preparing verification..." : "Loading verification service..."}
                                    </p>
                                </div>
                            ) : (
                                !error && (
                                    <p className="text-gray-500">
                                        Verification will start automatically...
                                    </p>
                                )
                            )}
                        </div>

                        <div className="pt-6 flex justify-between">
                            <Button
                                type="button"
                                onClick={onPrev}
                                variant="outline"
                                className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={initializeWidget}
                                variant="secondary"
                                className="h-12 px-6"
                                disabled={!token || loading || !user || !kycData}
                            >
                                {loading ? "Loading..." : "Start Verification"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}