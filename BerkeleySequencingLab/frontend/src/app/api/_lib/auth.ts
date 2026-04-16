import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export type AppRole = 'customer' | 'staff' | 'superadmin';

export type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  role: AppRole;
};

export async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: authentication required' },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Failed to load user role', details: profileError.message },
        { status: 500 }
      ),
    };
  }

  if (profile && profile.is_active === false) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Account deactivated. Please contact a superadmin.' },
        { status: 403 }
      ),
    };
  }

  const role = (profile?.role ?? 'customer') as AppRole;

  return {
    context: {
      supabase,
      user,
      role,
    } satisfies AuthContext,
  };
}

export function isStaffRole(role: AppRole) {
  return role === 'staff' || role === 'superadmin';
}

export function isSuperadminRole(role: AppRole) {
  return role === 'superadmin';
}
