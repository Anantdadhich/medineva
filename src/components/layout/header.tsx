"use client"

import { Bell, Search, Plus, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "./global-search"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebarlayout"

interface HeaderProps {
    title: string
    description?: string
    children?: React.ReactNode
    clinicId?: string
    action?: {
        label: string
        onClick: () => void
        icon?: LucideIcon
        variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    }
}

export function Header({ title, description, children, action, clinicId }: HeaderProps) {
    const Icon = action?.icon || Plus
    const { state, isMobile } = useSidebar()

    return (
        <header className="mx-0 mt-0 flex flex-col justify-between gap-4 rounded-[24px] border border-white bg-white/60 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-2xl md:h-[72px] md:flex-row md:items-center md:gap-0 md:py-0 md:pl-6 md:pr-6">
            <div className="flex items-center gap-4">
                {(state === "collapsed" || isMobile) && (
                    <SidebarTrigger className="h-10 w-10 text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white shadow-sm border border-gray-200/50 rounded-xl transition-all" />
                )}
                <div>
                    <h1 className="text-[20px] md:text-[24px] font-bold tracking-tight text-gray-900 leading-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">{description}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {/* Global Search */}
                {clinicId && <GlobalSearch clinicId={clinicId} />}

                {children}

                {/* Primary action */}
                {action && (
                    <Button 
                        onClick={action.onClick} 
                        variant={action.variant || "default"} 
                        className="h-10 w-10 sm:w-auto sm:px-6 gap-0 sm:gap-2 rounded-xl flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all hover:shadow-lg border border-gray-800/50"
                    >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                        <span className="font-semibold text-[13px] tracking-wide hidden sm:inline">{action.label}</span>
                    </Button>
                )}
            </div>
        </header>
    )
}
