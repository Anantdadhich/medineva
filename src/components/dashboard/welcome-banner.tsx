"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export function WelcomeBanner({ userName }: { userName: string }) {
    const [greeting, setGreeting] = useState("Welcome back")

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) {
            setGreeting("Good morning")
        } else if (hour < 17) {
            setGreeting("Good afternoon")
        } else {
            setGreeting("Good evening")
        }
    }, [])

    const docName = userName?.trim().replace(/^Dr\.\s+/i, "") || "Doctor"
    const firstName = docName.split(" ")[0]

    return (
        <Card className="col-span-full lg:col-span-2 overflow-hidden bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative min-h-fit sm:min-h-[220px]">
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-60 pointer-events-none hidden md:block">
                <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-400 blur-[80px] opacity-20" />
                <div className="absolute bottom-[-20%] right-[10%] w-[200px] h-[200px] rounded-full bg-amber-400 blur-[60px] opacity-20" />
            </div>

            <CardContent className="relative z-10 p-4 sm:p-8 flex flex-col justify-center h-full">
                <h2 className="text-[18px] sm:text-[28px] md:text-[32px] font-bold text-gray-900 leading-tight tracking-tight mb-1.5">
                    {greeting}, Dr. {firstName}
                </h2>
                <p className="text-[12px] sm:text-[15px] text-gray-500 font-medium mb-4 sm:mb-8 max-w-md">
                    Detailed information about your clinic's health, today's schedule, and recent patient activity.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <Button asChild className="rounded-xl h-[38px] sm:h-[44px] px-5 sm:px-6 bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all font-semibold text-[13px] sm:text-[14px] w-full sm:w-auto justify-center">
                        <Link href="/schedule">
                            See Appointment
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl h-[38px] sm:h-[44px] px-5 sm:px-6 border-gray-200 bg-white/50 hover:bg-white text-gray-700 font-semibold shadow-sm transition-all text-[13px] sm:text-[14px] w-full sm:w-auto justify-center">
                        <Link href="/patients">
                            Manage Patients
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
