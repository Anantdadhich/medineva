import { Sidebar } from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebarlayout"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/sign-in")
    }

    const userIsAdmin = isAdmin(user.email)

    if (!user.hasAccess && !userIsAdmin) {
        redirect("/verify-access")
    }

    return (
        <SidebarProvider className="bg-gradient-to-br from-amber-50/60 via-rose-50/40 to-cyan-50/60 min-h-screen selection:bg-cyan-100 selection:text-cyan-900">
            <Sidebar isAdmin={userIsAdmin} />
            <SidebarInset className="bg-transparent min-h-0 min-w-0">
                <main className="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 pb-8 pt-2 md:px-6 md:pt-3">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
