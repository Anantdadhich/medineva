import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendSMS } from "@/lib/notifications"

export async function GET(req: Request) {

    const authHeader = req.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const tomorrowStart = new Date()
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)
    tomorrowStart.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrowStart)
    tomorrowEnd.setHours(23, 59, 59, 999)


    const appointments = await prisma.appointment.findMany({
        where: {
            scheduledAt: {
                gte: tomorrowStart,
                lte: tomorrowEnd,
            },
            status: { notIn: ["CANCELLED", "NO_SHOW", "COMPLETED"] },
        },
        include: {
            patient: true,
            doctor: true,
            clinic: true,
        },
    })

    const results = []

    for (const appt of appointments) {
        if (!appt.patient.phone) continue

        const prettyTime = appt.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const message = `Hi ${appt.patient.firstName}, this is a reminder for your ${appt.type || "consultation"} appointment at ${appt.clinic.name || "our clinic"} tomorrow at ${prettyTime}.\nFrom Medineva`


        const notification = await prisma.notification.create({
            data: {
                type: "SMS",
                status: "PENDING",
                recipient: appt.patient.phone,
                message,
                clinicId: appt.clinicId,
                patientId: appt.patientId,
                appointmentId: appt.id,
            }
        })


        const res = await sendSMS({
            to: appt.patient.phone,
            body: message,
            templateId: process.env.MSG91_REMINDER_TEMPLATE_ID,
            variables: {
                VAR1: appt.patient.firstName,
                VAR2: appt.type || "consultation",
                VAR3: appt.clinic.name || "our clinic",
                VAR4: "tomorrow at " + prettyTime
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

        results.push({
            patient: appt.patient.firstName,
            status: res.success ? "SENT" : "FAILED"
        })
    }

    return NextResponse.json({
        success: true,
        processed: results.length,
        results
    })
}
