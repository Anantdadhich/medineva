"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Globe2, Loader2, Mail, MapPin, Phone, Save, User, Clock, Coins, Hash, FileText, Upload, Trash2, Image as ImageIcon, type LucideIcon } from "lucide-react"
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
        logoUrl: string
        invoiceFooter: string
        taxId: string
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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check if size is < 1MB (1,048,576 bytes)
        if (file.size > 1024 * 1024) {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
            toast({
                variant: "destructive",
                title: "Logo Image Too Large",
                description: `Your selected image is ${sizeInMB}MB. Image files must be under 1MB because excessively large logos slow down client-side invoice rendering, increase PDF print download times, and degrade portal load speeds for your patients. Please resize or compress the image and try again.`,
            })
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const base64String = event.target?.result as string
            setSettings(prev => ({ ...prev, logoUrl: base64String }))
            toast({
                title: "Logo uploaded",
                description: "Clinic logo loaded successfully.",
            })
        }
        reader.readAsDataURL(file)
        e.target.value = "" // Reset value so same file can be uploaded again
    }

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
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-4xl flex-col">

            <div className="space-y-8">
                {/* 1. Clinic Information Section */}
                <div className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-3xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-300/10 to-blue-300/10 blur-3xl" />
                    <SectionIntro
                        icon={Building2}
                        iconClassName="border-cyan-100/80 bg-cyan-50/80 text-cyan-600 shadow-sm"
                        title="Clinic Information"
                        description="This information will be displayed on invoices, automated notifications, and the public registration portal."
                    />
                    
                    <div className="space-y-6 p-4 sm:p-6 md:p-8 md:pt-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Doctor Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="doctorName"
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                                >
                                    Doctor Name / User Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="doctorName"
                                        value={settings.doctorName}
                                        onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                                        placeholder="e.g. Dr. John Doe"
                                        className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70"
                                    />
                                </div>
                            </div>

                            {/* Clinic Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                                >
                                    Clinic Name <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="name"
                                        value={settings.name}
                                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                        placeholder="e.g. Riverside Dental"
                                        required
                                        className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70"
                                    />
                                </div>
                            </div>

                            {/* Clinic Logo */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Clinic Logo
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    {/* Preview Block */}
                                    <div className="flex items-center justify-center border border-dashed border-slate-200 bg-white/40 rounded-2xl h-28 p-2 overflow-hidden shadow-inner relative group">
                                        {settings.logoUrl ? (
                                            <>
                                                <img
                                                    src={settings.logoUrl}
                                                    alt="Clinic Logo Preview"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setSettings({ ...settings, logoUrl: "" })}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md cursor-pointer"
                                                    title="Remove Logo"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                                                <ImageIcon className="h-8 w-8 mb-1 text-slate-350 stroke-1" />
                                                <span>No logo uploaded</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Block */}
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="logoUrl"
                                                    type="text"
                                                    value={settings.logoUrl}
                                                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                                    placeholder="Or paste image URL"
                                                    className="h-11 rounded-[16px] border-slate-200/60 bg-white/60 pl-4 pr-4 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70 text-xs w-full"
                                                />
                                            </div>
                                            <label 
                                                htmlFor="logo-file-input"
                                                className="h-11 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] w-full sm:w-auto shrink-0"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                Upload Image
                                            </label>
                                            <input
                                                id="logo-file-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            Recommended size: square or landscape layout. Must be under 1MB (PNG, JPG, or GIF formats).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Clinic Email */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                                >
                                    Clinic Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        placeholder="hello@yourclinic.com"
                                        className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                                >
                                    Phone Number
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="phone"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        placeholder="+1 234 567 8900"
                                        className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2 md:col-span-2">
                                <Label
                                    htmlFor="address"
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                                >
                                    Street Address
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="address"
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        placeholder="e.g. 123 Health Ave, Suite 100, New York, NY"
                                        className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 pl-11 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Regional & Scheduling Section */}
                <div className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-3xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-tr from-violet-300/10 to-fuchsia-300/10 blur-3xl" />
                    <SectionIntro
                        icon={Globe2}
                        iconClassName="border-violet-100/80 bg-violet-50/80 text-violet-600 shadow-sm"
                        title="Regional & Scheduling Preferences"
                        description="Define default timezone, billing currency, default slot durations, and invoice prefix variables."
                    />
                    
                    <div className="space-y-6 p-4 sm:p-6 md:p-8 md:pt-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Timezone */}
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <Globe2 className="h-3.5 w-3.5 text-slate-400" /> Timezone
                                </Label>
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                                >
                                    <SelectTrigger className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 shadow-sm transition-all focus:ring-4 focus:ring-cyan-500/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                        <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                                        <SelectItem value="America/New_York">USA — Eastern (EST)</SelectItem>
                                        <SelectItem value="America/Los_Angeles">USA — Pacific (PST)</SelectItem>
                                        <SelectItem value="Europe/London">UK (GMT)</SelectItem>
                                        <SelectItem value="Asia/Dubai">UAE (GST)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <Coins className="h-3.5 w-3.5 text-slate-400" /> Currency
                                </Label>
                                <Select
                                    value={settings.currency}
                                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                                >
                                    <SelectTrigger className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 shadow-sm transition-all focus:ring-4 focus:ring-cyan-500/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                                        <SelectItem value="EUR">Euro (€)</SelectItem>
                                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                                        <SelectItem value="AED">UAE Dirham (AED)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Default slot duration */}
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" /> Default Appointment Duration
                                </Label>
                                <Select
                                    value={settings.defaultAppointmentDuration.toString()}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, defaultAppointmentDuration: parseInt(value) })
                                    }
                                >
                                    <SelectTrigger className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 shadow-sm transition-all focus:ring-4 focus:ring-cyan-500/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="45">45 minutes</SelectItem>
                                        <SelectItem value="60">60 minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Invoice Prefix */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="invoicePrefix"
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
                                >
                                    <Hash className="h-3.5 w-3.5 text-slate-400" /> Invoice Prefix
                                </Label>
                                <Input
                                    id="invoicePrefix"
                                    value={settings.invoicePrefix}
                                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                                    placeholder="INV"
                                    maxLength={10}
                                    className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 font-mono text-sm shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70"
                                />
                            </div>

                            {/* Tax ID / GSTIN */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="taxId"
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
                                >
                                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> Tax ID / GSTIN
                                </Label>
                                <Input
                                    id="taxId"
                                    value={settings.taxId}
                                    onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                                    placeholder="e.g. 29AAAAA0000A1Z5"
                                    className="h-12 rounded-[16px] border-slate-200/60 bg-white/60 font-mono text-sm shadow-sm transition-all focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70"
                                />
                            </div>
                        </div>

                        {/* Invoice Footer Notes */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="invoiceFooter"
                                className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
                            >
                                <FileText className="h-3.5 w-3.5 text-slate-400" /> Default Invoice Footer Notes
                            </Label>
                            <textarea
                                id="invoiceFooter"
                                value={settings.invoiceFooter}
                                onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })}
                                placeholder="e.g. Payment due within 15 days. Transfer to HDFC Bank A/c: 1234567890 (IFSC: HDFC0000123)"
                                className="flex min-h-[80px] w-full rounded-[16px] border border-slate-200/60 bg-white/60 focus-visible:bg-white px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:border-cyan-500/70 text-slate-800 placeholder:text-slate-400 resize-none shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Save Control Area */}
                <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center p-4 sm:p-5 rounded-[24px] bg-slate-50/50 border border-slate-100/80 backdrop-blur-sm">
                    <p className="text-[12px] text-slate-400 text-center sm:text-left">
                        Ensure all adjustments are reviewed before saving changes.
                    </p>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-11 w-full sm:w-auto rounded-xl bg-slate-900 px-6 font-bold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-300" />
                        ) : (
                            <Save className="mr-2 h-4 w-4 text-cyan-300" />
                        )}
                        {isSaving ? "Saving changes…" : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="text-[12px] text-slate-400 flex items-center gap-1.5 p-1">
                <span>Looking for self-intake links or QR codes?</span>
                <Link
                    href="/settings/patient-intake"
                    className="font-bold text-cyan-600 hover:text-cyan-700 underline underline-offset-2 transition-colors"
                >
                    Patient self-registration
                </Link>
            </div>
        </div>
    )
}
