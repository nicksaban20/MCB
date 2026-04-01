import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

const LAB_NOTIFY =
  process.env.LAB_NOTIFY_EMAIL || process.env.CONTACT_RECIPIENT || 'berkeleysequencinglab@gmail.com'

/** Fire-and-forget lab notification when order status changes (optional Resend). */
export async function notifyLabOrderStatusChange(opts: {
  orderId: string
  oldStatus: string | null
  newStatus: string
}) {
  const resend = getResend()
  if (!resend) {
    console.info('[notifyLabOrderStatusChange] RESEND_API_KEY not set; skipping email')
    return
  }
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: LAB_NOTIFY,
      subject: `[Lab] Order ${opts.orderId.slice(0, 8)} → ${opts.newStatus}`,
      html: `
        <p><strong>Order status update</strong></p>
        <p>Order ID: ${opts.orderId}</p>
        <p>From: ${opts.oldStatus ?? '—'} → <strong>${opts.newStatus}</strong></p>
      `,
    })
  } catch (e) {
    console.error('[notifyLabOrderStatusChange]', e)
  }
}
