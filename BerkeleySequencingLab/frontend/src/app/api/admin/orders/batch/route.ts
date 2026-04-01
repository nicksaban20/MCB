import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { canTransitionOrderStatus } from '@/lib/order-lifecycle'
import { notifyLabOrderStatusChange } from '@/lib/notify-order-status'

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []
  const status: string | undefined = typeof body.status === 'string' ? body.status : undefined

  if (!ids.length || !status) {
    return NextResponse.json({ error: 'ids[] and status required' }, { status: 400 })
  }

  const next = status.toLowerCase()
  const results: { id: string; ok: boolean; error?: string }[] = []

  for (const id of ids) {
    const { data: existing } = await gate.supabase
      .from('dna_orders')
      .select('id,status')
      .eq('id', id)
      .single()

    if (!existing) {
      results.push({ id, ok: false, error: 'not found' })
      continue
    }
    if (!canTransitionOrderStatus(existing.status, next)) {
      results.push({ id, ok: false, error: 'invalid transition' })
      continue
    }

    const patch: Record<string, unknown> = { status: next }
    if (next === 'completed') patch.completed_at = new Date().toISOString()
    if (existing.status === 'completed' && next !== 'completed') patch.completed_at = null

    const { error: upErr } = await gate.supabase.from('dna_orders').update(patch).eq('id', id)

    if (upErr) {
      results.push({ id, ok: false, error: upErr.message })
      continue
    }

    await gate.supabase.from('order_status_events').insert({
      dna_order_id: id,
      old_status: existing.status,
      new_status: next,
      created_by: gate.user.id,
    })
    void notifyLabOrderStatusChange({
      orderId: id,
      oldStatus: existing.status,
      newStatus: next,
    })
    results.push({ id, ok: true })
  }

  return NextResponse.json({ results })
}
