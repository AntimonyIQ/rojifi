import { Check } from "lucide-react"

interface OnboardingProgressProps {
    currentStep: number
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
    const steps = [
        { number: 1, title: "Personal" },
        { number: 2, title: "Address" },
        { number: 3, title: "Documents" },
    ]

    return (
        <div className="flex items-center justify-between mb-8 w-full">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                    <div className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep > step.number
                                    ? "bg-primary text-white"
                                    : currentStep === step.number
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                        >
                            {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                        </div>
                        <span
                            className={`ml-2 text-sm font-medium whitespace-nowrap ${currentStep >= step.number ? "text-primary" : "text-gray-500"}`}
                        >
                            {step.title}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 ml-4 mr-4 ${currentStep > step.number ? "bg-primary" : "bg-gray-200"}`} />
                    )}
                </div>
            ))}
        </div>
    )
}
