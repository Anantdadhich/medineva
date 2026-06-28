
"use client"

import { format } from "date-fns"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash, Edit, MoreVertical, Loader2, Plus, X, Download, ArrowLeft, Printer } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import dynamic from "next/dynamic"

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <p>Loading PDF...</p>,
    }
)
import { InvoicePDF } from "@/components/billing/invoice-pdf"
import { deleteInvoice, updateInvoice, updateInvoiceItems } from "@/lib/actions/invoices"
import { getTreatments } from "@/lib/actions/treatments"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface InvoiceDetailClientProps {
    invoice: {
        id: string
        invoiceNumber: string
        status: string
        createdAt: Date | string
        dueDate?: Date | string
        notes?: string
        discount: number
        tax: number
        subtotal: number
        total: number
        amountPaid: number
        discountType?: string
        patient: {
            firstName: string
            lastName: string
            email?: string
            phone?: string
            address?: string
        }
        items: Array<{
            id: string
            description: string
            quantity: number
            unitPrice: number
            total: number
        }>
        payments: Array<{
            id: string
            paidAt: Date | string
            method: string
            reference?: string
            amount: number
        }>
        clinic?: {
            name: string
            address?: string
            phone?: string
            email?: string
            clinicSettings?: {
                logoUrl?: string | null
                taxId?: string | null
                invoiceFooter?: string | null
            } | null
        }
    }
    clinicId: string
}

export function InvoiceDetailClient({ invoice, clinicId }: InvoiceDetailClientProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Edit state
    const [formData, setFormData] = useState({
        notes: invoice.notes || "",
        status: invoice.status,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
        discount: invoice.discountType === "percentage" && invoice.subtotal > 0
            ? Number(((invoice.discount * 100) / invoice.subtotal).toFixed(2))
            : (invoice.discount || 0),
        discountType: invoice.discountType || "percentage",
        tax: invoice.tax || 0,
    })

    const [formItems, setFormItems] = useState<Array<{
        id?: string
        description: string
        quantity: number
        unitPrice: number
    }>>([])

    const [treatments, setTreatments] = useState<{ id: string; name: string; standardCost: number }[]>([])
    const [isLoadingTreatments, setIsLoadingTreatments] = useState(false)

    useEffect(() => {
        if (editOpen) {
            setFormData({
                notes: invoice.notes || "",
                status: invoice.status,
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
                discount: invoice.discountType === "percentage" && invoice.subtotal > 0
                    ? Number(((invoice.discount * 100) / invoice.subtotal).toFixed(2))
                    : (invoice.discount || 0),
                discountType: invoice.discountType || "percentage",
                tax: invoice.tax || 0,
            })
            setFormItems(invoice.items.map(item => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })))
        }
    }, [editOpen, invoice])

    useEffect(() => {
        if (editOpen) {
            const loadTreatments = async () => {
                setIsLoadingTreatments(true)
                try {
                    const treatmentsData = await getTreatments(clinicId)
                    if (treatmentsData.length === 0) {
                        const defaultServices = [
                            { id: 'default-1', name: 'Dental Cleaning (Prophylaxis)', standardCost: 1500 },
                            { id: 'default-2', name: 'Tooth Filling (Composite)', standardCost: 2000 },
                            { id: 'default-3', name: 'Tooth Extraction', standardCost: 1500 },
                            { id: 'default-4', name: 'Root Canal Treatment (RCT)', standardCost: 5000 },
                            { id: 'default-5', name: 'Dental Crown (Ceramic)', standardCost: 8000 },
                            { id: 'default-6', name: 'Teeth Whitening', standardCost: 10000 },
                            { id: 'default-7', name: 'Scaling & Polishing', standardCost: 1200 },
                            { id: 'default-8', name: 'Tooth Implant', standardCost: 35000 },
                            { id: 'default-9', name: 'Dental Bridge', standardCost: 15000 },
                            { id: 'default-10', name: 'Orthodontic Braces (Full)', standardCost: 50000 },
                            { id: 'default-11', name: 'Wisdom Tooth Extraction', standardCost: 3000 },
                            { id: 'default-12', name: 'Dental Veneer (per tooth)', standardCost: 12000 },
                            { id: 'default-13', name: 'Consultation Fee', standardCost: 500 },
                            { id: 'default-14', name: 'X-Ray (Full Mouth)', standardCost: 800 },
                            { id: 'default-15', name: 'Gum Treatment (Deep Cleaning)', standardCost: 4000 },
                        ]
                        setTreatments(defaultServices as any)
                    } else {
                        setTreatments(treatmentsData)
                    }
                } catch (error) {
                    console.error("Failed to load treatments", error)
                } finally {
                    setIsLoadingTreatments(false)
                }
            }
            loadTreatments()
        }
    }, [editOpen, clinicId])

    const handleAddItem = (description: string, quantity: number, unitPrice: number) => {
        setFormItems([...formItems, { description, quantity, unitPrice }])
    }

    const handleRemoveItem = (index: number) => {
        if (formItems.length === 1) return
        setFormItems(formItems.filter((_, idx) => idx !== index))
    }

    const handleUpdateItem = (index: number, field: string, value: any) => {
        setFormItems(formItems.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value }
            }
            return item
        }))
    }

    const editSubtotal = formItems.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0)
    let editDiscountAmount = Number(formData.discount) || 0
    if (formData.discountType === "percentage") {
        editDiscountAmount = (editSubtotal * editDiscountAmount) / 100
    }
    const editTaxAmount = Number(formData.tax) || 0
    const editTotal = editSubtotal - editDiscountAmount + editTaxAmount

    const pdfInvoiceData = {
        ...invoice,
        number: invoice.invoiceNumber,
        date: invoice.createdAt,
        patientName: invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : "Unknown",
        items: invoice.items || [],
        patient: invoice.patient || { firstName: "", lastName: "", email: "", phone: "" }
    }

    const safeFormat = (date: any, formatStr: string) => {
        try {
            if (!date) return "-"
            const d = new Date(date)
            if (isNaN(d.getTime())) return "-"
            return format(d, formatStr)
        } catch (e) {
            return "-"
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await deleteInvoice(invoice.id)
            toast({
                title: "Invoice deleted",
                description: "The invoice has been successfully deleted.",
            })
            router.push("/billing")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete invoice.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setDeleteOpen(false)
        }
    }

    const handleSaveEdit = async () => {
        setIsLoading(true)
        try {
            await updateInvoice(invoice.id, {
                notes: formData.notes,
                status: formData.status as "DRAFT" | "PENDING" | "PARTIAL" | "PAID" | "CANCELLED" | "REFUNDED",
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                discount: Number(formData.discount),
                discountType: formData.discountType,
                tax: Number(formData.tax),
            })
            await updateInvoiceItems(invoice.id, formItems)
            toast({
                title: "Invoice updated",
                description: "Invoice details and items saved successfully.",
            })
            setEditOpen(false)
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update invoice.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="flex flex-col w-full min-w-0 h-full space-y-6 print:hidden">
            <Header
                title={`Invoice ${invoice.invoiceNumber}`}
                description={`Created on ${safeFormat(invoice.createdAt, "PPP")}`}
                action={{
                    label: "Back to Billing",
                    onClick: () => router.back(),
                    variant: "outline",
                    icon: ArrowLeft
                }}
            />

            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto space-y-6">
                <div className="flex justify-between items-center mb-6 no-print">
                    <div>
                        <Badge variant={invoice.status.toLowerCase() as any} className="uppercase tracking-wider font-bold text-[10px] px-3 py-1 rounded-full">{invoice.status}</Badge>
                    </div>
                    <div className="flex gap-2.5 no-print">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="rounded-xl h-10 px-3.5 border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer">
                                    <MoreVertical className="h-4 w-4 sm:mr-2 shrink-0" />
                                    <span className="hidden sm:inline font-bold text-[13px]">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border border-gray-100 bg-white shadow-xl">
                                <DropdownMenuItem onClick={() => setEditOpen(true)} className="rounded-lg hover:bg-cyan-50 cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2 text-slate-500" />
                                    <span className="font-semibold text-[13px]">Edit Invoice</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive rounded-lg hover:bg-red-50 cursor-pointer">
                                    <Trash className="h-4 w-4 mr-2" />
                                    <span className="font-semibold text-[13px]">Delete Invoice</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {isMounted ? (
                            <PDFDownloadLink
                                document={
                                    <InvoicePDF
                                        invoice={pdfInvoiceData}
                                        clinicName={invoice.clinic?.name}
                                        clinicAddress={invoice.clinic?.address}
                                        clinicPhone={invoice.clinic?.phone}
                                        clinicEmail={invoice.clinic?.email}
                                    />
                                }
                                fileName={`${invoice.invoiceNumber}.pdf`}
                            >
                                {/* @ts-ignore */}
                                {({ loading }) => (
                                    <Button variant="outline" disabled={loading} className="rounded-xl h-10 px-3.5 border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Download className="h-4 w-4 sm:mr-2 text-cyan-600" />}
                                        <span className="hidden sm:inline font-bold text-[13px]">Download PDF</span>
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        ) : (
                            <Button variant="outline" disabled className="rounded-xl h-10 px-3.5 border-slate-200 bg-white shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                                <span className="hidden sm:inline font-bold text-[13px]">Loading PDF...</span>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="rounded-xl h-10 px-3.5 border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer"
                        >
                            <Printer className="h-4 w-4 sm:mr-2 text-cyan-650" />
                            <span className="hidden sm:inline font-bold text-[13px]">Print Receipt</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Info */}
                    <Card className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-gray-100/50 bg-white/40">
                            <CardTitle className="text-[16px] font-bold text-gray-900">Billed To</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-3.5 text-left">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient Name</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{invoice.patient.firstName} {invoice.patient.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{invoice.patient.address || "No Address Provided"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                        <p className="text-[14px] font-bold text-gray-800 mt-0.5">{invoice.patient.phone || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                        <p className="text-[14px] font-bold text-gray-800 mt-0.5 truncate">{invoice.patient.email || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Info */}
                    <Card className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-gray-100/50 bg-white/40">
                            <CardTitle className="text-[16px] font-bold text-gray-900">Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-left">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice Number</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{invoice.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Issued</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{safeFormat(invoice.createdAt, "dd MMM yyyy")}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Due Date</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5">{safeFormat(invoice.dueDate, "dd MMM yyyy")}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-0.5 leading-relaxed">{invoice.notes || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Items Table */}
                <Card className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden mt-6">
                    <CardHeader className="py-4 px-4 sm:px-6 border-b border-gray-100/50 bg-white/40">
                        <CardTitle className="text-[16px] font-bold text-gray-900">Line Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto w-full">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100/50 bg-white/40">
                                        <th className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                                        <th className="px-6 py-3.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit Price</th>
                                        <th className="px-6 py-3.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {invoice.items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-white/40 transition-all duration-200">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.description}</td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-600 font-semibold">{item.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-600 font-semibold">{formatCurrency(item.unitPrice)}</td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden p-4 space-y-3">
                            {invoice.items.map((item: any) => (
                                <div key={item.id} className="p-4 border border-white bg-white/60 backdrop-blur-2xl rounded-2xl flex justify-between items-center shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:bg-white/90 transition-all duration-200">
                                    <div className="min-w-0 pr-3">
                                        <p className="font-bold text-[14px] text-gray-900 truncate">{item.description}</p>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                                            Qty: {item.quantity} · {formatCurrency(item.unitPrice)}
                                        </p>
                                    </div>
                                    <p className="font-black text-[14px] text-gray-950 shrink-0">
                                        {formatCurrency(item.total)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Separator className="bg-gray-100/50" />

                        <div className="flex flex-col items-end space-y-2.5 p-4 sm:p-6 text-sm">
                            <div className="flex justify-between w-52 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span>Subtotal</span>
                                <span className="text-gray-800 font-semibold text-[13px] normal-case">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between w-52 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                    <span>Discount</span>
                                    <span className="text-emerald-600 font-bold text-[13px] normal-case">-{formatCurrency(invoice.discount)}</span>
                                </div>
                            )}
                            {invoice.tax > 0 && (
                                <div className="flex justify-between w-52 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <span>Tax</span>
                                    <span className="text-gray-800 font-semibold text-[13px] normal-case">+{formatCurrency(invoice.tax)}</span>
                                </div>
                            )}
                            <div className="flex justify-between w-52 font-black text-base pt-3 border-t border-gray-100">
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider pt-0.5">Total</span>
                                <span className="text-gray-950 font-black text-lg leading-none">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="flex justify-between w-52 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1">
                                <span>Amount Paid</span>
                                <span className="text-gray-800 font-semibold text-[13px] normal-case">{formatCurrency(invoice.amountPaid)}</span>
                            </div>
                            <div className="flex justify-between w-52 text-[10px] font-bold uppercase tracking-wider pt-1">
                                <span className={invoice.total - invoice.amountPaid > 0 ? "text-amber-500" : "text-emerald-500"}>Balance</span>
                                <span className={`text-[14px] font-bold ${invoice.total - invoice.amountPaid > 0 ? "text-amber-600" : "text-emerald-600"} normal-case`}>
                                    {formatCurrency(invoice.total - invoice.amountPaid)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments */}
                {invoice.payments && invoice.payments.length > 0 && (
                    <Card className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden mt-6">
                        <CardHeader className="py-4 px-4 sm:px-6 border-b border-gray-100/50 bg-white/40">
                            <CardTitle className="text-[16px] font-bold text-gray-900">Payment History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto w-full">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100/50 bg-white/40">
                                            <th className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference</th>
                                            <th className="px-6 py-3.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100/50">
                                        {invoice.payments.map((payment: any) => (
                                            <tr key={payment.id} className="hover:bg-white/40 transition-all duration-200">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{safeFormat(payment.paidAt, "dd MMM yyyy HH:mm")}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-750 capitalize">{payment.method.toLowerCase().replace("_", " ")}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{payment.reference || "—"}</td>
                                                <td className="px-6 py-4 text-sm text-right font-bold text-emerald-650">{formatCurrency(payment.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden p-4 space-y-3">
                                {invoice.payments.map((payment: any) => (
                                    <div key={payment.id} className="p-4 border border-white bg-white/60 backdrop-blur-2xl rounded-2xl flex flex-col gap-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:bg-white/90 transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</span>
                                            <span className="text-[13px] text-gray-800 font-bold">{safeFormat(payment.paidAt, "dd MMM yyyy HH:mm")}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Method</span>
                                            <span className="text-[11px] text-cyan-700 font-bold uppercase bg-cyan-50/50 border border-cyan-100 px-2.5 py-0.5 rounded-lg shadow-sm">
                                                {payment.method.toLowerCase().replace("_", " ")}
                                            </span>
                                        </div>
                                        {payment.reference && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference</span>
                                                <span className="text-[13px] text-gray-600 font-semibold">{payment.reference}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100/50">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</span>
                                            <span className="text-[14px] font-black text-emerald-600">{formatCurrency(payment.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-white/40 shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">Edit Invoice</DialogTitle>
                            <DialogDescription className="text-gray-500 font-medium mt-1">Update invoice details and items.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold text-[13px]">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus:ring-cyan-500/20">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-gray-100 bg-white shadow-xl">
                                    <SelectItem value="DRAFT" className="rounded-lg">Draft</SelectItem>
                                    <SelectItem value="PENDING" className="rounded-lg">Pending</SelectItem>
                                    <SelectItem value="PAID" className="rounded-lg">Paid</SelectItem>
                                    <SelectItem value="CANCELLED" className="rounded-lg">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold text-[13px]">Discount</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        max={formData.discountType === "percentage" ? 100 : undefined}
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                        className="flex-1 h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                    />
                                    <select
                                        className="flex h-11 w-[100px] rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-gray-800"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="percentage">%</option>
                                        <option value="fixed">Fixed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold text-[13px]">Tax (₹)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.tax}
                                    onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold text-[13px]">Due Date</Label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold text-[13px]">Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add notes..."
                                className="rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 p-3 min-h-[80px]"
                            />
                        </div>

                        {/* Line Items Editor */}
                        <div className="space-y-4 pt-2">
                            <div className="flex flex-col gap-3 p-4 bg-cyan-50/20 border border-cyan-100/50 rounded-2xl sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-1.5 w-full sm:flex-row sm:items-center sm:gap-2 sm:flex-1">
                                    <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider sm:text-xs whitespace-nowrap">Quick Add Service:</Label>
                                    <select
                                        className="flex h-10 w-full sm:h-9 sm:max-w-[240px] rounded-xl border border-gray-200/65 bg-white px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-gray-800"
                                        onChange={(e) => {
                                            const treatmentId = e.target.value
                                            if (!treatmentId) return
                                            const treatment = treatments.find(t => t.id === treatmentId)
                                            if (treatment) {
                                                handleAddItem(treatment.name, 1, Number(treatment.standardCost))
                                                e.target.value = ""
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select treatment...</option>
                                        {treatments.map((t: any) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} - ₹{t.standardCost}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto h-10 sm:h-9 rounded-xl font-bold border-gray-200/60 bg-white hover:bg-gray-50 text-gray-750 text-xs gap-1.5 px-4 shadow-sm"
                                    onClick={() => handleAddItem("", 1, 0)}
                                >
                                    <Plus className="h-3.5 w-3.5 text-cyan-600" />
                                    Add Blank Item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formItems.length > 0 && (
                                    <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                        <div className="col-span-6">Description</div>
                                        <div className="col-span-2">Qty</div>
                                        <div className="col-span-3">Price (₹)</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                )}
                                {formItems.map((item, index) => (
                                    <div key={index} className="w-full">
                                        {/* Desktop View */}
                                        <div className="hidden sm:grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-6">
                                                <Input
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Qty"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItem(index, "quantity", Number(e.target.value))}
                                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    min="0"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleUpdateItem(index, "unitPrice", Number(e.target.value))}
                                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={formItems.length === 1}
                                                    className="h-11 w-full text-red-400 hover:text-red-650 hover:bg-red-50 rounded-xl cursor-pointer"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="sm:hidden flex flex-col gap-3 p-3.5 border border-gray-100/60 bg-white/40 backdrop-blur-md rounded-2xl relative shadow-sm">
                                            {formItems.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-650 hover:bg-red-50 rounded-xl"
                                                    onClick={() => handleRemoveItem(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</Label>
                                                <Input
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                                                    className="h-11 rounded-xl bg-white border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Qty</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Qty"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(index, "quantity", Number(e.target.value))}
                                                        className="h-11 rounded-xl bg-white border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Price"
                                                        min="0"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleUpdateItem(index, "unitPrice", Number(e.target.value))}
                                                        className="h-11 rounded-xl bg-white border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="bg-gray-100/50" />

                            <div className="rounded-2xl bg-gray-50/50 border border-gray-100/40 p-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-950">₹{editSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Discount</span>
                                    <span className="text-red-500 font-bold">- ₹{editDiscountAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Tax</span>
                                    <span className="text-gray-700 font-bold">+ ₹{editTaxAmount.toFixed(2)}</span>
                                </div>
                                <Separator className="my-1.5" />
                                <div className="flex justify-between font-black text-[17px] text-gray-900 pt-1">
                                    <span>Total</span>
                                    <span className="text-cyan-700">₹{editTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px] shrink-0">
                        <Button variant="outline" onClick={() => setEditOpen(false)} className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50 text-gray-700">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isLoading} className="w-full sm:w-auto rounded-xl px-6 h-11 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 cursor-pointer">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="max-w-md bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-gray-900">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500 font-medium mt-2">
                                This action cannot be undone. This will permanently delete the invoice
                                and all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px]">
                        <AlertDialogCancel className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50 mt-0 text-gray-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="w-full sm:w-auto rounded-xl px-6 h-11 font-bold bg-destructive text-white hover:bg-red-700 shadow-md transition-all border border-transparent cursor-pointer flex items-center justify-center">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : "Delete"}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
            </div>

            {/* Print-only Invoice Receipt Component */}
            <div className="hidden print:block w-full max-w-4xl mx-auto p-0 font-sans text-slate-800 text-[12px] leading-relaxed bg-white">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-8">
                    <div>
                        {invoice.clinic?.clinicSettings?.logoUrl && (
                            <img
                                src={invoice.clinic?.clinicSettings?.logoUrl}
                                alt="Clinic Logo"
                                className="max-h-12 max-w-[180px] mb-3 object-contain"
                            />
                        )}
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">{invoice.clinic?.name || "Smile Science Dentistry"}</h2>
                        <p className="text-slate-500 max-w-[350px] mt-1">{invoice.clinic?.address || "ELECTRONICS CITY, 5th Floor, 224, 3rd Cross Road, Neeladri Nagar, Electronic City Phase I, Electronic City, Bengaluru, Karnataka 560100"}</p>
                        <p className="text-slate-500 mt-1">{invoice.clinic?.phone || "+91 98765 43210"} • {invoice.clinic?.email || "comacksclient@gmail.com"}</p>
                        {invoice.clinic?.clinicSettings?.taxId && (
                            <p className="text-slate-500 mt-1 font-semibold">Tax ID / GSTIN: {invoice.clinic?.clinicSettings?.taxId}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-slate-300 tracking-wider mb-2">INVOICE</h1>
                        <div className="space-y-1">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold">Invoice #</p>
                                <p className="font-bold text-slate-900">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold">Date Issued</p>
                                <p className="font-bold text-slate-900">{safeFormat(invoice.createdAt, "dd MMM yyyy")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Info Block */}
                <div className="grid grid-cols-3 gap-6 bg-slate-50 border border-slate-100 rounded-lg p-5 mb-8">
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Billed To</p>
                        <p className="text-sm font-bold text-slate-900">{invoice.patient.firstName} {invoice.patient.lastName}</p>
                        <p className="text-slate-500">{invoice.patient.email}</p>
                        {invoice.patient.phone && <p className="text-slate-500">{invoice.patient.phone}</p>}
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Due Date</p>
                        <p className="text-sm font-bold text-slate-900">{safeFormat(invoice.dueDate, "dd MMM yyyy")}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                        <p className={`text-sm font-bold uppercase ${invoice.status === 'PAID' ? 'text-green-600' : 'text-slate-900'}`}>{invoice.status || 'DRAFT'}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-left text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                            <th className="py-2 w-3/5">Description</th>
                            <th className="py-2 text-center w-1/12">Qty</th>
                            <th className="py-2 text-right w-1/6">Rate</th>
                            <th className="py-2 text-right w-1/6">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {invoice.items.map((item: any) => (
                            <tr key={item.id} className="py-3">
                                <td className="py-3 font-bold text-slate-950">{item.description}</td>
                                <td className="py-3 text-center">{item.quantity}</td>
                                <td className="py-3 text-right">Rs. {Number(item.unitPrice).toLocaleString('en-IN')}</td>
                                <td className="py-3 text-right font-bold text-slate-950">Rs. {Number(item.total).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-16">
                    <div className="w-2/5 space-y-2">
                        <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1">
                            <span>Subtotal</span>
                            <span className="font-semibold text-slate-900">Rs. {Number(invoice.subtotal).toLocaleString('en-IN')}</span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="flex justify-between text-emerald-600 border-b border-slate-100 pb-1">
                                <span>Discount</span>
                                <span className="font-bold">-Rs. {Number(invoice.discount).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {invoice.tax > 0 && (
                            <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1">
                                <span>Tax</span>
                                <span className="font-semibold text-slate-900">+Rs. {Number(invoice.tax).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-900 font-bold border-t-2 border-slate-900 pt-2 text-[14px]">
                            <span>Total</span>
                            <span className="text-[16px]">Rs. {Number(invoice.total).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                            <span>Amount Paid</span>
                            <span>Rs. {Number(invoice.amountPaid).toLocaleString('en-IN')}</span>
                        </div>
                        <div className={`flex justify-between font-bold text-[12px] pt-1 ${invoice.total - invoice.amountPaid > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            <span>Balance Due</span>
                            <span>Rs. {Number(invoice.total - invoice.amountPaid).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="border-t border-slate-150 pt-5 text-center text-slate-400 text-[11px] space-y-1">
                    {invoice.clinic?.clinicSettings?.invoiceFooter && (
                        <p className="text-slate-600 font-medium whitespace-pre-line mb-1.5">{invoice.clinic?.clinicSettings?.invoiceFooter}</p>
                    )}
                    <p>Thank you for choosing {invoice.clinic?.name || "Smile Science Dentistry"}.</p>
                </div>
            </div>
        </>
    )
}
