"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { PatientTable } from "@/components/patients/patient-table"
import { QuickAddPatientSheet } from "@/components/patients/quick-add-sheet"
import { createPatient, updatePatient, deletePatient } from "@/lib/actions/patients"
import type { PatientFormValues } from "@/lib/validations/patient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImportPatientsDialog } from "@/components/patients/import-patients-dialog"
import { ExportPatientsDialog } from "@/components/patients/export-patients-dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, X, Users, Activity, Sparkles, AlertTriangle } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PatientsClientProps {
    initialPatients: any[]
    clinicId: string
}

export function PatientsClient({ initialPatients, clinicId }: PatientsClientProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
    const [patients, setPatients] = useState(initialPatients)
    const [selectedPatient, setSelectedPatient] = useState<any>(null)

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("recent")

    // Sync local state with server data when props change
    useEffect(() => {
        setPatients(initialPatients)
    }, [initialPatients])

    // Calculate metrics/stats from total patients list
    const stats = useMemo(() => {
        const total = patients.length
        
        // Active patients: last visit date is within the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const active = patients.filter(p => {
            if (!p.lastVisitDate) return false
            return new Date(p.lastVisitDate) >= thirtyDaysAgo
        }).length
        
        const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0

        // New patients in last 30 days
        const newPatientsCount = patients.filter(p => {
            if (!p.createdAt) return false
            return new Date(p.createdAt) >= thirtyDaysAgo
        }).length

        // Patients with allergies recorded
        const withAllergies = patients.filter(p => p.allergies && p.allergies.length > 0).length

        return {
            total,
            active,
            activePercentage,
            newPatients: newPatientsCount,
            withAllergies,
        }
    }, [patients])

    const handleSheetSubmit = async (data: PatientFormValues) => {
        try {
            if (selectedPatient) {
                // Edit Mode
                await updatePatient(selectedPatient.id, data)
                toast({ title: "Patient updated successfully" })
            } else {
                // Create Mode
                await createPatient(clinicId, data)
                toast({ title: "Patient created successfully" })
            }
            router.refresh()
            setIsAddSheetOpen(false)
            setSelectedPatient(null)
        } catch (error) {
            console.error("Failed to save patient", error)
            toast({
                title: "Error",
                description: "Failed to save patient details.",
                variant: "destructive"
            })
        }
    }

    const handleAddClick = () => {
        setSelectedPatient(null)
        setIsAddSheetOpen(true)
    }

    const handleViewPatient = (patient: { id: string }) => {
        router.push(`/patients/${patient.id}`)
    }

    const handleEditPatient = (patient: any) => {
        // Pre-fill date objects if needed, though react-hook-form handles strings well for defaultValues usually
        // But date input needs YYYY-MM-DD
        const formattedPatient = {
            ...patient,
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
        }
        setSelectedPatient(formattedPatient)
        setIsAddSheetOpen(true)
    }

    const handleDeletePatient = async (patient: any) => {
        if (confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This action cannot be undone.`)) {
            try {
                await deletePatient(patient.id)
                toast({ title: "Patient deleted successfully" })
                router.refresh()
            } catch (error) {
                console.error("Delete failed", error)
                toast({ title: "Delete failed", variant: "destructive" })
            }
        }
    }

    // Filtered and sorted patients
    const filteredPatients = useMemo(() => {
        let result = [...patients]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(patient => {
                const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
                const phone = patient.phone?.toLowerCase() || ""
                const email = patient.email?.toLowerCase() || ""
                return fullName.includes(query) || phone.includes(query) || email.includes(query)
            })
        }

        // Status filter
        if (statusFilter !== "all") {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            result = result.filter(patient => {
                const lastVisit = patient.lastVisitDate ? new Date(patient.lastVisitDate) : null

                if (statusFilter === "active") {
                    return lastVisit && lastVisit >= thirtyDaysAgo
                } else if (statusFilter === "inactive") {
                    return !lastVisit || lastVisit < thirtyDaysAgo
                }
                return true
            })
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "name":
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                case "lastVisit":
                    const dateA = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0
                    const dateB = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0
                    return dateB - dateA
                default:
                    return 0
            }
        })

        return result
    }, [patients, searchQuery, statusFilter, sortBy])

    return (
        <div className="flex flex-col w-full min-w-0 h-full">
            <Header
                title="Patients"
                description="Manage your patient records"
                action={{
                    label: "Add Patient",
                    onClick: handleAddClick,
                }}
            >
                <div className="flex items-center gap-2">
                    <ImportPatientsDialog clinicId={clinicId} />
                    <ExportPatientsDialog clinicId={clinicId} />
                </div>
            </Header>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6 mt-6">
                {/* Total Patients Card */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] p-6 hover:-translate-y-0.5 transition-all duration-200">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Patients</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{stats.total}</h3>
                        <p className="text-[11px] text-gray-400 font-semibold pt-1">Registered in system</p>
                    </div>
                </div>

                {/* Active Patients Card */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] p-6 hover:-translate-y-0.5 transition-all duration-200">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Patients</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{stats.active}</h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/60 border border-emerald-100/50 px-1.5 py-0.5 rounded-md">
                                {stats.activePercentage}% active
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-semibold pt-1">Visited in last 30d</p>
                    </div>
                </div>

                {/* New Patients Card */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] p-6 hover:-translate-y-0.5 transition-all duration-200">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">New Patients</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{stats.newPatients}</h3>
                        <p className="text-[11px] text-gray-400 font-semibold pt-1">Registered last 30d</p>
                    </div>
                </div>

                {/* Allergies Card */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] p-6 hover:-translate-y-0.5 transition-all duration-200">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Allergies</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{stats.withAllergies}</h3>
                            {stats.withAllergies > 0 && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50/60 border border-amber-100/50 px-1.5 py-0.5 rounded-md">
                                    Alerts active
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-400 font-semibold pt-1">Patients with alerts</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar - Glassmorphic Toolbar */}
            <div className="px-4 md:px-6 my-6 mb-3">
                <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px] p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-10 rounded-xl border-gray-100 bg-white/50 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="flex-1 sm:w-[130px] h-10 rounded-xl border-gray-100 bg-white/50 hover:bg-white transition-all shadow-sm">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                                <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                                <SelectItem value="active" className="rounded-lg">Active (30d)</SelectItem>
                                <SelectItem value="inactive" className="rounded-lg">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="flex-1 sm:w-[130px] h-10 rounded-xl border-gray-100 bg-white/50 hover:bg-white transition-all shadow-sm">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                                <SelectItem value="recent" className="rounded-lg">Most Recent</SelectItem>
                                <SelectItem value="name" className="rounded-lg">Name (A-Z)</SelectItem>
                                <SelectItem value="lastVisit" className="rounded-lg">Last Visit</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="text-[13px] font-medium text-gray-400 pl-2 sm:border-l border-gray-200/50 w-full sm:w-auto text-center sm:text-left mt-1 sm:mt-0">
                            <span className="text-gray-900 font-bold">{filteredPatients.length}</span> of {patients.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Filters indicator */}
            {(searchQuery || statusFilter !== "all" || sortBy !== "recent") && (
                <div className="px-4 md:px-6 mb-4 flex flex-wrap gap-2 items-center animate-fadeIn">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Active Filters:</span>
                    {searchQuery && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-gray-100/60 shadow-sm text-xs font-semibold text-gray-700">
                            Search: "{searchQuery}"
                            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    {statusFilter !== "all" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-gray-100/60 shadow-sm text-xs font-semibold text-gray-700">
                            Status: {statusFilter === "active" ? "Active (30d)" : "Inactive"}
                            <button onClick={() => setStatusFilter("all")} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    {sortBy !== "recent" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-gray-100/60 shadow-sm text-xs font-semibold text-gray-700">
                            Sort: {sortBy === "name" ? "Name (A-Z)" : sortBy === "lastVisit" ? "Last Visit" : sortBy}
                            <button onClick={() => setSortBy("recent")} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => {
                            setSearchQuery("")
                            setStatusFilter("all")
                            setSortBy("recent")
                        }} 
                        className="text-[12px] font-bold text-cyan-600 hover:text-cyan-800 transition-colors ml-1"
                    >
                        Clear All
                    </button>
                </div>
            )}

            <div className="flex-1 p-4 md:p-6 pt-0 overflow-auto">
                {filteredPatients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No patients found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Click 'Add Patient' to create your first patient record"}
                        </p>
                    </div>
                ) : (
                    <PatientTable
                        patients={filteredPatients}
                        onView={handleViewPatient}
                        onEdit={handleEditPatient}
                        onDelete={handleDeletePatient}
                    />
                )}
            </div>

            <QuickAddPatientSheet
                open={isAddSheetOpen}
                onOpenChange={(open) => {
                    setIsAddSheetOpen(open)
                    if (!open) setSelectedPatient(null)
                }}
                onSubmit={handleSheetSubmit}
                defaultValues={selectedPatient}
                clinicId={clinicId}
            />
        </div>
    )
}
