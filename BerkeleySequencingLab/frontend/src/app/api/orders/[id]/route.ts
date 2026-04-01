import { NextResponse } from 'next/server';
import { isStaffRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';

const VALID_STATUSES = ['pending', 'in_progress', 'completed'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, role } = authResult.context;

    if (!isStaffRole(role)) {
      return NextResponse.json(
        { error: 'Forbidden: staff or superadmin role required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const nextStatus = typeof body.status === 'string' ? body.status.trim().toLowerCase() : '';

    if (!VALID_STATUSES.includes(nextStatus as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: 'Invalid status', details: VALID_STATUSES },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('dna_orders')
      .update({ status: nextStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
