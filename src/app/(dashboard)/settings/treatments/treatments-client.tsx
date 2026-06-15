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
        category: "",
        duration: "",
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
                category: treatment.category,
                duration: treatment.duration ? String(treatment.duration) : "",
            })
        } else {
            setEditingTreatment(null)
            setFormData({
                code: "",
                name: "",
                description: "",
                standardCost: "",
                category: "",
                duration: "",
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
                duration: formData.duration ? parseInt(formData.duration) : undefined,
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
            <Header
                title="Treatment catalog"
                description="Services, standard fees, and durations for scheduling and billing."
                clinicId={clinicId}
                action={{
                    label: "Add treatment",
                    onClick: () => handleOpenDialog(),
                }}
            />

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
                                        className="flex flex-col gap-3 px-4 sm:px-6 py-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between"
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
                                            {/* Mobile Duration and Cost badges */}
                                            <div className="flex items-center gap-3 mt-2 sm:hidden text-[13px] font-medium text-gray-500">
                                                {treatment.duration != null && treatment.duration > 0 && (
                                                    <span className="tabular-nums">
                                                        {treatment.duration} min
                                                    </span>
                                                )}
                                                {treatment.duration != null && treatment.duration > 0 && (
                                                    <span className="text-gray-300">•</span>
                                                )}
                                                <span className="font-bold tabular-nums text-gray-900">
                                                    {formatCurrency(treatment.standardCost)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-1 sm:mt-0 pt-2.5 sm:pt-0 border-t border-gray-100/50 sm:border-0 shrink-0">
                                            <div className="hidden sm:flex items-center gap-3 sm:gap-4">
                                                {treatment.duration != null && treatment.duration > 0 && (
                                                    <span className="text-[13px] font-medium text-gray-500 tabular-nums">
                                                        {treatment.duration} min
                                                    </span>
                                                )}
                                                <span className="text-[15px] font-bold tabular-nums text-gray-900">
                                                    {formatCurrency(treatment.standardCost)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-0.5 ml-auto">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900"
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
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTreatment ? "Edit Treatment" : "Add New Treatment"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTreatment
                                ? "Update the treatment details below."
                                : "Add a new service to your treatment catalog."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Service Code</Label>
                                <Input
                                    id="code"
                                    placeholder="D0120"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({ ...formData, code: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <select
                                    id="category"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Select category</option>
                                    <option value="Preventive">Preventive</option>
                                    <option value="Restorative">Restorative</option>
                                    <option value="Cosmetic">Cosmetic</option>
                                    <option value="Endodontic">Endodontic</option>
                                    <option value="Periodontic">Periodontic</option>
                                    <option value="Orthodontic">Orthodontic</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Diagnostic">Diagnostic</option>
                                    <option value="General">General</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Treatment Name *</Label>
                            <Input
                                id="name"
                                placeholder="Root Canal - Molar"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of the treatment"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="standardCost">Standard Cost (₹) *</Label>
                                <Input
                                    id="standardCost"
                                    type="number"
                                    placeholder="5000"
                                    value={formData.standardCost}
                                    onChange={(e) =>
                                        setFormData({ ...formData, standardCost: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    placeholder="30"
                                    value={formData.duration}
                                    onChange={(e) =>
                                        setFormData({ ...formData, duration: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingTreatment ? "Save Changes" : "Add Treatment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
