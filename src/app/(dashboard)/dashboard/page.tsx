import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    getDashboardStats,
    getUpcomingAppointments,
    getRecentActivity,
    getRevenueChartData,
    getRevenueChartDataWeekly,
    getAppointmentStatusDistribution,
    getRecentMessages,
    getPatientGrowthData,
    getPatientGrowthDataWeekly,
    getTopServicesData,
    getMonthlyComparisonData
} from "@/lib/actions/dashboard"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { CircularProgressStatCard } from "@/components/dashboard/circular-progress"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { MessagesWidget } from "@/components/dashboard/messages-widget"
import { ScheduleWidget } from "@/components/dashboard/schedule-widget"
import { Clock } from "lucide-react"
import { PatientGrowthChart } from "@/components/dashboard/patient-growth-chart"
import { TopServicesChart } from "@/components/dashboard/top-services-chart"
import { MonthlyComparisonChart } from "@/components/dashboard/monthly-comparison-chart"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/sign-in")
    }

    if (!user.clinicId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>No clinic associated with your account. Please contact support.</p>
            </div>
        )
    }

    const clinicId = user.clinicId
    const [
        stats,
        upcomingAppointments,
        recentActivity,
        revenueDataMonthly,
        revenueDataWeekly,
        appointmentStatusData,
        recentMessages,
        patientGrowthDataMonthly,
        patientGrowthDataWeekly,
        topServicesData,
        monthlyComparisonData
    ] = await Promise.all([
        getDashboardStats(clinicId),
        getUpcomingAppointments(clinicId),
        getRecentActivity(clinicId),
        getRevenueChartData(clinicId),
        getRevenueChartDataWeekly(clinicId),
        getAppointmentStatusDistribution(clinicId),
        getRecentMessages(clinicId),
        getPatientGrowthData(clinicId),
        getPatientGrowthDataWeekly(clinicId),
        getTopServicesData(clinicId),
        getMonthlyComparisonData(clinicId)
    ])

    return (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
            <Header
                title="Dashboard Overview"
                description={`Welcome back, Dr ${user.firstName}. Detailed information about your clinic's health.`}
                clinicId={clinicId}
            />

            <div className="flex min-h-0 flex-1 flex-col space-y-6">
                <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                    {/* LEFT MAIN COLUMN: 2/3 width */}
                    <div className="min-w-0 space-y-6 lg:col-span-2">

                        {/* Welcome Banner */}
                        <WelcomeBanner userName={`${user.firstName} ${user.lastName}`} />

                        {/* 4 Stat Cards */}
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            {stats.map((stat: any, index: number) => (
                                <CircularProgressStatCard
                                    key={index}
                                    title={stat.title}
                                    value={stat.isCurrency ? `₹${Number(stat.value).toLocaleString()}` : stat.value}
                                    progressValue={stat.progress || 0}
                                    label={`${stat.progress || 0}%`}
                                    description={stat.description}
                                />
                            ))}
                        </div>

                        {/* Doctor's List (Upcoming Appointments Table) */}
                        <Card className="overflow-hidden bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px]">
                            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-gray-100/50">
                                <CardTitle className="text-[17px] font-bold text-gray-800">Clinical Appointments</CardTitle>
                                <Link href="/schedule" className="text-[13px] text-cyan-600 font-medium hover:text-cyan-700">
                                    See All ›
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Desktop Table View */}
                                <div className="w-full overflow-x-auto hidden md:block">
                                    <div className="min-w-full inline-block align-middle">
                                        <table className="min-w-full px-2">
                                            <thead className="bg-gray-50/50 border-b border-gray-100/50">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Doctor Name</th>
                                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Treatment</th>
                                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50/50">
                                                {upcomingAppointments.length === 0 ? (
                                                    <tr><td colSpan={4} className="text-center py-6 text-gray-400 text-sm">No scheduled appointments</td></tr>
                                                ) : upcomingAppointments.map((apt: any) => (
                                                    <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[13px]">
                                                                    {apt.doctor?.firstName?.[0] || 'D'}{apt.doctor?.lastName?.[0] || 'R'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-[14px] font-bold text-gray-900">
                                                                        Dr. {apt.doctor?.firstName ? `${apt.doctor.firstName} ${apt.doctor.lastName || ''}`.trim() : 'Assigned'}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-400 font-medium">{apt.patient.firstName} {apt.patient.lastName}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="text-[14px] font-semibold text-gray-800">{apt.type}</div>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <Badge variant={apt.status.toLowerCase() as any} className="shadow-none px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                                                {apt.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap text-[13px] font-medium text-gray-500">
                                                            {format(new Date(apt.scheduledAt), "MMM dd, yyyy")} <br />
                                                            <span className="text-[11px] text-gray-400">{format(new Date(apt.scheduledAt), "HH:mm")}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mobile Card List View */}
                                <div className="md:hidden divide-y divide-gray-100/50">
                                    {upcomingAppointments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">No scheduled appointments</div>
                                    ) : upcomingAppointments.map((apt: any) => (
                                        <div key={apt.id} className="p-4 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[13px]">
                                                        {apt.doctor?.firstName?.[0] || 'D'}{apt.doctor?.lastName?.[0] || 'R'}
                                                    </div>
                                                    <div>
                                                        <div className="text-[14px] font-bold text-gray-900 leading-tight">
                                                            Dr. {apt.doctor?.firstName ? `${apt.doctor.firstName} ${apt.doctor.lastName || ''}`.trim() : 'Assigned'}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 font-medium">Patient: {apt.patient.firstName} {apt.patient.lastName}</div>
                                                    </div>
                                                </div>
                                                <Badge variant={apt.status.toLowerCase() as any} className="shadow-none px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider">
                                                    {apt.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-[13px] text-gray-600">
                                                <span className="font-semibold text-gray-800">{apt.type}</span>
                                                <span className="text-gray-400 font-medium text-[11px]">
                                                    {format(new Date(apt.scheduledAt), "MMM dd · HH:mm")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bottom Row: Messages & Schedule */}
                        <div className="grid gap-6 md:grid-cols-2 w-full min-w-0">
                            <MessagesWidget messages={recentMessages} />
                            <ScheduleWidget appointments={upcomingAppointments} />
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR COLUMN: timeline & comparison */}
                    <div className="min-w-0 space-y-6 lg:col-span-1">

                        <PatientGrowthChart weeklyData={patientGrowthDataWeekly} monthlyData={patientGrowthDataMonthly} />

                        {/* Appointment Timeline */}
                        <Card className="bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px] flex flex-col h-[520px]">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 shrink-0">
                                <CardTitle className="text-[16px]">Appointment Timeline</CardTitle>
                                <span className="text-[12px] text-cyan-600 font-medium cursor-pointer">See All ›</span>
                            </CardHeader>
                            <CardContent className="overflow-y-auto flex-1 pr-2 custom-scrollbar min-h-0">
                                <div className="space-y-5 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {recentActivity.length === 0 ? (
                                        <div className="text-center text-gray-400 text-sm py-4 relative z-10 bg-white/70">No activity today</div>
                                    ) : recentActivity.map((activity: any, index: number) => (
                                        <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-5 md:left-1/2 -translate-x-1/2 z-10">
                                                <div className={`w-2.5 h-2.5 rounded-full ${activity.action === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                            </div>
                                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] ml-10 md:ml-0 p-3.5 rounded-[14px] border border-gray-100/50 bg-white/50 shadow-sm transition-all hover:bg-white text-left">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-bold text-[13px] text-gray-900">{format(new Date(activity.time), "dd-MMM-yy")}</div>
                                                    <div className="text-[11px] text-gray-400">{format(new Date(activity.time), "HH:mm")}</div>
                                                </div>
                                                <div className="text-[12px] font-semibold text-gray-800 leading-tight">{activity.treatment}</div>
                                                <div className="text-[11px] text-gray-500 mt-1 truncate">{activity.patient}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* FULL WIDTH BOTTOM ROW: Analytics */}
                <section className="space-y-6 pt-2">

                    <RevenueChart weeklyData={revenueDataWeekly} monthlyData={revenueDataMonthly} />

                    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
                        {/*
                        <div className="min-w-0">
                            <TopServicesChart data={topServicesData} />
                        </div>
                        <div className="min-w-0">
                            <MonthlyComparisonChart data={monthlyComparisonData} currentYear={new Date().getFullYear()} />
                        </div>
                     */ }
                    </div>
                </section>
            </div>
        </div>
    )
}