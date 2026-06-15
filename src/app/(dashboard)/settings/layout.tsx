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
            <aside className="w-full min-w-0 shrink-0 lg:w-64">
                <nav
                    className="w-full min-w-0 rounded-[20px] border border-white/60 bg-white/70 p-2 shadow-[0_4px_24px_rgba(0,0,0,0.03)] backdrop-blur-2xl lg:sticky lg:top-4"
                    aria-label="Settings sections"
                >
                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 hidden lg:block">
                        Configure
                    </p>
                    <div className="flex flex-row lg:flex-col overflow-x-auto gap-1 lg:space-y-1 max-w-full scrollbar-thin pb-2 lg:pb-0">
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
                                        "relative flex items-center lg:items-start gap-2 lg:gap-3 rounded-[14px] px-3 py-2 lg:py-2.5 text-left transition-all shrink-0",
                                        isActive
                                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                            : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
                                    )}
                                >
                                    {isActive && (
                                        <span
                                            className="absolute inset-y-2 left-1 w-1 rounded-full bg-cyan-400 hidden lg:block"
                                            aria-hidden
                                        />
                                    )}
                                    <item.icon
                                        className={cn(
                                            "ml-1 h-4 w-4 shrink-0 lg:mt-0.5",
                                            isActive ? "text-cyan-300" : "text-slate-400"
                                        )}
                                        strokeWidth={2}
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-[14px] font-semibold leading-tight whitespace-nowrap">
                                            {item.title}
                                        </span>
                                        <span
                                            className={cn(
                                                "mt-0.5 hidden lg:block text-[12px] leading-snug",
                                                isActive ? "text-white/75" : "text-slate-400"
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
