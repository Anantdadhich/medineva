"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient"
import { checkRateLimit } from "@/lib/rate-limit"
import { randomUUID } from "crypto"


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
    if (!await checkRateLimit(`patients-get-${user.id}`)) {
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
    if (!await checkRateLimit(`patients-get-by-id-${user.id}`)) {
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
    if (!await checkRateLimit(`patients-create-${user.id}`)) {
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
    if (!await checkRateLimit(`patients-update-${user.id}`)) {
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
    if (!await checkRateLimit(`patients-delete-${user.id}`)) {
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
    if (!await checkRateLimit(`patients-import-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    try {

        let defaultDoctorId = user.id


        if (user.role !== "DOCTOR" && user.role !== "SUPERADMIN" && user.role !== "ADMIN") {
            const firstDoctor = await prisma.user.findFirst({
                where: { clinicId, role: "DOCTOR" }
            })
            if (firstDoctor) defaultDoctorId = firstDoctor.id
        }

        const validPatients = patients.map(p => {
            if (!p.firstName || !p.lastName || !p.phone) {
                return null
            }

            let dob = new Date()
            if (p.dateOfBirth) {
                dob = new Date(p.dateOfBirth)
                if (isNaN(dob.getTime())) dob = new Date()
            }


            let nextAppointmentDate: Date | null = null
            if (p.nextAppointment || p.appointmentDate || p.scheduledAt) {
                const dateStr = p.nextAppointment || p.appointmentDate || p.scheduledAt
                const parsedDate = new Date(dateStr)
                if (!isNaN(parsedDate.getTime())) {

                    nextAppointmentDate = parsedDate
                }
            }


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


        const uniqueImportPatients: any[] = []
        const seenImportKeys = new Set<string>()
        let internalDuplicatesCount = 0

        for (const p of validPatients) {
            const key = `${p.firstName.toLowerCase()}|${p.lastName.toLowerCase()}|${p.phone}`
            if (!seenImportKeys.has(key)) {
                seenImportKeys.add(key)
                uniqueImportPatients.push(p)
            } else {
                internalDuplicatesCount++
            }
        }

        if (uniqueImportPatients.length === 0) {
            return { success: false, count: 0, skipped: 0, error: "No valid records found" }
        }


        const importPhones = uniqueImportPatients.map(p => p.phone)


        const existingPatients = await prisma.patient.findMany({
            where: {
                clinicId,
                phone: { in: importPhones }
            },
            select: { phone: true, firstName: true, lastName: true }
        })

        const existingPatientKeys = new Set(
            existingPatients.map(p => `${p.firstName.toLowerCase()}|${p.lastName.toLowerCase()}|${p.phone}`)
        )


        const newPatientsToCreate = uniqueImportPatients.filter(p => {
            const key = `${p.firstName.toLowerCase()}|${p.lastName.toLowerCase()}|${p.phone}`
            return !existingPatientKeys.has(key)
        })

        const skippedCount = validPatients.length - newPatientsToCreate.length

        if (newPatientsToCreate.length === 0) {
            return {
                success: true,
                count: 0,
                skipped: skippedCount,
                error: `All ${skippedCount} patients already exist in the system.`
            }
        }


        const now = new Date()
        const patientsWithIds = newPatientsToCreate.map(p => ({
            id: randomUUID(),
            firstName: p.firstName,
            lastName: p.lastName,
            phone: p.phone,
            email: p.email,
            dateOfBirth: p.dateOfBirth,
            gender: p.gender,
            address: p.address,
            clinicId: p.clinicId,
            nextAppointmentDate: p.nextAppointmentDate
        }))

        const patientsData = patientsWithIds.map(({ nextAppointmentDate, ...patientData }) => ({
            ...patientData,
            createdAt: now,
            updatedAt: now
        }))

        const appointmentsData = patientsWithIds
            .filter(p => p.nextAppointmentDate !== null)
            .map(p => ({
                id: randomUUID(),
                scheduledAt: p.nextAppointmentDate!,
                patientId: p.id,
                clinicId: clinicId,
                doctorId: defaultDoctorId,
                status: "SCHEDULED" as const,
                type: "General Consultation",
                notes: "Auto-created from patient import",
                createdAt: now,
                updatedAt: now
            }))

        await prisma.$transaction(async (tx) => {
            if (patientsData.length > 0) {
                await tx.patient.createMany({
                    data: patientsData
                })
            }
            if (appointmentsData.length > 0) {
                await tx.appointment.createMany({
                    data: appointmentsData
                })
            }
        }, {
            timeout: 30000
        })

        revalidatePath("/patients")
        revalidatePath("/dashboard")
        revalidatePath("/schedule")

        return {
            success: true,
            count: patientsData.length,
            skipped: skippedCount,
            appointmentCount: appointmentsData.length
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
    if (!await checkRateLimit(`patients-export-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const where: any = { clinicId }

    if (startDate && endDate) {

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
