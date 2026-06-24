"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { appointmentFormSchema, type AppointmentFormValues } from "@/lib/validations/appointment"
import { sendSMS } from "@/lib/notifications"
import { Client } from "@upstash/qstash"
import { checkRateLimit } from "@/lib/rate-limit"

export async function getAppointments(
    clinicId: string,
    options?: {
        date?: Date
        startDate?: Date
        endDate?: Date
        doctorId?: string
        status?: string
        query?: string
    }
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-get-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const { doctorId, status, startDate, endDate, query } = options || {}



    let dateFilter: any = {}

    if (startDate || endDate) {
        dateFilter = {
            gte: startDate,
            lte: endDate
        }
    } else if (!query) {

        const defaultStart = new Date(new Date().setDate(new Date().getDate() - 30))
        const defaultEnd = new Date(new Date().setDate(new Date().getDate() + 30))
        dateFilter = {
            gte: defaultStart,
            lte: defaultEnd
        }
    }

    const where: any = {
        clinicId,
        ...(Object.keys(dateFilter).length > 0 && { scheduledAt: dateFilter }),
        ...(doctorId && { doctorId }),
        ...(status && { status: status as "SCHEDULED" | "CONFIRMED" | "SEATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW" }),
    }

    if (query) {
        where.OR = [
            {
                patient: {
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } },
                        { phone: { contains: query } }
                    ]
                }
            },
            {
                doctor: {
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } }
                    ]
                }
            },
            { type: { contains: query, mode: "insensitive" } }
        ]
    }

    const appointments = await prisma.appointment.findMany({
        where,
        include: {
            patient: true,
            doctor: true,
        },
        orderBy: { scheduledAt: "desc" },
    })

    return appointments
}

export async function createAppointment(
    clinicId: string,
    data: AppointmentFormValues
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-create-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }


    const validated = appointmentFormSchema.parse(data)

    const appointment = await prisma.appointment.create({
        data: {
            ...validated,
            clinicId,
            doctorId: user.id,
            status: "SCHEDULED",
        },
        include: {
            patient: true,
            doctor: true,
            clinic: true,
        },
    })


    const patientPhone = validated.patientId ? (await prisma.patient.findUnique({ where: { id: validated.patientId } }))?.phone : null;

    if (patientPhone) {
        const clinicName = appointment.clinic?.name || "our clinic";
        const serviceName = validated.type || "consultation";
        const prettyDateTime = validated.scheduledAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

        const message = `Hi ${appointment.patient.firstName}, your ${serviceName} appointment at ${clinicName} is confirmed for ${prettyDateTime}.\nFrom Medineva.`;


        const notification = await prisma.notification.create({
            data: {
                type: "SMS",
                status: "PENDING",
                recipient: patientPhone,
                message,
                clinicId,
                patientId: validated.patientId,
                appointmentId: appointment.id,
            }
        })


        sendSMS({
            to: patientPhone,
            body: message,
            templateId: process.env.MSG91_CONFIRMATION_TEMPLATE_ID,
            variables: {
                VAR1: appointment.patient.firstName,
                VAR2: serviceName,
                VAR3: clinicName,
                VAR4: prettyDateTime
            }
        }).then(async (res) => {
            await prisma.notification.update({
                where: { id: notification.id },
                data: {
                    status: res.success ? "SENT" : "FAILED",
                    providerId: res.messageId,
                    error: res.error ? JSON.stringify(res.error) : null,
                }
            })
        })
    }


    if (patientPhone && process.env.QSTASH_TOKEN) {
        try {
            const qstashClient = new Client({ token: process.env.QSTASH_TOKEN })

            const appointmentDate = new Date(validated.scheduledAt)
            const reminderTime = new Date(appointmentDate)
            reminderTime.setHours(reminderTime.getHours() - 24)


            if (reminderTime > new Date()) {
                const prettyTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const clinicName = appointment.clinic?.name || "our clinic";
                const serviceName = validated.type || "consultation";

                const reminderMessage = `Hi ${appointment.patient.firstName}, this is a reminder for your ${serviceName} appointment at ${clinicName} tomorrow at ${prettyTime}.\nFrom Medineva`;

                const job = await prisma.smsJob.create({
                    data: {
                        type: "REMINDER",
                        status: "SCHEDULED",
                        scheduledFor: reminderTime,
                        patientId: validated.patientId,
                        appointmentId: appointment.id,
                        qstashId: `pending_${Date.now()}`
                    }
                })


                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

                const res = await qstashClient.publishJSON({
                    url: `${baseUrl}/api/webhooks/send-sms`,
                    body: {
                        jobId: job.id,
                        phone: patientPhone,
                        message: reminderMessage,
                        templateId: process.env.MSG91_REMINDER_TEMPLATE_ID,
                        variables: {
                            VAR1: appointment.patient.firstName,
                            VAR2: serviceName,
                            VAR3: clinicName,
                            VAR4: "tomorrow at " + prettyTime
                        },
                        clinicId,
                        patientId: validated.patientId,
                        appointmentId: appointment.id
                    },
                    notBefore: Math.floor(reminderTime.getTime() / 1000)
                })

                if (res && res.messageId) {
                    await prisma.smsJob.update({
                        where: { id: job.id },
                        data: { qstashId: res.messageId }
                    })
                }
            }
        } catch (error) {
            console.error(" Failed to schedule QStash reminder:", error)
        }
    }

    revalidatePath("/schedule")
    revalidatePath("/dashboard")
    return appointment
}

export async function updateAppointmentStatus(
    id: string,
    status: "SCHEDULED" | "CONFIRMED" | "SEATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-status-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const appointment = await prisma.appointment.update({
        where: { id },
        data: { status },
    })


    if (status === "COMPLETED") {
        await prisma.patient.update({
            where: { id: appointment.patientId },
            data: { lastVisitDate: new Date() },
        })
    }
    revalidatePath("/schedule")
    revalidatePath("/dashboard")
    return appointment
}

export async function getUpcomingAppointments(clinicId: string, limit = 5) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-upcoming-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const now = new Date()

    const appointments = await prisma.appointment.findMany({
        where: {
            clinicId,
            scheduledAt: { gte: now },
            status: { in: ["SCHEDULED", "CONFIRMED", "SEATED"] },
        },
        include: {
            patient: true,
            doctor: true,
        },
        orderBy: { scheduledAt: "asc" },
        take: limit,
    })

    return appointments
}

export async function getTodayAppointments(clinicId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-today-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
        where: {
            clinicId,
            scheduledAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            patient: true,
            doctor: true,
        },
        orderBy: { scheduledAt: "asc" },
    })

    return appointments
}

export async function updateAppointment(
    id: string,
    data: {
        scheduledAt?: Date
        type?: string
        notes?: string
        duration?: number
        doctorId?: string
    }
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-update-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const updateData: any = {}
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt
    if (data.type !== undefined) updateData.type = data.type
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.doctorId !== undefined) {
        updateData.doctor = { connect: { id: data.doctorId } }
    }

    const appointment = await prisma.appointment.update({
        where: { id },
        data: updateData,
        include: {
            patient: true,
            doctor: true,
        },
    })

    revalidatePath("/schedule")
    revalidatePath(`/patients/${appointment.patientId}`)
    revalidatePath("/dashboard") // Dashboard
    return appointment
}


export async function getPatientAppointments(patientId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-patient-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient || patient.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
            doctor: true,
        },
        orderBy: { scheduledAt: "desc" },
    })

    return appointments
}

export async function deleteAppointment(id: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-delete-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    const appointment = await prisma.appointment.delete({
        where: { id },
    })

    revalidatePath("/schedule")
    revalidatePath(`/patients/${appointment.patientId}`)
    revalidatePath("/dashboard")
    return appointment
}


export async function sendManualReminder(appointmentId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!checkRateLimit(`appointments-reminder-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true, clinic: true }
    })
    
    if (appointment && appointment.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    if (!appointment || !appointment.patient.phone) {
        throw new Error("Patient phone number missing")
    }

    const clinicName = appointment.clinic?.name || "our clinic";
    const prettyDateTime = appointment.scheduledAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const message = `Hi ${appointment.patient.firstName}, this is a reminder for your ${appointment.type || "consultation"} appointment at ${clinicName} ${prettyDateTime}.\nFrom Medineva`;

    const notification = await prisma.notification.create({
        data: {
            type: "SMS",
            status: "PENDING",
            recipient: appointment.patient.phone,
            message,
            clinicId: appointment.clinicId,
            patientId: appointment.patientId,
            appointmentId: appointment.id,
        }
    })


    const res = await sendSMS({
        to: appointment.patient.phone,
        body: message,
        templateId: process.env.MSG91_REMINDER_TEMPLATE_ID,
        variables: {
            VAR1: appointment.patient.firstName,
            VAR2: appointment.type || "consultation",
            VAR3: clinicName,
            VAR4: prettyDateTime
        }
    })


    await prisma.notification.update({
        where: { id: notification.id },
        data: {
            status: res.success ? "SENT" : "FAILED",
            providerId: res.messageId,
            error: res.error ? JSON.stringify(res.error) : null,
        }
    })

    return { success: res.success }
}
