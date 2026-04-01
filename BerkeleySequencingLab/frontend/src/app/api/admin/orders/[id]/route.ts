import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { canTransitionOrderStatus } from '@/lib/order-lifecycle'
import { notifyLabOrderStatusChange } from '@/lib/notify-order-status'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const status = typeof body.status === 'string' ? body.status : undefined
  const internal_notes =
    typeof body.internal_notes === 'string' ? body.internal_notes : undefined

  const { data: existing, error: fetchErr } = await gate.supabase
    .from('dna_orders')
    .select('id,user_id,status,internal_notes')
    .eq('id', id)
    .single()

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const patch: Record<string, unknown> = {}
  if (internal_notes !== undefined) patch.internal_notes = internal_notes

  if (status !== undefined) {
    const next = status.toLowerCase()
    if (!canTransitionOrderStatus(existing.status, next)) {
      return NextResponse.json(
        { error: `Invalid status transition ${existing.status} → ${next}` },
        { status: 400 }
      )
    }
    patch.status = next
    if (next === 'completed') {
      patch.completed_at = new Date().toISOString()
    } else if (existing.status === 'completed' && next !== 'completed') {
      patch.completed_at = null
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  const { data: updated, error: upErr } = await gate.supabase
    .from('dna_orders')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  if (status !== undefined && status.toLowerCase() !== (existing.status || '').toLowerCase()) {
    await gate.supabase.from('order_status_events').insert({
      dna_order_id: id,
      old_status: existing.status,
      new_status: status.toLowerCase(),
      created_by: gate.user.id,
    })
    void notifyLabOrderStatusChange({
      orderId: id,
      oldStatus: existing.status,
      newStatus: status.toLowerCase(),
    })
  }

  return NextResponse.json(updated)
}
