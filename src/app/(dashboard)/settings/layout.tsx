"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings, Stethoscope, QrCode } from "lucide-react"
import { Header } from "@/components/layout/header"
import { getClinicId } from "@/lib/actions/settings"

const settingsNav = [
    {
        title: "General",
        href: "/settings",
        icon: Settings,
        description: "Clinic profile & preferences",
    },
    {
        title: "Treatment catalog",
        href: "/settings/treatments",
        icon: Stethoscope,
        description: "Services, codes, and pricing",
    },
    {
        title: "Patient self-registration",
        href: "/settings/patient-intake",
        icon: QrCode,
        description: "QR code & intake link",
    },
]

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [clinicId, setClinicId] = useState<string | null>(null)

    useEffect(() => {
        getClinicId().then(setClinicId).catch(console.error)
    }, [])

    // Determine header details based on current pathname
    let headerTitle = "Settings"
    let headerDescription = ""

    const activeNav = settingsNav.find(item => {
        if (item.href === "/settings") {
            return pathname === "/settings"
        }
        return pathname === item.href || pathname.startsWith(`${item.href}/`)
    })

    if (activeNav) {
        headerTitle = activeNav.title === "General" ? "General Settings" : activeNav.title
        headerDescription = activeNav.description
    }

    return (
        <div className="flex flex-col w-full min-w-0 space-y-6">
            <Header
                title={headerTitle}
                description={headerDescription}
                clinicId={clinicId || undefined}
            />

            <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-10">
                <aside className="w-full min-w-0 shrink-0 lg:w-72">
                    <nav
                        className="w-full min-w-0 bg-transparent border-b border-slate-200/50 p-0 shadow-none rounded-none lg:rounded-[24px] lg:border lg:border-white/80 lg:bg-white/40 lg:p-3 lg:shadow-[0_8px_32px_rgba(0,0,0,0.03)] lg:backdrop-blur-3xl lg:sticky lg:top-4"
                        aria-label="Settings sections"
                    >
                        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hidden lg:block">
                            Configure
                        </p>
                        <div className="flex flex-row lg:flex-col overflow-x-auto gap-6 lg:space-y-1 max-w-full scrollbar-thin pb-2 lg:pb-0">
                            {settingsNav.map((item) => {
                                const isActive =
                                    item.href === "/settings"
                                        ? pathname === "/settings"
                                        : pathname === item.href || pathname.startsWith(`${item.href}/`)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "relative flex items-center lg:items-start transition-all duration-250 shrink-0 select-none",
                                            "gap-2 lg:gap-3 rounded-none lg:rounded-xl px-0.5 lg:px-3.5 pb-2.5 lg:py-2.5 pt-1.5 lg:pt-2.5 border-b-2 lg:border-b-0",
                                            isActive
                                                ? "border-slate-900 lg:border-transparent text-slate-900 lg:text-white lg:bg-slate-900 lg:shadow-xl lg:shadow-slate-950/15"
                                                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350 lg:hover:bg-white/60 lg:hover:text-slate-900 lg:hover:translate-x-1"
                                        )}
                                    >
                                        {isActive && (
                                            <span
                                                className="absolute inset-y-3 left-1.5 w-1 rounded-full bg-cyan-400 hidden lg:block"
                                                aria-hidden
                                            />
                                        )}
                                        <item.icon
                                            className={cn(
                                                "h-4 w-4 shrink-0 lg:mt-0.5 transition-transform duration-300",
                                                isActive
                                                    ? "text-slate-900 lg:text-cyan-300 scale-110"
                                                    : "text-slate-400 group-hover:scale-105"
                                            )}
                                            strokeWidth={2}
                                        />
                                        <span className="min-w-0">
                                            <span className="block text-[14px] font-semibold leading-tight whitespace-nowrap">
                                                {item.title}
                                            </span>
                                            <span
                                                className={cn(
                                                    "mt-1 hidden lg:block text-[11px] leading-relaxed",
                                                    isActive ? "text-white/70 font-normal" : "text-slate-400"
                                                )}
                                            >
                                                {item.description}
                                            </span>
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>

                    </nav>
                </aside>

                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    )
}
