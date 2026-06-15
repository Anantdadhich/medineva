"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { appointmentFormSchema, type AppointmentFormValues } from "@/lib/validations/appointment"
import { getPatients } from "@/lib/actions/patients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Doctor {
    id: string
    firstName: string
    lastName: string
}

interface Patient {
    id: string
    firstName: string
    lastName: string
}

interface AppointmentFormProps {
    clinicId: string
    patients: Patient[]
    defaultValues?: Partial<AppointmentFormValues>
    onSubmit: (data: AppointmentFormValues) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function AppointmentForm({
    clinicId,
    patients,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading,
}: AppointmentFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentFormSchema) as any,
        defaultValues: {
            type: "CHECKUP",
            ...defaultValues,
        },
    })

    const [searchTerm, setSearchTerm] = useState("")
    const [patientList, setPatientList] = useState(patients)
    const [isSearching, setIsSearching] = useState(false)

    // Update patientList when initial patients prop changes (e.g. reload)
    useEffect(() => {
        if (!searchTerm) {
            setPatientList(patients)
        }
    }, [patients]) // Removed searchTerm dependency to avoid overwrite during typing

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!searchTerm) {
                setPatientList(patients)
                return
            }

            try {
                setIsSearching(true)
                const results = await getPatients(clinicId, searchTerm)
                setPatientList(results.map((p: any) => ({ id: p.id, firstName: p.firstName, lastName: p.lastName })))
            } catch (error) {
                console.error("Search failed", error)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, clinicId, patients])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="patientId" className="text-gray-700 font-semibold text-[13px]">Patient *</Label>
                    <Input
                        placeholder="Search patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2 h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                    />
                    <select
                        id="patientId"
                        className="flex h-11 w-full rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-gray-800"
                        {...register("patientId")}
                    >
                        <option value="">
                            {isSearching ? "Searching..." : `Select Patient (${patientList.length})`}
                        </option>
                        {patientList.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                                {patient.firstName} {patient.lastName}
                            </option>
                        ))}
                    </select>
                    {patientList.length === 0 && !isSearching && (
                        <p className="text-xs text-muted-foreground mt-1 px-1">No patients found. Access Patients page to add one.</p>
                    )}
                    {errors.patientId && (
                        <p className="text-sm text-destructive px-1">{errors.patientId.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="scheduledAt" className="text-gray-700 font-semibold text-[13px]">Date & Time *</Label>
                    <Input
                        id="scheduledAt"
                        type="datetime-local"
                        {...register("scheduledAt", { valueAsDate: true })}
                        className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                    />
                    {errors.scheduledAt && (
                        <p className="text-sm text-destructive px-1">{errors.scheduledAt.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duration" className="text-gray-700 font-semibold text-[13px]">Duration (mins) *</Label>
                    <select
                        id="duration"
                        className="flex h-11 w-full rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-gray-800"
                        {...register("duration", { valueAsNumber: true })}
                    >
                        <option value="15">15 mins</option>
                        <option value="30">30 mins</option>
                        <option value="45">45 mins</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                    </select>
                    {errors.duration && (
                        <p className="text-sm text-destructive px-1">{errors.duration.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-700 font-semibold text-[13px]">Type *</Label>
                <select
                    id="type"
                    className="flex h-11 w-full rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-gray-800"
                    {...register("type")}
                >
                    <option value="CHECKUP">General Checkup</option>
                    <option value="TREATMENT">Treatment</option>
                    <option value="CONSULTATION">Consultation</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="EMERGENCY">Emergency</option>
                </select>
                {errors.type && (
                    <p className="text-sm text-destructive px-1">{errors.type.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700 font-semibold text-[13px]">Notes</Label>
                <textarea
                    id="notes"
                    className="flex min-h-[90px] w-full rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 placeholder:text-gray-400 text-gray-750 resize-none"
                    placeholder="Reason for visit..."
                    {...register("notes")}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100/50">
                <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50 text-gray-750">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="rounded-xl px-6 h-11 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 cursor-pointer">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Scheduling...
                        </>
                    ) : (
                        (defaultValues as any)?.id ? "Update Appointment" : "Schedule Appointment"
                    )}
                </Button>
            </div>
        </form>
    )
}
