"use client"

import { User, MapPin, FileText, Check } from "lucide-react"

interface OnboardingSidebarProps {
    currentStep: number
}

export function OnboardingSidebar({ currentStep }: OnboardingSidebarProps) {
    const steps = [
        {
            id: 1,
            title: "Bio-data",
            description: "Enter your name as it appears on your ID",
            icon: User,
        },
        {
            id: 2,
            title: "Address",
            description: "This should match your proof of address document",
            icon: MapPin,
        },
        {
            id: 3,
            title: "ID Information",
            description: "Provide details of your government authorized ID",
            icon: FileText,
        },
    ]

    return (
        <div className="space-y-4">
            {steps.map((step) => {
                const isCompleted = currentStep > step.id
                const isCurrent = currentStep === step.id
                const Icon = step.icon

                return (
                    <div
                        key={step.id}
                        className={`p-4 rounded-lg border-2 ${isCompleted
                            ? "border-primary bg-primary/5"
                            : isCurrent
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 bg-white"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                                    ? "bg-primary text-white"
                                    : isCurrent
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </div>
                            <div>
                                <h3 className={`font-medium ${isCompleted || isCurrent ? "text-primary" : "text-gray-700"}`}>
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
