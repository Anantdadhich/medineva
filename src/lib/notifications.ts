interface SendSMSParams {
    to: string
    body: string
    variables?: Record<string, string>
}

export async function sendSMS({ to, body, variables }: SendSMSParams): Promise<{ success: boolean; messageId?: string; error?: any }> {
    const authKey = process.env.MSG91_AUTH_KEY?.trim()
    const templateId = process.env.MSG91_TEMPLATE_ID?.trim()


    if (!authKey || !templateId) {
        console.error(" MSG91 config missing! Please set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in .env")
        return { success: false, error: "Missing MSG91 Configuration" }
    }


    try {
        let cleanPhone = to.replace(/[\s\-\(\)\+]/g, '')
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.substring(1)
        }
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone
        }

        const mappedVariables: Record<string, string> = {
            VAR1: body,
            var1: body,
            message: body
        }

        if (variables) {
            for (const [key, value] of Object.entries(variables)) {
                mappedVariables[key.toUpperCase()] = value
                mappedVariables[key.toLowerCase()] = value
            }
        }

        const payload = {
            template_id: templateId,
            recipients: [
                {
                    mobiles: cleanPhone,
                    ...mappedVariables
                }
            ]
        }

        const response = await fetch("https://control.msg91.com/api/v5/flow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "authkey": authKey
            },
            body: JSON.stringify(payload)
        })

        let data: any = null
        const responseText = await response.text()

        try {
            data = JSON.parse(responseText)
        } catch (e) {
            data = { message: responseText }
        }

        const hasError = !response.ok ||
            (data && (
                String(data.type).toLowerCase() === "error" ||
                String(data.status).toLowerCase() === "error" ||
                String(data.status).toLowerCase() === "failed" ||
                data.hasError === true
            ))

        if (hasError) {
            console.error(" MSG91 Error Details:", data)
            return { success: false, error: data }
        }

        return { success: true, messageId: data.request_id || data.message || `msg91_${Date.now()}` }

    } catch (error) {
        console.error(" MSG91 Network Error:", error)
        return { success: false, error }
    }
}
