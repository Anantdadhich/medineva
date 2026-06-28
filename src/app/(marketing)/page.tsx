"use client";

import React, { useState } from 'react';
import {
    Users,
    Calendar,
    MessageSquare,
    Receipt,
    Stethoscope,
    ShieldCheck,
    ChevronRight,
    LayoutDashboard,
    Settings,
    QrCode,
    Zap,
    Bell,
    MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { NoiseTexture } from '@/components/ui/noisetexture';
import { cn } from '@/lib/utils';

const PMS_FEATURES = [
    {
        title: "All-in-One Daily Dashboard",
        desc: "See your appointments, check-in status, and today's collections in one clean view. Zero clutter, zero stress.",
        iconColor: "blue" as const,
        icon: LayoutDashboard,
    },
    {
        title: "Instant Monthly Reports",
        desc: "Track your practice earnings, top-performing procedures, and outstanding collections in 2 simple clicks.",
        iconColor: "cyan" as const,
        icon: ShieldCheck,
    },
    {
        title: "3-Click Patient Billing",
        desc: "Create and print professional bills immediately during checkout. Apply custom discounts and print receipt PDFs instantly.",
        iconColor: "orange" as const,
        icon: Receipt,
    },
];

const STATS = [
    {
        value: "Super Simple",
        label: "Designed specifically for doctors. No complicated training or computer degrees required.",
        icon: Calendar,
    },
    {
        value: "100% Paperless",
        label: "Patients scan a QR code at your reception to register themselves. No manual forms to file.",
        icon: ShieldCheck,
    },
    {
        value: "Staff Ready",
        label: "Your receptionist can learn the system and start booking appointments in under 5 minutes.",
        icon: Users,
    },
];

const FAQ_DATA = [
    {
        q: "Do I need special computer training to use this?",
        a: "Not at all. If you can send an email or open a website, you can use Medineva. The interface is clean, uses large buttons, and displays everything on a single screen so you don't get lost.",
    },
    {
        q: "How does it help me manage my clinic?",
        a: "It does four main things: schedules patient visits, stores checkup histories and prescriptions, texts automated visit reminders to patients, and handles quick print-ready invoicing.",
    },
    {
        q: "What is QR Self Check-In and how does it save me time?",
        a: "We provide a printable QR code for your reception desk. Arriving patients scan it on their phone, fill in their name and details, and they instantly appear on your screen. Your receptionist doesn't have to write anything down or type it in.",
    },
];

const FeaturePill = ({
    title,
    desc,
    iconColor,
    icon: Icon,
}: {
    title: string
    desc: string
    iconColor: "orange" | "blue" | "cyan"
    icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
}) => {
    const colorMap = {
        orange: "bg-orange-50 text-orange-500",
        blue: "bg-blue-50 text-blue-500",
        cyan: "bg-cyan-50 text-cyan-500",
    }

    return (
        <div className="flex w-full sm:flex-1 sm:min-w-[300px] sm:max-w-[340px] cursor-pointer items-start gap-4 rounded-[20px] border border-gray-100/50 bg-white px-6 py-5 shadow-md transition-transform hover:-translate-y-1">
            <div
                className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${colorMap[iconColor]}`}
            >
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div className="text-left min-w-0">
                <h4 className="mb-1 text-[15px] font-medium truncate">{title}</h4>
                <p className="text-[13px] leading-relaxed text-gray-500">{desc}</p>
            </div>
        </div>
    )
}

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setIsOpen(!isOpen)
                }
            }}
            className="group cursor-pointer rounded-[20px] border border-gray-100 bg-white p-5 md:p-6 shadow-sm transition-all hover:shadow-md"
        >
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-[15px] md:text-[16px] font-medium text-gray-900">{q}</h4>
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 transition-transform duration-200 ${isOpen ? "rotate-90 bg-gray-100" : ""}`}
                >
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900" />
                </div>
            </div>
            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 mt-4 border-t border-gray-50 pt-4 text-[14px] leading-relaxed text-gray-500">
                    {a}
                </div>
            )}
        </div>
    )
}

const HeroSection = () => (
    <section
        className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24"
        style={{
            background: "radial-gradient(circle at 50% 0%, rgba(200, 240, 255, 0.4) 0%, rgba(255, 240, 200, 0.4) 30%, transparent 70%)"
        }}
    >

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 text-center">

            <div className="mb-6 md:mb-8 flex items-center justify-center gap-2.5">
                <div className="flex items-center gap-2 rounded-full border border-gray-200/50 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm max-w-full">
                    <span className="relative flex h-2 w-2 shrink-0 rounded-full bg-blue-500">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    </span>
                    <span className="text-[13px] md:text-[14px] font-medium text-gray-700 truncate">Digital Clinic Management</span>
                </div>
            </div>

            <h1 className="mb-6 md:mb-8 text-[36px] sm:text-[40px] md:text-[56px] font-normal leading-[1.15] md:leading-[1.1] tracking-tight text-gray-900 px-2">
                A smart and simple way
                <br className="hidden sm:block" />
                to manage your health clinic
            </h1>

            <p className="mx-auto mb-10 max-w-[600px] text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed text-gray-500 px-4">
                No more confusing systems.
                Everything you need — appointments, patients, reminders, and bills — in one place.
            </p>

            <div className="mb-12 md:mb-16 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 w-full max-w-md mx-auto sm:max-w-none">
                <Link href="/sign-up" className="w-full sm:w-auto flex justify-center rounded-xl bg-black px-8 py-3.5 text-[15px] font-medium text-white shadow-lg shadow-black/10 transition-colors hover:bg-gray-800">
                    Launch your clinic
                </Link>
                <Link href="/sign-in" className="w-full sm:w-auto flex justify-center rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-[15px] font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                    Login to Start
                </Link>
            </div>

            {/* Dashboard mockup */}
            <div className="relative mx-auto max-w-[900px] rounded-[24px] md:rounded-[32px] border border-white bg-white/90 p-2 sm:p-4 md:p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex h-[400px] md:h-[500px] flex-col overflow-hidden rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50/50 text-left shadow-inner">
                    <div className="flex h-10 md:h-12 shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-3 md:px-4">
                        <div className="flex gap-1.5 md:gap-2">
                            <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-rose-400" />
                            <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-amber-400" />
                            <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-400" />
                        </div>
                        <div className="h-4 w-24 sm:w-32 md:h-5 md:w-48 rounded-md bg-gray-100" />
                        <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-blue-50 text-[10px] md:text-[11px] font-medium text-blue-600">
                            DR
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        <div className="hidden sm:block w-14 shrink-0 space-y-2 border-r border-gray-100 bg-white p-2 md:w-56 md:p-4">
                            <div className="flex h-10 items-center justify-center rounded-xl bg-slate-900 text-cyan-300 md:justify-start md:px-4">
                                <LayoutDashboard className="h-5 w-5 md:mr-3 shrink-0" />
                                <span className="hidden text-[14px] font-medium md:inline truncate">Dashboard</span>
                            </div>
                            {[
                                { icon: Calendar, label: "Schedule" },
                                { icon: Users, label: "Patients" },
                                { icon: MessageSquare, label: "Messages" },
                                { icon: Receipt, label: "Billing" },
                                { icon: Settings, label: "Settings" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex h-10 cursor-pointer items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-50 md:justify-start md:px-4"
                                >
                                    <item.icon className="h-5 w-5 md:mr-3 shrink-0" />
                                    <span className="hidden text-[14px] font-medium md:inline truncate">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-1 flex-col gap-4 md:gap-6 overflow-y-auto bg-gray-50/30 p-4 md:p-6">
                            <div>
                                <h2 className="mb-0.5 md:mb-1 text-[18px] md:text-[22px] font-medium text-gray-900 truncate">Good morning, Dr. Patel</h2>
                                <p className="text-[13px] md:text-[14px] text-gray-500 truncate">Here is what your practice looks like today.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 shrink-0">
                                <div className="rounded-[16px] md:rounded-[20px] border border-gray-100 bg-white p-4 md:p-5 shadow-sm min-w-0">
                                    <div className="mb-3 md:mb-4 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-blue-50">
                                        <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                                    </div>
                                    <div className="mb-1 text-[22px] md:text-[28px] font-medium leading-none text-gray-900">38</div>
                                    <div className="text-[12px] md:text-[13px] text-gray-500 truncate">Active patients</div>
                                </div>
                                <div className="rounded-[16px] md:rounded-[20px] border border-gray-100 bg-white p-4 md:p-5 shadow-sm min-w-0">
                                    <div className="mb-3 md:mb-4 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-orange-50">
                                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                                    </div>
                                    <div className="mb-1 text-[22px] md:text-[28px] font-medium leading-none text-gray-900">14</div>
                                    <div className="text-[12px] md:text-[13px] text-gray-500 truncate">Visits this week</div>
                                </div>
                                <div className="hidden md:block rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm min-w-0">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                                        <QrCode className="h-5 w-5 text-cyan-600" />
                                    </div>
                                    <div className="mb-1 text-[28px] font-medium leading-none text-gray-900">QR</div>
                                    <div className="text-[13px] text-gray-500 truncate">Self check-in</div>
                                </div>
                            </div>

                            <div className="flex-1 rounded-[16px] md:rounded-[20px] border border-gray-100 bg-white p-4 md:p-5 shadow-sm overflow-hidden flex flex-col">
                                <div className="mb-4 md:mb-6 h-3 md:h-4 w-24 sm:w-32 md:w-40 shrink-0 rounded-md bg-gray-200" />
                                <div className="space-y-2.5 md:space-y-3 overflow-y-auto pr-1">
                                    {[1, 2, 3].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex h-12 md:h-14 shrink-0 items-center rounded-lg md:rounded-xl border border-gray-50 bg-gray-50/50 px-3 md:px-4"
                                        >
                                            <div className="mr-3 md:mr-4 h-6 w-6 md:h-8 md:w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200" />
                                            <div className="flex-1 min-w-0">
                                                <div className="mb-1.5 md:mb-2 h-2 md:h-2.5 w-16 sm:w-20 md:w-24 rounded-full bg-gray-300" />
                                                <div className="h-1.5 md:h-2 w-10 sm:w-12 md:w-16 rounded-full bg-gray-200" />
                                            </div>
                                            <div className="h-5 w-10 sm:w-12 md:h-6 md:w-16 shrink-0 rounded-md border border-gray-200 bg-white" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                id="features"
                className="relative z-10 mx-auto mt-12 md:mt-16 flex max-w-5xl flex-wrap justify-center gap-4 md:gap-6 px-4 sm:px-6 md:px-8 scroll-mt-28"
            >
                {PMS_FEATURES.map((pill, idx) => (
                    <FeaturePill key={idx} {...pill} />
                ))}
            </div>
        </div>
    </section>
)

function MiniBars() {
    const heights = [10, 14, 8, 18, 22, 16, 12];
    return (
        <div className="flex items-end gap-1">
            {heights.map((h, i) => (
                <span key={i} className={"w-1.5 rounded-sm " + (i === 4 ? "bg-blue-600" : "bg-blue-100")} style={{ height: h + "px" }} />
            ))}
        </div>
    );
}

function LineChart() {
    return (
        <svg viewBox="0 0 500 160" className="mt-3 w-full">
            <defs>
                <pattern id="grid" width="50" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 32" fill="none" stroke="rgba(229, 231, 235, 0.5)" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="500" height="160" fill="url(#grid)" />
            <rect x="210" y="0" width="30" height="160" fill="rgba(37, 99, 235, 0.08)" />
            <line x1="0" y1="90" x2="500" y2="90" stroke="#fb923c" strokeDasharray="4 4" strokeWidth="1" />
            <polyline fill="none" stroke="#2563eb" strokeWidth="2" points="0,120 50,100 100,110 150,80 200,90 225,70 270,95 320,75 370,55 420,40 470,30 500,20" />
            {[0, 50, 100, 150, 200, 225, 270, 320, 370, 420, 470].map((x, i) => (
                <circle key={i} cx={x} cy={[120, 100, 110, 80, 90, 70, 95, 75, 55, 40, 30][i]} r="3" fill="white" stroke="#2563eb" strokeWidth="1.5" />
            ))}
        </svg>
    );
}

function DumbbellChart() {
    const pts = [40, 28, 36, 22, 30, 18, 26, 14];
    return (
        <svg viewBox="0 0 160 60" className="w-32">
            {pts.map((p, i) => {
                const x = 10 + i * 20;
                return (
                    <g key={i}>
                        <line x1={x} y1={p} x2={x} y2={55} stroke="#fee2e2" strokeWidth="2" />
                        <circle cx={x} cy={p} r="4" fill="#ef4444" />
                        <circle cx={x} cy={55} r="4" fill="#ef4444" />
                    </g>
                );
            })}
        </svg>
    );
}

function BarChart() {
    const heights = [8, 14, 22, 28, 36, 30, 42, 38, 30, 24, 18, 12];
    return (
        <div className="flex items-end gap-1">
            {heights.map((h, i) => (
                <span key={i} className={"w-2 rounded-sm " + (i === 6 ? "bg-[#fb923c]" : "bg-gray-200")} style={{ height: h + "px" }} />
            ))}
        </div>
    );
}

function MiniWindow({ className = "", children }: { className?: string; children?: React.ReactNode }) {
    return (
        <div className={"rounded-lg border border-gray-200/60 bg-white shadow-sm " + className}>
            <div className="flex items-center gap-1 border-b border-gray-150/40 px-2 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="p-3">{children}</div>
        </div>
    );
}

function VisualOne() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,#c4b5fd_0%,transparent_70%)] opacity-70" />
            <div className="absolute left-6 sm:left-10 top-8 w-44 sm:w-56">
                <MiniWindow>
                    <div className="h-1.5 w-20 rounded-full bg-gray-200" />
                    <div className="mt-2 h-1.5 w-32 rounded-full bg-gray-100" />
                    <div className="mt-4 h-5 w-16 rounded-md bg-[#2563eb]" />
                </MiniWindow>
            </div>
            <div className="absolute right-4 sm:right-8 bottom-4 w-24 sm:w-28">
                <MiniWindow>
                    <div className="h-1.5 w-16 rounded-full bg-gray-200" />
                    <div className="mt-2 h-1.5 w-20 rounded-full bg-gray-100" />
                    <div className="mt-3 h-4 w-12 rounded-md bg-[#2563eb]" />
                </MiniWindow>
            </div>
        </div>
    );
}

function VisualTwo() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-x-4 sm:inset-x-12 top-10">
                <MiniWindow>
                    <div className="flex items-center justify-between">
                        <div className="h-1.5 w-16 rounded-full bg-gray-200" />
                        <div className="h-3 w-10 rounded-md bg-[#2563eb]" />
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-md bg-gray-100" />
                        ))}
                    </div>
                    <div className="mt-2 space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-gray-100" />
                        <div className="h-1.5 w-3/4 rounded-full bg-gray-100" />
                    </div>
                </MiniWindow>
            </div>
        </div>
    );
}

function VisualThree() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 opacity-20" style={{
                background: "repeating-linear-gradient(0deg, #4ade80 0 1px, transparent 1px 14px), repeating-linear-gradient(90deg, #4ade80 0 1px, transparent 1px 14px)"
            }} />
            <div className="absolute inset-x-4 sm:inset-x-6 top-5">
                <MiniWindow>
                    <div className="border-b border-gray-100 pb-1.5 mb-2">
                        <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Patient Self Check-In</span>
                    </div>
                    <div className="space-y-1.5 text-[9px] text-left">
                        <div>
                            <div className="mb-0.5 text-gray-400">Full Name</div>
                            <div className="h-5 px-1.5 rounded border border-gray-150 bg-gray-50 flex items-center text-gray-700">John Doe</div>
                        </div>
                        <div>
                            <div className="mb-0.5 text-gray-400">Phone Number</div>
                            <div className="h-5 px-1.5 rounded border border-gray-150 bg-gray-50 flex items-center text-gray-700">+91 99111 33114</div>
                        </div>
                        <div className="h-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] mt-2">
                            Submit Check-In
                        </div>
                    </div>
                </MiniWindow>
            </div>
        </div>
    );
}

function VisualFour() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0" style={{
                background: "repeating-linear-gradient(90deg, #fca5a5 0 1px, transparent 1px 18px), repeating-linear-gradient(0deg, #fca5a5 0 1px, transparent 1px 18px)",
                opacity: 0.2,
                maskImage: "radial-gradient(circle at center, black, transparent 70%)",
            }} />
            <div className="absolute inset-x-0 top-6 flex justify-center gap-2">
                <div className="h-20 w-16 rounded-md border border-gray-150 bg-white" />
                <div className="h-24 w-16 rounded-md border border-gray-200 bg-white shadow-md flex items-center justify-center">
                    <Bell className="h-5 w-5 text-[#2563eb]" />
                </div>
                <div className="h-20 w-16 rounded-md border border-gray-150 bg-white" />
            </div>
        </div>
    );
}

function VisualFive() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 opacity-20" style={{
                background: "radial-gradient(circle, #60a5fa 1px, transparent 1.5px) 0 0 / 10px 10px",
            }} />
            <div className="absolute inset-x-4 sm:inset-x-6 top-6">
                <MiniWindow>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5 mb-2">
                        <span className="text-[9px] font-bold text-gray-800">Invoice INV-2601</span>
                        <span className="text-[8px] font-bold text-emerald-650 bg-emerald-50 px-1 rounded">PAID</span>
                    </div>
                    <div className="space-y-1 text-[8px] text-gray-650 text-left">
                        <div className="flex justify-between">
                            <span>Consultation</span>
                            <span>Rs. 500</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Dental Scaling</span>
                            <span>Rs. 1,500</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-1 font-bold text-gray-800">
                            <span>Total Paid</span>
                            <span>Rs. 2,000</span>
                        </div>
                    </div>
                </MiniWindow>
            </div>
        </div>
    );
}

function VisualSix() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 opacity-20" style={{
                background: "repeating-linear-gradient(45deg, #f59e0b 0 1px, transparent 1px 15px)"
            }} />
            <div className="absolute inset-x-4 sm:inset-x-6 top-8">
                <MiniWindow>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-800">Growth Report</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+24%</span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] text-gray-500">
                            <span>Patient Registrations</span>
                            <span className="font-semibold text-gray-800">120</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: "75%" }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-500 pt-1">
                            <span>Revenue Target</span>
                            <span className="font-semibold text-gray-800">Rs. 85,000</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: "90%" }} />
                        </div>
                    </div>
                </MiniWindow>
            </div>
        </div>
    );
}

function FeatureCard({ title, desc, visual, tint }: { title: string; desc: string; visual: React.ReactNode; tint: string }) {
    return (
        <div className="overflow-hidden rounded-[24px] border border-gray-150 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className={cn("relative h-52 shrink-0 overflow-hidden bg-gradient-to-b border-b border-gray-100/50", tint)}>
                {/* Premium SaaS Grid Dot Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center">{visual}</div>
            </div>
            <div className="p-6 text-left flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900 tracking-tight">{title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-gray-550 font-normal">{desc}</p>
                </div>
            </div>
        </div>
    );
}

const FeaturesSection = () => (
    <section id="capabilities" className="scroll-mt-28 bg-amber-50/50 py-16 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
            <div className="mb-4 md:mb-5 text-center">
                <span className="inline-block rounded-full bg-gray-100 px-4 py-1.5 md:px-5 md:py-2 text-[13px] md:text-[14px] font-medium text-gray-600">
                    <Zap className="inline-block mr-1 h-3.5 w-3.5 fill-current text-blue-500" /> Real Features. Real Practice
                </span>
            </div>
            <h2 className="mb-12 md:mb-20 text-center text-[28px] sm:text-[32px] md:text-[48px] font-normal tracking-tight text-gray-900 px-2 leading-tight">
                Everything you need
                <br />
                to run a paper-free clinic
            </h2>

            <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                    title="Instant Patient History"
                    desc="Never search paper files again. Look up a patient's name to view past prescriptions, checkup history, and billing records immediately."
                    visual={<VisualOne />}
                    tint="from-purple-50 to-white"
                />
                <FeatureCard
                    title="Clean Booking Calendar"
                    desc="Schedule patient visits, block slots, and see who is currently waiting at your reception desk in a single glance."
                    visual={<VisualTwo />}
                    tint="from-blue-50 to-white"
                />
                <FeatureCard
                    title="Self-Service Patient Entry"
                    desc="Let arriving patients scan a QR code at your desk to register themselves on their phone. Saves typing and receptionist time."
                    visual={<VisualThree />}
                    tint="from-green-50 to-white"
                />
                <FeatureCard
                    title="Auto SMS Reminders"
                    desc="Stop no-shows automatically. The system texts automated booking confirmations and next-day appointment reminders to your patients."
                    visual={<VisualFour />}
                    tint="from-red-50 to-white"
                />
                <FeatureCard
                    title="Quick Clinic Invoicing"
                    desc="Generate clean receipts during checkouts in 2 clicks. Add your logo, Tax ID/GSTIN registration, and print or export to PDF."
                    visual={<VisualFive />}
                    tint="from-blue-50 to-white"
                />
                <FeatureCard
                    title="Track Collections & Earnings"
                    desc="See how much your clinic collected today, monitor pending patient balances, and track your top-performing medical services."
                    visual={<VisualSix />}
                    tint="from-amber-50 to-white"
                />
            </div>
        </div>
    </section>
)

const StatsSection = () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-100/60 via-amber-50/40 to-cyan-100/60 py-16 md:py-32">
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 text-center">
            <div className="mb-5 md:mb-6">
                <span className="inline-block rounded-full bg-white/90 px-4 py-1.5 md:px-5 md:py-2 text-[13px] md:text-[14px] font-medium text-gray-700 shadow-sm">
                    Why practices pick Medineva
                </span>
            </div>

            <h2 className="mb-12 md:mb-24 text-[28px] sm:text-[32px] md:text-[48px] font-normal tracking-tight">
                Less juggling.
                <br />
                More face-to-face care.
            </h2>

            <div className="mx-auto grid max-w-5xl gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {STATS.map((stat, idx) => (
                    <div
                        key={idx}
                        className="rounded-[24px] md:rounded-[32px] border border-white/50 bg-white/30 p-6 sm:p-8 md:p-10 shadow-lg backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2 flex flex-col items-center sm:items-start text-center sm:text-left"
                    >
                        <div className="mb-5 md:mb-6 flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-[16px] md:rounded-[20px] bg-white/50 shadow-inner">
                            <stat.icon className="text-gray-800 h-6 w-6 md:h-7 md:w-7" strokeWidth={2.5} />
                        </div>
                        <div className="mb-2 md:mb-3 text-[28px] sm:text-[32px] md:text-[40px] font-medium leading-none tracking-tight text-gray-900 w-full truncate">
                            {stat.value}
                        </div>
                        <div className="text-[14px] md:text-[15px] font-medium leading-snug text-gray-700">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
)

const FaqSection = () => (
    <section id="faq" className="w-full scroll-mt-28 border-t border-gray-100 bg-gray-50/50 py-16 md:py-32">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-10 lg:gap-16 px-4 sm:px-6 md:px-8 lg:flex-row">
            <div className="lg:w-1/3">
                <div className="mb-5 md:mb-6">
                    <span className="inline-block rounded-full border border-gray-200/50 bg-white px-4 py-1.5 md:px-5 md:py-2 text-[13px] md:text-[14px] font-medium text-gray-600">
                        Common questions
                    </span>
                </div>
                <h3 className="mb-4 md:mb-6 text-[28px] md:text-[36px] font-normal leading-tight tracking-tight text-gray-900">
                    Plain answers,
                    <br className="hidden md:block" />
                    no jargon.
                </h3>
                <p className="mb-6 md:mb-8 text-[14px] md:text-[15px] leading-relaxed text-gray-500">
                    If you're comparing systems for your clinic, start here. We describe what our clinic software actually does today to build trust with your team.
                </p>
                <Link
                    href="https://wa.me/919911133114"
                    target="_blank"
                    className="inline-block text-center w-full sm:w-auto rounded-xl bg-black px-6 py-3.5 md:py-3 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
                >
                    Talk to us
                </Link>
            </div>

            <div className="space-y-3 md:space-y-4 lg:w-2/3 lg:pt-4">
                {FAQ_DATA.map((faq, idx) => (
                    <AccordionItem key={idx} q={faq.q} a={faq.a} />
                ))}
            </div>
        </div>
    </section>
)

export default function MarketingPage() {
    return (
        <div className="min-h-screen bg-amber-50/50 font-sans text-gray-900 selection:bg-blue-100 overflow-x-hidden">
            <main>
                <HeroSection />
                <FeaturesSection />
                <StatsSection />
                <FaqSection />
            </main>
        </div>
    )
}