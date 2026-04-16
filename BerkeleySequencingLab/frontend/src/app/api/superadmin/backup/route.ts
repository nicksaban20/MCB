import { NextResponse } from 'next/server';
import type { AuthContext } from '@/app/api/_lib/auth';
import { isSuperadminRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { logAdminAction } from '@/app/api/_lib/audit';

const BACKUP_TABLES = [
  'user_profiles',
  'organizations',
  'dna_orders',
  'dna_samples',
  'plates',
  'plate_wells',
  'notifications',
  'support_tickets',
  'support_messages',
  'sequencing_data',
  'sequencing_samples',
  'admin_audit_logs',
  'site_settings',
] as const;

const RESTORE_TABLES = [
  'organizations',
  'dna_orders',
  'dna_samples',
  'plates',
  'plate_wells',
  'notifications',
  'support_tickets',
  'support_messages',
  'sequencing_data',
  'sequencing_samples',
  'site_settings',
] as const;

const DELETE_ORDER = [
  'plate_wells',
  'dna_samples',
  'sequencing_samples',
  'support_messages',
  'notifications',
  'support_tickets',
  'dna_orders',
  'sequencing_data',
  'plates',
  'organizations',
  'site_settings',
] as const;

const PRIMARY_KEY_BY_TABLE: Record<(typeof RESTORE_TABLES)[number], string> = {
  organizations: 'id',
  dna_orders: 'id',
  dna_samples: 'id',
  plates: 'id',
  plate_wells: 'id',
  notifications: 'id',
  support_tickets: 'id',
  support_messages: 'id',
  sequencing_data: 'id',
  sequencing_samples: 'id',
  site_settings: 'key',
};

type BackupTable = (typeof BACKUP_TABLES)[number];
type RestoreTable = (typeof RESTORE_TABLES)[number];

function normalizeBackupPayload(rawPayload: unknown) {
  if (!rawPayload || typeof rawPayload !== 'object') {
    throw new Error('Backup JSON must be an object.');
  }

  const payloadObject = rawPayload as Record<string, unknown>;
  const backupValue = payloadObject.backup;
  const backupObject =
    backupValue && typeof backupValue === 'object'
      ? (backupValue as Record<string, unknown>)
      : payloadObject;

  const normalizedBackup: Partial<Record<BackupTable, Record<string, unknown>[]>> = {};

  for (const table of BACKUP_TABLES) {
    const tableValue = backupObject[table];
    if (tableValue === undefined) {
      normalizedBackup[table] = [];
      continue;
    }

    if (!Array.isArray(tableValue)) {
      throw new Error(`Backup table "${table}" must be an array.`);
    }

    normalizedBackup[table] = tableValue as Record<string, unknown>[];
  }

  return normalizedBackup;
}

async function deleteAllRows(
  supabase: AuthContext['supabase'],
  table: RestoreTable
) {
  const primaryKey = PRIMARY_KEY_BY_TABLE[table];
  const { error } = await supabase
    .from(table)
    .delete()
    .not(primaryKey, 'is', null);

  if (error) {
    throw new Error(`Failed to clear ${table}: ${error.message}`);
  }
}

async function insertRows(
  supabase: AuthContext['supabase'],
  table: RestoreTable,
  rows: Record<string, unknown>[]
) {
  if (rows.length === 0) {
    return;
  }

  const primaryKey = PRIMARY_KEY_BY_TABLE[table];
  const { error } = await supabase
    .from(table)
    .upsert(rows, {
      onConflict: primaryKey,
      ignoreDuplicates: false,
    });

  if (error) {
    throw new Error(`Failed to restore ${table}: ${error.message}`);
  }
}

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

    const backup: Record<string, unknown> = {};
    const counts: Record<string, number> = {};

    for (const table of BACKUP_TABLES) {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        return NextResponse.json(
          { error: `Failed to export ${table}`, details: error.message },
          { status: 500 }
        );
      }

      backup[table] = data ?? [];
      counts[table] = Array.isArray(data) ? data.length : 0;
    }

    await logAdminAction(
      { supabase, user, role },
      {
        action: 'backup_exported',
        targetTable: 'system_backup',
        metadata: {
          tables: BACKUP_TABLES,
          counts,
        },
      }
    );

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
      counts,
      appendOnlyTables: ['admin_audit_logs'],
      backup,
    });
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

    if (!isSuperadminRole(role)) {
      return NextResponse.json(
        { error: 'Forbidden: superadmin role required' },
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    const backup = normalizeBackupPayload(requestBody);
    for (const table of DELETE_ORDER) {
      await deleteAllRows(supabase, table);
    }

    const restoredCounts: Partial<Record<RestoreTable, number>> = {};

    for (const table of RESTORE_TABLES) {
      const rows = backup[table] ?? [];
      await insertRows(supabase, table, rows);
      restoredCounts[table] = rows.length;
    }

    await logAdminAction(
      { supabase, user, role },
      {
        action: 'backup_restored',
        targetTable: 'system_backup',
        metadata: {
          restoredCounts,
          skippedTables: ['user_profiles', 'admin_audit_logs'],
        },
      }
    );

    return NextResponse.json({
      restoredAt: new Date().toISOString(),
      restoredBy: user.id,
      restoredCounts,
      skippedTables: ['user_profiles', 'admin_audit_logs'],
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
