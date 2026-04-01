import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []
  if (!ids.length) {
    return NextResponse.json({ error: 'ids[] required' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
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
  } else if (typeof body.plate_id === 'string') patch.plate_id = body.plate_id

  if (typeof body.well_index === 'number') {
    if (body.well_index < 0 || body.well_index > 95) {
      return NextResponse.json({ error: 'well_index must be 0–95' }, { status: 400 })
    }
    patch.well_index = body.well_index
  } else if (body.clear_wells === true) {
    patch.well_index = null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No bulk fields' }, { status: 400 })
  }

  const { error } = await gate.supabase.from('dna_samples').update(patch).in('id', ids)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updated: ids.length })
}
