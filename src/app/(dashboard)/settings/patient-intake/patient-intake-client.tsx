"use client"

import { Header } from "@/components/layout/header"
import { ClinicQrGenerator } from "@/components/settings/clinic-qr-generator"
import { QrCode } from "lucide-react"

const steps = [
    {
        title: "Print or display the QR code",
        body: "Put it at reception, on a standee, or add it to your website. Patients only need their phone camera.",
    },
    {
        title: "They fill the form on their phone",
        body: "Basic details and health information go straight into your practice—less paperwork at the desk.",
    },
    {
        title: "You keep using Medineva as usual",
        body: "Find new patients under Patients, book visits from Schedule, and send messages from Messages when you need to.",
    },
]

export function PatientIntakeClient({ clinicId }: { clinicId: string }) {
    return (
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-4xl flex-col gap-8">
            <Header
                title="Patient self-registration"
                description="QR code and link for new patients—no extra apps, just a simple form on their phone."
                clinicId={clinicId}
            />

            <div className="rounded-[20px] border border-white/60 bg-white/70 p-4 sm:p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
                <div className="mb-6 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50/90 text-cyan-700">
                        <QrCode className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900">How it works</h2>
                        <p className="mt-1 text-[14px] leading-relaxed text-gray-500">
                            Three short steps your front desk can explain in seconds.
                        </p>
                    </div>
                </div>
                <ol className="space-y-4">
                    {steps.map((step, i) => (
                        <li key={step.title} className="flex gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[13px] font-bold text-white">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">{step.title}</p>
                                <p className="mt-1 text-[14px] leading-relaxed text-gray-600">{step.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            <ClinicQrGenerator clinicId={clinicId} />
        </div>
    )
}
