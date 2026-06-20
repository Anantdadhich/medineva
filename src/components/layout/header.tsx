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
        <header className="mx-0 mt-0 flex flex-row items-center justify-between gap-3 rounded-2xl border border-white bg-white/60 px-3.5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-2xl md:h-[72px] md:px-6 md:py-0 md:rounded-[24px]">
            <div className="flex items-center gap-3 min-w-0">
                {(state === "collapsed" || isMobile) && (
                    <SidebarTrigger className="h-9 w-9 text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white shadow-sm border border-gray-200/50 rounded-xl transition-all shrink-0" />
                )}
                <div className="min-w-0">
                    <h1 className="text-[16px] md:text-[24px] font-bold tracking-tight text-gray-900 leading-tight truncate">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[11px] md:text-[13px] text-gray-500 font-medium mt-0.5 truncate hidden sm:block">{description}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* Global Search */}
                {clinicId && <GlobalSearch clinicId={clinicId} />}

                {children}

                {/* Primary action */}
                {action && (
                    <Button 
                        onClick={action.onClick} 
                        variant={action.variant || "default"} 
                        className="h-9 w-9 sm:h-10 sm:w-auto sm:px-6 gap-0 sm:gap-2 rounded-xl flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md transition-all hover:shadow-lg border border-gray-800/50"
                    >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                        <span className="font-semibold text-[13px] tracking-wide hidden sm:inline">{action.label}</span>
                    </Button>
                )}
            </div>
        </header>
    )
}
