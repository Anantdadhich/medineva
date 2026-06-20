import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/query-provider"
import { PatientProvider } from "@/providers/patient-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Medineva | Smart Practice Management for Modern Clinics",
    template: "%s | Medineva",
  },
  description: "Streamline your clinic with our all-in-one Practice Management System. Manage patient records, appointments, billing, and treatment plans efficiently.",
  keywords: [
    "Practice Management",
    "Clinic Management System",
    "Clinic Software",
    "Patient Management",
    "Scheduling Software",
    "Electronic Health Records",
    "Clinical Automation",
    "Medineva",
  ],
  authors: [{ name: "Medineva Team" }],
  creator: "Medineva",
  applicationName: "Medineva",

  icons: {
    icon: "/pmslogo.png",
    shortcut: "/pmslogo.png",
    apple: "/pmslogo.png",
  },

}

import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <QueryProvider>
            <PatientProvider>
              <TooltipProvider delayDuration={0}>
                {children}
              </TooltipProvider>
            </PatientProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}