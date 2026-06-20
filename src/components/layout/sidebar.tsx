"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import {
    LayoutDashboard,
    Calendar,
    Users,
    Receipt,
    Settings,
    Stethoscope,
    LogOut,
    MessageSquare,
    KeyRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar as SidebarBase,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    useSidebar,
    SidebarRail,
} from "@/components/ui/sidebarlayout"

const navigationItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Schedule", href: "/schedule", icon: Calendar },
    { title: "Patients", href: "/patients", icon: Users },
    { title: "Messages", href: "/messages", icon: MessageSquare },
    { title: "Billing", href: "/billing", icon: Receipt },
    { title: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
    className?: string
    isAdmin?: boolean
}

export function Sidebar({ className, isAdmin = false }: SidebarProps) {
    const pathname = usePathname()
    const { isMobile, setOpenMobile } = useSidebar()
    const { user, isLoaded } = useUser()
    const { signOut } = useClerk()

    const handleSignOut = () => {
        signOut({ redirectUrl: "/sign-in" })
    }

    return (
        <SidebarBase
            variant="floating"
            collapsible="icon"
            className={cn(
                // Container: transparent so floating inner shows; no harsh border on desktop
                "border-0 bg-transparent",
                className
            )}
        >
            <div className="flex h-[76px] shrink-0 items-center justify-between gap-2 px-4 pt-3 pb-1 md:px-3">
                <Link
                    href="/dashboard"
                    onClick={() => {
                        if (isMobile) setOpenMobile(false)
                    }}
                    className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 shadow-md shadow-slate-900/15 ring-1 ring-white/15 transition-transform duration-200 hover:scale-[1.02]">
                        <Stethoscope className="h-[21px] w-[21px] text-cyan-400" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-[17px] font-bold tracking-tight text-slate-900">
                            Medineva
                        </p>
                        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
                            Practice suite
                        </p>
                    </div>
                </Link>

                {!isMobile && (
                    <SidebarTrigger
                        className="h-9 w-9 shrink-0 rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-900 group-data-[collapsible=icon]:hidden"
                    />
                )}
            </div>

            <SidebarContent className="gap-0 px-2 pb-4">
                <p className="mb-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 group-data-[collapsible=icon]:hidden">
                    Workspace
                </p>
                <SidebarMenu className="gap-1">
                    {navigationItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/" && pathname?.startsWith(item.href))

                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.title}
                                    className={cn(
                                        "h-11 rounded-xl px-3 transition-colors duration-200 outline-none",
                                        "bg-transparent hover:bg-slate-100/90 data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:shadow-md",
                                        isActive
                                            ? "text-white shadow-slate-900/10"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    <Link 
                                        href={item.href} 
                                        className="flex w-full items-center gap-3"
                                        onClick={() => {
                                            if (isMobile) setOpenMobile(false)
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-white/15 text-cyan-300"
                                                    : "bg-slate-100 text-slate-500 group-hover/menu-button:bg-white group-hover/menu-button:text-cyan-600"
                                            )}
                                        >
                                            <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 2} />
                                        </span>
                                        <span
                                            className={cn(
                                                "truncate text-[14px] font-medium group-data-[collapsible=icon]:hidden",
                                                isActive && "font-semibold"
                                            )}
                                        >
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>

                {isAdmin && (
                    <div className="mt-4">
                        <p className="mb-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 group-data-[collapsible=icon]:hidden">
                            Administration
                        </p>
                        <SidebarMenu className="gap-1">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === "/admin/codes"}
                                    tooltip="Access Codes"
                                    className={cn(
                                        "h-11 rounded-xl px-3 transition-colors duration-200 outline-none",
                                        "bg-transparent hover:bg-slate-100/90 data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:shadow-md",
                                        pathname === "/admin/codes"
                                            ? "text-white shadow-slate-900/10"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    <Link 
                                        href="/admin/codes" 
                                        className="flex w-full items-center gap-3"
                                        onClick={() => {
                                            if (isMobile) setOpenMobile(false)
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                pathname === "/admin/codes"
                                                    ? "bg-white/15 text-cyan-300"
                                                    : "bg-slate-100 text-slate-500 group-hover/menu-button:bg-white group-hover/menu-button:text-cyan-600"
                                            )}
                                        >
                                            <KeyRound className="h-[18px] w-[18px]" strokeWidth={pathname === "/admin/codes" ? 2.25 : 2} />
                                        </span>
                                        <span
                                            className={cn(
                                                "truncate text-[14px] font-medium group-data-[collapsible=icon]:hidden",
                                                pathname === "/admin/codes" && "font-semibold"
                                            )}
                                        >
                                            Access Codes
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/60 p-3">
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/60 p-2.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/90",
                        "group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none"
                    )}
                >
                    <Avatar className="h-9 w-9 shrink-0 border-2 border-white bg-white shadow-sm">
                        <AvatarImage src={user?.imageUrl} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-[11px] font-bold text-slate-600">
                            {isLoaded && user
                                ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                                : "··"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-[13px] font-semibold leading-tight text-slate-900">
                            {isLoaded && user ? `${user.firstName} ${user.lastName}` : "Loading…"}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                            {user?.primaryEmailAddress?.emailAddress || "—"}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 group-data-[collapsible=icon]:hidden"
                        onClick={handleSignOut}
                        aria-label="Sign out"
                    >
                        <LogOut className="h-4 w-4" strokeWidth={2.25} />
                    </Button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </SidebarBase>
    )
}
