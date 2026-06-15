"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Search, User, Calendar } from "lucide-react"
import { getPatients } from "@/lib/actions/patients"
import { getAppointments } from "@/lib/actions/appointments"
import { format } from "date-fns"

interface GlobalSearchProps {
    clinicId: string
}

export function GlobalSearch({ clinicId }: GlobalSearchProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [patients, setPatients] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Reset search query and results when dialog is closed
    useEffect(() => {
        if (!open) {
            setQuery("")
            setPatients([])
            setAppointments([])
        }
    }, [open])

    // Search when query changes
    useEffect(() => {
        if (!query || query.length < 2) {
            setPatients([])
            setAppointments([])
            return
        }

        const search = async () => {
            setLoading(true)
            try {
                const [patientsData, appointmentsData] = await Promise.all([
                    getPatients(clinicId, query),
                    getAppointments(clinicId, { query })
                ])

                setPatients(patientsData.slice(0, 5))
                setAppointments(appointmentsData.slice(0, 5))
            } catch (error) {
                console.error("Search failed:", error)
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(search, 300)
        return () => clearTimeout(debounceTimer)
    }, [query, clinicId])

    const handleSelectPatient = (patientId: string) => {
        setOpen(false)
        router.push(`/patients/${patientId}`)
    }

    const handleSelectAppointment = (appointmentId: string) => {
        setOpen(false)
        router.push(`/schedule`)
    }

    return (
        <>
            {/* Desktop Search Button */}
            <div
                className="relative hidden md:block cursor-pointer group"
                onClick={() => setOpen(true)}
            >
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                <div className="w-64 h-11 pl-10 pr-3 border border-gray-200/60 bg-white/60 group-hover:bg-white rounded-xl flex items-center text-xs text-gray-400 font-medium transition-all shadow-sm">
                    Search patients, appointments...
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 border-gray-200 px-1.5 font-mono text-[9px] font-bold text-gray-400 opacity-100 shadow-2xs">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>

            {/* Mobile Search Button */}
            <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 md:hidden shrink-0 rounded-xl border border-gray-200/60 bg-white/60 hover:bg-white shadow-sm transition-all text-gray-400 hover:text-cyan-600"
                onClick={() => setOpen(true)}
                aria-label="Search"
            >
                <Search className="h-4 w-4 text-slate-500" />
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
                <CommandInput
                    placeholder="Search patients, appointments..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {loading ? "Searching..." : "No results found."}
                    </CommandEmpty>

                    {patients.length > 0 && (
                        <CommandGroup heading="Patients">
                            {patients.map((patient) => (
                                <CommandItem
                                    key={patient.id}
                                    onSelect={() => handleSelectPatient(patient.id)}
                                    className="cursor-pointer"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>{patient.firstName} {patient.lastName}</span>
                                    {patient.phone && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {patient.phone}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {appointments.length > 0 && (
                        <CommandGroup heading="Appointments">
                            {appointments.map((apt) => (
                                <CommandItem
                                    key={apt.id}
                                    onSelect={() => handleSelectAppointment(apt.id)}
                                    className="cursor-pointer"
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>
                                        {apt.patient.firstName} {apt.patient.lastName}
                                    </span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {format(new Date(apt.scheduledAt), "MMM d, h:mm a")}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
