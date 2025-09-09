
"use client";

import { useEffect, useState } from "react";
import { Files, MapPin, UsersIcon, Building, Calendar, Globe, Phone, Mail, Shield, Award, Clock, ArrowRight, Download, DollarSign, TrendingUp, Users, Eye, ChevronLeft, ChevronRight, User } from "lucide-react";
import Loading from "../loading";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { ISender, IDirectorAndShareholder } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import { Link, useParams } from "wouter";

enum Tabs {
    KYC = "KYC",
    OVERVIEW = "Overview"
}

export function BusinessProfileView() {
    const [loading, setLoading] = useState<boolean>(true);
    const [kycCompleted, setKycCompleted] = useState<boolean>(false);
    const [sender, setSender] = useState<ISender | null>(null);
    const sd: SessionData = session.getUserData();
    const { wallet } = useParams();
    console.log("Wallet param:", wallet);

    const [_currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("KYC");

    // Directors & Shareholders navigation state
    const [currentDirectorIndex, setCurrentDirectorIndex] = useState(0);

    const statusTabs = Object.values(Tabs);

    // Simulate Directors & Shareholders data (replace with actual data when available)
    const simulatedDirectorsAndShareholders: IDirectorAndShareholder[] = [];

    // Use actual data if available, otherwise use simulated data
    const directorsAndShareholders = sender?.directorsAndShareholders?.length
        ? sender.directorsAndShareholders
        : simulatedDirectorsAndShareholders;

    useEffect(() => {
        if (sd) {
            setSender(sd.sender);
            setKycCompleted(sd.sender.businessVerificationCompleted);
            setLoading(false);
        }
    }, [sd]);

    // Helper function to check document status
    const getDocumentStatuses = () => {
        if (!sender) return { allVerified: false, hasFailed: false, inReview: false };

        // Use the new documents array structure
        const documents = sender.documents || [];

        if (documents.length === 0) {
            return { allVerified: false, hasFailed: false, inReview: true };
        }

        const allVerified = documents.every(doc => doc.smileIdStatus === "verified");
        const hasFailed = documents.some(doc => doc.smileIdStatus === "failed");
        const inReview = documents.some(doc => doc.smileIdStatus === "pending" || !doc.smileIdStatus);

        return { allVerified, hasFailed, inReview };
    };

    const { hasFailed, inReview } = getDocumentStatuses();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'in-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'unapproved': return 'bg-red-100 text-red-800 border-red-200';
            case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Premium Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{
                                    rotateY: [0, 180, 360],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="p-2 bg-blue-600 rounded-full"
                            >
                                <Building className="h-5 w-5 text-white" />
                            </motion.div>
                            <div className="text-left">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Business Profile
                                </h1>
                                <p className="text-sm text-gray-500">Manage your business information and verification</p>
                            </div>
                        </div>
                        {sender && (
                            <Badge className={`px-3 py-1 ${getStatusColor(sender.status)} font-medium border`}>
                                {sender.status}
                            </Badge>
                        )}
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                >
                    <div className="flex gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                        {statusTabs.map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setCurrentPage(1);
                                }}
                                className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${statusFilter === status
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/60"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-20"
                    >
                        <Loading />
                    </motion.div>
                )}

                {/* KYC Incomplete State */}
                {!loading && statusFilter === Tabs.KYC && !kycCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className={`w-16 h-16 ${hasFailed ? 'bg-red-600' : 'bg-yellow-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <Shield className="h-8 w-8 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        {hasFailed ? 'KYC Verification Issues' : 'KYC Verification In Review'}
                                    </h2>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        {hasFailed
                                            ? 'Some of your submitted documents have verification issues that need to be resolved'
                                            : 'Your KYC documents are currently being reviewed. We will notify you once the review is complete'
                                        }
                                    </p>
                                </div>

                                {/* Verification Steps - Row Layout */}
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    {/* Business Documents Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className={`p-6 rounded-xl border-2 ${hasFailed
                                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                                            : inReview
                                                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                                                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${hasFailed ? 'bg-red-600' : inReview ? 'bg-yellow-600' : 'bg-green-600'
                                                } rounded-full flex items-center justify-center`}>
                                                <Files className="h-6 w-6 text-white" />
                                            </div>
                                            <Badge className={
                                                hasFailed
                                                    ? 'bg-red-100 text-red-800 border-red-200'
                                                    : inReview
                                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                        : 'bg-green-100 text-green-800 border-green-200'
                                            }>
                                                {hasFailed ? 'Failed' : inReview ? 'In Review' : 'Verified'}
                                            </Badge>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-3">Business Documents</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Upload required business registration and incorporation documents, business address with recent utility bill or bank statement
                                        </p>

                                        {/* Document Status List */}
                                        <div className="space-y-2 mb-4">
                                            {sender?.documents?.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs">
                                                    <span>{doc.which?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                    <Badge className={`text-xs ${doc.smileIdStatus === 'verified'
                                                        ? 'bg-green-100 text-green-700'
                                                        : doc.smileIdStatus === 'failed'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {doc.smileIdStatus || 'Pending'}
                                                    </Badge>
                                                </div>
                                            )) || (
                                                    <div className="text-center py-4 text-gray-500 text-xs">
                                                        No documents uploaded yet
                                                    </div>
                                                )}
                                        </div>

                                        {hasFailed && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Review Issues
                                            </Button>
                                        )}
                                    </motion.div>

                                    {/* Directors & Shareholders Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className={`p-6 rounded-xl border-2 ${directorsAndShareholders.length > 0
                                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${directorsAndShareholders.length > 0 ? 'bg-green-600' : 'bg-gray-400'
                                                } rounded-full flex items-center justify-center`}>
                                                <UsersIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <Badge className={
                                                directorsAndShareholders.length > 0
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }>
                                                {directorsAndShareholders.length > 0 ? 'Complete' : 'Pending'}
                                            </Badge>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-3">Directors & Shareholders</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Add and manage all company directors and shareholders information, address with recent utility bill or bank statement
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Directors & Shareholders Added</span>
                                                <Badge className="text-xs bg-blue-100 text-blue-700">
                                                    {directorsAndShareholders.length} Added
                                                </Badge>
                                            </div>
                                        </div>

                                        {directorsAndShareholders.length === 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                                            >
                                                <UsersIcon className="mr-2 h-4 w-4" />
                                                Add Directors & Shareholders
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Status Message */}
                                <div className="text-center">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${hasFailed
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {hasFailed
                                                ? 'Action required - Please review and resubmit documents'
                                                : 'Review in progress - We will notify you once complete'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* KYC Completed State */}
                {!loading && statusFilter === Tabs.KYC && kycCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="mb-6"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Award className="h-10 w-10 text-white" />
                                    </div>
                                </motion.div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification Complete</h2>
                                <p className="text-gray-600 mb-8">
                                    Congratulations! Your business KYC verification has been successfully completed and approved.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Button variant="outline" className="px-6 py-3 h-auto">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Certificate
                                    </Button>
                                    <Button className="px-6 py-3 h-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Business Overview */}
                {!loading && statusFilter === Tabs.OVERVIEW && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Business Info Card */}
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                {/* Header with Actions */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Building className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                                            <p className="text-gray-600">Company details and registration information</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="px-4 py-2 h-auto">
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                        <Link href={`/dashboard/${wallet}/sender/edit`}>
                                            <Button className="px-4 py-2 h-auto">
                                                <Building className="mr-2 h-4 w-4" />
                                                Edit Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Business Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-purple-600" />
                                            Business Name
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">{sender?.businessName || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-purple-600" />
                                            Trading Name
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">{sender?.tradingName || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-purple-600" />
                                            Rojifi ID
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-mono text-gray-900">{sender?.rojifiId || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Files className="h-4 w-4 text-purple-600" />
                                            Registration Number
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">{sender?.businessRegistrationNumber || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-purple-600" />
                                            Website
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900 break-all">{sender?.website || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Files className="h-4 w-4 text-purple-600" />
                                            Legal Form
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">{sender?.legalForm || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-purple-600" />
                                            Company Activity
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">{sender?.companyActivity || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-purple-600" />
                                            Country of Incorporation
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">{sender?.countryOfIncorporation || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-purple-600" />
                                            Registration Date
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.registrationDate
                                                    ? new Date(sender.registrationDate).toLocaleDateString()
                                                    : "Not provided"
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-purple-600" />
                                            Onboarding Date
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.onboardingDate
                                                    ? new Date(sender.onboardingDate).toLocaleDateString()
                                                    : "Not provided"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Information Card */}
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
                                        <p className="text-gray-600">Registered business address details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                            Street Address
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.streetAddress || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                            Street Address 2
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.streetAddress2 || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-emerald-600" />
                                            City
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.city || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-emerald-600" />
                                            State
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.state || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-emerald-600" />
                                            Region
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.region || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                            Postal Code
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.postalCode || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information Card */}
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Phone className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                                        <p className="text-gray-600">Business contact details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-blue-600" />
                                            Business Email
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.email || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-blue-600" />
                                            Business Phone
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.phoneCountryCode} {sender?.phoneNumber || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Files className="h-4 w-4 text-blue-600" />
                                            Tax Identification Number
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.taxIdentificationNumber || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            Account Status
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <Badge className={`${getStatusColor(sender?.status || '')} font-medium`}>
                                                {sender?.status || "Unknown"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Information Card */}
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Financial Information</h2>
                                        <p className="text-gray-600">Company financial details and projections</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            Share Capital
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.shareCapital ? `${sender.shareCapital.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            Last Year Turnover
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.lastYearTurnover ? `${sender.lastYearTurnover.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-green-600" />
                                            Company Assets
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.companyAssets ? `${sender.companyAssets.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            Monthly Volume
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.volume ? `${sender.volume.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            Expected Monthly Inbound Crypto
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyInboundCryptoPayments ? `${sender.expectedMonthlyInboundCryptoPayments.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            Expected Monthly Outbound Crypto
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyOutboundCryptoPayments ? `${sender.expectedMonthlyOutboundCryptoPayments.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            Expected Monthly Inbound Fiat
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyInboundFiatPayments ? `${sender.expectedMonthlyInboundFiatPayments.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            Expected Monthly Outbound Fiat
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyOutboundFiatPayments ? `${sender.expectedMonthlyOutboundFiatPayments.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Risk & Compliance Card */}
                        {/*
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Risk & Compliance</h2>
                                        <p className="text-gray-600">Risk assessment and compliance information</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-red-600" />
                                            Risk Level
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.riskLevel || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4 text-red-600" />
                                            Percentage Ownership
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.percentageOwnership ? `${sender.percentageOwnership}%` : "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Files className="h-4 w-4 text-red-600" />
                                            Additional Due Diligence
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.additionalDueDiligenceConducted || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        */}

                        {/* Services & Sources Card */}
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Services & Sources</h2>
                                        <p className="text-gray-600">Requested services and funding sources</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-purple-600" />
                                            Requested Services
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <div className="flex flex-wrap gap-2">
                                                {sender?.requestedNilosServices && sender.requestedNilosServices.length > 0 ? (
                                                    sender.requestedNilosServices.map((service, index) => (
                                                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                            {service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-900">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-purple-600" />
                                            Source of Wealth
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <div className="flex flex-wrap gap-2">
                                                {sender?.sourceOfWealth && sender.sourceOfWealth.length > 0 ? (
                                                    sender.sourceOfWealth.map((source, index) => (
                                                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            {source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-900">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-purple-600" />
                                            Anticipated Source of Funds
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <div className="flex flex-wrap gap-2">
                                                {sender?.anticipatedSourceOfFundsOnNilos && sender.anticipatedSourceOfFundsOnNilos.length > 0 ? (
                                                    sender.anticipatedSourceOfFundsOnNilos.map((source, index) => (
                                                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-900">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compliance Declarations Card */}
                        {/*
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Compliance Declarations</h2>
                                        <p className="text-gray-600">Business compliance and regulatory declarations</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-orange-600" />
                                            Operations and Registered Addresses Match
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <Badge className={sender?.actualOperationsAndRegisteredAddressesMatch ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                                                {sender?.actualOperationsAndRegisteredAddressesMatch ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-orange-600" />
                                            Company Provides Regulated Financial Services
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <Badge className={sender?.companyProvideRegulatedFinancialServices ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                                                {sender?.companyProvideRegulatedFinancialServices ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4 text-orange-600" />
                                            Director or Beneficial Owner is PEP or US Person
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <Badge className={sender?.directorOrBeneficialOwnerIsPEPOrUSPerson ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-green-100 text-green-800 border-green-200"}>
                                                {sender?.directorOrBeneficialOwnerIsPEPOrUSPerson ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-orange-600" />
                                            Immediate Approval Requested
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <Badge className={sender?.immediateApprove ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                                                {sender?.immediateApprove ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                         */}

                        {/* Directors & Shareholders Card */}
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Directors & Shareholders</h2>
                                            <p className="text-gray-600">Company leadership and ownership structure</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="px-3 py-1">
                                            {directorsAndShareholders.length} {directorsAndShareholders.length === 1 ? 'Person' : 'People'}
                                        </Badge>
                                    </div>
                                </div>

                                {directorsAndShareholders.length > 0 ? (
                                    <>
                                        {/* Progress Indicator */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-gray-700">
                                                    {currentDirectorIndex + 1} of {directorsAndShareholders.length}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {directorsAndShareholders[currentDirectorIndex]?.firstName} {directorsAndShareholders[currentDirectorIndex]?.lastName}
                                                </p>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                                                    style={{ width: `${((currentDirectorIndex + 1) / directorsAndShareholders.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Current Director/Shareholder Details */}
                                        <motion.div
                                            key={currentDirectorIndex}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            {/* Personal Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <User className="h-4 w-4 text-indigo-600" />
                                                        Full Name
                                                    </Label>
                                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                        <p className="font-semibold text-gray-900">
                                                            {`${directorsAndShareholders[currentDirectorIndex]?.firstName} ${directorsAndShareholders[currentDirectorIndex]?.middleName ? directorsAndShareholders[currentDirectorIndex]?.middleName + ' ' : ''}${directorsAndShareholders[currentDirectorIndex]?.lastName}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-indigo-600" />
                                                        Email Address
                                                    </Label>
                                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                        <p className="text-gray-900">{directorsAndShareholders[currentDirectorIndex]?.email}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-indigo-600" />
                                                        Role & Position
                                                    </Label>
                                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                        <p className="font-semibold text-gray-900">{directorsAndShareholders[currentDirectorIndex]?.role}</p>
                                                        {directorsAndShareholders[currentDirectorIndex]?.jobTitle && (
                                                            <p className="text-sm text-gray-600 mt-1">{directorsAndShareholders[currentDirectorIndex]?.jobTitle}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                                                        Ownership
                                                    </Label>
                                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                        <p className="font-semibold text-gray-900">
                                                            {directorsAndShareholders[currentDirectorIndex]?.isShareholder
                                                                ? `${directorsAndShareholders[currentDirectorIndex]?.shareholderPercentage}% shareholding`
                                                                : 'No shareholding'
                                                            }
                                                        </p>
                                                        <div className="flex gap-2 mt-2">
                                                            {directorsAndShareholders[currentDirectorIndex]?.isDirector && (
                                                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Director</Badge>
                                                            )}
                                                            {directorsAndShareholders[currentDirectorIndex]?.isShareholder && (
                                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Shareholder</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-indigo-600" />
                                                        Phone Number
                                                    </Label>
                                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                        <p className="text-gray-900">+{directorsAndShareholders[currentDirectorIndex]?.phoneCode} {directorsAndShareholders[currentDirectorIndex]?.phoneNumber}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-indigo-600" />
                                                        Nationality
                                                    </Label>
                                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                        <p className="text-gray-900">{directorsAndShareholders[currentDirectorIndex]?.nationality}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Street Address
                                                        </Label>
                                                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                            <p className="text-gray-900">{directorsAndShareholders[currentDirectorIndex]?.streetAddress}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700">City & Postal Code</Label>
                                                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                            <p className="text-gray-900">{directorsAndShareholders[currentDirectorIndex]?.city}, {directorsAndShareholders[currentDirectorIndex]?.postalCode}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700">State/Province</Label>
                                                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                            <p className="text-gray-900">{directorsAndShareholders[currentDirectorIndex]?.state}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700">Country</Label>
                                                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                            <p className="text-gray-900">{directorsAndShareholders[currentDirectorIndex]?.country}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Verification Status */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Verification Status</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-indigo-600" />
                                                            ID Document
                                                        </Label>
                                                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={directorsAndShareholders[currentDirectorIndex]?.idDocumentVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                                                    {directorsAndShareholders[currentDirectorIndex]?.idDocumentVerified ? 'Verified' : 'Pending'}
                                                                </Badge>
                                                                <span className="text-sm text-gray-600">
                                                                    {directorsAndShareholders[currentDirectorIndex]?.idType === 'passport' ? 'Passport' : 'Driver\'s License'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Proof of Address
                                                        </Label>
                                                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                                                            <Badge className={directorsAndShareholders[currentDirectorIndex]?.proofOfAddressVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                                                {directorsAndShareholders[currentDirectorIndex]?.proofOfAddressVerified ? 'Verified' : 'Pending'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Navigation Buttons */}
                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentDirectorIndex(Math.max(0, currentDirectorIndex - 1))}
                                                disabled={currentDirectorIndex === 0}
                                                className="flex items-center gap-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>

                                            <div className="flex gap-2">
                                                {directorsAndShareholders.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentDirectorIndex(index)}
                                                        className={`w-3 h-3 rounded-full transition-all ${index === currentDirectorIndex
                                                            ? 'bg-indigo-600 scale-125'
                                                            : 'bg-gray-300 hover:bg-gray-400'
                                                            }`}
                                                    />
                                                ))}
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentDirectorIndex(Math.min(directorsAndShareholders.length - 1, currentDirectorIndex + 1))}
                                                disabled={currentDirectorIndex === directorsAndShareholders.length - 1}
                                                className="flex items-center gap-2"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Directors or Shareholders</h3>
                                        <p className="text-gray-600 mb-6">Add directors and shareholders to complete your business profile.</p>
                                        <Button className="px-6 py-3 h-auto">
                                            <Users className="mr-2 h-4 w-4" />
                                            Add Directors & Shareholders
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </div>
        </div>
    );
}