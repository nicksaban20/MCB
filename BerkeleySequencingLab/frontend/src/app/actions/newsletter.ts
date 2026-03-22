'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error: string | null }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert([{ email, is_active: true }], { onConflict: 'email' })

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function unsubscribe(email: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false })
    .eq('email', email)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function sendAnnouncementEmail(subject: string, htmlBody: string): Promise<{ success: boolean; error: string | null; sent?: number }> {
  const supabase = await createClient()

  // Get active subscribers
  const { data: subscribers, error: fetchError } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('is_active', true)

  if (fetchError) return { success: false, error: fetchError.message }
  if (!subscribers || subscribers.length === 0) return { success: false, error: 'No active subscribers found' }

  const resend = getResendClient()
  if (!resend) {
    return { success: false, error: 'Email service is not configured' }
  }

  // Send in batches
  const emails = subscribers.map(s => s.email)
  const batchSize = 50
  let sent = 0

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: batch,
      subject,
      html: htmlBody,
    })

    if (error) {
      console.error('Batch send error:', error)
    } else {
      sent += batch.length
    }
  }

  return { success: true, error: null, sent }
}
