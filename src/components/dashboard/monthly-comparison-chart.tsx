"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface MonthlyComparisonChartProps {
    data: Array<{
        month: string
        thisYear: number
        lastYear: number
    }>
    currentYear?: number
}

export function MonthlyComparisonChart({ data, currentYear = new Date().getFullYear() }: MonthlyComparisonChartProps) {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <Card className="flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
            <CardHeader className="shrink-0 border-b border-gray-100/50 p-4 sm:p-6 pb-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-[17px] font-bold text-gray-900">Monthly comparison</CardTitle>
                        <CardDescription className="text-[14px] text-gray-500">Revenue paid this year vs last year</CardDescription>
                    </div>
                    <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
            </CardHeader>
            <CardContent className="min-h-0 w-full min-w-0 p-3 sm:p-6 pt-6 sm:pt-6">
                <div className="h-[292px] w-full min-w-0">
                    {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="month"
                                className="text-[12px]"
                                tick={{ fill: "#6b7280" }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fill: "#6b7280" }}
                                tickFormatter={(value) => formatCurrency(value)}
                                className="text-[12px]"
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-sm p-4 shadow-xl">
                                                <div className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</div>
                                                {payload.map((entry) => (
                                                    <div key={entry.name} className="flex justify-between gap-6 text-[13px] font-medium" style={{ color: entry.color }}>
                                                        <span>{entry.name}:</span>
                                                        <span>{formatCurrency(entry.value as number)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }} />
                            <Line
                                type="monotone"
                                dataKey="thisYear"
                                stroke="#c2410c"
                                strokeWidth={3}
                                name={`${currentYear}`}
                                dot={{ fill: "#c2410c", r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, stroke: "#c2410c", strokeWidth: 2, fill: "white" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="lastYear"
                                stroke="#78716c"
                                strokeWidth={3}
                                strokeDasharray="6 6"
                                name={`${currentYear - 1}`}
                                dot={{ fill: "#78716c", r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, stroke: "#78716c", strokeWidth: 2, fill: "white" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full bg-slate-50/50 animate-pulse rounded-xl" />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
