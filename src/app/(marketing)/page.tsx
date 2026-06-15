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
} from "lucide-react"
import Link from "next/link"
import { NoiseTexture } from '@/components/ui/noisetexture';
import { cn } from '@/lib/utils';

const PMS_FEATURES = [
    {
        title: "Simple Daily View",
        desc: "See all your patients, today’s appointments, and clinic earnings in one place. Everything is clear and easy, so you stay relaxed.",
        iconColor: "blue" as const,
        icon: LayoutDashboard,
    },
    {
        title: "Easy Patient Check-In",
        desc: "Patients scan a code with their phone and enter their details themselves. No paper, no writing, no waiting.",
        iconColor: "cyan" as const,
        icon: QrCode,
    },
    {
        title: "Quick Billing",
        desc: "Make bills easily while checking the patient. You can see who has paid and who hasn’t, without any confusion.",
        iconColor: "orange" as const,
        icon: Receipt,
    },
];

const STATS = [
    {
        value: "Very Easy",
        label: "Everything you need to run your clinic is in one simple screen",
        icon: Calendar,
    },
    {
        value: "Clean & Paper-Free",
        label: "No more paper work. Patients can check in using their phone, making your clinic look modern and neat",
        icon: ShieldCheck,
    },
    {
        value: "Quick to Learn",
        label: "Your staff can learn and start using it in just a few minutes",
        icon: Users,
    },
];

const FAQ_DATA = [
    {
        q: "Do I need computer knowledge to use this?",
        a: "No, not at all. If you can use a phone or open a website, you can use this easily. Setting it up is simple and takes just a few minutes.",
    },
    {
        q: "What can this system do?",
        a: "It helps you manage appointments, store patient details, send reminders, create bills, plan treatments, and handle patient entry without paper.",
    },
    {
        q: "How does patient check-in work?",
        a: "You print a small code and keep it at your clinic. Patients scan it with their phone and fill in their details. It comes directly to you, so no writing or waiting is needed.",
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
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-rose-50/30 to-cyan-50/50 pt-12 pb-16 md:pt-16 md:pb-24">

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
                to manage your dental clinic
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

const FeaturesSection = () => (
    <section id="capabilities" className="scroll-mt-28 bg-white py-16 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
            <div className="mb-4 md:mb-5 text-center">
                <span className="inline-block rounded-full bg-gray-100 px-4 py-1.5 md:px-5 md:py-2 text-[13px] md:text-[14px] font-medium text-gray-600">
                    Made for everyday clinics
                </span>
            </div>
            <h2 className="mb-12 md:mb-20 text-center text-[28px] sm:text-[32px] md:text-[48px] font-normal tracking-tight px-2">
                Everything you need, in one simple place
            </h2>

            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:gap-16 lg:grid-cols-2">
                <div className="space-y-3 md:space-y-4">

                    <div className="flex cursor-pointer items-start gap-4 md:gap-5 rounded-[20px] md:rounded-[24px] border border-transparent p-4 sm:p-5 md:p-6 transition-colors hover:border-gray-100/50 hover:bg-gray-50">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] md:rounded-[16px] bg-gray-900 shadow-sm">
                            <Calendar className="text-white h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="mb-1.5 text-[16px] md:text-[17px] font-medium truncate">Easy Appointment View</h3>
                            <p className="text-[13px] md:text-[14px] leading-relaxed text-gray-500">
                                See all your appointments clearly for the day or week. Add or change bookings quickly without any confusion.
                            </p>
                        </div>
                    </div>

                    <div className="flex cursor-pointer items-start gap-4 md:gap-5 rounded-[20px] md:rounded-[24px] border border-blue-100/50 bg-blue-50/50 p-4 sm:p-5 md:p-6 transition-colors">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] md:rounded-[16px] bg-blue-500 shadow-sm">
                            <Users className="text-white h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="mb-1.5 text-[16px] md:text-[17px] font-medium truncate">Patient Records</h3>
                            <p className="text-[13px] md:text-[14px] leading-relaxed text-gray-600">
                                Keep all patient details, history, and notes safely in one place. No files or papers needed.
                            </p>
                        </div>
                    </div>

                    <div className="flex cursor-pointer items-start gap-4 md:gap-5 rounded-[20px] md:rounded-[24px] border border-transparent p-4 sm:p-5 md:p-6 transition-colors hover:border-gray-100/50 hover:bg-gray-50">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] md:rounded-[16px] bg-amber-100">
                            <QrCode className="text-amber-700 h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="mb-1.5 text-[16px] md:text-[17px] font-medium truncate">Quick Patient Entry</h3>
                            <p className="text-[13px] md:text-[14px] leading-relaxed text-gray-500">
                                Patients scan a code and enter their details on their phone. No writing, no waiting at reception.
                            </p>
                        </div>
                    </div>

                    <div className="flex cursor-pointer items-start gap-4 md:gap-5 rounded-[20px] md:rounded-[24px] border border-transparent p-4 sm:p-5 md:p-6 transition-colors hover:border-gray-100/50 hover:bg-gray-50">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] md:rounded-[16px] bg-emerald-100">
                            <MessageSquare className="text-emerald-700 h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="mb-1.5 text-[16px] md:text-[17px] font-medium truncate">Automatic Reminders</h3>
                            <p className="text-[13px] md:text-[14px] leading-relaxed text-gray-500">
                                Patients get simple message reminders for their visits, so fewer people forget or miss appointments.
                            </p>
                        </div>
                    </div>

                    <div className="flex cursor-pointer items-start gap-4 md:gap-5 rounded-[20px] md:rounded-[24px] border border-transparent p-4 sm:p-5 md:p-6 transition-colors hover:border-gray-100/50 hover:bg-gray-50">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] md:rounded-[16px] bg-violet-100">
                            <Receipt className="text-violet-700 h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="mb-1.5 text-[16px] md:text-[17px] font-medium truncate">Simple Billing</h3>
                            <p className="text-[13px] md:text-[14px] leading-relaxed text-gray-500">
                                Create bills in seconds and easily see payments. No calculations or confusion.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Right side graphic card */}
                <div className="relative min-h-[380px] md:min-h-[480px] rounded-[24px] md:rounded-[32px] border border-gray-100/50 bg-gray-50/80 p-5 sm:p-6 md:p-10 mt-8 lg:mt-0 overflow-hidden">
                    <div className="absolute right-4 top-4 md:right-10 md:top-10 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-[16px] md:rounded-[20px] bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg z-10">
                        <QrCode className="text-white h-6 w-6 md:h-7 md:w-7" />
                    </div>

                    <div className="mt-16 md:mt-24 space-y-3 md:space-y-4 relative z-20">

                        <div className="relative flex items-center gap-3 md:gap-4 rounded-[16px] md:rounded-[20px] border border-gray-100/50 bg-white p-4 md:p-5 shadow-sm">
                            <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full bg-gradient-to-br from-rose-200 to-rose-300" />
                            <div className="min-w-0 flex-1">
                                <p className="mb-0.5 text-[14px] md:text-[15px] font-medium truncate">New patient</p>
                                <p className="text-[12px] md:text-[13px] text-gray-500 line-clamp-2 md:line-clamp-none">Patient fills details by scanning the code at reception.</p>
                            </div>
                        </div>

                        <div className="relative ml-0 sm:ml-4 md:ml-8 flex items-center gap-3 md:gap-4 rounded-[16px] md:rounded-[20px] border border-gray-100/50 bg-white p-4 md:p-5 shadow-sm">
                            <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] md:rounded-[16px] bg-gradient-to-br from-cyan-400 to-blue-500 shadow-inner">
                                <Stethoscope className="text-white h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="mb-0.5 text-[14px] md:text-[15px] font-medium truncate">During visit</p>
                                <p className="text-[12px] md:text-[13px] text-blue-600 line-clamp-2 md:line-clamp-none">Doctor or staff updates patient details and notes easily.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 rounded-[16px] md:rounded-[20px] border border-gray-100/50 bg-white/80 p-4 md:p-5 opacity-60 shadow-sm">
                            <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full bg-gray-200" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[14px] md:text-[15px] font-medium truncate">End of day</p>
                                <p className="text-[12px] md:text-[13px] text-gray-500 line-clamp-2 md:line-clamp-none">All visits and payments are already updated automatically.</p>
                            </div>
                        </div>

                    </div>

                    <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-emerald-500 shadow-xl z-10">
                        <ShieldCheck className="text-white h-6 w-6 md:h-7 md:w-7" />
                    </div>
                </div>
            </div>
        </div>
    </section>
)

const StatsSection = () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-100/60 via-amber-50/40 to-cyan-100/60 py-16 md:py-32">
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 text-center">
            <div className="mb-5 md:mb-6">
                <span className="inline-block rounded-full bg-white/90 px-4 py-1.5 md:px-5 md:py-2 text-[13px] md:text-[14px] font-medium text-gray-700 shadow-sm">
                    Why practices pick CareSync
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
                <button className="w-full sm:w-auto rounded-xl bg-black px-6 py-3.5 md:py-3 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-gray-800">
                    Talk to us
                </button>
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
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 overflow-x-hidden">
            <main>
                <HeroSection />
                <FeaturesSection />
                <StatsSection />
                <FaqSection />
            </main>
        </div>
    )
}