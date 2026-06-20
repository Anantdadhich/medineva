"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { generateAccessCodesAction } from "@/lib/actions/access-codes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Plus,
    Search,
    Copy,
    Check,
    Lock,
    Unlock,
    Sparkles,
    Ticket,
} from "lucide-react"

interface UsedByUser {
    firstName: string
    lastName: string
    email: string
}

interface AccessCode {
    id: string
    code: string
    isUsed: boolean
    usedBy: UsedByUser | null
    createdAt: Date
}

interface AdminCodesClientProps {
    initialCodes: AccessCode[]
}

export function AdminCodesClient({ initialCodes }: AdminCodesClientProps) {
    const [count, setCount] = useState("5")
    const [isGenerating, setIsGenerating] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const router = useRouter()

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const res = await generateAccessCodesAction(Number(count))
            if (res.success) {
                router.refresh()
            } else {
                alert(res.error || "Failed to generate codes.")
            }
        } catch (error) {
            alert("An error occurred while generating codes.")
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (id: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // Filters
    const filteredCodes = initialCodes.filter((c) => {
        const matchesSearch =
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.usedBy?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${c.usedBy?.firstName} ${c.usedBy?.lastName}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    const totalCodes = initialCodes.length
    const usedCodes = initialCodes.filter((c) => c.isUsed).length
    const unusedCodes = totalCodes - usedCodes

    return (
        <div className="space-y-6">
            {/* Top Stat Summary */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                        <CardTitle className="text-[14px] font-semibold text-gray-500">Total Codes</CardTitle>
                        <Ticket className="h-4.5 w-4.5 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-[26px] font-bold text-gray-900">{totalCodes}</div>
                        <p className="text-[11px] text-gray-400 mt-0.5">All generated credentials</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                        <CardTitle className="text-[14px] font-semibold text-gray-500">Claimed Codes</CardTitle>
                        <Lock className="h-4.5 w-4.5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-[26px] font-bold text-gray-900">{usedCodes}</div>
                        <p className="text-[11px] text-gray-400 mt-0.5">Used by activated clinics</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                        <CardTitle className="text-[14px] font-semibold text-gray-500">Available Codes</CardTitle>
                        <Unlock className="h-4.5 w-4.5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-[26px] font-bold text-gray-900">{unusedCodes}</div>
                        <p className="text-[11px] text-gray-400 mt-0.5">Unused invite keys</p>
                    </CardContent>
                </Card>
            </div>

            {/* Generator Action & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="flex flex-1 max-w-md items-center gap-2 rounded-xl border border-gray-200/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-md">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search codes or clinic emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-[14px] outline-none placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Select value={count} onValueChange={setCount}>
                        <SelectTrigger className="w-[110px] rounded-xl border-gray-200/80 bg-white shadow-sm h-11">
                            <SelectValue placeholder="Count" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-150">
                            <SelectItem value="1">1 Code</SelectItem>
                            <SelectItem value="5">5 Codes</SelectItem>
                            <SelectItem value="10">10 Codes</SelectItem>
                            <SelectItem value="25">25 Codes</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 px-5 shadow-sm border border-slate-800 cursor-pointer flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Generate Codes
                    </Button>
                </div>
            </div>

            {/* Table of Codes */}
            <Card className="overflow-hidden bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px]">
                {/* Desktop View */}
                <div className="w-full overflow-x-auto hidden md:block">
                    <table className="min-w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Access Code</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Claimed By</th>
                                <th className="px-6 py-4 text-right text-[12px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {filteredCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                                        No access codes found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredCodes.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-[14px] font-bold text-gray-800 tracking-wider">
                                                {c.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                variant={c.isUsed ? "secondary" : "success"}
                                                className="shadow-none px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                            >
                                                {c.isUsed ? "Used" : "Unused"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500 font-medium">
                                            {new Date(c.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {c.usedBy ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-semibold text-gray-900 leading-tight">
                                                        {c.usedBy.firstName} {c.usedBy.lastName}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">{c.usedBy.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(c.id, c.code)}
                                                className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                            >
                                                {copiedId === c.id ? (
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-100/50 bg-white/30">
                    {filteredCodes.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No access codes found matching your criteria.
                        </div>
                    ) : (
                        filteredCodes.map((c) => (
                            <div key={c.id} className="p-4 space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[15px] font-extrabold text-gray-900 tracking-wider">
                                        {c.code}
                                    </span>
                                    <Badge
                                        variant={c.isUsed ? "secondary" : "success"}
                                        className="shadow-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        {c.isUsed ? "Used" : "Unused"}
                                    </Badge>
                                </div>

                                <div className="bg-white/50 rounded-[14px] border border-gray-150/40 p-3 space-y-2.5">
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Created</span>
                                        <span className="text-gray-700 font-semibold">
                                            {new Date(c.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-start text-[12px] pt-2 border-t border-gray-100">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Claimed By</span>
                                        <span className="text-right">
                                            {c.usedBy ? (
                                                <span className="flex flex-col items-end">
                                                    <span className="font-bold text-gray-900">
                                                        {c.usedBy.firstName} {c.usedBy.lastName}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 mt-0.5">{c.usedBy.email}</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(c.id, c.code)}
                                        className="w-full rounded-xl h-9 text-[13px] font-bold border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1.5"
                                    >
                                        {copiedId === c.id ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy Code
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}
