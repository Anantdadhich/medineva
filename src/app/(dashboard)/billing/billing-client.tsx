"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    DollarSign,
    Receipt,
    TrendingUp,
    Clock,
    Download,
    Eye,
    CreditCard,
    Loader2,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PAYMENT_METHODS } from "@/lib/validations/invoice"
import { PDFDownloadLink } from "@react-pdf/renderer"

import { recordPayment } from "@/lib/actions/invoices"
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog"
import { useSearchParams, useRouter } from "next/navigation"
import { InvoicePDF } from "@/components/billing/invoice-pdf"

interface BillingClientProps {
    initialInvoices: any[]
    clinicId: string
}

export function BillingClient({ initialInvoices, clinicId }: BillingClientProps) {
    const [invoices, setInvoices] = useState(initialInvoices)
    const [filter, setFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("CASH")
    const [isLoading, setIsLoading] = useState(false)
    const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)

    const searchParams = useSearchParams()
    const router = useRouter()
    const patientIdParam = searchParams.get("patientId")
    const highlightId = searchParams.get("highlight")

    // Sync local state with server data when props change
    useEffect(() => {
        setInvoices(initialInvoices)
    }, [initialInvoices])

    // Open create dialog if patientId is present
    useEffect(() => {
        if (patientIdParam) {
            setFilter("all")
            setSearchQuery("")
            setIsCreateInvoiceOpen(true)
        }
    }, [patientIdParam])

    // Refresh data handler
    const handleInvoiceCreated = () => {
        // In a real app with server actions, revalidatePath handles data refresh.
        // But we might need to reset filtered view or show success.
        setIsCreateInvoiceOpen(false)
        router.refresh()
        // Optionally remove query param
        if (patientIdParam) {
            router.replace("/billing")
        }
    }

    // Calculate stats based on real data
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0)
    const outstanding = invoices.filter(inv => inv.status !== "PAID").reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0)
    const collectedToday = 0 // Needs payment date logic or separate fetch, keeping 0 or removing stat for now
    const invoicesCount = invoices.length

    const stats = [
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            change: "Total",
            icon: DollarSign,
            description: "All time",
        },
        {
            title: "Outstanding",
            value: formatCurrency(outstanding),
            change: "Unpaid",
            icon: Clock,
            description: "Pending payment",
        },
        {
            title: "Invoices Created",
            value: invoicesCount.toString(),
            change: "Total",
            icon: Receipt,
            description: "All time",
        },
    ]

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesFilter = filter === "all" || invoice.status === filter.toUpperCase()
        const patientName = invoice.patient
            ? `${invoice.patient.firstName} ${invoice.patient.lastName}`.toLowerCase()
            : ""
        const matchesSearch =
            patientName.includes(searchQuery.toLowerCase()) ||
            invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleRecordPayment = (invoice: any) => {
        setSelectedInvoice(invoice)
        setPaymentAmount(String(invoice.total - invoice.amountPaid))
        setIsPaymentDialogOpen(true)
    }

    const handleSubmitPayment = async () => {
        if (!selectedInvoice) return
        setIsLoading(true)

        try {
            const paymentResult = await recordPayment({
                invoiceId: selectedInvoice.id,
                amount: parseFloat(paymentAmount),
                method: paymentMethod as any,
                notes: "Recorded via Dashboard",
                reference: ""
            })

            // Update local state
            const newPaidAmount = selectedInvoice.amountPaid + parseFloat(paymentAmount)
            const newStatus = newPaidAmount >= selectedInvoice.total ? "PAID" : "PARTIAL"

            setInvoices(invoices.map(inv =>
                inv.id === selectedInvoice.id
                    ? { ...inv, amountPaid: newPaidAmount, status: newStatus }
                    : inv
            ))

            setIsPaymentDialogOpen(false)
            setSelectedInvoice(null)
        } catch (error) {
            console.error("Payment failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col w-full min-w-0 h-full">
            <Header
                title="Billing"
                description="Manage invoices and payments"
                action={{
                    label: "New Invoice",
                    onClick: () => setIsCreateInvoiceOpen(true),
                }}
            />

            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div 
                            key={stat.title}
                            className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] p-6 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <div className="flex flex-row items-center justify-between pb-2">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {stat.title}
                                </p>
                                <stat.icon className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="space-y-1 mt-1">
                                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">{stat.value}</h3>
                                <p className="text-[11px] text-gray-400 font-semibold pt-1">
                                    {stat.change} · {stat.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Invoices Table */}
                <Card className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] overflow-hidden">
                    <CardHeader className="py-4 px-4 sm:px-6 border-b border-gray-100/50 bg-white/40">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="text-[17px] font-bold text-gray-900">Recent Invoices</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                                <Input
                                    placeholder="Search invoices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 h-10 rounded-xl border-gray-100 bg-white/50 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20"
                                />
                                <div className="flex gap-1 rounded-xl border border-gray-100/50 bg-white/50 p-1 overflow-x-auto max-w-full">
                                    {["all", "pending", "partial", "paid"].map((status) => (
                                        <Button
                                            key={status}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFilter(status)}
                                            className={`capitalize rounded-lg px-4 font-semibold text-[13px] transition-all cursor-pointer ${
                                                filter === status 
                                                    ? "bg-white text-cyan-700 shadow-sm border border-gray-100/50" 
                                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/30"
                                            }`}
                                        >
                                            {status}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop View */}
                        <div className="hidden md:block rounded-lg border overflow-x-auto w-full">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left text-sm font-medium">Invoice</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Paid</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Balance</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-b hover:bg-muted/50">
                                            <td className="px-4 py-3 font-mono text-sm">{invoice.invoiceNumber || invoice.number}</td>
                                            <td className="px-4 py-3 font-medium">{invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : invoice.patientName}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {invoice.createdAt ? format(new Date(invoice.createdAt), "dd MMM yyyy") : format(invoice.date, "dd MMM yyyy")}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(invoice.total)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-success">
                                                {formatCurrency(invoice.amountPaid)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {invoice.total - invoice.amountPaid > 0 ? (
                                                    <span className="text-warning font-medium">
                                                        {formatCurrency(invoice.total - invoice.amountPaid)}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={invoice.status.toLowerCase() as any}>{invoice.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/billing/${invoice.id}`)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <PDFDownloadLink
                                                        document={
                                                            <InvoicePDF
                                                                invoice={{
                                                                    ...invoice,
                                                                    // Map prisma model to invoice type expected by PDF
                                                                    number: invoice.invoiceNumber,
                                                                    date: invoice.createdAt || invoice.date,
                                                                    dueDate: invoice.dueDate,
                                                                    patientName: invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : invoice.patientName,
                                                                    items: invoice.items?.map((i: any) => ({
                                                                        description: i.description,
                                                                        quantity: i.quantity,
                                                                        unitPrice: i.unitPrice,
                                                                        total: i.total
                                                                    })) || [],
                                                                    patient: invoice.patient ? {
                                                                        firstName: invoice.patient.firstName,
                                                                        lastName: invoice.patient.lastName,
                                                                        email: invoice.patient.email || "",
                                                                        phone: invoice.patient.phone
                                                                    } : { firstName: "", lastName: "", email: "", phone: "" }
                                                                }}
                                                                clinicName={invoice.clinic?.name}
                                                                clinicAddress={invoice.clinic?.address}
                                                                clinicPhone={invoice.clinic?.phone}
                                                                clinicEmail={invoice.clinic?.email}
                                                            />
                                                        }
                                                        fileName={`${invoice.invoiceNumber || invoice.id}.pdf`}
                                                    >
                                                        {/* @ts-ignore - render prop type mismatch */}
                                                        {({ loading }) => (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                    </PDFDownloadLink>
                                                    {invoice.status !== "PAID" && invoice.status !== "paid" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary"
                                                            onClick={() => handleRecordPayment(invoice)}
                                                        >
                                                            <CreditCard className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden space-y-4">
                            {filteredInvoices.map((invoice) => {
                                const balance = invoice.total - invoice.amountPaid
                                return (
                                    <div
                                        key={invoice.id}
                                        className="rounded-[20px] border border-white bg-white/60 p-4 space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:bg-white/95 duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm font-bold text-gray-900">
                                                {invoice.invoiceNumber || invoice.number}
                                            </span>
                                            <Badge variant={invoice.status.toLowerCase() as any}>
                                                {invoice.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-0.5">
                                            <p className="text-[14px] font-bold text-gray-900">
                                                {invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : invoice.patientName}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {invoice.createdAt ? format(new Date(invoice.createdAt), "dd MMM yyyy") : format(invoice.date, "dd MMM yyyy")}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-gray-50/50 border border-gray-100/40 text-center">
                                            <div>
                                                <p className="text-[9px] uppercase font-bold text-gray-400">Total</p>
                                                <p className="text-[12px] font-bold text-gray-900 mt-0.5">
                                                    {formatCurrency(invoice.total)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] uppercase font-bold text-emerald-500">Paid</p>
                                                <p className="text-[12px] font-bold text-emerald-600 mt-0.5">
                                                    {formatCurrency(invoice.amountPaid)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] uppercase font-bold text-amber-500">Balance</p>
                                                <p className="text-[12px] font-bold text-amber-600 mt-0.5">
                                                    {balance > 0 ? formatCurrency(balance) : "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1.5 pt-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 rounded-xl h-9 px-1.5 text-[12px] font-bold border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-1"
                                                onClick={() => router.push(`/billing/${invoice.id}`)}
                                            >
                                                <Eye className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                                                View
                                            </Button>

                                            <PDFDownloadLink
                                                document={
                                                    <InvoicePDF
                                                        invoice={{
                                                            ...invoice,
                                                            number: invoice.invoiceNumber,
                                                            date: invoice.createdAt || invoice.date,
                                                            dueDate: invoice.dueDate,
                                                            patientName: invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : invoice.patientName,
                                                            items: invoice.items?.map((i: any) => ({
                                                                description: i.description,
                                                                quantity: i.quantity,
                                                                unitPrice: i.unitPrice,
                                                                total: i.total
                                                            })) || [],
                                                            patient: invoice.patient ? {
                                                                firstName: invoice.patient.firstName,
                                                                lastName: invoice.patient.lastName,
                                                                email: invoice.patient.email || "",
                                                                phone: invoice.patient.phone
                                                            } : { firstName: "", lastName: "", email: "", phone: "" }
                                                        }}
                                                        clinicName={invoice.clinic?.name}
                                                        clinicAddress={invoice.clinic?.address}
                                                        clinicPhone={invoice.clinic?.phone}
                                                        clinicEmail={invoice.clinic?.email}
                                                    />
                                                }
                                                fileName={`${invoice.invoiceNumber || invoice.id}.pdf`}
                                                style={{ display: "inline-flex", flex: 1 }}
                                            >
                                                {/* @ts-ignore */}
                                                {({ loading }) => (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full rounded-xl h-9 px-1.5 text-[12px] font-bold border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-1"
                                                        disabled={loading}
                                                    >
                                                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Download className="h-3.5 w-3.5 text-cyan-600 shrink-0" />}
                                                        PDF
                                                    </Button>
                                                )}
                                            </PDFDownloadLink>

                                            {invoice.status !== "PAID" && invoice.status !== "paid" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 rounded-xl h-9 px-1.5 text-[12px] font-bold border-cyan-100 bg-cyan-50/50 hover:bg-cyan-100/50 text-cyan-700 shadow-sm cursor-pointer flex items-center justify-center gap-1"
                                                    onClick={() => handleRecordPayment(invoice)}
                                                >
                                                    <CreditCard className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                                                    Pay
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="max-w-md bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-white/40">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">Record Payment</DialogTitle>
                            <DialogDescription className="text-gray-500 font-medium">
                                Record a payment for invoice {selectedInvoice?.invoiceNumber || selectedInvoice?.number}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedInvoice && (
                        <div className="space-y-5 p-4 sm:p-6">
                            <div className="rounded-2xl bg-gray-50/50 border border-gray-100/40 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Invoice Total</span>
                                    <span className="font-bold text-gray-950">{formatCurrency(selectedInvoice.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Already Paid</span>
                                    <span className="text-emerald-600 font-bold">{formatCurrency(selectedInvoice.amountPaid)}</span>
                                </div>
                                <Separator className="my-1" />
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-900">Balance Due</span>
                                    <span className="text-amber-600">{formatCurrency(selectedInvoice.total - selectedInvoice.amountPaid)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-gray-700 font-semibold text-[13px]">Payment Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="method" className="text-gray-700 font-semibold text-[13px]">Payment Method</Label>
                                <select
                                    id="method"
                                    className="flex h-11 w-full rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    {PAYMENT_METHODS.map((method) => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px]">
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitPayment} disabled={isLoading} className="w-full sm:w-auto rounded-xl px-6 h-11 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 cursor-pointer">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : "Record Payment"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <CreateInvoiceDialog
                open={isCreateInvoiceOpen}
                onOpenChange={setIsCreateInvoiceOpen}
                clinicId={clinicId}
                defaultPatientId={patientIdParam}
                onSuccess={handleInvoiceCreated}
            />
        </div >
    )
}
