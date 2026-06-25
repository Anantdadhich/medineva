"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

// Type definition for clinical record form
type ClinicalRecordFormValues = {
    appointmentId: string
    patientId: string
    procedureId: string
    toothNumber?: string
    surface?: string
    diagnosis?: string
    notes?: string
    costOverride?: number
}

export async function getClinicalRecords(patientId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`clinical-records-get-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient || patient.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const records = await prisma.clinicalRecord.findMany({
        where: { patientId },
        include: {
            procedure: true,
            appointment: true,
            createdBy: true,
        },
        orderBy: { createdAt: "desc" },
    })

    return records
}

export async function getClinicalRecordsByAppointment(appointmentId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`clinical-records-appointment-get-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appointment || appointment.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const records = await prisma.clinicalRecord.findMany({
        where: { appointmentId },
        include: {
            procedure: true,
            createdBy: true,
        },
        orderBy: { createdAt: "asc" },
    })

    return records
}

export async function createClinicalRecord(
    userId: string,
    data: ClinicalRecordFormValues
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.id !== userId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`clinical-records-create-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } })
    if (!patient || patient.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }
    const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId }
    })
    if (!appointment || appointment.clinicId !== user.clinicId || appointment.patientId !== data.patientId) {
        throw new Error("Unauthorized: Appointment not found in this clinic")
    }

    // Get the procedure to get the standard cost
    const procedure = await prisma.treatmentCatalog.findUnique({
        where: { id: data.procedureId },
    })

    if (!procedure || procedure.clinicId !== user.clinicId) {
        throw new Error("Treatment not found")
    }

    const record = await prisma.clinicalRecord.create({
        data: {
            appointmentId: data.appointmentId,
            patientId: data.patientId,
            procedureId: data.procedureId,
            toothNumber: data.toothNumber,
            surface: data.surface,
            diagnosis: data.diagnosis,
            notes: data.notes,
            costOverride: data.costOverride,
            createdById: userId,
        },
        include: {
            procedure: true,
        },
    })

    // Create audit log if cost was overridden
    if (data.costOverride && data.costOverride !== Number(procedure.standardCost)) {
        await prisma.auditLog.create({
            data: {
                action: "UPDATE",
                entityType: "ClinicalRecord",
                entityId: record.id,
                oldValue: { cost: Number(procedure.standardCost) },
                newValue: { cost: data.costOverride },
                reason: "Manual price override",
                userId,
            },
        })
    }

    revalidatePath(`/patients/${data.patientId}`)
    return record
}

export async function updateClinicalRecord(
    id: string,
    userId: string,
    data: Partial<ClinicalRecordFormValues>
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.id !== userId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`clinical-records-update-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existingRecord = await prisma.clinicalRecord.findUnique({
        where: { id },
        include: { procedure: true, patient: true },
    })

    if (!existingRecord || existingRecord.patient.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const record = await prisma.clinicalRecord.update({
        where: { id },
        data: {
            toothNumber: data.toothNumber,
            surface: data.surface,
            diagnosis: data.diagnosis,
            notes: data.notes,
            costOverride: data.costOverride,
        },
    })

    // Log cost override changes
    if (
        data.costOverride !== undefined &&
        data.costOverride !== Number(existingRecord.costOverride)
    ) {
        await prisma.auditLog.create({
            data: {
                action: "UPDATE",
                entityType: "ClinicalRecord",
                entityId: record.id,
                oldValue: { cost: Number(existingRecord.costOverride || existingRecord.procedure.standardCost) },
                newValue: { cost: data.costOverride },
                reason: "Price override updated",
                userId,
            },
        })
    }

    revalidatePath(`/patients/${record.patientId}`)
    return record
}

export async function deleteClinicalRecord(id: string, userId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.id !== userId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`clinical-records-delete-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const record = await prisma.clinicalRecord.findUnique({
        where: { id },
        include: { patient: true },
    })

    if (!record || record.patient.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    await prisma.auditLog.create({
        data: {
            action: "DELETE",
            entityType: "ClinicalRecord",
            entityId: id,
            oldValue: record as object,
            userId,
        },
    })

    await prisma.clinicalRecord.delete({
        where: { id },
    })

    revalidatePath(`/patients/${record.patientId}`)
}

export async function getToothHistory(patientId: string, toothNumber: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`clinical-records-tooth-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient || patient.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const records = await prisma.clinicalRecord.findMany({
        where: {
            patientId,
            toothNumber,
        },
        include: {
            procedure: true,
            appointment: true,
        },
        orderBy: { createdAt: "desc" },
    })

    return records
}
