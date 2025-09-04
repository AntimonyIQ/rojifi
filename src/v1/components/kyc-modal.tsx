"use client"

import React from 'react';
import { Card, CardContent } from "@/v1/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'wouter';

interface KYCModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    buttonText?: string;
    buttonAction?: () => void;
    buttonHref?: string;
}

export default function KYCModal({
    isOpen = true,
    title,
    description,
    buttonText,
    buttonAction,
    buttonHref
}: KYCModalProps) {
    const [isChecking, setIsChecking] = React.useState(true);

    // Simulate KYC status check
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setIsChecking(false);
            }, 2000); // 2 second simulated check
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center p-4 z-[1000] font-inter">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xl mx-auto"
            >
                <Card className="bg-white rounded-3xl shadow-2xl border-0 min-h-[400px]">
                    <CardContent className="px-6 py-4 flex flex-col items-center justify-center text-center min-h-[300px]">
                        {isChecking ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-4 text-gray-600 text-sm">Checking KYC status...</p>
                            </div>
                        ) : (
                            <>
                                {/* KYC Icon with Camera Frame */}
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-br mt-10 from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center relative">
                                        {/* Corner brackets */}
                                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-gray-400"></div>
                                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-gray-400"></div>
                                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-gray-400"></div>
                                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-gray-400"></div>

                                        {/* User icon */}
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title and Description */}
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                                <p className="text-gray-500 text-xs mb-6 leading-relaxed">{description}</p>

                                {/* Action Button */}
                                {buttonText && (buttonHref || buttonAction) && (
                                    <div className="flex justify-center">
                                        {buttonHref ? (
                                            <Link href={buttonHref}>
                                                <button
                                                    className="w-full max-w-xs bg-primary-400 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                                >
                                                    {buttonText}
                                                </button>
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={buttonAction}
                                                className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-2xl transition-colors"
                                            >
                                                {buttonText}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}