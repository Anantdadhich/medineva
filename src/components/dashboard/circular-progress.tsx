"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface CircularProgressStatCardProps {
    title: string
    value: ReactNode
    progressValue: number
    label: string
    description?: string
}

export function CircularProgressStatCard({ title, value, progressValue, label, description }: CircularProgressStatCardProps) {
    const radius = 24
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progressValue / 100) * circumference

    const lowerTitle = title.toLowerCase()
    let colorClass = "text-slate-700"
    let bgTrackClass = "text-slate-100"
    let labelColorClass = "text-slate-800"

    if (lowerTitle.includes("patient")) {
        colorClass = "text-cyan-500"
        bgTrackClass = "text-cyan-100/40"
        labelColorClass = "text-cyan-600 font-black"
    } else if (lowerTitle.includes("appt") || lowerTitle.includes("appointment")) {
        colorClass = "text-indigo-500"
        bgTrackClass = "text-indigo-100/40"
        labelColorClass = "text-indigo-600 font-black"
    } else if (lowerTitle.includes("revenue") || lowerTitle.includes("earning")) {
        colorClass = "text-emerald-500"
        bgTrackClass = "text-emerald-100/40"
        labelColorClass = "text-emerald-600 font-black"
    } else if (lowerTitle.includes("pending") || lowerTitle.includes("outstanding")) {
        colorClass = "text-amber-500"
        bgTrackClass = "text-amber-100/40"
        labelColorClass = "text-amber-600 font-black"
    }

    return (
        <Card className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between p-3.5 sm:p-4 bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.015)] rounded-[20px] gap-3 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] border hover:border-slate-200/80 cursor-pointer group">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-[11px] min-[380px]:text-[13px] font-bold text-gray-400 uppercase tracking-wider truncate transition-colors group-hover:text-gray-500">{title}</span>
                <span className="text-[20px] min-[380px]:text-[24px] sm:text-[28px] font-black text-gray-900 leading-none mt-1 truncate">{value}</span>
                <span className="text-[11px] min-[380px]:text-[12px] text-gray-400 font-medium truncate mt-0.5">{description || "Analysis"}</span>
            </div>

            <div className="relative flex items-center justify-center w-16 h-16 shrink-0 transition-transform duration-500 group-hover:rotate-12">
                {/* Background Track */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5.5"
                        fill="transparent"
                        className={bgTrackClass}
                    />
                    {/* Progress Indicator */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Center Label */}
                <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-[12px] ${labelColorClass}`}>{label}</span>
                </div>
            </div>
        </Card>
    )
}
