import { NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { sendSMS } from '@/lib/notifications'
import prisma from '@/lib/prisma'


const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
})


export async function POST(req: Request) {
  try {
    const bodyText = await req.text()


    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
    if (!currentSigningKey && process.env.NODE_ENV === 'production') {
      console.error("QStash signing key configuration missing in production!")
      return NextResponse.json({ error: 'Signing key configuration missing' }, { status: 500 })
    }

    if (currentSigningKey) {
      const signature = req.headers.get('Upstash-Signature')
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }
      const isValid = await receiver.verify({ signature, body: bodyText }).catch(() => false);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(bodyText)
    const { jobId, phone, message, clinicId, patientId, appointmentId, variables, templateId } = payload

    if (!jobId || !phone || !message || !clinicId || !patientId) {
      return NextResponse.json({ error: 'Missing required payload fields' }, { status: 400 })
    }


    const job = await prisma.smsJob.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.status !== 'SCHEDULED') {

      return NextResponse.json({ message: `Job already ${job.status}` })
    }


    const res = await sendSMS({ to: phone, body: message, variables, templateId })


    const notification = await prisma.notification.create({
      data: {
        type: 'SMS',
        status: res.success ? 'SENT' : 'FAILED',
        recipient: phone,
        message,
        providerId: res.messageId,
        error: res.error ? JSON.stringify(res.error) : null,
        clinicId,
        patientId,
        appointmentId
      }
    })


    await prisma.smsJob.update({
      where: { id: jobId },
      data: { status: res.success ? 'COMPLETED' : 'FAILED' }
    })


    if (!res.success) {
      return NextResponse.json({ error: 'SMS sending failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, notificationId: notification.id })

  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
