import { Sidebar } from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebarlayout"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider className="bg-gradient-to-br from-amber-50/60 via-rose-50/40 to-cyan-50/60 min-h-screen selection:bg-cyan-100 selection:text-cyan-900">
            <Sidebar />
            <SidebarInset className="bg-transparent min-h-0 min-w-0">
                <main className="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 pb-8 pt-2 md:px-6 md:pt-3">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
