import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/app/api/_lib/auth';

type ProfilePayload = {
  phone?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  organization?: string | null;
  department?: string | null;
};

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeProfilePayload(body: ProfilePayload) {
  return {
    name: normalizeOptionalString(body.organization),
    phone: normalizeOptionalString(body.phone),
    street_address: normalizeOptionalString(body.streetAddress),
    city: normalizeOptionalString(body.city),
    state: normalizeOptionalString(body.state),
    zip_code: normalizeOptionalString(body.zipCode),
    department: normalizeOptionalString(body.department),
  };
}

export async function GET() {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user } = authResult.context;
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load profile', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? null);
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

    const { supabase, user } = authResult.context;
    const body = (await request.json()) as ProfilePayload;
    const normalizedProfile = normalizeProfilePayload(body);

    const { data: existingOrg, error: existingError } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: 'Failed to check existing profile', details: existingError.message },
        { status: 500 }
      );
    }

    if (existingOrg) {
      const { error: updateError } = await supabase
        .from('organizations')
        .update(normalizedProfile)
        .eq('user_id', user.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update profile', details: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from('organizations')
        .insert([
          {
            user_id: user.id,
            ...normalizedProfile,
          },
        ]);

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create profile', details: insertError.message },
          { status: 500 }
        );
      }
    }

    const { data: refreshedProfile, error: refreshError } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (refreshError) {
      return NextResponse.json(
        { error: 'Profile saved but reload failed', details: refreshError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: refreshedProfile });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
