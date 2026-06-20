"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { verifyAccessCodeAction } from "@/lib/actions/access-codes"
import { KeyRound, Loader2, LogOut } from "lucide-react"

export default function VerifyAccessPage() {
    const [code, setCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const { signOut } = useClerk()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) {
            setError("Please enter your access code.")
            return
        }

        setError(null)
        setIsPending(true)

        try {
            const res = await verifyAccessCodeAction(code)
            if (res.success) {
                router.refresh()
                router.push("/dashboard")
            } else {
                setError(res.error || "Failed to verify access code.")
                setIsPending(false)
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.")
            setIsPending(false)
        }
    }

    const handleSignOut = () => {
        signOut({ redirectUrl: "/sign-in" })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/60 via-rose-50/40 to-cyan-50/60 px-4">
            <div className="w-full max-w-[440px] rounded-[24px] border border-white/70 bg-white/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-md ring-1 ring-white/15">
                        <KeyRound className="h-[22px] w-[22px] text-cyan-400" strokeWidth={2.25} />
                    </div>
                    <h1 className="text-[22px] font-bold tracking-tight text-gray-900">Unlock Medineva</h1>
                    <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                        Medineva is currently invite-only. Enter your practice's access code to unlock your dashboard.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                            Access Code
                        </label>
                        <div className="relative">
                            <input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="CARE-XXXX-XXXX"
                                disabled={isPending}
                                className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[14px] font-medium placeholder:text-gray-400 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-[13px] font-medium text-rose-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex h-11 items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[14px] shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-cyan-400" />
                        ) : (
                            "Unlock Dashboard"
                        )}
                    </button>
                </form>

                <div className="mt-6 border-t border-gray-200/40 pt-4 flex justify-center">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out of Account
                    </button>
                </div>
            </div>
        </div>
    )
}
