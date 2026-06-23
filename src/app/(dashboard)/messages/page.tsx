import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { getAllMessages } from "@/lib/actions/dashboard"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { MessageSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { MessagesClient } from "./messages-client"

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
    const user = await getCurrentUser()
    if (!user || !user.clinicId) redirect("/sign-in")

    const messages = await getAllMessages(user.clinicId)

    const sent = messages.filter((m) => m.status === "SENT").length
    const failed = messages.filter((m) => m.status === "FAILED").length
    const pending = messages.filter((m) => m.status === "PENDING").length

    const statCards = [
        {
            label: "Total",
            value: messages.length,
            sub: "All notifications",
            icon: MessageSquare,
            tone: "slate" as const,
        },
        {
            label: "Delivered",
            value: sent,
            sub: "Sent successfully",
            icon: CheckCircle2,
            tone: "emerald" as const,
        },
        {
            label: "Pending",
            value: pending,
            sub: "Awaiting delivery",
            icon: Clock,
            tone: "amber" as const,
        },
        {
            label: "Failed",
            value: failed,
            sub: "Needs attention",
            icon: AlertCircle,
            tone: "rose" as const,
        },
    ]

    const toneStyles = {
        slate: "bg-slate-100 text-slate-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        rose: "bg-rose-50 text-rose-600",
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6">
            <Header
                title="Messages"
                description="Patient notifications and delivery status for your clinic."
                clinicId={user.clinicId}
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((s) => (
                    <Card
                        key={s.label}
                        className="rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl"
                    >
                        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneStyles[s.tone]}`}
                            >
                                <s.icon className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                                    {s.label}
                                </p>
                                <p className="text-[22px] font-bold tabular-nums tracking-tight text-gray-900">
                                    {s.value}
                                </p>
                                <p className="truncate text-[12px] font-medium text-gray-500">{s.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <MessagesClient initialMessages={messages} />
        </div>
    )
}
