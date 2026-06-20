"use client"

import { useEffect, useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Printer, Download, Link2, ImageDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

function buildIntakePath(clinicId: string) {
    return `/public/register/${clinicId}`
}

export function ClinicQrGenerator({ clinicId }: { clinicId: string }) {
    const { toast } = useToast()
    const qrRef = useRef<SVGSVGElement>(null)
    const [intakeUrl, setIntakeUrl] = useState("")

    useEffect(() => {
        setIntakeUrl(`${window.location.origin}${buildIntakePath(clinicId)}`)
    }, [clinicId])

    const getSvgString = () => {
        const svg = qrRef.current
        if (!svg) return null
        const serialized = new XMLSerializer().serializeToString(svg)
        return `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`
    }

    const handlePrint = () => {
        const svgData = getSvgString()
        if (!svgData) return

        const printWindow = window.open("", "_blank")
        if (!printWindow) {
            toast({
                variant: "destructive",
                title: "Pop-up blocked",
                description: "Allow pop-ups for this site to print the QR code.",
            })
            return
        }

        printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Patient intake QR</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .sheet { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 48px 40px; max-width: 420px; text-align: center; box-shadow: 0 20px 40px rgba(15,23,42,0.06); }
    h1 { margin: 0 0 8px; font-size: 22px; font-weight: 700; }
    p { margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.5; }
    svg { display: block; margin: 0 auto; width: 280px; height: 280px; }
    .url { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3bacc; word-break: break-all; }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>Scan to register</h1>
<p>Scan this code with your phone camera to open the form.</p>
    ${svgData.replace(/^<\?xml[^>]*>\s*/i, "")}
    <div class="url">${intakeUrl}</div>
  </div>
  <script>
    window.onload = function () { window.focus(); window.print(); };
  </script>
</body>
</html>`)
        printWindow.document.close()
    }

    const handleDownloadSvg = () => {
        const raw = getSvgString()
        if (!raw) return
        const blob = new Blob([raw], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `medineva-intake-qr-${clinicId.slice(0, 8)}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast({ title: "Download started", description: "SVG saved to your device." })
    }

    const handleDownloadPng = () => {
        const svg = qrRef.current
        if (!svg || !intakeUrl) return

        const svgString = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            const scale = 2
            const size = 512
            const canvas = document.createElement("canvas")
            canvas.width = size * scale
            canvas.height = size * scale
            const ctx = canvas.getContext("2d")
            if (!ctx) {
                URL.revokeObjectURL(svgUrl)
                return
            }
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(svgUrl)
                    if (!blob) {
                        toast({
                            variant: "destructive",
                            title: "Export failed",
                            description: "Could not create PNG. Try SVG instead.",
                        })
                        return
                    }
                    const pngUrl = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.href = pngUrl
                    link.download = `medineva-intake-qr-${clinicId.slice(0, 8)}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(pngUrl)
                    toast({ title: "Download started", description: "PNG saved to your device." })
                },
                "image/png",
                1
            )
        }
        img.onerror = () => {
            URL.revokeObjectURL(svgUrl)
            toast({
                variant: "destructive",
                title: "PNG export unavailable",
                description: "Download the SVG instead or check your connection.",
            })
        }
        img.src = svgUrl
    }

    const handleCopyLink = async () => {
        if (!intakeUrl) return
        try {
            await navigator.clipboard.writeText(intakeUrl)
            toast({ title: "Link copied", description: "Share this URL with patients if they cannot scan a code." })
        } catch {
            toast({
                variant: "destructive",
                title: "Could not copy",
                description: "Select the link and copy manually, or check browser permissions.",
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Section 1: Reception QR */}
            <Card className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-200/25 blur-3xl" />
                <CardHeader className="p-4 sm:p-6 space-y-1 border-b border-gray-100/50 pb-4">
                    <CardTitle className="text-[17px] font-bold text-gray-900">Reception QR code</CardTitle>
                    <CardDescription className="text-[14px] leading-relaxed text-gray-500">
                        Display this code at the front desk. It opens your clinic&apos;s public registration page on the
                        patient&apos;s phone.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
                    <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
                        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-inner">
                            {intakeUrl ? (
                                <QRCodeSVG
                                    ref={qrRef}
                                    value={intakeUrl}
                                    size={196}
                                    level="H"
                                    includeMargin
                                />
                            ) : (
                                <div
                                    className="flex h-[196px] w-[196px] items-center justify-center rounded-xl bg-slate-50 text-center text-[13px] text-slate-400"
                                    aria-hidden
                                >
                                    Loading QR…
                                </div>
                            )}
                        </div>
                        <div className="w-full max-w-sm flex-1 space-y-3 text-center md:text-left">
                            <p className="text-[13px] text-gray-500">
                                Tip: Print on A5 or laminate a smaller card so the code stays scannable at the desk.
                            </p>
                            <Button
                                type="button"
                                className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 md:w-auto md:min-w-[180px]"
                                onClick={handlePrint}
                                disabled={!intakeUrl}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print sheet
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Link & file downloads */}
            <Card className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
                <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-slate-200/40 blur-3xl" />
                <CardHeader className="p-4 sm:p-6 space-y-1 border-b border-gray-100/50 pb-4">
                    <CardTitle className="text-[17px] font-bold text-gray-900">Link &amp; downloads</CardTitle>
                    <CardDescription className="text-[14px] leading-relaxed text-gray-500">
                        Copy the registration URL for email or SMS, or download the QR as a vector (SVG) or image
                        (PNG) for posters and documents.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-5 pt-6 sm:pt-6">
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Registration URL
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                            <div className="flex min-h-12 flex-1 items-center rounded-xl border border-gray-200/80 bg-white/90 px-4 py-2 text-[13px] font-medium text-gray-700 shadow-sm">
                                <span className="min-w-0 flex-1 truncate">{intakeUrl || "…"}</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 shrink-0 rounded-xl border-gray-200 bg-white hover:bg-gray-50"
                                onClick={handleCopyLink}
                                disabled={!intakeUrl}
                            >
                                <Link2 className="mr-2 h-4 w-4" />
                                Copy link
                            </Button>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            QR files
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 flex-1 rounded-xl border-cyan-200/80 bg-cyan-50/40 text-cyan-900 hover:bg-cyan-50"
                                onClick={handleDownloadSvg}
                                disabled={!intakeUrl}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download SVG
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 flex-1 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
                                onClick={handleDownloadPng}
                                disabled={!intakeUrl}
                            >
                                <ImageDown className="mr-2 h-4 w-4" />
                                Download PNG
                            </Button>
                        </div>
                        <p className="mt-2 text-[12px] text-gray-400">
                            SVG is best for designers and print shops; PNG works for slides and quick sharing.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
