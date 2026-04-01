import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const q = searchParams.get('q')?.trim()
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = gate.supabase
    .from('dna_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (from) {
    query = query.gte('created_at', from)
  }
  if (to) {
    query = query.lte('created_at', to)
  }

  const { data: orders, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let list = orders || []

  if (q) {
    const lower = q.toLowerCase()
    const allUserIds = [...new Set(list.map((o) => o.user_id).filter(Boolean))]
    const { data: orgsForSearch } = await gate.supabase
      .from('organizations')
      .select('user_id, name')
      .in(
        'user_id',
        allUserIds.length ? allUserIds : ['00000000-0000-0000-0000-000000000000']
      )

    const orgByUserForSearch = new Map((orgsForSearch || []).map((r) => [r.user_id, r.name]))

    list = list.filter((o) => {
      const org = orgByUserForSearch.get(o.user_id)?.toLowerCase() || ''
      return (
        o.sample_type?.toLowerCase().includes(lower) ||
        o.plate_name?.toLowerCase().includes(lower) ||
        o.primer_details?.toLowerCase().includes(lower) ||
        o.user_id?.toLowerCase().includes(lower) ||
        org.includes(lower)
      )
    })
  }

  const userIds = [...new Set(list.map((o) => o.user_id))]
  const { data: orgRows } = await gate.supabase
    .from('organizations')
    .select('user_id, name')
    .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])

  const orgByUser = new Map((orgRows || []).map((r) => [r.user_id, r.name]))

  const enriched = list.map((o) => ({
    ...o,
    customer_label: orgByUser.get(o.user_id) || o.user_id?.slice(0, 8) || 'Unknown',
  }))

  return NextResponse.json(enriched)
}
