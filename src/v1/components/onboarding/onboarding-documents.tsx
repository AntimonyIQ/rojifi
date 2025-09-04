"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select"
import { Plus } from "lucide-react"
import { OnboardingProgress } from "./onboarding-progress"
import { OnboardingSidebar } from "./onboarding-sidebar"

interface OnboardingDocumentsProps {
    data: any
    onUpdate: (data: any) => void
    onNext: () => void
    onPrev: () => void
}

export function OnboardingDocuments({ data, onUpdate, onNext }: OnboardingDocumentsProps) {
    const [dragActive, setDragActive] = useState(false)

    const handleInputChange = (field: string, value: string) => {
        onUpdate({ [field]: value })
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpdate({ uploadedFile: e.dataTransfer.files[0] })
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpdate({ uploadedFile: e.target.files[0] })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext()
    }

    return (
        <div className="max-w-6xl mx-auto">
            <OnboardingProgress currentStep={3} />

            <div className="grid lg:grid-cols-[300px,1fr] gap-8 mt-8">
                <OnboardingSidebar currentStep={3} />

                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Document</h2>
                        <p className="text-gray-600">Provide details of your government authorized ID</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-2">
                                Select ID type
                            </Label>
                            <Select value={data.idType} onValueChange={(value) => handleInputChange("idType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nin">National ID (NIN)</SelectItem>
                                    <SelectItem value="drivers-license">Driver's License</SelectItem>
                                    <SelectItem value="passport">International Passport</SelectItem>
                                    <SelectItem value="voters-card">Voter's Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                ID Number
                            </Label>
                            <Input
                                id="idNumber"
                                value={data.idNumber}
                                onChange={(e) => handleInputChange("idNumber", e.target.value)}
                                placeholder="ASD938923989043JJ0892"
                            />
                        </div>

                        <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-2">Upload document</Label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-600 mb-2">Drag & drop or click to choose files</p>
                                <p className="text-sm text-gray-500 mb-2">JPEG, and PNG formats</p>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    </div>
                                    Max file size: 2 MB
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />
                            </div>
                            {data.uploadedFile && (
                                <p className="text-sm text-green-600 mt-2">File uploaded: {data.uploadedFile.name}</p>
                            )}
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                                Finish
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
