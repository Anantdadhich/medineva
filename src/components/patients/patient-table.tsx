"use client"

import { format } from "date-fns"
import { MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Patient {
    id: string
    firstName: string
    lastName: string
    email?: string
    phone: string
    dateOfBirth: Date
    gender?: string
    lastVisitDate?: Date
}

interface PatientTableProps {
    patients: Patient[]
    onView: (patient: Patient) => void
    onEdit: (patient: Patient) => void
    onDelete: (patient: Patient) => void
}

const getAvatarStyle = (firstName: string, lastName: string) => {
    const name = `${firstName} ${lastName}`
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % 5
    const styles = [
        { bg: "bg-cyan-50 text-cyan-700 border-cyan-100", dot: "bg-cyan-500" },
        { bg: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-500" },
        { bg: "bg-purple-50 text-purple-700 border-purple-100", dot: "bg-purple-500" },
        { bg: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-500" },
        { bg: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500" }
    ]
    return styles[index]
}

export function PatientTable({ patients, onView, onEdit, onDelete }: PatientTableProps) {
    const calculateAge = (dob: Date) => {
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const isActive = (lastVisit?: Date) => {
        if (!lastVisit) return false
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return new Date(lastVisit) >= thirtyDaysAgo
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-[20px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/30 border-b border-gray-100/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Age/Gender</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Last Visit</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/30">
                            {patients.map((patient) => {
                                const avatarStyle = getAvatarStyle(patient.firstName, patient.lastName)
                                const activeStatus = isActive(patient.lastVisitDate)
                                return (
                                    <tr key={patient.id} className="group hover:bg-white/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-bold text-[13px] shadow-sm transition-all duration-250 group-hover:scale-105 ${avatarStyle.bg}`}>
                                                    {patient.firstName.charAt(0).toUpperCase()}{patient.lastName.charAt(0).toUpperCase()}
                                                </div>
                                                <div 
                                                    onClick={() => onView(patient)}
                                                    className="font-bold text-[15px] text-gray-900 group-hover:text-cyan-700 transition-colors cursor-pointer"
                                                >
                                                    {patient.firstName} {patient.lastName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 text-[13px]">
                                                <a 
                                                    href={`tel:${patient.phone}`} 
                                                    className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 font-medium transition-colors w-fit"
                                                >
                                                    <Phone className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                                    {patient.phone}
                                                </a>
                                                {patient.email && (
                                                    <a 
                                                        href={`mailto:${patient.email}`} 
                                                        className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 font-medium transition-colors w-fit"
                                                    >
                                                        <Mail className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                                        {patient.email}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-gray-600 font-semibold">
                                            {calculateAge(patient.dateOfBirth)}y
                                            {patient.gender && <span className="text-gray-400 font-normal ml-1">• {patient.gender}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-gray-500 font-semibold">
                                            {patient.lastVisitDate
                                                ? format(new Date(patient.lastVisitDate), "MMM dd, yyyy")
                                                : "Never"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-all duration-200
                                                ${activeStatus 
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100/60" 
                                                    : "bg-gray-50 text-gray-500 border-gray-100"}
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${activeStatus ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                                                {activeStatus ? "Active" : "Inactive"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => onView(patient)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => onEdit(patient)}
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => onDelete(patient)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {patients.map((patient) => {
                    const avatarStyle = getAvatarStyle(patient.firstName, patient.lastName)
                    const activeStatus = isActive(patient.lastVisitDate)
                    return (
                        <Card key={patient.id} className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px] overflow-hidden hover:shadow-md transition-all duration-200">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border font-bold text-[15px] shadow-sm ${avatarStyle.bg}`}>
                                            {patient.firstName.charAt(0).toUpperCase()}{patient.lastName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 
                                                onClick={() => onView(patient)}
                                                className="font-bold text-[16px] text-gray-900 leading-tight truncate hover:text-cyan-700 transition-colors cursor-pointer"
                                            >
                                                {patient.firstName} {patient.lastName}
                                            </h3>
                                            <p className="text-[13px] text-gray-500 font-medium mt-1">
                                                {calculateAge(patient.dateOfBirth)}y
                                                {patient.gender && ` • ${patient.gender}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border mr-1
                                            ${activeStatus 
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100/60" 
                                                : "bg-gray-50 text-gray-500 border-gray-100"}
                                        `}>
                                            <span className={`w-1 h-1 rounded-full ${activeStatus ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                                            {activeStatus ? "Active" : "Inactive"}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg cursor-pointer"
                                            onClick={() => onView(patient)}
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg cursor-pointer"
                                            onClick={() => onEdit(patient)}
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                            onClick={() => onDelete(patient)}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-white/50 rounded-[14px] border border-gray-100 p-4 space-y-3 mb-4">
                                    <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
                                        <Phone className="h-4 w-4 text-cyan-600/70 shrink-0" />
                                        <a href={`tel:${patient.phone}`} className="hover:text-cyan-700 transition-colors">
                                            {patient.phone}
                                        </a>
                                    </div>
                                    {patient.email && (
                                        <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
                                            <Mail className="h-4 w-4 text-cyan-600/70 shrink-0" />
                                            <a href={`mailto:${patient.email}`} className="hover:text-cyan-700 transition-colors truncate">
                                                {patient.email}
                                            </a>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-gray-100/60 flex items-center justify-between text-[12px]">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Last Visit</span>
                                        <span className="text-gray-900 font-bold">
                                            {patient.lastVisitDate
                                                ? format(new Date(patient.lastVisitDate), "MMM dd, yyyy")
                                                : "Never"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => onView(patient)}
                                        variant="outline"
                                        className="flex-1 rounded-xl h-9 text-[13px] font-bold border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                                    >
                                        <Eye className="mr-2 h-3.5 w-3.5" />
                                        View
                                    </Button>
                                    <Button
                                        onClick={() => onEdit(patient)}
                                        variant="outline"
                                        className="flex-1 rounded-xl h-9 text-[13px] font-bold border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                                    >
                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
