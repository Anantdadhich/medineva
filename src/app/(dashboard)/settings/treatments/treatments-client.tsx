"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

import { createTreatment, updateTreatment, deleteTreatment } from "@/lib/actions/treatments"
import { useRouter } from "next/navigation"

interface Treatment {
    id: string
    code?: string | null
    name: string
    description?: string | null
    standardCost: number
    category: string
    duration?: number | null
    isActive: boolean
}

interface TreatmentsClientProps {
    initialTreatments: Treatment[]
    clinicId: string
}

export function TreatmentsClient({ initialTreatments, clinicId }: TreatmentsClientProps) {
    const [treatments, setTreatments] = useState(initialTreatments)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        standardCost: "",
        category: "General",
    })

    const groupedTreatments = treatments.reduce((acc, treatment) => {
        if (!acc[treatment.category]) {
            acc[treatment.category] = []
        }
        acc[treatment.category].push(treatment)
        return acc
    }, {} as Record<string, Treatment[]>)

    const handleOpenDialog = (treatment?: Treatment) => {
        if (treatment) {
            setEditingTreatment(treatment)
            setFormData({
                code: treatment.code || "",
                name: treatment.name,
                description: treatment.description || "",
                standardCost: String(treatment.standardCost),
                category: treatment.category || "General",
            })
        } else {
            setEditingTreatment(null)
            setFormData({
                code: "",
                name: "",
                description: "",
                standardCost: "",
                category: "General",
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data: any = {
                code: formData.code || undefined,
                name: formData.name,
                description: formData.description || undefined,
                standardCost: parseFloat(formData.standardCost),
                category: formData.category,
            }

            if (editingTreatment) {
                const updated = await updateTreatment(editingTreatment.id, data)
                setTreatments(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
            } else {
                const created = await createTreatment(clinicId, data)
                setTreatments(prev => [...prev, created as Treatment])
            }
            setIsDialogOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to save treatment", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this treatment?")) return

        try {
            await deleteTreatment(id)
            setTreatments(prev => prev.filter(t => t.id !== id))
            router.refresh()
        } catch (error) {
            console.error("Failed to delete treatment", error)
        }
    }

    return (
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-4xl flex-col space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Services Catalog</h3>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="rounded-xl px-4 bg-slate-900 hover:bg-slate-850 text-white font-bold text-[12px] h-9 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                    Add treatment
                </Button>
            </div>

            <div className="flex-1 space-y-6">
                {treatments.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-gray-200/80 bg-white/50 px-8 py-16 text-center backdrop-blur-sm">
                        <p className="text-[15px] font-semibold text-gray-900">No treatments yet</p>
                        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-gray-500">
                            Add your first service so appointments and invoices can use consistent codes
                            and pricing.
                        </p>
                        <Button
                            className="mt-6 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                            onClick={() => handleOpenDialog()}
                        >
                            Add treatment
                        </Button>
                    </div>
                )}
                {Object.entries(groupedTreatments).map(([category, categoryTreatments]) => (
                    <Card
                        key={category}
                        className="overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl"
                    >
                        <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b border-gray-100/50 py-4 sm:py-4">
                            <CardTitle className="text-[17px] font-bold text-gray-800">{category}</CardTitle>
                            <Badge
                                variant="secondary"
                                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-none"
                            >
                                {categoryTreatments.length}{" "}
                                {categoryTreatments.length === 1 ? "service" : "services"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100/50">
                                {categoryTreatments.map((treatment) => (
                                    <div
                                        key={treatment.id}
                                        className="flex flex-col gap-1 px-4 sm:px-6 py-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {treatment.code && (
                                                    <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-medium text-gray-600">
                                                        {treatment.code}
                                                    </span>
                                                )}
                                                <span className="text-[15px] font-semibold text-gray-900">
                                                    {treatment.name}
                                                </span>
                                            </div>
                                            {treatment.description && (
                                                <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
                                                    {treatment.description}
                                                </p>
                                            )}
                                            {/* Mobile View Metadata & Actions Row */}
                                            <div className="flex items-center justify-between mt-2.5 sm:hidden">
                                                <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
                                                    {treatment.duration != null && treatment.duration > 0 && (
                                                        <span className="tabular-nums">{treatment.duration} min</span>
                                                    )}
                                                    {treatment.duration != null && treatment.duration > 0 && (
                                                        <span className="text-gray-350">•</span>
                                                    )}
                                                    <span className="font-bold tabular-nums text-gray-900">
                                                        {formatCurrency(treatment.standardCost)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900"
                                                        onClick={() => handleOpenDialog(treatment)}
                                                        aria-label="Edit treatment"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl text-red-650 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => handleDelete(treatment.id)}
                                                        aria-label="Delete treatment"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop View Actions & Pricing Row */}
                                        <div className="hidden sm:flex items-center gap-4 shrink-0">
                                            {treatment.duration != null && treatment.duration > 0 && (
                                                <span className="text-[13px] font-medium text-gray-500 tabular-nums">
                                                    {treatment.duration} min
                                                </span>
                                            )}
                                            <span className="text-[15px] font-bold tabular-nums text-gray-900">
                                                {formatCurrency(treatment.standardCost)}
                                            </span>
                                            <div className="flex items-center gap-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl text-gray-600 hover:bg-white hover:text-gray-950"
                                                    onClick={() => handleOpenDialog(treatment)}
                                                    aria-label="Edit treatment"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDelete(treatment.id)}
                                                    aria-label="Delete treatment"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-white/40">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {editingTreatment ? "Edit Treatment" : "Add New Treatment"}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 font-medium mt-1">
                                {editingTreatment
                                    ? "Update the treatment details below."
                                    : "Add a new service to your treatment catalog."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-gray-700 font-semibold text-[13px]">Service Code</Label>
                                <Input
                                    id="code"
                                    placeholder="D0120"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({ ...formData, code: e.target.value })
                                    }
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-gray-700 font-semibold text-[13px]">Category *</Label>
                                <Input
                                    id="category"
                                    placeholder="General"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    required
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-semibold text-[13px]">Treatment Name *</Label>
                            <Input
                                id="name"
                                placeholder="Root Canal - Molar"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                                className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-700 font-semibold text-[13px]">Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of the treatment"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="standardCost" className="text-gray-700 font-semibold text-[13px]">Standard Cost (₹) *</Label>
                            <Input
                                id="standardCost"
                                type="number"
                                placeholder="5000"
                                value={formData.standardCost}
                                onChange={(e) =>
                                    setFormData({ ...formData, standardCost: e.target.value })
                                }
                                required
                                className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                            />
                        </div>

                        <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50 text-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto rounded-xl px-6 h-11 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 cursor-pointer flex items-center justify-center">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : editingTreatment ? "Save Changes" : "Add Treatment"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
