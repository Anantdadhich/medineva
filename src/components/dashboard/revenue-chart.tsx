"use client"

import { useState, useMemo, useEffect } from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp } from "lucide-react"

/** Warm amber / orange — matches dashboard gradient, no green or blue */
const STROKE = "#10b981"
const GRADIENT_ID = "revenueAreaFill"

interface RevenueChartProps {
    weeklyData: { name: string; value: number }[]
    monthlyData: { name: string; value: number }[]
}

const CHART_H = 292

export function RevenueChart({ weeklyData, monthlyData }: RevenueChartProps) {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const [period, setPeriod] = useState<"weekly" | "monthly">("monthly")
    const data = period === "weekly" ? weeklyData : monthlyData

    const chartData = useMemo(() => data?.map((d) => ({ ...d })) ?? [], [data])

    return (
        <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
            <CardHeader className="shrink-0 flex-row flex-wrap items-start justify-between gap-3 border-b border-gray-100/50 p-4 sm:p-6 pb-4 sm:pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-[17px] font-bold text-gray-900">Revenue overview</CardTitle>
                    <CardDescription className="text-[14px] text-gray-500">
                        {period === "weekly" ? "Last 8 weeks (paid invoices)" : "Last 6 months (paid invoices)"}
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <Select value={period} onValueChange={(val) => setPeriod(val as "weekly" | "monthly")}>
                        <SelectTrigger className="h-9 w-[128px] rounded-xl border-gray-200 bg-white/80 text-[13px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="min-h-0 w-full min-w-0 flex-1 p-3 sm:p-6 pt-6 sm:pt-6">
                {!chartData.length ? (
                    <div className="flex items-center justify-center text-[14px] text-gray-400" style={{ height: CHART_H }}>
                        No payments recorded in this range yet.
                    </div>
                ) : (
                    <div className="w-full min-w-0" style={{ height: CHART_H }}>
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                                <defs>
                                    <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={STROKE} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={STROKE} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={10}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={52}
                                    tickFormatter={(value) => formatCurrency(Number(value))}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null
                                        const v = payload[0].value as number
                                        return (
                                            <div className="rounded-xl border border-gray-200/80 bg-white/95 px-3 py-2.5 text-[13px] shadow-lg backdrop-blur-sm">
                                                <div className="mb-1 font-semibold text-gray-900">{label}</div>
                                                <div className="font-medium text-gray-900">{formatCurrency(v)}</div>
                                            </div>
                                        )
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={STROKE}
                                    strokeWidth={2.5}
                                    fill={`url(#${GRADIENT_ID})`}
                                    dot={{ fill: STROKE, r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: STROKE }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full bg-slate-50/50 animate-pulse rounded-xl" />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
