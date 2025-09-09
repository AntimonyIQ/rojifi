import { motion } from "framer-motion";
import { Clock, Shield, ArrowRight, Building } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useParams } from "wouter";

export function VerificationInReview() {
    const { wallet } = useParams();
    console.log("Wallet param in VerificationInReview:", wallet);

    const handleViewBusinessProfile = () => {
        if (wallet) {
            window.location.href = `/dashboard/${wallet}/businessprofile`;
        } else {
            // Fallback: try to navigate relative to current path
            const currentPath = window.location.pathname;
            const newPath = currentPath.replace(/\/[^/]*$/, '/businessprofile');
            window.location.href = newPath;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full"
            >
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        {/* Animated Icon */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="mb-6"
                        >
                            <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                <Shield className="h-10 w-10 text-white" />
                                {/* Pulsing ring effect */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 bg-yellow-400 rounded-full"
                                />
                            </div>
                        </motion.div>

                        {/* Main Content */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            Verification in Review
                        </h1>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                            Your business verification is currently being processed.
                            Access to dashboard features is temporarily limited while we review your submission.
                        </p>

                        {/* Status Info */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-2 text-yellow-800">
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">Review typically takes 1-2 business days</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Button
                                onClick={handleViewBusinessProfile}
                                size="lg"
                                className="w-full px-8 py-4 h-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg"
                            >
                                <Building className="mr-2 h-5 w-5" />
                                View Business Profile
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <p className="text-sm text-gray-500">
                                Check your verification status and manage your business information
                            </p>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    <span>Documents under review</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <span>Profile access available</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
