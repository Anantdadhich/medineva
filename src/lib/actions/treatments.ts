"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { TreatmentFormValues } from "@/lib/validations/treatment"
import { getCurrentUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

// Serialization Helper
const serializeDecimal = (val: any) => (val !== null && val !== undefined ? Number(val) : 0)

const serializeTreatment = (treatment: any) => ({
    ...treatment,
    standardCost: serializeDecimal(treatment.standardCost),
})

export async function getTreatments(clinicId: string, category?: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`treatments-get-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const treatments = await prisma.treatmentCatalog.findMany({
        where: {
            clinicId,
            ...(category && { category }),
            isActive: true,
        },
        orderBy: { category: "asc" },
    })
    return treatments.map(serializeTreatment)
}

export async function getAllTreatments(clinicId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`treatments-get-all-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const treatments = await prisma.treatmentCatalog.findMany({
        where: { clinicId },
        orderBy: [{ category: "asc" }, { name: "asc" }],
    })
    return treatments.map(serializeTreatment)
}

export async function createTreatment(clinicId: string, data: TreatmentFormValues) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`treatments-create-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const treatment = await prisma.treatmentCatalog.create({
        data: {
            ...data,
            clinicId,
            standardCost: data.standardCost,
        },
    })

    revalidatePath("/settings/treatments")
    return serializeTreatment(treatment)
}

export async function updateTreatment(id: string, data: Partial<TreatmentFormValues>) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`treatments-update-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.treatmentCatalog.findUnique({ where: { id } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const treatment = await prisma.treatmentCatalog.update({
        where: { id },
        data: {
            ...data,
            ...(data.standardCost !== undefined && { standardCost: data.standardCost }),
        },
    })

    revalidatePath("/settings/treatments")
    return serializeTreatment(treatment)
}

export async function deleteTreatment(id: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`treatments-delete-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.treatmentCatalog.findUnique({ where: { id } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    // Soft delete by setting isActive to false
    await prisma.treatmentCatalog.update({
        where: { id },
        data: { isActive: false },
    })

    revalidatePath("/settings/treatments")
}

export async function getTreatmentCategories(clinicId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`treatments-categories-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const treatments = await prisma.treatmentCatalog.findMany({
        where: { clinicId, isActive: true },
        select: { category: true },
        distinct: ["category"],
    })
    return treatments.map((t: { category: string }) => t.category)
}
