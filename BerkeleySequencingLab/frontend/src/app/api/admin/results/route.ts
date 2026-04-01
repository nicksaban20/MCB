import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const q = searchParams.get('q')?.trim().toLowerCase()

  let query = gate.supabase
    .from('result_files')
    .select(
      `
      *,
      dna_orders ( id, sample_type, plate_name, user_id )
    `
    )
    .order('created_at', { ascending: false })
    .limit(500)

  if (orderId) query = query.eq('dna_order_id', orderId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let list = data || []
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

  list = list.map((r: Record<string, unknown>) => {
    const order = r.dna_orders as { user_id?: string } | undefined
    const uid = order?.user_id
    return {
      ...r,
      customer_label: uid ? orgByUser.get(uid) || String(uid).slice(0, 8) : '',
    }
  })

  if (q) {
    list = list.filter((r) => {
      const fn = String((r as { file_name?: string }).file_name || '').toLowerCase()
      const cl = String((r as { customer_label?: string }).customer_label || '').toLowerCase()
      const st = String(
        (r.dna_orders as { sample_type?: string } | undefined)?.sample_type || ''
      ).toLowerCase()
      return fn.includes(q) || cl.includes(q) || st.includes(q)
    })
  }

  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json().catch(() => ({}))
  const dna_order_id = typeof body.dna_order_id === 'string' ? body.dna_order_id : null
  const storage_path = typeof body.storage_path === 'string' ? body.storage_path : null
  const file_name = typeof body.file_name === 'string' ? body.file_name : null
  if (!dna_order_id || !storage_path || !file_name) {
    return NextResponse.json(
      { error: 'dna_order_id, storage_path, file_name required' },
      { status: 400 }
    )
  }

  const { data: orderExists } = await gate.supabase
    .from('dna_orders')
    .select('id')
    .eq('id', dna_order_id)
    .maybeSingle()
  if (!orderExists) {
    return NextResponse.json(
      { error: `Order ${dna_order_id} not found. Verify the order ID.` },
      { status: 404 }
    )
  }

  const row = {
    dna_order_id,
    dna_sample_id: typeof body.dna_sample_id === 'string' ? body.dna_sample_id : null,
    storage_path,
    file_name,
    mime_type: typeof body.mime_type === 'string' ? body.mime_type : null,
  }

  const { data, error } = await gate.supabase.from('result_files').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
