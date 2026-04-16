import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { validatePassword } from '@/utils/security';

export async function PATCH(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase } = authResult.context;
    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password : '';

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid password', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update password', details: updateError.message },
        { status: 500 }
      );
    }

    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
    if (signOutError) {
      return NextResponse.json(
        { error: 'Password updated, but failed to invalidate sessions', details: signOutError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresReauth: true,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
