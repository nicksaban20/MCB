import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const plateId = searchParams.get('plateId')
  const status = searchParams.get('status')
  const flagged = searchParams.get('flagged')
  const q = searchParams.get('q')?.trim().toLowerCase()

  let query = gate.supabase
    .from('dna_samples')
    .select(
      `
      *,
      dna_orders (
        id,
        user_id,
        sample_type,
        status,
        plate_name,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false })

  if (orderId) query = query.eq('dna_order_id', orderId)
  if (plateId === 'unassigned') {
    query = query.is('plate_id', null)
  } else if (plateId) {
    query = query.eq('plate_id', plateId)
  }
  if (status && status !== 'all') query = query.eq('status', status)
  if (flagged === '1' || flagged === 'true') query = query.eq('flag_for_review', true)

  const { data: rows, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const list = rows || []
  const userIds = [
    ...new Set(
      list.map((r: { dna_orders?: { user_id?: string } }) => r.dna_orders?.user_id).filter(Boolean)
    ),
  ] as string[]

  const { data: orgRows } = await gate.supabase
    .from('organizations')
    .select('user_id, name')
    .in(
      'user_id',
      userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']
    )

  const orgByUser = new Map((orgRows || []).map((r) => [r.user_id, r.name]))

  const enriched = list.map((r: Record<string, unknown>) => {
    const order = r.dna_orders as { user_id?: string } | undefined
    const uid = order?.user_id
    return {
      ...r,
      customer_label: uid ? orgByUser.get(uid) || String(uid).slice(0, 8) : '',
    }
  })

  if (q) {
    return NextResponse.json(
      enriched.filter((entry) => {
        const r = entry as Record<string, unknown>
        const name = String(r.name || '').toLowerCase()
        const notes = String(r.notes || '').toLowerCase()
        const st = String((r.dna_orders as { sample_type?: string })?.sample_type || '').toLowerCase()
        return name.includes(q) || notes.includes(q) || st.includes(q)
      })
    )
  }

  return NextResponse.json(enriched)
}
