import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const { id } = await ctx.params

  const { data, error } = await gate.supabase
    .from('dna_samples')
    .select(
      `
      *,
      dna_orders ( id, user_id, sample_type, status, plate_name, created_at )
    `
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const uid = (data.dna_orders as { user_id?: string } | null)?.user_id
  let customer_label = ''
  if (uid) {
    const { data: org } = await gate.supabase
      .from('organizations')
      .select('name')
      .eq('user_id', uid)
      .maybeSingle()
    customer_label = org?.name || uid.slice(0, 8)
  }

  return NextResponse.json({ ...data, customer_label })
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))

  const patch: Record<string, unknown> = {}
  if (typeof body.name === 'string') patch.name = body.name
  if (typeof body.notes === 'string') patch.notes = body.notes
  if (typeof body.status === 'string') {
    const SAMPLE_STATUSES = ['pending', 'received', 'processing', 'completed', 'failed']
    const normalized = body.status.toLowerCase()
    if (!SAMPLE_STATUSES.includes(normalized)) {
      return NextResponse.json({ error: `Invalid sample status: ${body.status}` }, { status: 400 })
    }
    patch.status = normalized
  }
  if (typeof body.flag_for_review === 'boolean') patch.flag_for_review = body.flag_for_review
  if (body.plate_id === null) {
    patch.plate_id = null
    patch.well_index = null
  } else if (typeof body.plate_id === 'string') {
    patch.plate_id = body.plate_id
  }
  if (body.well_index === null) patch.well_index = null
  else if (typeof body.well_index === 'number') {
    if (body.well_index < 0 || body.well_index > 95) {
      return NextResponse.json({ error: 'well_index must be 0–95' }, { status: 400 })
    }
    patch.well_index = body.well_index
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  const { data: updated, error } = await gate.supabase
    .from('dna_samples')
    .update(patch)
    .eq('id', id)
    .select(
      `
      *,
      dna_orders ( id, user_id, sample_type, status, plate_name, created_at )
    `
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
