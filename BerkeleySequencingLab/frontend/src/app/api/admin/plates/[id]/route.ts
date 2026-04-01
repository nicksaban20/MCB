import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}
  if (typeof body.name === 'string') patch.name = body.name.trim()
  if (typeof body.status === 'string') patch.status = body.status

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No fields' }, { status: 400 })
  }

  const { data, error } = await gate.supabase.from('plates').update(patch).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const { id } = await ctx.params

  await gate.supabase.from('dna_samples').update({ plate_id: null, well_index: null }).eq('plate_id', id)

  const { error } = await gate.supabase.from('plates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
