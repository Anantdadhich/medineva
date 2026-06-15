
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

            <div className="flex-1 p-4 md:p-6 overflow-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <Badge variant={invoice.status.toLowerCase() as any}>{invoice.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="px-3 sm:px-4">
                                    <MoreVertical className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete Invoice
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
                                    <Button variant="outline" disabled={loading} className="px-3 sm:px-4">
                                        <Download className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Download PDF</span>
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        ) : (
                            <Button variant="outline" disabled className="px-3 sm:px-4">
                                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                                <span className="hidden sm:inline">Loading PDF...</span>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Billed To</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="font-medium">{invoice.patient.firstName} {invoice.patient.lastName}</p>
                                <p className="text-sm text-muted-foreground">{invoice.patient.address || "No address"}</p>
                                <p className="text-sm text-muted-foreground">{invoice.patient.phone}</p>
                                <p className="text-sm text-muted-foreground">{invoice.patient.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Invoice Number</p>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Date Issued</p>
                                <p className="font-medium">{safeFormat(invoice.createdAt, "dd MMM yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Due Date</p>
                                <p className="font-medium">{safeFormat(invoice.dueDate, "dd MMM yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Notes</p>
                                <p className="font-medium">{invoice.notes || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Items Table */}
                <Card className="mt-6">
                    <CardHeader className="p-4 sm:p-6 pb-4">
                        <CardTitle className="text-[17px] font-bold text-gray-900">Line Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto w-full">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-sm text-muted-foreground">
                                        <th className="py-2 text-left">Description</th>
                                        <th className="py-2 text-right">Qty</th>
                                        <th className="py-2 text-right">Unit Price</th>
                                        <th className="py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {invoice.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="py-3 text-sm">{item.description}</td>
                                            <td className="py-3 text-sm text-right">{item.quantity}</td>
                                            <td className="py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                                            <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-3">
                            {invoice.items.map((item: any) => (
                                <div key={item.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex justify-between items-center">
                                    <div className="min-w-0 pr-3">
                                        <p className="font-bold text-[14px] text-gray-900 truncate">{item.description}</p>
                                        <p className="text-[12px] text-gray-500 font-medium mt-1">
                                            Qty: {item.quantity} • {formatCurrency(item.unitPrice)}
                                        </p>
                                    </div>
                                    <p className="font-bold text-[14px] text-gray-900 shrink-0">
                                        {formatCurrency(item.total)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="flex flex-col items-end space-y-2 text-sm">
                            <div className="flex justify-between w-48">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between w-48 text-success">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(invoice.discount)}</span>
                                </div>
                            )}
                            {invoice.tax > 0 && (
                                <div className="flex justify-between w-48">
                                    <span>Tax</span>
                                    <span>+{formatCurrency(invoice.tax)}</span>
                                </div>
                            )}
                            <div className="flex justify-between w-48 font-bold text-lg pt-2 border-t">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="flex justify-between w-48 text-muted-foreground mt-2">
                                <span>Amount Paid</span>
                                <span>{formatCurrency(invoice.amountPaid)}</span>
                            </div>
                            <div className="flex justify-between w-48 font-medium">
                                <span className={invoice.total - invoice.amountPaid > 0 ? "text-destructive" : "text-success"}>Balance</span>
                                <span className={invoice.total - invoice.amountPaid > 0 ? "text-destructive" : "text-success"}>
                                    {formatCurrency(invoice.total - invoice.amountPaid)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments */}
                {invoice.payments && invoice.payments.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader className="p-4 sm:p-6 pb-4">
                            <CardTitle className="text-[17px] font-bold text-gray-900">Payment History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto w-full">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-sm text-muted-foreground">
                                            <th className="py-2 text-left">Date</th>
                                            <th className="py-2 text-left">Method</th>
                                            <th className="py-2 text-left">Reference</th>
                                            <th className="py-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {invoice.payments.map((payment: any) => (
                                            <tr key={payment.id}>
                                                <td className="py-3 text-sm">{safeFormat(payment.paidAt, "dd MMM yyyy HH:mm")}</td>
                                                <td className="py-3 text-sm capitalize">{payment.method.toLowerCase().replace("_", " ")}</td>
                                                <td className="py-3 text-sm text-muted-foreground">{payment.reference || "-"}</td>
                                                <td className="py-3 text-sm text-right font-medium">{formatCurrency(payment.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-3">
                                {invoice.payments.map((payment: any) => (
                                    <div key={payment.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date</span>
                                            <span className="text-[13px] text-gray-900 font-semibold">{safeFormat(payment.paidAt, "dd MMM yyyy HH:mm")}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Method</span>
                                            <span className="text-[13px] text-gray-900 font-semibold capitalize bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">
                                                {payment.method.toLowerCase().replace("_", " ")}
                                            </span>
                                        </div>
                                        {payment.reference && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Reference</span>
                                                <span className="text-[13px] text-gray-500 font-medium">{payment.reference}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Amount</span>
                                            <span className="text-[14px] font-bold text-emerald-600">{formatCurrency(payment.amount)}</span>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Invoice</DialogTitle>
                        <DialogDescription>Update invoice details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tax</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.tax}
                                    onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add notes..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the invoice
                            and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
