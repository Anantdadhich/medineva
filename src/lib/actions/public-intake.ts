"use server"

import prisma from "@/lib/prisma"
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient"
import { checkRateLimit } from "@/lib/rate-limit"

export async function createPublicPatient(clinicId: string, data: PatientFormValues) {
    try {
        if (!await checkRateLimit(`public-intake-${clinicId}`)) {
            return { error: "Too many registrations. Please wait a moment and try again." }
        }

        // Validate the clinic exists first
        const clinic = await prisma.clinic.findUnique({
            where: { id: clinicId }
        })

        if (!clinic) {
            return { error: "Invalid registration link. Clinic not found." }
        }

        // Validate the data against our robust schema
        const validatedData = patientFormSchema.parse(data)

        const dob = new Date(validatedData.dateOfBirth)
        if (isNaN(dob.getTime())) {
            return { error: "Invalid date of birth" }
        }

        // Default to 'Consultation' as requested by user
        let notesText = "Initial visit type: Consultation."
        const trimmedNotes = validatedData.notes?.trim()
        if (trimmedNotes) {
            notesText += `\nPatient Notes: ${trimmedNotes}`
        }

        const patient = await prisma.patient.create({
            data: {
                firstName: validatedData.firstName.trim(),
                lastName: validatedData.lastName.trim(),
                phone: validatedData.phone,
                email: validatedData.email?.trim() || null,
                dateOfBirth: dob,
                gender: validatedData.gender || null,
                address: validatedData.address?.trim() || null,
                allergies: validatedData.allergies || [],
                notes: notesText,
                clinicId: clinicId,
            },
        })

        // We don't return the full patient object for security since this is public
        // We just return success status
        return { success: true, id: patient.id }
    } catch (error: any) {
        console.error("Public Patient Registration Error:", error)
        
        if (error.code === 'P2002') {
            return { error: "A patient with this phone number or email might already exist." }
        }
        
        if (error.name === "ZodError") {
            return { error: error.errors[0].message }
        }
        
        return { error: "An unexpected error occurred. Please try again." }
    }
}
