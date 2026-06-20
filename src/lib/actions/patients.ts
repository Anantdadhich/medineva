"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient"
import { checkRateLimit } from "@/lib/rate-limit"

// Serialization Helpers
const serializeDecimal = (val: any) => (val !== null && val !== undefined ? Number(val) : null)

const serializeInvoice = (invoice: any) => ({
    ...invoice,
    subtotal: serializeDecimal(invoice.subtotal) || 0,
    discount: serializeDecimal(invoice.discount) || 0,
    tax: serializeDecimal(invoice.tax) || 0,
    total: serializeDecimal(invoice.total) || 0,
    amountPaid: serializeDecimal(invoice.amountPaid) || 0,
})

const serializeProcedure = (proc: any) => ({
    ...proc,
    standardCost: serializeDecimal(proc.standardCost) || 0,
})

const serializeClinicalRecord = (rec: any) => ({
    ...rec,
    costOverride: serializeDecimal(rec.costOverride),
    procedure: rec.procedure ? serializeProcedure(rec.procedure) : undefined,
})

const serializeAppointment = (apt: any) => ({
    ...apt,
    clinicalRecords: apt.clinicalRecords?.map(serializeClinicalRecord),
    notifications: apt.notifications,
})

const serializePatient = (patient: any) => {
    if (!patient) return null
    return {
        ...patient,
        appointments: patient.appointments?.map(serializeAppointment),
        invoices: patient.invoices?.map(serializeInvoice),
    }
}

export async function getPatients(clinicId: string, query?: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`patients-get-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    // Build search conditions
    const whereConditions: any = { clinicId }

    if (query) {
        // Split query into words for better name matching
        const queryWords = query.trim().split(/\s+/)

        if (queryWords.length === 1) {
            // Single word: search firstName, lastName, or phone
            whereConditions.OR = [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
            ]
        } else if (queryWords.length === 2) {
            // Two words: likely "FirstName LastName"
            whereConditions.OR = [
                // Match "First Last"
                {
                    AND: [
                        { firstName: { contains: queryWords[0], mode: "insensitive" } },
                        { lastName: { contains: queryWords[1], mode: "insensitive" } },
                    ]
                },
                // Match "Last First" (reversed)
                {
                    AND: [
                        { firstName: { contains: queryWords[1], mode: "insensitive" } },
                        { lastName: { contains: queryWords[0], mode: "insensitive" } },
                    ]
                },
                // Also search each word individually
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
            ]
        } else {
            // More than 2 words: search the full query in each field
            whereConditions.OR = [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
            ]
        }
    }

    const patients = await prisma.patient.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
        take: 50,
    })
    return patients
}

export async function getPatientById(id: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`patients-get-by-id-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            appointments: {
                orderBy: { scheduledAt: "desc" },
                take: 10,
                include: {
                    doctor: true,
                    notifications: {
                        orderBy: { createdAt: "desc" },
                    },
                    clinicalRecords: {
                        include: {
                            procedure: true,
                        },
                    },
                },
            },
            invoices: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    })

    if (patient && patient.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    return serializePatient(patient)
}

export async function createPatient(clinicId: string, data: PatientFormValues) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`patients-create-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    // Server-side validation — prevents bypassing frontend checks
    const validated = patientFormSchema.parse(data)

    const patient = await prisma.patient.create({
        data: {
            ...validated,
            dateOfBirth: new Date(validated.dateOfBirth),
            clinicId,
            email: validated.email || null,
        },
    })

    revalidatePath("/patients")
    revalidatePath("/dashboard") // Dashboard
    return patient
}

export async function updatePatient(id: string, data: Partial<PatientFormValues>) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`patients-update-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.patient.findUnique({ where: { id } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    // Partial validation — only validate provided fields
    const validated = patientFormSchema.partial().parse(data)

    const patient = await prisma.patient.update({
        where: { id },
        data: {
            ...validated,
            dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : undefined,
            email: validated.email || null,
        },
    })

    revalidatePath("/patients")
    revalidatePath(`/patients/${id}`)
    revalidatePath("/dashboard") // Dashboard
    return patient
}

export async function deletePatient(id: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`patients-delete-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.patient.findUnique({ where: { id } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    await prisma.patient.delete({
        where: { id },
    })

    revalidatePath("/patients")
    revalidatePath("/dashboard") // Dashboard
}

export async function updateLastVisitDate(patientId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }

    const existing = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    await prisma.patient.update({
        where: { id: patientId },
        data: { lastVisitDate: new Date() },
    })
}

/**
 * Import patients from CSV data
 * Handles bulk creation with duplicate detection based on phone number
 */
export async function importPatients(clinicId: string, patients: any[]) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`patients-import-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    try {
        // 1. Determine default Doctor ID
        let defaultDoctorId = user.id
        // If current user is not a doctor, find one
        // (For simplicity, we assume user is a doctor or we pick the first doctor)
        if (user.role !== "DOCTOR" && user.role !== "SUPERADMIN" && user.role !== "ADMIN") {
            const firstDoctor = await prisma.user.findFirst({
                where: { clinicId, role: "DOCTOR" }
            })
            if (firstDoctor) defaultDoctorId = firstDoctor.id
        }

        // Validate and map data
        const validPatients = patients.map(p => {
            if (!p.firstName || !p.lastName || !p.phone) {
                return null
            }

            let dob = new Date()
            if (p.dateOfBirth) {
                dob = new Date(p.dateOfBirth)
                if (isNaN(dob.getTime())) dob = new Date()
            }

            // Parse Next Appointment
            let nextAppointmentDate: Date | null = null
            if (p.nextAppointment || p.appointmentDate || p.scheduledAt) {
                const dateStr = p.nextAppointment || p.appointmentDate || p.scheduledAt
                const parsedDate = new Date(dateStr)
                if (!isNaN(parsedDate.getTime())) {
                    // If date is valid, check if it's in the future (optional, but good practice)
                    nextAppointmentDate = parsedDate
                }
            }

            // Normalize phone number
            const normalizedPhone = String(p.phone).replace(/[\s\-\(\)]/g, '')

            return {
                firstName: String(p.firstName).trim(),
                lastName: String(p.lastName).trim(),
                phone: normalizedPhone,
                email: p.email ? String(p.email).trim() : null,
                dateOfBirth: dob,
                gender: p.gender ? String(p.gender) : null,
                address: p.address ? String(p.address) : null,
                clinicId: clinicId,
                nextAppointmentDate // Temporary field
            }
        }).filter(Boolean) as any[]

        if (validPatients.length === 0) {
            return { success: false, count: 0, skipped: 0, error: "No valid records found" }
        }

        // Get all phone numbers from the import
        const importPhones = validPatients.map(p => p.phone)

        // Check for existing patients
        const existingPatients = await prisma.patient.findMany({
            where: {
                clinicId,
                phone: { in: importPhones }
            },
            select: { phone: true }
        })

        const existingPhones = new Set(existingPatients.map(p => p.phone))

        // Filter out duplicates
        const newPatientsToCreate = validPatients.filter(p => !existingPhones.has(p.phone))
        const skippedCount = validPatients.length - newPatientsToCreate.length

        if (newPatientsToCreate.length === 0) {
            return {
                success: true,
                count: 0,
                skipped: skippedCount,
                error: `All ${skippedCount} patients already exist in the system.`
            }
        }

        // Detailed Transaction execution
        let createdCount = 0
        let appointmentCount = 0

        await prisma.$transaction(async (tx) => {
            for (const p of newPatientsToCreate) {
                // Create Patient
                const { nextAppointmentDate, ...patientData } = p

                const createdPatient = await tx.patient.create({
                    data: patientData
                })
                createdCount++

                // Create Appointment if date exists
                if (nextAppointmentDate) {
                    await tx.appointment.create({
                        data: {
                            scheduledAt: nextAppointmentDate,
                            patientId: createdPatient.id,
                            clinicId: clinicId,
                            doctorId: defaultDoctorId,
                            status: "SCHEDULED",
                            type: "General Consultation",
                            notes: "Auto-created from patient import"
                        }
                    })
                    appointmentCount++
                }
            }
        })

        revalidatePath("/patients")
        revalidatePath("/dashboard")
        revalidatePath("/schedule")

        return {
            success: true,
            count: createdCount,
            skipped: skippedCount,
            appointmentCount
        }
    } catch (error) {
        console.error("Import failed:", error)
        return { success: false, count: 0, skipped: 0, error: "Database error during import" }
    }
}

export async function exportPatients(clinicId: string, startDate?: Date, endDate?: Date) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`patients-export-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const where: any = { clinicId }

    if (startDate && endDate) {
        // Adjust endDate to end of day
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        where.createdAt = {
            gte: startDate,
            lte: end
        }
    }

    const patients = await prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            dateOfBirth: true,
            gender: true,
            lastVisitDate: true,
            createdAt: true
        }
    })

    return patients
}
