"use server"

import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export interface ReportExtractionPayload {
    clinicId: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
}

export async function generateExecutiveReportPayload(input: ReportExtractionPayload) {
    // 1. Enforce Multi-Tenant Isolation Protection
    const user = await getCurrentUser()
    if (!user || user.clinicId !== input.clinicId) {
        throw new Error("Access Denied: Resource isolated to tenant scope.")
    }

    const { clinicId, startDate, endDate } = input

    // Calculate boundary timestamps
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    // 2. Fetch Invoice aggregates: total billing, amount paid, discount sum, and count
    const billingSummary = await prisma.invoice.aggregate({
        where: {
            clinicId,
            createdAt: { gte: start, lte: end }
        },
        _sum: {
            total: true,
            amountPaid: true,
            discount: true
        },
        _count: {
            id: true
        }
    })

    const totalBilled = billingSummary._sum.total ? Number(billingSummary._sum.total) : 0
    const totalCollected = billingSummary._sum.amountPaid ? Number(billingSummary._sum.amountPaid) : 0
    const totalDiscounts = billingSummary._sum.discount ? Number(billingSummary._sum.discount) : 0
    const invoicesCount = billingSummary._count.id || 0
    const averageInvoiceValue = invoicesCount > 0 ? (totalBilled / invoicesCount) : 0
    const outstandingDues = totalBilled - totalCollected

    // 3. Fetch Payments in this date range to group by payment method in memory
    const payments = await prisma.payment.findMany({
        where: {
            invoice: { clinicId },
            paidAt: { gte: start, lte: end }
        },
        select: {
            amount: true,
            method: true
        }
    })

    // Group payments in memory
    let upiCollected = 0
    let cashCollected = 0
    let cardCollected = 0
    let bankTransferCollected = 0
    let insuranceCollected = 0
    let otherCollected = 0

    payments.forEach(p => {
        const amt = Number(p.amount || 0)
        if (p.method === 'UPI') upiCollected += amt
        else if (p.method === 'CASH') cashCollected += amt
        else if (p.method === 'CARD') cardCollected += amt
        else if (p.method === 'BANK_TRANSFER') bankTransferCollected += amt
        else if (p.method === 'INSURANCE') insuranceCollected += amt
        else otherCollected += amt
    })

    // 4. Fetch Appointments in this date range to count status distribution in memory
    const appointments = await prisma.appointment.findMany({
        where: {
            clinicId,
            scheduledAt: { gte: start, lte: end }
        },
        select: {
            status: true
        }
    })

    let completedSlots = 0
    let cancelledSlots = 0
    let missedSlots = 0 // NO_SHOW in schema
    let scheduledSlots = 0
    let otherSlots = 0

    appointments.forEach(apt => {
        if (apt.status === 'COMPLETED') completedSlots++
        else if (apt.status === 'CANCELLED') cancelledSlots++
        else if (apt.status === 'NO_SHOW') missedSlots++
        else if (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED' || apt.status === 'SEATED' || apt.status === 'IN_PROGRESS') {
            scheduledSlots++
        } else {
            otherSlots++
        }
    })

    // Standard consult leakage cost of ₹500 per lost opportunity slot
    const structuralOpportunityLeakage = (cancelledSlots + missedSlots) * 500

    // 5. Count New Patient Registrations in the range
    const newPatientsCount = await prisma.patient.count({
        where: {
            clinicId,
            createdAt: { gte: start, lte: end }
        }
    })

    // 6. Fetch Invoice items for procedure popularity
    const invoiceItems = await prisma.invoiceItem.findMany({
        where: {
            invoice: {
                clinicId,
                createdAt: { gte: start, lte: end }
            }
        },
        select: {
            description: true,
            total: true
        }
    })

    // Aggregate top treatments in memory
    const treatmentMap: Record<string, number> = {}
    invoiceItems.forEach(item => {
        const desc = item.description || "General Consult"
        const amt = Number(item.total || 0)
        treatmentMap[desc] = (treatmentMap[desc] || 0) + amt
    })

    const topTreatments = Object.entries(treatmentMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)

    // 7. Fetch Invoices with doctor information for payroll/contributions splits
    const invoicesWithDoctors = await prisma.invoice.findMany({
        where: {
            clinicId,
            createdAt: { gte: start, lte: end }
        },
        select: {
            total: true,
            appointment: {
                select: {
                    doctor: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        }
    })

    // Aggregate doctor contributions in memory
    const doctorMap: Record<string, number> = {}
    invoicesWithDoctors.forEach(inv => {
        const docName = inv.appointment?.doctor 
            ? `Dr. ${inv.appointment.doctor.firstName} ${inv.appointment.doctor.lastName}`
            : "Direct / Clinic billing"
        const amt = Number(inv.total || 0)
        doctorMap[docName] = (doctorMap[docName] || 0) + amt
    })

    const doctorSplits = Object.entries(doctorMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)

    return {
        meta: {
            extractedForPeriod: `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} to ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
            timestamp: new Date().toISOString()
        },
        financials: {
            totalBilled,
            totalCollected,
            outstandingDues,
            totalDiscounts,
            averageInvoiceValue,
            invoicesCount,
            upiCollected,
            cashCollected,
            cardCollected,
            bankTransferCollected,
            insuranceCollected,
            otherCollected
        },
        operations: {
            completedSlots,
            cancelledSlots,
            missedSlots,
            scheduledSlots,
            structuralOpportunityLeakage,
            newPatientsCount
        },
        analytics: {
            topTreatments,
            doctorSplits
        }
    }
}
