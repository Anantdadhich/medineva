import { getCurrentUser, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAccessCodesAction } from "@/lib/actions/access-codes"
import { Header } from "@/components/layout/header"
import { AdminCodesClient } from "./admin-codes-client"

export const dynamic = "force-dynamic"

export default async function AdminCodesPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/sign-in")
    }

    if (!isAdmin(user.email)) {
        redirect("/dashboard")
    }

    const res = await getAccessCodesAction()
    const codes = res.codes || []

    return (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
            <Header
                title="Access Code Manager"
                description="Generate, track, and monitor active invite codes for new clinic registrations."
                clinicId={user.clinicId || ""}
            />

            <div className="flex min-h-0 flex-1 flex-col space-y-6">
                <AdminCodesClient initialCodes={codes as any} />
            </div>
        </div>
    )
}
