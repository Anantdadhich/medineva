
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
        discount: invoice.discount || 0,
        tax: invoice.tax || 0,
    })

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
                tax: Number(formData.tax),
            })
            toast({
                title: "Invoice updated",
                description: "Invoice details saved successfully.",
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
        <div className="flex flex-col w-full min-w-0 h-full space-y-6">
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
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Badge variant={invoice.status.toLowerCase() as any} className="uppercase tracking-wider font-bold text-[10px] px-3 py-1 rounded-full">{invoice.status}</Badge>
                    </div>
                    <div className="flex gap-2.5">
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
                <DialogContent className="max-w-md bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-white/40">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">Edit Invoice</DialogTitle>
                            <DialogDescription className="text-gray-500 font-medium mt-1">Update invoice details.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="space-y-4 p-4 sm:p-6">
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
                                <Label className="text-gray-700 font-semibold text-[13px]">Discount (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold text-[13px]">Tax</Label>
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
                    </div>
                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px]">
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
    )
}
