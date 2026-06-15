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

    return (
        <Card className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between p-3.5 sm:p-4 bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px] gap-3">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-[11px] min-[380px]:text-[13px] font-semibold text-gray-500 uppercase tracking-wide truncate">{title}</span>
                <span className="text-[20px] min-[380px]:text-[24px] sm:text-[28px] font-bold text-gray-900 leading-none mt-1 truncate">{value}</span>
                <span className="text-[11px] min-[380px]:text-[12px] text-gray-400 font-medium truncate">{description || "Analysis"}</span>
            </div>

            <div className="relative flex items-center justify-center w-16 h-16">
                {/* Background Track */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    {/* Progress Indicator */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="text-slate-700 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Center Label */}
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[12px] font-bold text-gray-800">{label}</span>
                </div>
            </div>
        </Card>
    )
}
