"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createInvoiceSchema, paymentFormSchema, type CreateInvoiceValues, type PaymentFormValues } from "@/lib/validations/invoice"
import { generateInvoiceNumber } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

// Helper to serialize Decimal to number
function serializeInvoice(invoice: any) {
    if (!invoice) return null

    // Helper for creating safe objects
    const safeNumber = (val: any) => (val !== null && val !== undefined ? Number(val) : 0)

    const serialized = {
        ...invoice,
        subtotal: safeNumber(invoice.subtotal),
        discount: safeNumber(invoice.discount),
        tax: safeNumber(invoice.tax),
        total: safeNumber(invoice.total),
        amountPaid: safeNumber(invoice.amountPaid),
    }

    if (invoice.items) {
        serialized.items = invoice.items.map((item: any) => ({
            ...item,
            unitPrice: safeNumber(item.unitPrice),
            total: safeNumber(item.total),
        }))
    }

    if (invoice.payments) {
        serialized.payments = invoice.payments.map((payment: any) => ({
            ...payment,
            amount: safeNumber(payment.amount),
        }))
    }

    if (invoice.clinic && invoice.clinic.clinicSettings) {
        serialized.clinic = {
            ...invoice.clinic,
            clinicSettings: {
                ...invoice.clinic.clinicSettings,
                taxRate: safeNumber(invoice.clinic.clinicSettings.taxRate),
            }
        }
    }

    return serialized
}

export async function getInvoices(
    clinicId: string,
    options?: {
        patientId?: string
        status?: string
        limit?: number
    }
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-get-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const { patientId, status, limit } = options || {}

    const invoices = await prisma.invoice.findMany({
        where: {
            clinicId,
            ...(patientId && { patientId }),
            ...(status && { status: status as "DRAFT" | "PENDING" | "PARTIAL" | "PAID" | "CANCELLED" | "REFUNDED" }),
        },
        include: {
            patient: true,
            clinic: true,
            items: true,
            payments: true,
        },
        orderBy: { createdAt: "desc" },
        ...(limit && { take: limit }),
    })

    return invoices.map(serializeInvoice)
}

export async function getInvoiceById(id: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-get-by-id-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            patient: true,
            appointment: true,
            clinic: {
                include: {
                    clinicSettings: true,
                },
            },
            items: {
                include: {
                    clinicalRecord: {
                        include: {
                            procedure: true,
                        },
                    },
                },
            },
            payments: true,
        },
    })

    if (invoice && invoice.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    return serializeInvoice(invoice)
}

export async function createInvoice(clinicId: string, data: CreateInvoiceValues) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-create-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    // Server-side validation
    const validated = createInvoiceSchema.parse(data)

    // Verify patient belongs to the clinic to prevent IDOR cross-tenant mapping
    const patient = await prisma.patient.findUnique({
        where: { id: validated.patientId }
    })
    if (!patient || patient.clinicId !== clinicId) {
        throw new Error("Unauthorized: Patient does not belong to this clinic")
    }

    // Verify appointment belongs to the clinic and patient if provided
    if (validated.appointmentId) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: validated.appointmentId }
        })
        if (!appointment || appointment.clinicId !== clinicId || appointment.patientId !== validated.patientId) {
            throw new Error("Unauthorized: Appointment not found in this clinic")
        }
    }

    // Verify clinicalRecordIds mapped on line items belong to the same clinic and patient
    for (const item of validated.items) {
        if (item.clinicalRecordId) {
            const clinicalRecord = await prisma.clinicalRecord.findUnique({
                where: { id: item.clinicalRecordId },
                include: { patient: true }
            })
            if (!clinicalRecord || clinicalRecord.patient.clinicId !== clinicId || clinicalRecord.patientId !== validated.patientId) {
                throw new Error("Unauthorized: Invalid clinical record mapping")
            }
        }
    }

    const subtotal = validated.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    )

    let discount = validated.discount || 0
    if (validated.discountType === "percentage") {
        discount = (subtotal * discount) / 100
    }

    const tax = validated.tax || 0
    const total = subtotal - discount + tax

    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber: generateInvoiceNumber(),
            patientId: validated.patientId,
            appointmentId: validated.appointmentId,
            clinicId,
            subtotal,
            discount,
            discountType: validated.discountType,
            tax,
            total,
            status: "PENDING",
            dueDate: validated.dueDate,
            notes: validated.notes,
            items: {
                create: validated.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.unitPrice * item.quantity,
                    clinicalRecordId: item.clinicalRecordId,
                })),
            },
        },
        include: {
            items: true,
            payments: true, // Include payments to match structure even if empty
        },
    })

    revalidatePath("/billing")
    revalidatePath("/dashboard") // Dashboard
    return serializeInvoice(invoice)
}

export async function recordPayment(data: PaymentFormValues) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-record-payment-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    // Fetch invoice to check boundary
    const invoiceExists = await prisma.invoice.findUnique({
        where: { id: data.invoiceId }
    })
    if (!invoiceExists || invoiceExists.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    // Server-side validation
    const validated = paymentFormSchema.parse(data)

    const payment = await prisma.payment.create({
        data: {
            invoiceId: validated.invoiceId,
            amount: validated.amount,
            method: validated.method as "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "INSURANCE" | "OTHER",
            reference: validated.reference,
            notes: validated.notes,
        },
    })

    // Update invoice
    const invoice = await prisma.invoice.findUnique({
        where: { id: data.invoiceId },
        include: { payments: true },
    })

    if (invoice) {
        const totalPaid = invoice.payments.reduce(
            (sum: number, p: { amount: unknown }) => sum + Number(p.amount),
            0
        )

        const status = totalPaid >= Number(invoice.total) ? "PAID" : "PARTIAL"

        await prisma.invoice.update({
            where: { id: data.invoiceId },
            data: {
                amountPaid: totalPaid,
                status,
            },
        })
    }

    revalidatePath("/billing")
    revalidatePath("/dashboard") // Dashboard
    return {
        ...payment,
        amount: Number(payment.amount),
    }
}

export async function generateInvoiceFromAppointment(
    appointmentId: string,
    clinicId: string
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess || user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-generate-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
    })
    if (!appointment || appointment.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }

    // Get clinical records from the appointment
    const clinicalRecords = await prisma.clinicalRecord.findMany({
        where: { appointmentId },
        include: { procedure: true },
    })

    if (clinicalRecords.length === 0) {
        throw new Error("No treatments found for this appointment")
    }

    // Create invoice items from clinical records
    type ClinicalRecordWithProcedure = typeof clinicalRecords[number]
    const items = clinicalRecords.map((record: ClinicalRecordWithProcedure) => ({
        description: `${record.procedure.name}${record.toothNumber ? ` (Tooth ${record.toothNumber})` : ""}`,
        quantity: 1,
        unitPrice: Number(record.costOverride || record.procedure.standardCost),
        clinicalRecordId: record.id,
    }))

    const invoice = await createInvoice(clinicId, {
        patientId: appointment.patientId,
        appointmentId,
        items,
        discount: 0,
        tax: 0,
    })

    return invoice
}

// Update invoice details
export async function updateInvoice(
    invoiceId: string,
    data: {
        notes?: string
        dueDate?: Date
        discount?: number
        discountType?: string
        tax?: number
        status?: "DRAFT" | "PENDING" | "PARTIAL" | "PAID" | "CANCELLED" | "REFUNDED"
    }
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-update-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }
    // Get current invoice to recalculate if discount/tax changed
    const currentInvoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true }
    })

    if (!currentInvoice) {
        throw new Error("Invoice not found")
    }

    let updateData: any = {}

    // Update simple fields
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate
    if (data.status !== undefined) updateData.status = data.status

    // If discount, tax, or discountType changed, recalculate total
    if (data.discount !== undefined || data.tax !== undefined || data.discountType !== undefined) {
        const subtotal = Number(currentInvoice.subtotal)
        let discount = Number(currentInvoice.discount)
        const discountType = data.discountType ?? currentInvoice.discountType

        if (data.discount !== undefined) {
            discount = data.discount
            if (discountType === "percentage") {
                discount = (subtotal * discount) / 100
            }
        } else if (data.discountType !== undefined && data.discountType !== currentInvoice.discountType) {
            // If discountType changed but discount wasn't sent,
            // we should convert the old absolute discount to percentage rate if needed,
            // but normally they are changed together.
            if (data.discountType === "percentage" && subtotal > 0) {
                // If they changed to percentage, convert absolute to proportional (already stored as absolute)
                // We keep it as is.
            }
        }

        const tax = data.tax ?? Number(currentInvoice.tax)
        const total = subtotal - discount + tax

        updateData.discount = discount
        updateData.discountType = discountType
        updateData.tax = tax
        updateData.total = total
    }

    const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: updateData,
        include: {
            patient: true,
            clinic: true,
            items: true,
            payments: true,
        },
    })

    revalidatePath("/billing")
    revalidatePath(`/billing/${invoiceId}`)
    revalidatePath("/dashboard")
    return serializeInvoice(invoice)
}

// Update invoice items
export async function updateInvoiceItems(
    invoiceId: string,
    items: Array<{
        id?: string
        description: string
        quantity: number
        unitPrice: number
        clinicalRecordId?: string
    }>
) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-items-update-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }
    // Delete existing items
    await prisma.invoiceItem.deleteMany({
        where: { invoiceId }
    })

    // Create new items
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

    const currentInvoice = await prisma.invoice.findUnique({
        where: { id: invoiceId }
    })

    if (!currentInvoice) {
        throw new Error("Invoice not found")
    }

    let discount = Number(currentInvoice.discount)
    if (currentInvoice.discountType === "percentage") {
        const oldSubtotal = Number(currentInvoice.subtotal)
        if (oldSubtotal > 0) {
            discount = (subtotal * discount) / oldSubtotal
        } else {
            discount = 0
        }
    }

    const tax = Number(currentInvoice.tax)
    const total = subtotal - discount + tax

    const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            subtotal,
            total,
            items: {
                create: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.unitPrice * item.quantity,
                    clinicalRecordId: item.clinicalRecordId,
                }))
            }
        },
        include: {
            patient: true,
            clinic: true,
            items: true,
            payments: true,
        },
    })

    revalidatePath("/billing")
    revalidatePath(`/billing/${invoiceId}`)
    revalidatePath("/dashboard")
    return serializeInvoice(invoice)
}

// Delete invoice
export async function deleteInvoice(invoiceId: string) {
    const user = await getCurrentUser()
    if (!user || !user.hasAccess) {
        throw new Error("Unauthorized")
    }
    if (!await checkRateLimit(`invoices-delete-${user.id}`)) {
        throw new Error("Rate limit exceeded")
    }

    const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!existing || existing.clinicId !== user.clinicId) {
        throw new Error("Unauthorized")
    }
    // First delete related items and payments
    await prisma.invoiceItem.deleteMany({
        where: { invoiceId }
    })

    await prisma.payment.deleteMany({
        where: { invoiceId }
    })

    // Then delete the invoice
    const invoice = await prisma.invoice.delete({
        where: { id: invoiceId }
    })

    revalidatePath("/billing")
    revalidatePath("/dashboard")
    return { success: true, id: invoice.id }
}
