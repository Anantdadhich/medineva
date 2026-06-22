"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { PatientForm } from "./patient-form"
import type { PatientFormValues } from "@/lib/validations/patient"

interface QuickAddPatientSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: PatientFormValues) => Promise<void>
    defaultValues?: Partial<PatientFormValues>
    clinicId: string
}

export function QuickAddPatientSheet({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
    clinicId,
}: QuickAddPatientSheetProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (data: PatientFormValues) => {
        setIsLoading(true)
        try {
            await onSubmit(data)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create/update patient:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto bg-white/70 backdrop-blur-3xl border-l border-white/60 shadow-[-8px_0_32px_rgba(0,0,0,0.05)] p-0">
                <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                            {defaultValues ? "Edit Patient" : "Add New Patient"}
                        </SheetTitle>
                        <SheetDescription className="text-gray-500 font-medium">
                            {defaultValues ? "Update patient details below." : "Fill in the patient details below. Required fields are marked with *."}
                        </SheetDescription>
                    </SheetHeader>
                </div>
                <div className="p-4 sm:p-8">
                    <PatientForm
                        clinicId={clinicId}
                        defaultValues={defaultValues}
                        onSubmit={handleSubmit}
                        onCancel={() => onOpenChange(false)}
                        isLoading={isLoading}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
