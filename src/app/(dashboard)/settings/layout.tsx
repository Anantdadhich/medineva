"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings, Stethoscope, QrCode } from "lucide-react"

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

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-10">
            <aside className="w-full min-w-0 shrink-0 lg:w-72">
                <nav
                    className="w-full min-w-0 rounded-[24px] border border-white/80 bg-white/40 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-3xl lg:sticky lg:top-4"
                    aria-label="Settings sections"
                >
                    <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hidden lg:block">
                        Configure
                    </p>
                    <div className="flex flex-row lg:flex-col overflow-x-auto gap-1.5 lg:space-y-1 max-w-full scrollbar-thin pb-2 lg:pb-0">
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
                                        "relative flex items-center lg:items-start gap-2.5 lg:gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all duration-250 shrink-0 select-none",
                                        isActive
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-950/15"
                                            : "text-slate-600 hover:bg-white/60 hover:text-slate-900 hover:translate-x-0.5 lg:hover:translate-x-1"
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
                                            isActive ? "text-cyan-300 scale-110" : "text-slate-400 group-hover:scale-105"
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
    )
}
