import { NextResponse } from 'next/server';
import { isStaffRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user, role } = authResult.context;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    const query = supabase
      .from('dna_samples')
      .select(`
        id,
        dna_order_id,
        sample_no,
        name,
        notes,
        created_at,
        dna_orders!inner (
          id,
          user_id,
          sample_type,
          status,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (orderId) {
      query.eq('dna_order_id', orderId);
    }

    if (!isStaffRole(role)) {
      query.eq('dna_orders.user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load samples', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
