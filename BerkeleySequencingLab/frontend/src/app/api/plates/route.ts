import { NextResponse } from 'next/server';
import { isStaffRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { logAdminAction } from '@/app/api/_lib/audit';

type PlateWellInput = {
  well: string;
  sample_id?: string | null;
  order_id?: string | null;
  notes?: string | null;
};

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET() {
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

    const { data, error } = await supabase
      .from('plates')
      .select(`
        id,
        name,
        status,
        created_by,
        created_at,
        updated_at,
        plate_wells (
          id,
          well,
          sample_id,
          order_id,
          notes,
          created_at
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load plates', details: error.message },
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

export async function POST(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user, role } = authResult.context;

    if (!isStaffRole(role)) {
      return NextResponse.json(
        { error: 'Forbidden: staff or superadmin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = normalizeOptionalString(body.name);
    const status = normalizeOptionalString(body.status) ?? 'preparing';
    const plateId = normalizeOptionalString(body.id);
    const wells = Array.isArray(body.wells) ? (body.wells as PlateWellInput[]) : [];

    if (!name && !plateId) {
      return NextResponse.json(
        { error: 'Plate name is required when creating a plate' },
        { status: 400 }
      );
    }

    let activePlateId = plateId;

    if (plateId) {
      const { error: updateError } = await supabase
        .from('plates')
        .update({ name, status, updated_at: new Date().toISOString() })
        .eq('id', plateId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update plate', details: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const { data: createdPlate, error: createError } = await supabase
        .from('plates')
        .insert([
          {
            name,
            status,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create plate', details: createError.message },
          { status: 500 }
        );
      }

      activePlateId = createdPlate.id;
    }

    if (activePlateId && wells.length > 0) {
      const wellRows = wells
        .map((well) => ({
          plate_id: activePlateId,
          well: normalizeOptionalString(well.well),
          sample_id: normalizeOptionalString(well.sample_id),
          order_id: normalizeOptionalString(well.order_id),
          notes: normalizeOptionalString(well.notes),
        }))
        .filter((well) => well.well);

      if (wellRows.length > 0) {
        const { error: wellError } = await supabase
          .from('plate_wells')
          .upsert(wellRows, { onConflict: 'plate_id,well' });

        if (wellError) {
          return NextResponse.json(
            { error: 'Plate saved but wells failed', details: wellError.message, plateId: activePlateId },
            { status: 500 }
          );
        }
      }
    }

    await logAdminAction(
      { supabase, user, role },
      {
        action: plateId ? 'plate_updated' : 'plate_created',
        targetTable: 'plates',
        targetId: activePlateId,
        metadata: {
          name: name ?? null,
          status,
          wellCount: wells.length,
        },
      }
    );

    return NextResponse.json({ plateId: activePlateId }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
