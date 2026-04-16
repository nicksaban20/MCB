import { NextResponse } from 'next/server';
import { isSuperadminRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { logAdminAction } from '@/app/api/_lib/audit';

type Role = 'customer' | 'staff' | 'superadmin';

const VALID_ROLES: Role[] = ['customer', 'staff', 'superadmin'];

export async function GET() {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user, role } = authResult.context;

    if (!isSuperadminRole(role)) {
      return NextResponse.json(
        { error: 'Forbidden: superadmin role required' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, role, is_active, deactivated_at, first_name, last_name, phone, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load user profiles', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      currentUserId: user.id,
      profiles: data ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user, role } = authResult.context;

    if (!isSuperadminRole(role)) {
      return NextResponse.json(
        { error: 'Forbidden: superadmin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const profileId = typeof body.profileId === 'string' ? body.profileId.trim() : '';
    const nextRole = typeof body.role === 'string' ? body.role.trim().toLowerCase() : '';
    const hasIsActive = typeof body.isActive === 'boolean';
    const nextIsActive = hasIsActive ? body.isActive : undefined;

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      );
    }

    if (!nextRole && !hasIsActive) {
      return NextResponse.json(
        { error: 'Provide either a role change or an activation change' },
        { status: 400 }
      );
    }

    if (nextRole && !VALID_ROLES.includes(nextRole as Role)) {
      return NextResponse.json(
        { error: 'Invalid role', details: VALID_ROLES },
        { status: 400 }
      );
    }

    if (profileId === user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role or activation state from this endpoint' },
        { status: 400 }
      );
    }

    const updatePayload: {
      role?: Role;
      is_active?: boolean;
      deactivated_at?: string | null;
    } = {};

    let auditAction = 'user_role_updated';

    if (nextRole) {
      updatePayload.role = nextRole as Role;
    }

    if (typeof nextIsActive === 'boolean') {
      updatePayload.is_active = nextIsActive;
      updatePayload.deactivated_at = nextIsActive ? null : new Date().toISOString();
      auditAction = nextIsActive ? 'user_reactivated' : 'user_deactivated';
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('id', profileId)
      .select('id, role, is_active, deactivated_at, first_name, last_name, phone, created_at')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update user role', details: error.message },
        { status: 500 }
      );
    }

    await logAdminAction(
      { supabase, user, role },
      {
        action: auditAction,
        targetTable: 'user_profiles',
        targetId: profileId,
        metadata: {
          nextRole: nextRole || undefined,
          isActive: nextIsActive,
        },
      }
    );

    return NextResponse.json({ profile: data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
