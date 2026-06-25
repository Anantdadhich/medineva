"use server"

import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'DOCTOR' | 'STAFF'

export async function getDoctors(clinicId: string) {
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.hasAccess || currentUser.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`users-get-doctors-${currentUser.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const doctors = await prisma.user.findMany({
        where: {
            clinicId,
            role: 'DOCTOR',
            isActive: true,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
        orderBy: { firstName: 'asc' },
    })

    return doctors
}

export async function getUsers(clinicId: string, role?: UserRole) {
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.hasAccess || currentUser.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`users-get-${currentUser.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const users = await prisma.user.findMany({
        where: {
            clinicId,
            ...(role && { role }),
            isActive: true,
        },
        orderBy: { firstName: 'asc' },
    })

    return users
}
