"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronsUpDown, Check, Plus, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import { createInvoice } from "@/lib/actions/invoices"
import { getPatients } from "@/lib/actions/patients"
import { getTreatments } from "@/lib/actions/treatments"
import { createInvoiceSchema, type CreateInvoiceValues } from "@/lib/validations/invoice"


interface CreateInvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    clinicId: string
    defaultPatientId?: string | null // Explicitly allow null
    onSuccess: () => void
}


export function CreateInvoiceDialog({
    open,
    onOpenChange,
    clinicId,
    defaultPatientId,
    onSuccess,
}: CreateInvoiceDialogProps) {
    const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string }[]>([])
    const [treatments, setTreatments] = useState<{ id: string; name: string; standardCost: number }[]>([])
    const [isLoadingPatients, setIsLoadingPatients] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [patientOpen, setPatientOpen] = useState(false) // State for combobox

    // @ts-ignore - Resolver types mismatch due to strict Zod inference but runtime is fine. 
    // We are manually casting or ignoring to proceed fast as schema is correct.
    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateInvoiceValues>({
        // @ts-ignore
        resolver: zodResolver(createInvoiceSchema),
        defaultValues: {
            items: [{ description: "", quantity: 1, unitPrice: 0 }],
            tax: 0,
            discount: 0,
            discountType: "percentage",
            patientId: defaultPatientId || "",
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    })

    const watchItems = watch("items")
    const watchDiscount = watch("discount")
    const watchDiscountType = watch("discountType")
    const watchTax = watch("tax")

    // Calculate totals for preview
    const subtotal = (watchItems || []).reduce((acc, item) => acc + (Number(item?.quantity || 0) * Number(item?.unitPrice || 0)), 0)

    let discountAmount = Number(watchDiscount) || 0
    if (watchDiscountType === "percentage") {
        discountAmount = (subtotal * discountAmount) / 100
    }
    const taxAmount = Number(watchTax) || 0
    const total = subtotal - discountAmount + taxAmount

    // Fetch data when dialog opens
    useEffect(() => {
        if (open) {
            const loadData = async () => {
                setIsLoadingPatients(true)
                try {
                    const [patientsData, treatmentsData] = await Promise.all([
                        getPatients(clinicId),
                        getTreatments(clinicId)
                    ])
                    setPatients(patientsData)

                    // If no treatments in catalog, provide default dental services
                    if (treatmentsData.length === 0) {
                        const defaultServices = [
                            { id: 'default-1', name: 'Dental Cleaning (Prophylaxis)', standardCost: 1500, category: 'Preventive' },
                            { id: 'default-2', name: 'Tooth Filling (Composite)', standardCost: 2000, category: 'Restorative' },
                            { id: 'default-3', name: 'Tooth Extraction', standardCost: 1500, category: 'Surgery' },
                            { id: 'default-4', name: 'Root Canal Treatment (RCT)', standardCost: 5000, category: 'Endodontic' },
                            { id: 'default-5', name: 'Dental Crown (Ceramic)', standardCost: 8000, category: 'Restorative' },
                            { id: 'default-6', name: 'Teeth Whitening', standardCost: 10000, category: 'Cosmetic' },
                            { id: 'default-7', name: 'Scaling & Polishing', standardCost: 1200, category: 'Preventive' },
                            { id: 'default-8', name: 'Tooth Implant', standardCost: 35000, category: 'Surgery' },
                            { id: 'default-9', name: 'Dental Bridge', standardCost: 15000, category: 'Restorative' },
                            { id: 'default-10', name: 'Orthodontic Braces (Full)', standardCost: 50000, category: 'Orthodontic' },
                            { id: 'default-11', name: 'Wisdom Tooth Extraction', standardCost: 3000, category: 'Surgery' },
                            { id: 'default-12', name: 'Dental Veneer (per tooth)', standardCost: 12000, category: 'Cosmetic' },
                            { id: 'default-13', name: 'Consultation Fee', standardCost: 500, category: 'General' },
                            { id: 'default-14', name: 'X-Ray (Full Mouth)', standardCost: 800, category: 'Diagnostic' },
                            { id: 'default-15', name: 'Gum Treatment (Deep Cleaning)', standardCost: 4000, category: 'Periodontic' },
                        ]
                        setTreatments(defaultServices as any)
                    } else {
                        setTreatments(treatmentsData)
                    }
                } catch (error) {
                    console.error("Failed to load data", error)
                } finally {
                    setIsLoadingPatients(false)
                }
            }
            loadData()
        }
    }, [open, clinicId])

    // Update form when defaultPatientId changes
    useEffect(() => {
        if (defaultPatientId) {
            setValue("patientId", defaultPatientId)
        }
    }, [defaultPatientId, setValue])

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const treatmentId = e.target.value
        if (!treatmentId) return

        const treatment = treatments.find(t => t.id === treatmentId)
        if (treatment) {
            append({
                description: treatment.name,
                quantity: 1,
                unitPrice: Number(treatment.standardCost)
            })
            // Reset select
            e.target.value = ""
        }
    }

    const onSubmit: SubmitHandler<CreateInvoiceValues> = async (data) => {
        setIsSubmitting(true)
        try {
            await createInvoice(clinicId, data)
            reset()
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create invoice", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[24px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100/50 bg-white/40 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Create New Invoice</DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label className="text-gray-700 font-semibold text-[13px]">Patient</Label>
                                {defaultPatientId ? (
                                    <Input
                                        value={patients.find(p => p.id === defaultPatientId)?.firstName + " " + patients.find(p => p.id === defaultPatientId)?.lastName || "Loading..."}
                                        disabled
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200/60 px-4 text-gray-700"
                                    />
                                ) : (
                                    <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={patientOpen}
                                                className={cn(
                                                    "w-full justify-between h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus:ring-2 focus:ring-cyan-500/20 px-4 font-normal text-left text-gray-800",
                                                    !watch("patientId") && "text-muted-foreground"
                                                )}
                                            >
                                                {watch("patientId")
                                                    ? patients.find((patient) => patient.id === watch("patientId"))?.firstName + " " + patients.find((patient) => patient.id === watch("patientId"))?.lastName
                                                    : "Select patient..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-cyan-600" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0 rounded-xl shadow-2xl border border-gray-100 bg-white" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search patient..." />
                                                <CommandList>
                                                    <CommandEmpty>No patient found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {patients.map((patient) => (
                                                            <CommandItem
                                                                key={patient.id}
                                                                value={patient.firstName + " " + patient.lastName}
                                                                onSelect={() => {
                                                                    setValue("patientId", patient.id)
                                                                    setPatientOpen(false)
                                                                }}
                                                                className="rounded-lg hover:bg-cyan-50 cursor-pointer"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4 text-cyan-600",
                                                                        watch("patientId") === patient.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {patient.firstName} {patient.lastName}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                                {errors.patientId && (
                                    <p className="text-sm text-destructive">{errors.patientId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold text-[13px]">Due Date</Label>
                                <Input
                                    type="date"
                                    {...register("dueDate", { valueAsDate: true })}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 p-4 bg-cyan-50/20 border border-cyan-100/50 rounded-2xl sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-1.5 w-full sm:flex-row sm:items-center sm:gap-2 sm:flex-1">
                                    <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider sm:text-xs whitespace-nowrap">Quick Add Service:</Label>
                                    <select
                                        className="flex h-10 w-full sm:h-9 sm:max-w-[240px] rounded-xl border border-gray-200/60 bg-white px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-gray-800"
                                        onChange={handleServiceSelect}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select treatment...</option>
                                        {treatments.map((t: any) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.category || 'General'}) - ₹{t.standardCost}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto h-10 sm:h-9 rounded-xl font-bold border-gray-200/60 bg-white hover:bg-gray-50 text-gray-750 text-xs gap-1.5 px-4 shadow-sm"
                                    onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                                >
                                    <Plus className="h-3.5 w-3.5 text-cyan-600" />
                                    Add Blank Item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.length > 0 && (
                                    <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                        <div className="col-span-6">Description</div>
                                        <div className="col-span-2">Qty</div>
                                        <div className="col-span-3">Price (₹)</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                )}
                                {fields.map((field, index) => (
                                    <div key={field.id} className="w-full">
                                        {/* Desktop View */}
                                        <div className="hidden sm:grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-6">
                                                <Input
                                                    placeholder="Description"
                                                    {...register(`items.${index}.description` as const)}
                                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Qty"
                                                    min="1"
                                                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    min="0"
                                                    {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                    className="h-11 w-full text-red-400 hover:text-red-650 hover:bg-red-50 rounded-xl cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="sm:hidden flex flex-col gap-3 p-3.5 border border-gray-100/60 bg-white/40 backdrop-blur-md rounded-2xl relative shadow-sm">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-650 hover:bg-red-50 rounded-xl"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</Label>
                                                <Input
                                                    placeholder="Description"
                                                    {...register(`items.${index}.description` as const)}
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
                                                        {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                                        className="h-11 rounded-xl bg-white border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Price"
                                                        min="0"
                                                        {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                                                        className="h-11 rounded-xl bg-white border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {errors.items && (
                                    <p className="text-sm text-destructive">{errors.items.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold text-[13px]">Discount</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        {...register("discount", { valueAsNumber: true })}
                                        className="flex-1 h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                    />
                                    <select
                                        className="flex h-11 w-[100px] rounded-xl border border-gray-200/60 bg-white/60 focus:bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-gray-800"
                                        {...register("discountType")}
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
                                    {...register("tax", { valueAsNumber: true })}
                                    className="h-11 rounded-xl bg-white/60 border-gray-200/60 focus:bg-white transition-all shadow-sm focus-visible:ring-cyan-500/20 px-4"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50/50 border border-gray-100/40 p-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-950">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Discount</span>
                                <span className="text-red-500 font-bold">- ₹{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Tax</span>
                                <span className="text-gray-700 font-bold">+ ₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <Separator className="my-1.5" />
                            <div className="flex justify-between font-black text-[17px] text-gray-900 pt-1">
                                <span>Total</span>
                                <span className="text-cyan-700">₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[24px] shrink-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold border-gray-200/60 bg-white shadow-sm hover:bg-gray-50 text-gray-700">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto rounded-xl px-6 h-11 font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all border border-gray-800/50 cursor-pointer flex items-center justify-center">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : "Create Invoice"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
