import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

/** Assign a sample to a well (or clear with well_index null). Frees conflicting wells. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { id: plateId } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const sampleId = typeof body.sample_id === 'string' ? body.sample_id : null
  if (!sampleId) {
    return NextResponse.json({ error: 'sample_id required' }, { status: 400 })
  }

  const wellRaw = body.well_index
  if (wellRaw !== null && wellRaw !== undefined) {
    if (typeof wellRaw !== 'number' || wellRaw < 0 || wellRaw > 95) {
      return NextResponse.json({ error: 'well_index must be 0–95 or null' }, { status: 400 })
    }
  }

  const { data: sample, error: sErr } = await gate.supabase
    .from('dna_samples')
    .select('id, plate_id, well_index')
    .eq('id', sampleId)
    .single()

  if (sErr || !sample) {
    return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
  }

  if (wellRaw === null || wellRaw === undefined) {
    const { data: updated, error } = await gate.supabase
      .from('dna_samples')
      .update({ plate_id: null, well_index: null })
      .eq('id', sampleId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(updated)
  }

  await gate.supabase
    .from('dna_samples')
    .update({ plate_id: null, well_index: null })
    .eq('plate_id', plateId)
    .eq('well_index', wellRaw)

  const { data: updated, error } = await gate.supabase
    .from('dna_samples')
    .update({ plate_id: plateId, well_index: wellRaw })
    .eq('id', sampleId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(updated)
}
