"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    MapPin,
    AlertCircle,
    FileText,
    Plus,
    Bell,
    Edit,
    Trash2,
    Eye,
    Download,
    CreditCard,
    Loader2
} from "lucide-react"
import { calculateAge, formatCurrency } from "@/lib/utils"
import { sendManualReminder, createAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment } from "@/lib/actions/appointments"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { getTreatments } from "@/lib/actions/treatments"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvoicePDF } from "@/components/billing/invoice-pdf"
import dynamic from "next/dynamic"

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false }
)
import { recordPayment } from "@/lib/actions/invoices"
import { updatePatient } from "@/lib/actions/patients"
import { PAYMENT_METHODS } from "@/lib/validations/invoice"

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
    CHECKUP: "General Checkup",
    TREATMENT: "Treatment",
    CONSULTATION: "Consultation",
    FOLLOW_UP: "Follow-up",
    EMERGENCY: "Emergency",
}

export function PatientDetailClient({ patient }: { patient: any }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isNewVisitOpen, setIsNewVisitOpen] = useState(false)

    // Notes Editor State
    const [notesText, setNotesText] = useState(patient.notes || "")
    const [isSavingNotes, setIsSavingNotes] = useState(false)

    // Payment Dialog State
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("CASH")
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

    const handleSaveNotes = async () => {
        setIsSavingNotes(true)
        try {
            await updatePatient(patient.id, {
                firstName: patient.firstName,
                lastName: patient.lastName,
                phone: patient.phone,
                dateOfBirth: new Date(patient.dateOfBirth),
                notes: notesText
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to update notes", error)
            alert("Failed to save clinical notes.")
        } finally {
            setIsSavingNotes(false)
        }
    }

    const handleRecordPaymentClick = (invoice: any, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedInvoice(invoice)
        setPaymentAmount(String(Number(invoice.total) - Number(invoice.amountPaid)))
        setIsPaymentDialogOpen(true)
    }

    const handleSubmitPayment = async () => {
        if (!selectedInvoice) return
        setIsSubmittingPayment(true)
        try {
            await recordPayment({
                invoiceId: selectedInvoice.id,
                amount: parseFloat(paymentAmount),
                method: paymentMethod as any,
                notes: "Recorded via Patient Details",
                reference: ""
            })
            setIsPaymentDialogOpen(false)
            setSelectedInvoice(null)
            router.refresh()
        } catch (error) {
            console.error("Failed to record payment", error)
            alert("Failed to record payment.")
        } finally {
            setIsSubmittingPayment(false)
        }
    }

    // Edit appointment state
    const [editingAppointment, setEditingAppointment] = useState<any | null>(null)
    const [editForm, setEditForm] = useState({
        date: "",
        time: "",
        type: "",
        duration: 30,
        notes: "",
        status: "SCHEDULED" as any
    })

    const [treatments, setTreatments] = useState<{ id: string; name: string; standardCost: number; category?: string }[]>([])

    useEffect(() => {
        const loadTreatments = async () => {
            try {
                const data = await getTreatments(patient.clinicId)
                setTreatments(data)
            } catch (error) {
                console.error("Failed to load treatments", error)
            }
        }
        loadTreatments()
    }, [patient.clinicId])

    const editSelectOptions = useMemo(() => {
        const baseOptions = ["CHECKUP", "TREATMENT", "CONSULTATION", "FOLLOW_UP", "EMERGENCY"]
        if (editForm.type && !baseOptions.includes(editForm.type)) {
            baseOptions.push(editForm.type)
        }
        return baseOptions
    }, [editForm.type])

    const handleEditClick = (apt: any, e: React.MouseEvent) => {
        e.stopPropagation()
        const aptDate = new Date(apt.scheduledAt)
        setEditForm({
            date: format(aptDate, "yyyy-MM-dd"),
            time: format(aptDate, "HH:mm"),
            type: apt.type || "",
            duration: apt.duration || 30,
            notes: apt.notes || "",
            status: apt.status || "SCHEDULED"
        })
        setEditingAppointment(apt)
    }

    const handleSaveEdit = async () => {
        if (!editingAppointment) return
        setIsLoading(true)
        try {
            const [hours, mins] = editForm.time.split(":").map(Number)
            const newDate = new Date(editForm.date)
            newDate.setHours(hours, mins, 0, 0)

            await updateAppointment(editingAppointment.id, {
                scheduledAt: newDate,
                type: editForm.type,
                duration: editForm.duration,
                notes: editForm.notes
            })

            if (editForm.status !== editingAppointment.status) {
                await updateAppointmentStatus(editingAppointment.id, editForm.status)
            }

            setEditingAppointment(null)
            router.refresh()
        } catch (error) {
            console.error("Failed to update appointment", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAppointment = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this appointment? This cannot be undone.")) return

        setIsLoading(true)
        try {
            await deleteAppointment(id)
            router.refresh()
        } catch (error) {
            console.error("Failed to delete appointment", error)
            alert("Failed to delete appointment.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateAppointment = async (data: any) => {
        setIsLoading(true)
        try {
            await createAppointment(patient.clinicId, data)
            setIsNewVisitOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to create appointment", error)
            alert("Failed to create appointment.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendReminder = async (appointmentId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Send SMS reminder to patient?")) return

        setIsLoading(true)
        try {
            const res = await sendManualReminder(appointmentId)
            if (res && res.success) {
                alert("Reminder sent successfully!")
            } else {
                alert("Failed to send reminder.")
            }
        } catch (error) {
            console.error("Failed to send reminder", error)
            alert("Failed to send reminder.")
        } finally {
            setIsLoading(false)
        }
    }

    // Derived data from real patient object
    const visits = patient.appointments || []
    const invoices = patient.invoices || []

    const upcomingVisits = useMemo(() => {
        return [...visits]
            .filter((v: any) => new Date(v.scheduledAt) >= new Date() && v.status !== "COMPLETED" && v.status !== "CANCELLED")
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    }, [visits])

    const pastVisits = useMemo(() => {
        return [...visits]
            .filter((v: any) => new Date(v.scheduledAt) < new Date() || v.status === "COMPLETED" || v.status === "CANCELLED")
            .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    }, [visits])

    // Calculate billing stats
    const totalBilled = invoices.reduce((sum: number, inv: any) => sum + Number(inv.total), 0)
    const totalPaid = invoices.reduce((sum: number, inv: any) => sum + Number(inv.amountPaid), 0)
    const outstanding = totalBilled - totalPaid

    const renderTimeline = (list: any[]) => {
        if (list.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white/40 border border-gray-100/50 rounded-[20px] shadow-sm">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-gray-100/30">
                        <Calendar className="h-8 w-8 text-gray-300 opacity-60" />
                    </div>
                    <p className="text-gray-500 font-medium text-center">No visits found.</p>
                </div>
            )
        }

        return (
            <div className="relative pl-4 sm:pl-6 md:pl-8 space-y-6 pt-2">
                {/* Vertical Timeline line connector */}
                <div className="absolute left-2 sm:left-3.5 md:left-4.5 top-2 bottom-2 w-0.5 bg-gray-200/65" />

                {list.map((visit: any) => {
                    const visitDate = new Date(visit.scheduledAt)
                    const isTimelineCompleted = visit.status === "COMPLETED"
                    return (
                        <div key={visit.id} className="relative group">
                            {/* Timeline Dot Indicator */}
                            <div className={`absolute -left-[22px] sm:-left-[30px] md:-left-[34px] top-1.5 w-4 h-4 rounded-full border-2 bg-white transition-all duration-200 flex items-center justify-center group-hover:scale-110 z-10
                                ${isTimelineCompleted
                                    ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                                    : "border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                                }
                            `}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isTimelineCompleted ? "bg-emerald-500" : "bg-cyan-500"}`} />
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm hover:shadow-md transition-all rounded-[20px] p-4 sm:p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start justify-between mb-4 gap-2">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-bold text-gray-900 text-lg">
                                                {format(visitDate, "dd MMM yyyy")}
                                            </span>
                                            <Badge className={`px-2.5 py-0.5 rounded-md font-bold uppercase text-[9px] tracking-wider border-0 ${isTimelineCompleted ? 'bg-emerald-50 text-emerald-700' :
                                                visit.status === "SCHEDULED" ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' :
                                                    'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}>
                                                {visit.status}
                                            </Badge>
                                        </div>
                                        <p className="text-[14px] font-medium text-gray-500 mt-1">
                                            Time: {format(visitDate, "HH:mm")} • Type: {visit.type || "General Consultation"}
                                        </p>
                                        <p className="text-[13px] text-gray-400 mt-0.5 font-medium">
                                            {visit.doctor ? `Dr. ${visit.doctor.firstName} ${visit.doctor.lastName}` : 'No Doctor Assigned'}
                                        </p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9 w-9 p-0 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg cursor-pointer"
                                            onClick={(e) => handleEditClick(visit, e)}
                                            title="Edit Appointment"
                                            disabled={isLoading}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9 w-9 p-0 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg cursor-pointer"
                                            onClick={(e) => handleSendReminder(visit.id, e)}
                                            title="Send Reminder Now"
                                            disabled={isLoading}
                                        >
                                            <Bell className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9 w-9 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                            onClick={(e) => handleDeleteAppointment(visit.id, e)}
                                            title="Delete Appointment"
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {(visit.chiefComplaint || visit.notes || (visit.clinicalRecords && visit.clinicalRecords.length > 0) || (visit.notifications && visit.notifications.length > 0)) && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100/60 mt-4 text-[14px] text-gray-700">
                                        {visit.chiefComplaint && <p><strong className="font-semibold text-gray-900">Chief Complaint:</strong> {visit.chiefComplaint}</p>}
                                        {visit.notes && <p><strong className="font-semibold text-gray-900">Notes:</strong> {visit.notes}</p>}

                                        {visit.clinicalRecords && visit.clinicalRecords.length > 0 && (
                                            <div className="bg-cyan-50/40 p-4 rounded-xl border border-cyan-100/50 mt-3">
                                                <p className="text-cyan-800 font-bold text-[12px] uppercase tracking-wider mb-2">Services & Treatments</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {visit.clinicalRecords.map((t: any, i: number) => (
                                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-cyan-100/60 rounded-xl text-xs font-semibold text-gray-700 shadow-sm">
                                                            {t.procedure?.name || "Treatment"}
                                                            {t.toothNumber && <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-100/50 px-1.5 py-0.5 rounded-md ml-0.5">Tooth {t.toothNumber}</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {visit.notifications && visit.notifications.length > 0 && (() => {
                                            const counts = visit.notifications.reduce((acc: Record<string, number>, notif: any) => {
                                                const key = `${notif.type}:${notif.status}`
                                                acc[key] = (acc[key] || 0) + 1
                                                return acc
                                            }, {})

                                            return (
                                                <div className="flex flex-wrap gap-2 items-center mt-3 pt-3 border-t border-gray-100/30">
                                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">SMS Reminders:</span>
                                                    {Object.entries(counts).map(([key, count]: [string, any]) => {
                                                        const [type, status] = key.split(":")
                                                        const isSent = status === 'SENT'
                                                        const isFailed = status === 'FAILED'
                                                        const displayLabel = count > 1 ? `${type}: ${status} (${count})` : `${type}: ${status}`

                                                        return (
                                                            <Badge
                                                                key={key}
                                                                className={`text-[9px] uppercase font-bold px-2 py-0.5 border-0 ${isSent
                                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50'
                                                                        : isFailed
                                                                            ? 'bg-red-50 text-red-750 bg-red-50 hover:bg-red-100/50'
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-150'
                                                                    }`}
                                                            >
                                                                {displayLabel}
                                                            </Badge>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )}

                                {/* Mobile actions row */}
                                <div className="flex md:hidden items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100/60">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 rounded-lg text-[11px] font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-1 px-2.5 cursor-pointer"
                                        onClick={(e) => handleEditClick(visit, e)}
                                        disabled={isLoading}
                                    >
                                        <Edit className="h-3.5 w-3.5 text-slate-500" />
                                        <span>Edit</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 rounded-lg text-[11px] font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-1 px-2.5 cursor-pointer"
                                        onClick={(e) => handleSendReminder(visit.id, e)}
                                        disabled={isLoading}
                                    >
                                        <Bell className="h-3.5 w-3.5 text-cyan-600" />
                                        <span>Remind</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 rounded-lg text-[11px] font-bold border-rose-100 bg-rose-50/50 hover:bg-rose-100/50 text-rose-600 flex items-center gap-1 px-2.5 cursor-pointer"
                                        onClick={(e) => handleDeleteAppointment(visit.id, e)}
                                        disabled={isLoading}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                        <span>Delete</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full min-w-0 h-full">
            <Header
                title={`${patient.firstName} ${patient.lastName}`}
                description={`Patient since ${format(new Date(patient.createdAt), "MMMM yyyy")}`}
            >
                <div className="flex gap-2">
                    <Button
                        onClick={() => router.push(`/billing?patientId=${patient.id}`)}
                        className="h-10 px-4 sm:px-5 gap-1.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all hover:shadow-lg border border-gray-800/50 font-bold text-[13px] cursor-pointer"
                    >
                        <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                        <span>New Invoice</span>
                    </Button>
                </div>
            </Header>

            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto space-y-6">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 font-bold uppercase tracking-wider min-w-0">
                        <span className="hover:text-gray-900 cursor-pointer transition-colors shrink-0" onClick={() => router.push("/patients")}>Patients</span>
                        <span className="text-gray-300 font-normal shrink-0">/</span>
                        <span className="text-cyan-700 truncate max-w-[120px] xs:max-w-[200px] sm:max-w-none">{patient.firstName} {patient.lastName}</span>
                    </div>
                    <Button variant="ghost" onClick={() => router.push("/patients")} className="gap-2 text-gray-500 hover:text-gray-900 transition-colors rounded-xl px-2 sm:px-3 group shrink-0">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="hidden sm:inline">Back to Patients</span>
                    </Button>
                </div>

                {/* Top Row Grid */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Card 1: Profile & Details Grid */}
                    <Card className="lg:col-span-2 bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden">
                        <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-5 sm:gap-6 md:gap-8 items-start">
                            {/* Left Column: Avatar & CTA */}
                            <div className="flex flex-col items-center text-center shrink-0 w-full md:w-48">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-100 to-indigo-100 text-cyan-800 border-4 border-white shadow-[0_4px_20px_rgba(6,182,212,0.15)] font-bold text-[30px] mb-4 uppercase">
                                    {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight mb-1 truncate max-w-full">
                                    {patient.firstName} {patient.lastName}
                                </h2>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                                    ID: {patient.id.slice(0, 8).toUpperCase()}
                                </p>
                                <div className="flex gap-2 w-full">
                                    <a
                                        href={`tel:${patient.phone}`}
                                        className="flex-1 flex items-center justify-center py-2 px-3 bg-white/80 border border-gray-100 rounded-xl text-[12px] font-bold text-gray-700 hover:text-cyan-700 hover:bg-cyan-50/35 hover:border-cyan-150 transition-all shadow-sm group gap-1.5"
                                    >
                                        <Phone className="h-3.5 w-3.5 text-cyan-600 transition-transform group-hover:scale-110" />
                                        Call
                                    </a>
                                    {patient.email && (
                                        <a
                                            href={`mailto:${patient.email}`}
                                            className="flex-1 flex items-center justify-center py-2 px-3 bg-white/80 border border-gray-100 rounded-xl text-[12px] font-bold text-gray-700 hover:text-cyan-700 hover:bg-cyan-50/35 hover:border-cyan-150 transition-all shadow-sm group gap-1.5"
                                        >
                                            <Mail className="h-3.5 w-3.5 text-cyan-600 transition-transform group-hover:scale-110" />
                                            Email
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Separator for mobile */}
                            <Separator className="block md:hidden my-2" />

                            {/* Right Column: Grid Details */}
                            <div className="flex-1 w-full grid grid-cols-2 gap-x-3.5 sm:gap-x-6 gap-y-4 text-left">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{patient.gender || "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">DOB</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{format(new Date(patient.dateOfBirth), "dd MMM yyyy")}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone number</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{patient.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Age</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{calculateAge(new Date(patient.dateOfBirth))} years</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{patient.address || "No Address Provided"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registration Date</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{format(new Date(patient.createdAt), "dd MMM yyyy")}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member Status</p>
                                    <p className="text-[14px] font-bold text-emerald-600 mt-0.5">Active member</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Clinical Notes Editor */}
                    <Card className="lg:col-span-1 bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden flex flex-col h-full min-h-[300px]">
                        <CardHeader className="py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-100/50 flex flex-row items-center justify-between gap-2">
                            <CardTitle className="text-sm sm:text-[15px] font-bold text-gray-800 flex items-center gap-2 shrink-0">
                                <FileText className="h-4 w-4 text-cyan-600" />
                                Clinical Notes
                            </CardTitle>
                            {patient.allergies && patient.allergies.length > 0 && (
                                <Badge className="bg-red-50 text-red-650 border border-red-100 shadow-none hover:bg-red-50 font-bold px-2 py-0.5 text-[9px] uppercase shrink-0">
                                    Alerts Active
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="flex-1 flex flex-col">
                                <textarea
                                    value={notesText}
                                    onChange={(e) => setNotesText(e.target.value)}
                                    placeholder="Add any clinical notes, allergies warnings, or tags..."
                                    className="flex-1 min-h-[120px] w-full rounded-xl border border-gray-200/60 bg-white/40 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 shadow-xs transition-all focus:bg-white placeholder:text-gray-400 resize-none text-gray-700 leading-relaxed scrollbar-thin"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                {patient.allergies && patient.allergies.length > 0 && (
                                    <div className="bg-red-50/40 rounded-xl border border-red-100/50 p-3">
                                        <div className="flex items-center gap-1.5 text-red-655 mb-1.5">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            <span className="font-bold text-[10px] uppercase tracking-wider">Recorded Allergies</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {patient.allergies.map((allergy: string) => (
                                                <Badge key={allergy} className="bg-white text-red-600 border-red-100 shadow-xs hover:bg-red-50/50 font-bold px-2 py-0.2 text-[10px]">
                                                    {allergy}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes}
                                        className="h-10 px-5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white border border-gray-800/50 font-bold text-[13px] cursor-pointer shadow-sm transition-all"
                                    >
                                        {isSavingNotes ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                                Saving...
                                            </>
                                        ) : "Save Note"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row Grid */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Visits Timeline Card (Takes 2 columns) */}
                    <Card className="lg:col-span-2 bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden flex flex-col h-fit">
                        <CardHeader className="py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-cyan-600" />
                                <CardTitle className="text-[16px] font-bold text-gray-800">Visits Timeline</CardTitle>
                            </div>
                            <Button className="rounded-xl px-5 h-10 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 gap-2 cursor-pointer" onClick={() => setIsNewVisitOpen(true)}>
                                <Plus className="h-4 w-4" />
                                New Visit
                            </Button>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6">
                            <Tabs defaultValue="upcoming" className="w-full">
                                <TabsList className="mb-6 bg-gray-50/50 border border-gray-100/60 p-1 rounded-xl h-auto flex w-fit">
                                    <TabsTrigger value="upcoming" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-cyan-700 font-semibold text-[13px] text-gray-500 transition-all cursor-pointer">
                                        Upcoming ({upcomingVisits.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="past" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-cyan-700 font-semibold text-[13px] text-gray-500 transition-all cursor-pointer">
                                        Past ({pastVisits.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="upcoming" className="mt-0">
                                    {renderTimeline(upcomingVisits)}
                                </TabsContent>
                                <TabsContent value="past" className="mt-0">
                                    {renderTimeline(pastVisits)}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Payments & Billing Card (Takes 1 column) */}
                    <Card className="lg:col-span-1 bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden flex flex-col h-fit">
                        <CardHeader className="py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-100/50 flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-cyan-600" />
                                <CardTitle className="text-sm sm:text-[16px] font-bold text-gray-800">Payments</CardTitle>
                            </div>
                            <Button
                                onClick={() => router.push(`/billing?patientId=${patient.id}`)}
                                className="h-9 w-9 sm:w-auto px-0 sm:px-3.5 gap-0 sm:gap-1.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white border border-gray-800/50 font-bold text-[12px] cursor-pointer shadow-sm transition-all flex items-center justify-center"
                            >
                                <Plus className="h-3.5 w-3.5 shrink-0" />
                                <span className="hidden sm:inline">Invoice</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 space-y-6">
                            {/* Balance Summary Grid */}
                            <div className="bg-white/40 border border-white/60 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.01)] relative overflow-hidden">
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-200/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Billed</p>
                                        <p className="text-[14px] font-black text-gray-900 mt-1 truncate">{formatCurrency(totalBilled)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Paid</p>
                                        <p className="text-[14px] font-black text-emerald-600 mt-1 truncate">{formatCurrency(totalPaid)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Outstanding</p>
                                        <p className="text-[14px] font-black text-amber-600 mt-1 truncate">{formatCurrency(outstanding)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Invoices List */}
                            <div className="space-y-3">
                                {invoices.length === 0 ? (
                                    <div className="py-6 text-center text-gray-400 text-xs font-semibold">
                                        No invoices found
                                    </div>
                                ) : (
                                    invoices.map((invoice: any) => {
                                        const balance = Number(invoice.total) - Number(invoice.amountPaid)
                                        return (
                                            <div key={invoice.id} className="p-3 sm:p-3.5 border border-gray-100/50 bg-white/40 rounded-xl hover:bg-white transition-all duration-200 space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-[12px] font-bold text-gray-800">
                                                        {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border-0
                                                        ${invoice.status === "PAID" ? 'bg-emerald-50 text-emerald-700' :
                                                            invoice.status === "PARTIAL" ? 'bg-amber-50 text-amber-700' :
                                                                'bg-red-50 text-red-700'
                                                        }`}>
                                                        <span className={`w-1 h-1 rounded-full ${invoice.status === "PAID" ? 'bg-emerald-500' : invoice.status === "PARTIAL" ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                                                        {invoice.status}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
                                                    <span>{format(new Date(invoice.createdAt), "dd MMM yyyy")}</span>
                                                    <span className="text-gray-900 font-bold">{formatCurrency(Number(invoice.total))}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 rounded-lg h-8 px-1.5 text-[11px] font-bold border-gray-100 bg-white shadow-xs hover:bg-gray-50 text-gray-750 hover:text-gray-900 cursor-pointer"
                                                        onClick={() => router.push(`/billing/${invoice.id}`)}
                                                    >
                                                        <Eye className="mr-1 h-3 w-3 text-cyan-600" />
                                                        View
                                                    </Button>

                                                    <PDFDownloadLink
                                                        document={
                                                            <InvoicePDF
                                                                invoice={{
                                                                    ...invoice,
                                                                    number: invoice.invoiceNumber,
                                                                    date: invoice.createdAt || invoice.date,
                                                                    dueDate: invoice.dueDate,
                                                                    patientName: `${patient.firstName} ${patient.lastName}`,
                                                                    items: invoice.items?.map((i: any) => ({
                                                                        description: i.description,
                                                                        quantity: i.quantity,
                                                                        unitPrice: i.unitPrice,
                                                                        total: i.total
                                                                    })) || [],
                                                                    patient: {
                                                                        firstName: patient.firstName,
                                                                        lastName: patient.lastName,
                                                                        email: patient.email || "",
                                                                        phone: patient.phone
                                                                    }
                                                                }}
                                                                clinicName={invoice.clinic?.name}
                                                                clinicAddress={invoice.clinic?.address}
                                                                clinicPhone={invoice.clinic?.phone}
                                                                clinicEmail={invoice.clinic?.email}
                                                            />
                                                        }
                                                        fileName={`${invoice.invoiceNumber || invoice.id}.pdf`}
                                                        style={{ display: "inline-flex", flex: 1 }}
                                                    >
                                                        {/* @ts-ignore */}
                                                        {({ loading }) => (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full rounded-lg h-8 px-1.5 text-[11px] font-bold border-gray-100 bg-white shadow-xs hover:bg-gray-50 text-gray-750 hover:text-gray-900 cursor-pointer"
                                                                disabled={loading}
                                                            >
                                                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3 text-cyan-600" />}
                                                                PDF
                                                            </Button>
                                                        )}
                                                    </PDFDownloadLink>

                                                    {balance > 0 && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 rounded-lg h-8 px-1.5 text-[11px] font-bold border-cyan-100 bg-cyan-50/20 text-cyan-650 hover:text-cyan-700 hover:bg-cyan-50 shadow-xs cursor-pointer"
                                                            onClick={(e) => handleRecordPaymentClick(invoice, e)}
                                                        >
                                                            <CreditCard className="mr-1 h-3 w-3" />
                                                            Pay
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isNewVisitOpen} onOpenChange={setIsNewVisitOpen}>
                <DialogContent className="max-w-2xl bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-white/40">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">Schedule New Visit</DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="p-4 sm:p-6">
                        <AppointmentForm
                            clinicId={patient.clinicId}
                            patients={[{ id: patient.id, firstName: patient.firstName, lastName: patient.lastName }]}
                            defaultValues={{ patientId: patient.id }}
                            onSubmit={handleCreateAppointment}
                            onCancel={() => setIsNewVisitOpen(false)}
                            isLoading={isLoading}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Appointment Dialog */}
            <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && setEditingAppointment(null)}>
                <DialogContent className="bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-white/40">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">Edit Appointment</DialogTitle>
                            <DialogDescription className="text-gray-500 font-medium">
                                Modify the details for this scheduled visit.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-date" className="text-gray-700 font-semibold text-[13px]">Date</Label>
                                <Input
                                    id="edit-date"
                                    type="date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-time" className="text-gray-700 font-semibold text-[13px]">Time</Label>
                                <Input
                                    id="edit-time"
                                    type="time"
                                    value={editForm.time}
                                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type" className="text-gray-700 font-semibold text-[13px]">Treatment Type</Label>
                            <Select
                                value={editForm.type}
                                onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4">
                                    <SelectValue placeholder="Select treatment" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-gray-100 bg-white shadow-xl">
                                    {editSelectOptions.map((treatment) => (
                                        <SelectItem key={treatment} value={treatment} className="rounded-lg hover:bg-cyan-50 cursor-pointer">
                                            {APPOINTMENT_TYPE_LABELS[treatment] || treatment}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-duration" className="text-gray-700 font-semibold text-[13px]">Duration (minutes)</Label>
                            <Input
                                id="edit-duration"
                                type="number"
                                value={editForm.duration}
                                onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 30 })}
                                className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold text-[13px]">Status</Label>
                            <Select
                                value={editForm.status}
                                onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent position="popper" side="bottom" className="rounded-xl border border-gray-100 bg-white shadow-xl">
                                    <SelectItem value="SCHEDULED" className="rounded-lg hover:bg-cyan-50 cursor-pointer">🔵 Scheduled</SelectItem>
                                    <SelectItem value="CONFIRMED" className="rounded-lg hover:bg-cyan-50 cursor-pointer">✅ Confirmed</SelectItem>
                                    <SelectItem value="SEATED" className="rounded-lg hover:bg-cyan-50 cursor-pointer">🪑 Seated</SelectItem>
                                    <SelectItem value="IN_PROGRESS" className="rounded-lg hover:bg-cyan-50 cursor-pointer">🏥 In Progress</SelectItem>
                                    <SelectItem value="COMPLETED" className="rounded-lg hover:bg-cyan-50 cursor-pointer">✔️ Completed</SelectItem>
                                    <SelectItem value="CANCELLED" className="rounded-lg hover:bg-cyan-50 cursor-pointer">❌ Cancelled</SelectItem>
                                    <SelectItem value="NO_SHOW" className="rounded-lg hover:bg-cyan-50 cursor-pointer">⚠️ No Show</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-notes" className="text-gray-700 font-semibold text-[13px]">Notes</Label>
                            <Input
                                id="edit-notes"
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                placeholder="Add any notes..."
                                className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                            />
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px]">
                        <Button variant="outline" onClick={() => setEditingAppointment(null)} className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isLoading} className="w-full sm:w-auto rounded-xl px-6 h-11 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 cursor-pointer">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="max-w-md bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-white/40">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">Record Payment</DialogTitle>
                            <DialogDescription className="text-gray-500 font-medium">
                                Record a payment for invoice {selectedInvoice?.invoiceNumber || selectedInvoice?.id?.slice(0, 8).toUpperCase()}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedInvoice && (
                        <div className="space-y-5 p-4 sm:p-6">
                            <div className="rounded-2xl bg-gray-50/50 border border-gray-100/40 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Invoice Total</span>
                                    <span className="font-bold text-gray-950">{formatCurrency(selectedInvoice.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Already Paid</span>
                                    <span className="text-emerald-600 font-bold">{formatCurrency(selectedInvoice.amountPaid)}</span>
                                </div>
                                <Separator className="my-1" />
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-900">Balance Due</span>
                                    <span className="text-amber-600">{formatCurrency(selectedInvoice.total - selectedInvoice.amountPaid)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-gray-700 font-semibold text-[13px]">Payment Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="method" className="text-gray-700 font-semibold text-[13px]">Payment Method</Label>
                                <select
                                    id="method"
                                    className="flex h-11 w-full rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    {PAYMENT_METHODS.map((method) => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px]">
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitPayment} disabled={isSubmittingPayment} className="w-full sm:w-auto rounded-xl px-6 h-11 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 cursor-pointer">
                            {isSubmittingPayment ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : "Record Payment"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
