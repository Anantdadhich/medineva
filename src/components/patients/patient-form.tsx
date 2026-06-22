"use client"

import { useForm, SubmitHandler, FieldValues, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronDown, Check, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getTreatments } from "@/lib/actions/treatments"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PatientFormProps {
    clinicId: string
    defaultValues?: Partial<PatientFormValues>
    onSubmit: (data: PatientFormValues) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

interface Treatment {
    id: string
    name: string
    category: string
}


const DEFAULT_DENTAL_SERVICES: Treatment[] = [

    { id: "default-1", name: "Routine Checkup", category: "Preventive Care" },
    { id: "default-2", name: "Dental Cleaning (Scaling)", category: "Preventive Care" },
    { id: "default-3", name: "Deep Cleaning", category: "Preventive Care" },
    { id: "default-4", name: "Fluoride Treatment", category: "Preventive Care" },
    { id: "default-5", name: "X-Ray", category: "Preventive Care" },
    { id: "default-6", name: "OPG/Full Mouth X-Ray", category: "Preventive Care" },


    { id: "default-7", name: "Tooth Filling (Composite)", category: "Restorative" },
    { id: "default-8", name: "Tooth Filling (Amalgam)", category: "Restorative" },
    { id: "default-9", name: "Root Canal Treatment (RCT)", category: "Restorative" },
    { id: "default-10", name: "Crown/Cap", category: "Restorative" },
    { id: "default-11", name: "Bridge", category: "Restorative" },
    { id: "default-12", name: "Inlay/Onlay", category: "Restorative" },


    { id: "default-13", name: "Teeth Whitening", category: "Cosmetic" },
    { id: "default-14", name: "Veneer", category: "Cosmetic" },
    { id: "default-15", name: "Smile Makeover", category: "Cosmetic" },
    { id: "default-16", name: "Tooth Bonding", category: "Cosmetic" },


    { id: "default-17", name: "Simple Extraction", category: "Extraction & Surgery" },
    { id: "default-18", name: "Surgical Extraction", category: "Extraction & Surgery" },
    { id: "default-19", name: "Wisdom Tooth Removal", category: "Extraction & Surgery" },
    { id: "default-20", name: "Gum Surgery", category: "Extraction & Surgery" },


    { id: "default-21", name: "Braces Consultation", category: "Orthodontics" },
    { id: "default-22", name: "Metal Braces", category: "Orthodontics" },
    { id: "default-23", name: "Ceramic Braces", category: "Orthodontics" },
    { id: "default-24", name: "Invisalign/Clear Aligners", category: "Orthodontics" },
    { id: "default-25", name: "Retainer", category: "Orthodontics" },


    { id: "default-26", name: "Dental Implant", category: "Implants & Prosthetics" },
    { id: "default-27", name: "Complete Denture", category: "Implants & Prosthetics" },
    { id: "default-28", name: "Partial Denture", category: "Implants & Prosthetics" },
    { id: "default-29", name: "Implant Crown", category: "Implants & Prosthetics" },


    { id: "default-30", name: "Child Checkup", category: "Pediatric" },
    { id: "default-31", name: "Pit & Fissure Sealant", category: "Pediatric" },
    { id: "default-32", name: "Pulpotomy", category: "Pediatric" },
    { id: "default-33", name: "Space Maintainer", category: "Pediatric" },


    { id: "default-34", name: "Emergency Consultation", category: "Emergency" },
    { id: "default-35", name: "Pain Relief", category: "Emergency" },
    { id: "default-36", name: "Temporary Filling", category: "Emergency" },
    { id: "default-37", name: "Tooth Re-implantation", category: "Emergency" },
]

export function PatientForm({
    clinicId,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading,
}: PatientFormProps) {
    const [treatments, setTreatments] = useState<Treatment[]>(DEFAULT_DENTAL_SERVICES)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            gender: undefined,
            address: "",
            allergies: [] as string[],
            notes: "",
            ...defaultValues,
        },
    })

    const selectedNotes = watch("notes") || ""


    useEffect(() => {
        async function loadTreatments() {
            try {
                const data = await getTreatments(clinicId)
                if (data && data.length > 0) {

                    setTreatments(data)
                }
            } catch (error) {
                console.error("Failed to load treatments:", error)
            }
        }
        loadTreatments()
    }, [clinicId])


    useEffect(() => {
        if (!isDropdownOpen) return
        function handleOutsideClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleOutsideClick)
        return () => document.removeEventListener("mousedown", handleOutsideClick)
    }, [isDropdownOpen])


    const groupedTreatments = treatments.reduce((acc, treatment) => {
        const category = treatment.category || "Other"
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(treatment)
        return acc
    }, {} as Record<string, Treatment[]>)


    const removeServiceFromNotes = (notes: string, serviceName: string) => {
        const items = notes.split(/,\s*/)
        const filteredItems = items.filter(item => item.trim() !== serviceName)
        return filteredItems.join(", ")
    }

    const handleServiceSelect = (serviceName: string) => {

        const items = selectedNotes.split(/,\s*/).map(item => item.trim()).filter(Boolean)
        let newNotes = ""
        if (items.includes(serviceName)) {
            newNotes = removeServiceFromNotes(selectedNotes, serviceName)
        } else {
            newNotes = selectedNotes ? `${selectedNotes}, ${serviceName}` : serviceName
        }
        setValue("notes", newNotes)
    }


    const selectedServices = treatments.filter(t => {
        const items = selectedNotes.split(/,\s*/).map(item => item.trim())
        return items.includes(t.name)
    })

    const handleFormSubmit: SubmitHandler<FieldValues> = async (data) => {
        await onSubmit(data as PatientFormValues)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[12px] font-bold uppercase tracking-wider text-gray-600">First Name <span className="text-red-500">*</span></Label>
                    <Input
                        id="firstName"
                        placeholder="John"
                        className="h-12 rounded-xl bg-white/80 border-gray-200/60 focus-visible:bg-white focus-visible:ring-cyan-500/20 shadow-sm transition-all px-4 text-sm"
                        {...register("firstName")}
                    />
                    {errors.firstName && (
                        <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.firstName.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                        id="lastName"
                        placeholder="Doe"
                        className="h-12 rounded-xl bg-white/80 border-gray-200/60 focus-visible:bg-white focus-visible:ring-cyan-500/20 shadow-sm transition-all px-4 text-sm"
                        {...register("lastName")}
                    />
                    {errors.lastName && (
                        <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.lastName.message as string}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        className="h-12 rounded-xl bg-white/80 border-gray-200/60 focus-visible:bg-white focus-visible:ring-cyan-500/20 shadow-sm transition-all px-4 text-sm"
                        {...register("phone")}
                    />
                    {errors.phone && (
                        <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.phone.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 rounded-xl bg-white/80 border-gray-200/60 focus-visible:bg-white focus-visible:ring-cyan-500/20 shadow-sm transition-all px-4 text-sm"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.email.message as string}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Date of Birth <span className="text-red-500">*</span></Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        className="h-12 rounded-xl bg-white/80 border-gray-200/60 focus-visible:bg-white focus-visible:ring-cyan-500/20 shadow-sm transition-all px-4 text-sm"
                        {...register("dateOfBirth")}
                    />
                    {errors.dateOfBirth && (
                        <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.dateOfBirth.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender" className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Gender</Label>
                    <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger className="h-12 rounded-xl bg-white/80 border-gray-200/60 focus-visible:bg-white focus-visible:ring-cyan-500/20 shadow-sm transition-all px-4 text-sm text-left">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-gray-100 bg-white shadow-xl">
                                    <SelectItem value="Male" className="rounded-lg hover:bg-cyan-50 cursor-pointer">Male</SelectItem>
                                    <SelectItem value="Female" className="rounded-lg hover:bg-cyan-50 cursor-pointer">Female</SelectItem>
                                    <SelectItem value="Other" className="rounded-lg hover:bg-cyan-50 cursor-pointer">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address" className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Address (Optional)</Label>
                <Input
                    id="address"
                    placeholder="123 Main Street, City"
                    className="h-12 rounded-xl bg-white/80 border-gray-200/60 focus-visible:bg-white focus-visible:ring-cyan-500/20 shadow-sm transition-all px-4 text-sm"
                    {...register("address")}
                />
            </div>

            {/* Service Selection with Dropdown */}
            <div className="space-y-2 relative" ref={dropdownRef}>
                <Label className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Reason for Visit / Services</Label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200/60 bg-white/80 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 shadow-sm transition-all hover:bg-white/90 cursor-pointer"
                    >
                        <span className="text-gray-500">
                            Select services to add...
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && treatments.length > 0 && (
                        <div className="absolute z-50 mt-2 w-full rounded-[14px] border border-gray-150 bg-white shadow-xl max-h-[260px] overflow-auto py-1 animate-in fade-in slide-in-from-top-2">
                            {Object.entries(groupedTreatments).map(([category, categoryTreatments]) => (
                                <div key={category}>
                                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 sticky top-0 backdrop-blur-md">
                                        {category}
                                    </div>
                                    {categoryTreatments.map((treatment) => {
                                        const isSelected = selectedNotes.split(/,\s*/).map(item => item.trim()).includes(treatment.name)
                                        return (
                                            <button
                                                key={treatment.id}
                                                type="button"
                                                onClick={() => handleServiceSelect(treatment.name)}
                                                className="flex w-full items-center px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors cursor-pointer text-left"
                                            >
                                                <Check className={`mr-3 h-4 w-4 shrink-0 ${isSelected ? 'text-cyan-600 opacity-100' : 'opacity-0'}`} />
                                                {treatment.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected services chips */}
                {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {selectedServices.map(service => (
                            <div key={service.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50/50 border border-cyan-100 text-cyan-700 rounded-xl text-xs font-semibold shadow-sm">
                                {service.name}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedNotes = removeServiceFromNotes(selectedNotes, service.name)
                                        setValue("notes", updatedNotes)
                                    }}
                                    className="text-cyan-400 hover:text-cyan-700 transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notes textarea */}
                <textarea
                    id="notes"
                    className="flex min-h-[100px] w-full rounded-xl border border-gray-200/60 bg-white/80 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 shadow-sm transition-all focus:bg-white placeholder:text-gray-400 mt-3 resize-none"
                    placeholder="Additional clinical / medical notes..."
                    {...register("notes")}
                />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100/50 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="w-full sm:w-auto rounded-xl h-12 px-5 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50 text-gray-750 cursor-pointer"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto rounded-xl h-12 px-7 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md hover:shadow-lg transition-all border border-gray-800/50 cursor-pointer"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
                    {defaultValues?.firstName ? "Update Patient" : "Save Patient"}
                </Button>
            </div>
        </form>
    )
}
