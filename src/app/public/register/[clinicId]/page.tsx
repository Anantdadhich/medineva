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
        <div className="min-h-screen flex flex-col bg-[#eef2f6] relative selection:bg-cyan-100">
            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 lg:p-8">
                {/* Clean branding at top of card */}
                <div className="w-full max-w-3xl bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">

                    {/* Card Header matching screenshot */}
                    <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#f1f5f9] flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-2xl font-semibold text-[#0f172a]">
                                Patient information
                            </h1>
                            <p className="text-[12px] sm:text-[13px] text-gray-500 font-medium mt-0.5 break-words">
                                Registration for <span className="font-bold text-cyan-600">{clinic.name}</span>
                            </p>
                        </div>
                        <div className="shrink-0">
                            {clinic.logo ? (
                                <Image
                                    src={clinic.logo}
                                    alt={`${clinic.name} Logo`}
                                    width={40}
                                    height={40}
                                    className="rounded-lg object-contain"
                                />
                            ) : (
                                <Image
                                    src="/pmslogo.png"
                                    alt="Medineva Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-lg opacity-85"
                                />
                            )}
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-8">
                        <PublicPatientForm clinicId={params.clinicId} />
                    </div>
                </div>
            </div>
        </div>
    )
}
