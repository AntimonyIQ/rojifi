
"use client";

import { useEffect, useState } from "react";
import { Briefcase, Check, CheckCircle2, Files, MapPin, UsersIcon, } from "lucide-react";
import Loading from "../loading";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Link from "next/link";
import { ISender } from "@/interface/interface";
import { session, SessionData } from "@/session/session";

enum Tabs {
    KYC = "KYC",
    OVERVIEW = "Overview"
}

export function BusinessProfileView() {
    const [loading, setLoading] = useState<boolean>(true);
    const [kycCompleted, setKycCompleted] = useState<boolean>(false);
    const [sender, setSender] = useState<ISender | null>(null);
    const sd: SessionData = session.getUserData();

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("KYC");
    const itemsPerPage = 10;

    const statusTabs = Object.values(Tabs);

    useEffect(() => {
        if (sd) {
            setSender(sd.sender);
            setKycCompleted(sd.sender.businessVerificationCompleted);
            setLoading(false);
        }
    }, [sd]);

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Business Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your transaction history across different currencies
                    </p>
                </div>
            </div>

            {/* Business Profile Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">{statusFilter}</h2>
                </div>

                {/* Status Tabs and Currency Filter */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="w-full lg:w-auto">
                        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
                            {statusTabs.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1); // Reset to first page when filter changes
                                    }}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === status
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sender loading */}
                {loading && <div className="py-40"><Loading /></div>}

                {!loading && statusFilter === Tabs.KYC && kycCompleted === false &&
                    <div className="flex flex-col items-center justify-center pt-5 w-full">
                        <div className="flex flex-col border rounded-sm p-5 gap-3">
                            <div>
                                <h2 className="font-bold text-[30px]">{statusFilter} Verification</h2>
                                <p className="text-slate-500">Complete/Update your Business {statusFilter} details and <span className="text-blue-500 font-medium">"Submit for Approval"</span></p>
                            </div>
                            <div className="w-full h-[1px] bg-slate-300"></div>
                            <div className="my-5 flex flex-col items-start justify-between gap-4">
                                <div className="flex flex-row items-center justify-start gap-3">
                                    <div className="w-10 h-10 rounded-full p-2 border flex flex-col items-center justify-center bg-blue-50">
                                        <Files size={18} color="#004390FF" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-[18px]">Business Documents</h2>
                                        <p className="text-slate-500 text-sm">Upload and manage all required Business documents</p>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-start gap-3">
                                    <div className="w-10 h-10 rounded-full p-2 border flex flex-col items-center justify-center bg-red-50">
                                        <UsersIcon size={18} color="#900000FF" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-[18px]">Directors & Shareholders</h2>
                                        <p className="text-slate-500 text-sm">Add and Manage all Directors & Shareholders of this business</p>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-start gap-3">
                                    <div className="w-10 h-10 rounded-full p-2 border flex flex-col items-center justify-center bg-yellow-50-50">
                                        <MapPin size={18} color="#906C00FF" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-[18px]">Business Address</h2>
                                        <p className="text-slate-500 text-sm">Confirm currect business address by uploading a recent utility bill</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-slate-300"></div>
                            <div>
                                <Button className="text-white w-full" size="lg" >
                                    <Link href="/signup/123456/verification" className="flex flex-row gap-2 items-center justify-center">
                                        <CheckCircle2 />
                                        Submit for Approval
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                }

                {!loading && statusFilter === Tabs.KYC && kycCompleted === true && (
                    <div className="flex flex-col items-center justify-center pt-5 w-full">
                        <div className="flex flex-col border rounded-sm p-5 gap-3">
                            <div>
                                <h2 className="font-bold text-[30px]">{statusFilter} Approved</h2>
                                <p className="text-slate-500">You have completed your Business {statusFilter} verification</p>
                            </div>
                            <div className="w-full h-[1px] bg-slate-300"></div>
                            <div className="my-5 flex flex-col items-center justify-center gap-4 w-full">
                                <div className="w-20 h-20 rounded-full p-2 border flex flex-col items-center justify-center bg-green-500">
                                    <Check size={50} color="#017605" />
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-slate-300"></div>
                            <div>
                                <Button className="text-white w-full" size="lg" >
                                    <Link href="/signup/123456/verification" className="flex flex-row gap-2 items-center justify-center">
                                        Close
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && statusFilter === Tabs.OVERVIEW &&
                    <div className="flex flex-col items-center justify-center pt-5 w-full">
                        <div className="w-full max-w-5xl border rounded-xl shadow-lg bg-white p-8 flex flex-col gap-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Overview</h2>
                            <div className="w-full h-[2px] bg-slate-200 mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                <div>
                                    <Label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">Business Name</Label>
                                    <Input id="businessName" name="businessName" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.businessName || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="rojifiId" className="block text-sm font-semibold text-gray-700 mb-2">Rojifi ID</Label>
                                    <Input id="rojifiId" name="rojifiId" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.rojifiId || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="businessRegistrationNumber" className="block text-sm font-semibold text-gray-700 mb-2">Business Registration Number</Label>
                                    <Input id="businessRegistrationNumber" name="businessRegistrationNumber" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.businessRegistrationNumber || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="countryOfIncorporation" className="block text-sm font-semibold text-gray-700 mb-2">Country of Incorporation</Label>
                                    <Input id="countryOfIncorporation" name="countryOfIncorporation" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.countryOfIncorporation || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="businessAddress" className="block text-sm font-semibold text-gray-700 mb-2">Business Address</Label>
                                    <Input id="businessAddress" name="businessAddress" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.businessAddress || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="businessCity" className="block text-sm font-semibold text-gray-700 mb-2">Business City</Label>
                                    <Input id="businessCity" name="businessCity" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.businessCity || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="businessState" className="block text-sm font-semibold text-gray-700 mb-2">Business State</Label>
                                    <Input id="businessState" name="businessState" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.businessState || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="businessPostalCode" className="block text-sm font-semibold text-gray-700 mb-2">Business Postal Code</Label>
                                    <Input id="businessPostalCode" name="businessPostalCode" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.businessPostalCode || ""} readOnly disabled />
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-slate-200 mt-6 mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                <div>
                                    <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Business Email</Label>
                                    <Input id="email" name="email" type="email" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.email || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">Business Phone</Label>
                                    <Input id="phoneNumber" name="phoneNumber" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.phoneNumber || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">Country</Label>
                                    <Input id="country" name="country" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.country || ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="dateOfIncorporation" className="block text-sm font-semibold text-gray-700 mb-2">Date of Incorporation</Label>
                                    <Input id="dateOfIncorporation" name="dateOfIncorporation" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.dateOfIncorporation ? new Date(sender.dateOfIncorporation).toLocaleDateString() : ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="createdAt" className="block text-sm font-semibold text-gray-700 mb-2">Created At</Label>
                                    <Input id="createdAt" name="createdAt" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.createdAt ? new Date(sender.createdAt).toLocaleDateString() : ""} readOnly disabled />
                                </div>
                                <div>
                                    <Label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">Status</Label>
                                    <Input id="status" name="status" type="text" className="h-12 bg-gray-50 border-gray-200 text-gray-900 font-medium" value={sender?.status || ""} readOnly disabled />
                                </div>
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
    );
}