import { redirect } from "next/navigation"
import Image from "next/image"
import prisma from "@/lib/prisma"
import { PublicPatientForm } from "@/components/patients/public-patient-form"

export default async function PublicRegistrationPage(props: { params: Promise<{ clinicId: string }> }) {
    const params = await props.params;

    // Server-side check: Ensure clinic exists and is valid
    const clinic = await prisma.clinic.findUnique({
        where: { id: params.clinicId }
    })

    if (!clinic) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[24px] shadow-xl text-center max-w-sm border border-gray-100">
                    <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4">
                        <span className="text-red-500 text-2xl font-bold">X</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-500 text-[14px]">
                        This registration link is not valid or has expired. Please scan the QR code at the reception desk again.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden selection:bg-cyan-100">
            {/* Soft Background gradients for a premium feel even on public pages */}
            <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-cyan-600 to-cyan-800" />

            {/* Glass decoration */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-20 left-10 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">

                {/* Branding Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg mb-4">
                        <Image
                            src="/pmslogo.png"
                            alt="Medineva Logo"
                            width={48}
                            height={48}
                            className="rounded-xl drop-shadow-md"
                        />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                        {clinic.name || "Clinic"} Patient Intake Form
                    </h1>
                    <p className="text-cyan-100/80 mt-2 font-medium">
                        Fast, secure, and touch-free registration
                    </p>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-xl bg-white/80 backdrop-blur-3xl p-6 sm:p-8 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                        <p className="text-[14px] text-gray-500 mt-1 font-medium">
                            Please fill in your information to speed up your check-in process.
                        </p>
                    </div>

                    <PublicPatientForm clinicId={params.clinicId} />
                </div>
            </div>
        </div>
    )
}
