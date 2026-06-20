"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, MessageSquare, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"

interface Message {
    id: string
    recipient: string
    message: string
    time: string
    status: string
}

import Link from "next/link"

export function MessagesWidget({ messages }: { messages: Message[] }) {
    return (
        <Card className="min-w-0 overflow-hidden bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                <CardTitle className="text-[16px]">Messages</CardTitle>
                <Link href="/messages" className="flex items-center text-[13px] text-cyan-600 font-medium hover:text-cyan-700">
                    See All <span className="ml-1">›</span>
                </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                            <MessageSquare className="mb-2 h-8 w-8 opacity-20" />
                            <p className="text-[14px]">No recent messages</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-inner relative">
                                    {msg.recipient.charAt(0)}
                                    {msg.status === "DELIVERED" || msg.status === "COMPLETED" ? (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                            <div className="h-2.5 w-2.5 bg-green-500 rounded-full" />
                                        </div>
                                    ) : (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                            <div className="h-2.5 w-2.5 bg-amber-500 rounded-full" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[14px] font-bold text-gray-900 truncate">
                                            {msg.recipient}
                                        </p>
                                        <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap pl-2">
                                            {format(new Date(msg.time), "HH:mm")}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-gray-500 truncate mt-0.5 pr-2">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
