import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export function isAdmin(email: string | undefined, role?: string): boolean {
    if (role === 'SUPERADMIN' || role === 'ADMIN') return true
    if (!email) return false
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
    return adminEmails.includes(email.toLowerCase())
}

export async function getCurrentUser() {
    const { userId } = await auth()

    if (!userId) {
        return null
    }


    let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { clinic: true },
    })


    if (!user) {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return null
        }

        try {

            user = await prisma.$transaction(async (tx) => {
                const clinic = await tx.clinic.create({
                    data: {
                        name: `${clerkUser.firstName || 'My'}'s Clinic`,
                        email: clerkUser.emailAddresses[0]?.emailAddress || '',
                    },
                })

                const emailAddress = clerkUser.emailAddresses[0]?.emailAddress || ''
                return await tx.user.create({
                    data: {
                        clerkId: userId,
                        email: emailAddress,
                        firstName: clerkUser.firstName || 'User',
                        lastName: clerkUser.lastName || '',
                        avatarUrl: clerkUser.imageUrl,
                        clinicId: clinic.id,
                        hasAccess: isAdmin(emailAddress),
                    },
                    include: { clinic: true },
                })
            })
        } catch (error: any) {

            if (error?.code === 'P2002') {

                user = await prisma.user.findUnique({
                    where: { clerkId: userId },
                    include: { clinic: true },
                })
            } else {
                throw error
            }
        }
    }

    if (user && isAdmin(user.email, user.role) && !user.hasAccess) {
        try {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { hasAccess: true },
                include: { clinic: true },
            })
        } catch (e) {
            user.hasAccess = true
        }
    }

    return user
}

export async function requireAuth() {
    const user = await getCurrentUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    return user
}

export async function requireClinic() {
    const user = await requireAuth()

    if (!user.clinicId) {
        throw new Error('No clinic associated with user')
    }

    return { user, clinicId: user.clinicId }
}
