"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient"
import { createPublicPatient } from "@/lib/actions/public-intake"

interface PublicPatientFormProps {
    clinicId: string
}

export function PublicPatientForm({ clinicId }: PublicPatientFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PatientFormValues>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            dateOfBirth: "",
            gender: undefined,
            address: "",
            notes: "",
        },
    })

    const handleFormSubmit = async (data: any) => {
        const validData = data as PatientFormValues
        setIsLoading(true)
        setSubmitError(null)

        try {
            const result = await createPublicPatient(clinicId, validData)

            if (result.error) {
                setSubmitError(result.error)
            } else {
                setIsSuccess(true)
            }
        } catch (error) {
            setSubmitError("An unexpected error occurred. Please try again or ask the reception for help.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
                    <div className="relative bg-emerald-50 border border-emerald-100 p-5 rounded-full shadow-sm">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600" strokeWidth={2.5} />
                    </div>
                </div>
                <div className="space-y-2 max-w-sm">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">You're all set!</h2>
                    <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
                        Thank you for providing your details. Please inform the receptionist that you have finished registering.
                    </p>
                </div>
                <Button
                    className="mt-8 rounded-lg bg-[#0c111d] hover:bg-black text-white font-semibold h-11 px-6 shadow-sm transition-all cursor-pointer"
                    onClick={() => window.location.reload()}
                >
                    Register Another Patient
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 animate-in fade-in duration-500">
            {/* Error Banner */}
            {submitError && (
                <div className="flex items-start gap-3 p-4 bg-red-50/80 border border-red-100 rounded-lg text-red-600 text-[14px] font-medium shadow-sm animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>{submitError}</p>
                </div>
            )}

            {/* Section: Basic information */}
            <div className="space-y-4">
                <h3 className="text-[16px] font-semibold text-[#0f172a]">
                    Basic information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {/* First Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-[13px] font-medium text-[#334155]">
                            First name<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="firstName"
                            placeholder="Enter first name"
                            disabled={isLoading}
                            className="h-11 rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 focus-visible:ring-offset-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all disabled:opacity-50"
                            {...register("firstName")}
                        />
                        {errors.firstName && (
                            <p className="text-[12px] font-medium text-red-500 mt-1">{errors.firstName.message as string}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-[13px] font-medium text-[#334155]">
                            Last name<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="lastName"
                            placeholder="Enter last name"
                            disabled={isLoading}
                            className="h-11 rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 focus-visible:ring-offset-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all disabled:opacity-50"
                            {...register("lastName")}
                        />
                        {errors.lastName && (
                            <p className="text-[12px] font-medium text-red-500 mt-1">{errors.lastName.message as string}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                        <Label htmlFor="dateOfBirth" className="text-[13px] font-medium text-[#334155]">
                            Date of birth<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            disabled={isLoading}
                            className="h-11 rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 focus-visible:ring-offset-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all disabled:opacity-50"
                            {...register("dateOfBirth")}
                        />
                        {errors.dateOfBirth && (
                            <p className="text-[12px] font-medium text-red-500 mt-1">{errors.dateOfBirth.message as string}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                        <Label htmlFor="gender" className="text-[13px] font-medium text-[#334155]">
                            Gender
                        </Label>
                        <div className="relative">
                            <select
                                id="gender"
                                disabled={isLoading}
                                className="flex h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-[15px] text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50 appearance-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                                {...register("gender")}
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-[13px] font-medium text-[#334155]">
                            Phone<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter phone"
                            disabled={isLoading}
                            className="h-11 rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 focus-visible:ring-offset-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all disabled:opacity-50"
                            {...register("phone")}
                        />
                        {errors.phone && (
                            <p className="text-[12px] font-medium text-red-500 mt-1">{errors.phone.message as string}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[13px] font-medium text-[#334155]">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            disabled={isLoading}
                            className="h-11 rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 focus-visible:ring-offset-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all disabled:opacity-50"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-[12px] font-medium text-red-500 mt-1">{errors.email.message as string}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Section: Address */}
            <div className="space-y-4">
                <h3 className="text-[16px] font-semibold text-[#0f172a]">
                    Address
                </h3>

                <div className="space-y-4">
                    {/* Address */}
                    <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-[13px] font-medium text-[#334155]">
                            Address
                        </Label>
                        <Input
                            id="address"
                            placeholder="Enter address"
                            disabled={isLoading}
                            className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 focus-visible:ring-offset-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all disabled:opacity-50"
                            {...register("address")}
                        />
                    </div>

                    {/* Medical Notes / Concerns */}
                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-[13px] font-medium text-[#334155]">
                            Medical History / Concerns
                        </Label>
                        <textarea
                            id="notes"
                            disabled={isLoading}
                            className="flex min-h-[100px] w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all disabled:opacity-50 resize-none"
                            placeholder="Any allergies, existing conditions, or dental concerns"
                            {...register("notes")}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Footer Section matching screenshot */}
            <div className="pt-6 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Info Text */}
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                    <Info className="h-4.5 w-4.5 text-gray-400 shrink-0" strokeWidth={2.2} />
                    <span>Please complete all fields marked with an asterisk (*).</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => reset()}
                        className="flex-1 sm:flex-none h-11 px-6 rounded-lg border border-[#e2e8f0] bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 sm:flex-none h-11 px-6 rounded-lg bg-[#0c111d] hover:bg-black text-white font-semibold shadow-sm transition-all cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}