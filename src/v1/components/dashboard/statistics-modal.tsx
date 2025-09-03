import { Dialog, DialogContent } from "@/v1/components/ui/dialog"
import { Minimize2 } from "lucide-react"
import { useState } from "react"

interface StatisticsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function StatisticsModal({ isOpen, onClose }: StatisticsModalProps) {
    const [activeTab, setActiveTab] = useState("Weekly")

    const weeklyData = [
        { day: "Sun", value: 60, amount: "$2,100" },
        { day: "Mon", value: 85, amount: "$3,800" },
        { day: "Tue", value: 70, amount: "$4,300", highlight: true },
        { day: "Wed", value: 55, amount: "$2,900" },
        { day: "Thu", value: 95, amount: "$5,200" },
        { day: "Fri", value: 75, amount: "$3,600" },
        { day: "Sat", value: 80, amount: "$4,100" },
    ]

    const monthlyData = [
        { day: "Week 1", value: 70, amount: "$15,200" },
        { day: "Week 2", value: 85, amount: "$18,900" },
        { day: "Week 3", value: 60, amount: "$12,800" },
        { day: "Week 4", value: 90, amount: "$21,300", highlight: true },
    ]

    const currentData = activeTab === "Weekly" ? weeklyData : monthlyData

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[80vh] p-0 gap-0">
                <div className="p-8 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900">Transaction Volume</h2>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <span className="text-sm">Minimize</span>
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex gap-2 mb-12">
                        <button
                            onClick={() => setActiveTab("Weekly")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "Weekly" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setActiveTab("Monthly")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "Monthly" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Monthly
                        </button>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 flex flex-col">
                        <div className="relative flex-1 flex items-end justify-between gap-4 mb-8">
                            {currentData.map((item, index: number) => (
                                <div key={index} className="flex flex-col items-center flex-1 group">
                                    <div className="relative flex-1 flex items-end w-full min-h-[200px]">
                                        <div
                                            className="w-full rounded-t-2xl bg-gradient-to-t from-primary to-blue-400 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500 relative"
                                            style={{ height: `${item.value}%` }}
                                        >
                                            {/* Gradient lines effect */}
                                            <div className="absolute inset-0 rounded-t-2xl opacity-20">
                                                <div className="h-full w-full bg-gradient-to-br from-white/30 to-transparent rounded-t-2xl"></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-t-2xl"></div>
                                            </div>
                                        </div>

                                        {/* Tooltip */}
                                        {item.highlight && (
                                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-primary rounded-sm"></div>
                                                    <span>
                                                        {activeTab === "Weekly" ? "Tues, Oct 30, 2024" : "Week 4, Oct 2024"}
                                                        <br />
                                                        {item.amount} Traded
                                                    </span>
                                                </div>
                                                {/* Arrow */}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-4 font-medium">{item.day}</div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 justify-center">
                            <div className="w-3 h-3 bg-primary rounded-sm"></div>
                            <span className="text-sm text-gray-600">Volume traded</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
