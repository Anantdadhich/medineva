"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function updateClinicSettings(clinicId: string, userId: string, data: {
    name: string
    doctorName?: string
    email?: string
    phone?: string
    address?: string
    timezone: string
    currency: string
    defaultAppointmentDuration: number
    invoicePrefix?: string
}) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId || user.id !== userId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`settings-update-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    // Update clinic basic info
    await prisma.clinic.update({
        where: { id: clinicId },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
        }
    })

    if (data.doctorName) {
        // Assume doctorName format could be "Dr. FirstName LastName"
        // Let's just update both to the same or split it if needed, or update firstName only.
        // Easiest is to set firstName and lastName to empty for simplicity if splitting is hard
        const parts = data.doctorName.trim().split(" ")
        await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: parts[0] || "",
                lastName: parts.slice(1).join(" "),
            }
        })
    }

    // Try to upsert clinic settings, but don't fail if table doesn't exist
    try {
        await prisma.clinicSettings.upsert({
            where: { clinicId },
            create: {
                clinicId,
                timezone: data.timezone,
                currency: data.currency,
                defaultAppointmentDuration: data.defaultAppointmentDuration,
                invoicePrefix: data.invoicePrefix || "INV",
            },
            update: {
                timezone: data.timezone,
                currency: data.currency,
                defaultAppointmentDuration: data.defaultAppointmentDuration,
                invoicePrefix: data.invoicePrefix || "INV",
            }
        })
    } catch (error) {
        console.log("ClinicSettings table not yet created, skipping settings update")
    }

    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return { success: true }
}

export async function getClinicId() {
    const user = await getCurrentUser()
    return user?.clinicId || null
}
