"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Globe2, Loader2, Mail, MapPin, Phone, Save, type LucideIcon } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateClinicSettings } from "@/lib/actions/settings"
import { useToast } from "@/hooks/use-toast"
interface SettingsClientProps {
    clinicId: string
    userId: string
    initialSettings: {
        name: string
        doctorName: string
        email: string
        phone: string
        address: string
        timezone: string
        currency: string
        defaultAppointmentDuration: number
        invoicePrefix: string
    }
}

function SectionIntro({
    icon: Icon,
    iconClassName,
    title,
    description,
}: {
    icon: LucideIcon
    iconClassName: string
    title: string
    description: string
}) {
    return (
        <div className="flex gap-4 border-b border-gray-100/50 p-4 sm:p-6 md:p-8 md:pb-6">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconClassName}`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 pt-0.5">
                <h2 className="text-[17px] font-bold tracking-tight text-gray-900">{title}</h2>
                <p className="mt-1 text-[14px] leading-relaxed text-gray-500">{description}</p>
            </div>
        </div>
    )
}

export function SettingsClient({ clinicId, userId, initialSettings }: SettingsClientProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateClinicSettings(clinicId, userId, settings)
            toast({
                title: "Changes saved",
                description: "Clinic details and preferences were updated.",
            })
        } catch {
            toast({
                variant: "destructive",
                title: "Save failed",
                description: "Something went wrong. Try again in a moment.",
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-4xl flex-col gap-8">
            <Header
                title="General"
                description="Practice profile, time zone, money format, and default visit length."
                clinicId={clinicId}
            />

            <div className="space-y-6">
                <div className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" />
                    <SectionIntro
                        icon={Building2}
                        iconClassName="border-blue-100 bg-blue-50/80 text-blue-600"
                        title="Clinic information"
                        description="Shown on invoices, reminders, and your public intake page."
                    />
                    <div className="space-y-6 p-4 sm:p-6 md:p-8 md:pt-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="doctorName"
                                    className="text-[12px] font-bold uppercase tracking-wider text-gray-600"
                                >
                                    Doctor Name / User Name
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="doctorName"
                                        value={settings.doctorName}
                                        onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                                        placeholder="e.g. Dr. John Doe"
                                        className="h-12 rounded-xl border-gray-200/60 bg-white/80 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-cyan-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-[12px] font-bold uppercase tracking-wider text-gray-600"
                                >
                                    Clinic name <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="name"
                                        value={settings.name}
                                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                        placeholder="e.g. Riverside Dental"
                                        required
                                        className="h-12 rounded-xl border-gray-200/60 bg-white/80 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-cyan-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[12px] font-bold uppercase tracking-wider text-gray-600"
                                >
                                    Clinic email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        placeholder="hello@yourclinic.com"
                                        className="h-12 rounded-xl border-gray-200/60 bg-white/80 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-cyan-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-[12px] font-bold uppercase tracking-wider text-gray-600"
                                >
                                    Phone
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="phone"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        placeholder="+1 234 567 8900"
                                        className="h-12 rounded-xl border-gray-200/60 bg-white/80 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-cyan-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label
                                    htmlFor="address"
                                    className="text-[12px] font-bold uppercase tracking-wider text-gray-600"
                                >
                                    Address
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="address"
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        placeholder="Street, city, region"
                                        className="h-12 rounded-xl border-gray-200/60 bg-white/80 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-cyan-500/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl" />
                    <SectionIntro
                        icon={Globe2}
                        iconClassName="border-violet-100 bg-violet-50/80 text-violet-600"
                        title="Regional & scheduling"
                        description="Time zone, currency, default visit length, and invoice numbering."
                    />
                    <div className="space-y-6 p-4 sm:p-6 md:p-8 md:pt-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-wider text-gray-600">
                                    Timezone
                                </Label>
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200/60 bg-white/80 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                        <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                                        <SelectItem value="America/New_York">USA — Eastern</SelectItem>
                                        <SelectItem value="America/Los_Angeles">USA — Pacific</SelectItem>
                                        <SelectItem value="Europe/London">UK (GMT)</SelectItem>
                                        <SelectItem value="Asia/Dubai">UAE (GST)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-wider text-gray-600">
                                    Currency
                                </Label>
                                <Select
                                    value={settings.currency}
                                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200/60 bg-white/80 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                        <SelectItem value="INR">Indian rupee (₹)</SelectItem>
                                        <SelectItem value="USD">US dollar ($)</SelectItem>
                                        <SelectItem value="EUR">Euro (€)</SelectItem>
                                        <SelectItem value="GBP">British pound (£)</SelectItem>
                                        <SelectItem value="AED">UAE dirham (AED)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-wider text-gray-600">
                                    Default appointment duration
                                </Label>
                                <Select
                                    value={settings.defaultAppointmentDuration.toString()}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, defaultAppointmentDuration: parseInt(value) })
                                    }
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200/60 bg-white/80 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="45">45 minutes</SelectItem>
                                        <SelectItem value="60">60 minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="invoicePrefix"
                                    className="text-[12px] font-bold uppercase tracking-wider text-gray-600"
                                >
                                    Invoice prefix
                                </Label>
                                <Input
                                    id="invoicePrefix"
                                    value={settings.invoicePrefix}
                                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                                    placeholder="INV"
                                    maxLength={10}
                                    className="h-12 rounded-xl border-gray-200/60 bg-white/80 font-mono text-sm shadow-sm focus-visible:bg-white focus-visible:ring-cyan-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
                    <p className="flex-1 text-[13px] text-gray-500">
                        Save before leaving this page so staff see the latest clinic details everywhere.
                    </p>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 rounded-xl bg-slate-900 px-8 font-semibold text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800"
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isSaving ? "Saving…" : "Save changes"}
                    </Button>
                </div>
            </div>

            <p className="text-[13px] text-gray-500">
                Need a QR code or link for new patients? Open{" "}
                <Link
                    href="/settings/patient-intake"
                    className="font-semibold text-cyan-700 underline-offset-2 hover:underline"
                >
                    Patient self-registration
                </Link>{" "}
                in the menu on the left.
            </p>
        </div>
    )
}
