import { NextResponse } from 'next/server'
import { requireAuthenticatedUser, isStaffRole } from '@/app/api/_lib/auth'
import { normalizeOrderPayload, validateOrderPayload } from '@/app/api/_lib/orders'

export async function GET() {
  try {
    const authResult = await requireAuthenticatedUser()

    if (authResult.errorResponse) {
      return authResult.errorResponse
    }

    const { supabase, user, role } = authResult.context

    let query = supabase
      .from('dna_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isStaffRole(role)) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details || 'No additional details available',
          hint: error.hint || 'Check if the dna_orders table exists and RLS policies are configured correctly'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Unexpected error in GET /api/orders:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser()

    if (authResult.errorResponse) {
      return authResult.errorResponse
    }

    const { supabase, user } = authResult.context
    const requestBody = await request.json()
    const normalizedPayload = normalizeOrderPayload(requestBody)
    const validationErrors = validateOrderPayload(normalizedPayload)

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid order payload', details: validationErrors },
        { status: 400 }
      )
    }

    const { data: insertedOrder, error: orderError } = await supabase
      .from('dna_orders')
      .insert([
        {
          user_id: user.id,
          sample_type: normalizedPayload.sampleType,
          dna_type: normalizedPayload.dnaType,
          dna_quantity: normalizedPayload.dnaQuantity,
          primer_details: normalizedPayload.primerDetails,
          plate_name: normalizedPayload.plateName,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (orderError) {
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    if (normalizedPayload.samples.length > 0) {
      const sampleRows = normalizedPayload.samples.map((sample) => ({
        dna_order_id: insertedOrder.id,
        sample_no: sample.sample_no,
        name: sample.name,
        notes: sample.notes,
      }))

      const { error: sampleError } = await supabase
        .from('dna_samples')
        .insert(sampleRows)

      if (sampleError) {
        return NextResponse.json(
          { error: 'Order created but samples failed', details: sampleError.message, orderId: insertedOrder.id },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        order: insertedOrder,
        sampleCount: normalizedPayload.samples.length,
      },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
