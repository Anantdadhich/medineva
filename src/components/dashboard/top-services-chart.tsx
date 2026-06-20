"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp } from "lucide-react"

interface TopServicesChartProps {
    data: Array<{
        name: string
        revenue: number
        count: number
    }>
}

export function TopServicesChart({ data }: TopServicesChartProps) {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
            <CardHeader className="shrink-0 border-b border-gray-100/50 p-4 sm:p-6 pb-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-[17px] font-bold text-gray-900">Top services</CardTitle>
                        <CardDescription className="text-[14px] text-gray-500">
                            Treatments on invoices with the highest revenue
                        </CardDescription>
                    </div>
                    <TrendingUp className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 p-3 sm:p-6 pt-6 sm:pt-6">
                {!data?.length ? (
                    <div className="flex items-center justify-center text-center text-[14px] text-gray-400" style={{ height: 292 }}>
                        When you create invoices with line items, your top services will appear here.
                    </div>
                ) : (
                    <div className="h-[292px] w-full min-w-0">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="name"
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
                                    cursor={{ fill: '#f3f4f6' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-sm p-4 shadow-xl">
                                                    <div className="font-semibold text-gray-900 mb-2">{payload[0].payload.name}</div>
                                                    <div className="text-[13px] text-gray-600 flex justify-between gap-4">
                                                        <span>Revenue:</span>
                                                        <span className="font-medium text-gray-900">{formatCurrency(payload[0].value as number)}</span>
                                                    </div>
                                                    <div className="text-[13px] text-gray-600 flex justify-between gap-4 mt-1">
                                                        <span>Count:</span>
                                                        <span className="font-medium text-gray-900">{payload[0].payload.count} treatments</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#9333ea"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
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
