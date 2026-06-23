"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    MessageSquare,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

interface Message {
    id: string
    recipient: string
    status: string
    time: string | Date
    message: string
}

interface MessagesClientProps {
    initialMessages: Message[]
}

export function MessagesClient({ initialMessages }: MessagesClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Filter messages based on search term and status
    const filteredMessages = useMemo(() => {
        return initialMessages.filter((msg) => {
            const matchesSearch =
                msg.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.message.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesStatus =
                statusFilter === "ALL" || msg.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [initialMessages, searchTerm, statusFilter])

    // Calculate pagination values
    const totalItems = filteredMessages.length
    const totalPages = Math.ceil(totalItems / pageSize) || 1
    const paginatedMessages = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredMessages.slice(startIndex, startIndex + pageSize)
    }, [filteredMessages, currentPage, pageSize])

    // Reset to page 1 on filter/search change
    const handleSearchChange = (val: string) => {
        setSearchTerm(val)
        setCurrentPage(1)
    }

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val)
        setCurrentPage(1)
    }

    const handlePageSizeChange = (val: string) => {
        setPageSize(Number(val))
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by recipient or message content..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white shadow-sm focus-visible:ring-cyan-500/20 w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="h-11 w-[140px] rounded-xl border-gray-200/60 bg-white/60 focus:bg-white shadow-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-gray-100 bg-white shadow-xl">
                            <SelectItem value="ALL" className="rounded-lg">All Statuses</SelectItem>
                            <SelectItem value="SENT" className="rounded-lg font-medium text-emerald-600">Delivered</SelectItem>
                            <SelectItem value="PENDING" className="rounded-lg font-medium text-amber-600">Pending</SelectItem>
                            <SelectItem value="FAILED" className="rounded-lg font-medium text-rose-600">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="h-11 w-[110px] rounded-xl border-gray-200/60 bg-white/60 focus:bg-white shadow-sm">
                            <SelectValue placeholder="Page Size" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-gray-100 bg-white shadow-xl">
                            <SelectItem value="5" className="rounded-lg">5 / page</SelectItem>
                            <SelectItem value="10" className="rounded-lg">10 / page</SelectItem>
                            <SelectItem value="25" className="rounded-lg">25 / page</SelectItem>
                            <SelectItem value="50" className="rounded-lg">50 / page</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Messages List Card */}
            <Card className="min-h-0 flex-1 overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.015)] backdrop-blur-2xl">
                <CardContent className="p-0">
                    {paginatedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                <MessageSquare className="h-7 w-7" strokeWidth={1.75} />
                            </div>
                            <h3 className="text-[17px] font-bold text-gray-900">No messages found</h3>
                            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-gray-500">
                                Try refining your search query or status filters.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100/50">
                            {paginatedMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className="flex gap-4 px-4 py-5 transition-colors hover:bg-gray-50/50 sm:gap-5 sm:px-6"
                                >
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[15px] font-bold text-slate-600 shadow-inner">
                                        {msg.recipient.charAt(0)}
                                        {msg.status === "SENT" ? (
                                            <div className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white bg-white p-0.5 shadow-sm">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            </div>
                                        ) : msg.status === "FAILED" ? (
                                            <div className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white bg-white p-0.5 shadow-sm">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                            </div>
                                        ) : (
                                            <div className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white bg-white p-0.5 shadow-sm">
                                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                            <p className="text-[15px] font-bold leading-snug text-gray-900">
                                                {msg.recipient}
                                            </p>
                                            <time
                                                className="shrink-0 text-[12px] font-medium tabular-nums text-gray-400 sm:pl-4 sm:text-right sm:text-[13px]"
                                                dateTime={String(msg.time)}
                                            >
                                                {format(new Date(msg.time), "MMM d, yyyy · HH:mm")}
                                            </time>
                                        </div>
                                        <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
                                            {msg.message}
                                        </p>
                                        <div
                                            className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                                msg.status === "SENT"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : msg.status === "FAILED"
                                                      ? "bg-red-50 text-red-700"
                                                      : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {msg.status === "SENT" ? "Delivered" : msg.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-[13px] text-gray-500 font-semibold">
                        Showing <span className="text-gray-900">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}-{Math.min(totalItems, currentPage * pageSize)}</span> of <span className="text-gray-900">{totalItems}</span> messages
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="rounded-xl h-9 px-3 border-gray-200 bg-white shadow-sm hover:bg-slate-50 text-gray-700"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center justify-center text-[13px] font-bold text-gray-700 px-2 min-w-8">
                            {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="rounded-xl h-9 px-3 border-gray-200 bg-white shadow-sm hover:bg-slate-50 text-gray-700"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
