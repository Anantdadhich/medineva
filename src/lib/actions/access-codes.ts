"use server"

import prisma from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/rate-limit"

function generateRandomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    return `CARE-${part1}-${part2}`
}

export async function verifyAccessCodeAction(code: string) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: "You must be logged in to verify an access code." }
        }

        if (!checkRateLimit(`access-codes-verify-${user.id}`)) {
            return { success: false, error: "Too many verification attempts. Please try again later." }
        }

        const trimmedCode = code.trim().toUpperCase()

        // Find the code
        const accessCode = await prisma.accessCode.findUnique({
            where: { code: trimmedCode },
        })

        if (!accessCode) {
            return { success: false, error: "Invalid access code. Please check and try again." }
        }

        if (accessCode.isUsed) {
            return { success: false, error: "This access code has already been used." }
        }

        // Atomically update user access status and claim the access code
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { hasAccess: true },
            }),
            prisma.accessCode.update({
                where: { id: accessCode.id },
                data: {
                    isUsed: true,
                    usedById: user.id,
                },
            }),
        ])

        revalidatePath("/")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: any) {
        console.error("Error verifying access code:", error)
        return { success: false, error: "An unexpected error occurred. Please try again later." }
    }
}

export async function generateAccessCodesAction(count: number) {
    try {
        const user = await getCurrentUser()
        if (!user || !isAdmin(user.email)) {
            throw new Error("Unauthorized: Only admins can generate access codes.")
        }

        if (!checkRateLimit(`access-codes-generate-${user.id}`)) {
            throw new Error("Rate limit exceeded")
        }

        const codesToCreate = []
        for (let i = 0; i < count; i++) {
            let uniqueCode = ""
            let attempts = 0
            // Ensure uniqueness
            while (attempts < 5) {
                const candidate = generateRandomCode()
                const existing = await prisma.accessCode.findUnique({
                    where: { code: candidate },
                })
                if (!existing) {
                    uniqueCode = candidate
                    break
                }
                attempts++
            }

            if (uniqueCode) {
                codesToCreate.push(uniqueCode)
            }
        }

        if (codesToCreate.length === 0) {
            return { success: false, error: "Failed to generate unique codes." }
        }

        await prisma.accessCode.createMany({
            data: codesToCreate.map((code) => ({
                code,
                isUsed: false,
            })),
        })

        revalidatePath("/admin/codes")
        return { success: true }
    } catch (error: any) {
        console.error("Error generating access codes:", error)
        return { success: false, error: error.message || "Failed to generate codes." }
    }
}

export async function getAccessCodesAction() {
    try {
        const user = await getCurrentUser()
        if (!user || !isAdmin(user.email)) {
            throw new Error("Unauthorized: Only admins can view access codes.")
        }

        if (!checkRateLimit(`access-codes-get-${user.id}`)) {
            throw new Error("Rate limit exceeded")
        }

        const codes = await prisma.accessCode.findMany({
            include: {
                usedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return { success: true, codes }
    } catch (error: any) {
        console.error("Error fetching access codes:", error)
        return { success: false, error: error.message || "Failed to fetch access codes." }
    }
}
