"use client";

import { useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { FileDown, Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { usePathname } from "wouter/use-browser-location";
import { Link } from "wouter";

export function BankStatementView() {
    const [totalTransactions, setTotalTransactions] = useState<number>(1);
    const [email, setEmail] = useState<string>("antimonyiq@gmail.com");
    const [months, setMonths] = useState<number>(3); // default: 3 months

    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const today = new Date();
    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - months);

    const pathname = usePathname();
    const parts = pathname ? pathname.split('/') : [];
    const wallet = (parts[2] || 'NGN').toUpperCase();

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Bank Statement</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your bank statement history across all accounts
                    </p>
                </div>
            </div>

            {/* Export Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">Export Bank Statement</h2>
                </div>

                <div className="w-full flex flex-col items-center justify-center pt-5">
                    <Card>
                        <CardContent className="p-0 border rounded-xl">
                            <div className="overflow-x-auto">
                                {totalTransactions === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 px-10">
                                        <p className="text-center">
                                            You currently have no Transaction Payments. Create one by clicking on the <br />
                                            <span className="text-blue-500 font-medium">"Create Payment"</span> button
                                            to enable exporting of bank statements.
                                        </p>
                                        <div className="flex items-center gap-2 pt-5">
                                            <Button
                                                size="lg"
                                                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                                            >
                                                <Link
                                                    href={`/dashboard/${wallet}/payment`}
                                                    className="flex flex-row items-center justify-center gap-2"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Create Payment</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {totalTransactions > 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 px-10">
                                        <Label className="text-xl font-bold">Export Configurations</Label>
                                        <p className="text-center mb-4">
                                            Select the date range for which you’d like to export your statement.
                                        </p>

                                        {/* Date inputs */}
                                        <div className="flex flex-col gap-4 mb-4 w-full">
                                            <div className="w-full">
                                                <Label className="text-sm">From</Label>
                                                <Input
                                                    type="date"
                                                    value={fromDate}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                    className="border rounded-md px-3 py-2 w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm">To</Label>
                                                <Input
                                                    type="date"
                                                    value={toDate}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                    className="border rounded-md px-3 py-2 w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Slider for months (commented out) */}
                                        {/*
                                        <div className="w-64 mb-4">
                                            <Slider
                                                defaultValue={[months]}
                                                min={1}
                                                max={12}
                                                step={1}
                                                onValueChange={(val) => setMonths(val[0])}
                                            />
                                            <p className="text-center mt-2 text-sm text-gray-600">
                                                Selected: <span className="font-medium">{months} month(s)</span>
                                            </p>
                                        </div>
                                        */}

                                        <p className="text-center text-slate-500 text-xs md:text-sm mb-4">
                                            You will receive a statement covering transactions from{" "}
                                            <span className="font-medium">
                                                {fromDate ? new Date(fromDate).toDateString() : "—"}
                                            </span>{" "}
                                            to{" "}
                                            <span className="font-medium">
                                                {toDate ? new Date(toDate).toDateString() : "—"}
                                            </span>. <br />
                                            The statement will be sent to your email:{" "}
                                            <span className="font-medium">
                                                {email.slice(0, 3)}***{email.slice(-6)}
                                            </span>
                                        </p>

                                        <Button
                                            size="lg"
                                            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                                        >
                                            <Link
                                                href={`/dashboard/${wallet}/payment`}
                                                className="flex flex-row items-center justify-center gap-2"
                                            >
                                                <FileDown className="h-4 w-4" />
                                                Export Bank Statement
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
