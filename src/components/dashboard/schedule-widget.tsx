"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths, subMonths, isSameDay } from "date-fns"
import { useRouter } from "next/navigation"

interface ScheduleWidgetProps {
    appointments?: any[]
}

export function ScheduleWidget({ appointments = [] }: ScheduleWidgetProps) {
    // Dynamic Calendar Logic
    const [currentDate, setCurrentDate] = useState(new Date())
    const router = useRouter()

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    })

    const startingDayIndex = getDay(startOfMonth(currentDate))
    
    // Create empty slots for proper day alignment
    const emptyDays = Array.from({ length: startingDayIndex }).map((_, i) => (
        <div key={`empty-${i}`} className="py-1 opacity-0">.</div>
    ))

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    // Real dynamic dots based on passed appointments
    const hasAppointment = (date: Date) => {
        return appointments.some(apt => isSameDay(new Date(apt.scheduledAt), date))
    }

    return (
        <Card className="min-w-0 overflow-hidden bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px] select-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[16px]">Schedule</CardTitle>
                <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
                    <span className="w-20 text-right">{format(currentDate, "MMMM yyyy")}</span>
                    <div className="flex gap-1 ml-2">
                        <ChevronLeft 
                            onClick={prevMonth}
                            className="h-4 w-4 cursor-pointer hover:text-gray-900 transition-colors" 
                        />
                        <ChevronRight 
                            onClick={nextMonth}
                            className="h-4 w-4 cursor-pointer hover:text-gray-900 transition-colors" 
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    <div><span className="hidden sm:inline">Sun</span><span className="sm:hidden">S</span></div>
                    <div><span className="hidden sm:inline">Mon</span><span className="sm:hidden">M</span></div>
                    <div><span className="hidden sm:inline">Tue</span><span className="sm:hidden">T</span></div>
                    <div><span className="hidden sm:inline">Wed</span><span className="sm:hidden">W</span></div>
                    <div><span className="hidden sm:inline">Thu</span><span className="sm:hidden">T</span></div>
                    <div><span className="hidden sm:inline">Fri</span><span className="sm:hidden">F</span></div>
                    <div><span className="hidden sm:inline">Sat</span><span className="sm:hidden">S</span></div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[13px] font-medium text-gray-600">
                    {emptyDays}
                    
                    {daysInMonth.map((day, i) => {
                        const today = isToday(day)
                        const busy = hasAppointment(day)
                        
                        return (
                            <div 
                                key={i} 
                                onClick={() => {
                                    const dateStr = format(day, "yyyy-MM-dd")
                                    router.push(`/schedule?date=${dateStr}`)
                                }}
                                className={`py-1 rounded-md cursor-pointer transition-all relative
                                    ${today ? 'bg-gray-900 text-white shadow-md font-bold' : 'hover:bg-gray-100'}
                                    ${!isSameMonth(day, currentDate) ? 'text-gray-300' : ''}
                                `}
                            >
                                {format(day, "d")}
                                
                                {/* Notification Dot for appointments */}
                                {busy && !today && (
                                    <div className="absolute top-1 right-1 w-1 h-1 bg-cyan-500 rounded-full" />
                                )}
                                {busy && today && (
                                    <div className="absolute top-1 right-1 w-1 h-1 bg-amber-400 rounded-full" />
                                )}
                            </div>
                        )
                    })}
                </div>
                
                {/* Working creativity: Quick Summary underneath */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span>Upcoming</span>
                    </div>
                    <span>{appointments.length} Appts</span>
                </div>
            </CardContent>
        </Card>
    )
}
