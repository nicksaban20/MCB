/** @jest-environment node */

import { GET, POST } from './route';
import { isSuperadminRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { logAdminAction } from '@/app/api/_lib/audit';

jest.mock('@/app/api/_lib/auth', () => ({
  requireAuthenticatedUser: jest.fn(),
  isSuperadminRole: jest.fn(),
}));

jest.mock('@/app/api/_lib/audit', () => ({
  logAdminAction: jest.fn(),
}));

const mockedRequireAuthenticatedUser = requireAuthenticatedUser as jest.MockedFunction<
  typeof requireAuthenticatedUser
>;
const mockedIsSuperadminRole = isSuperadminRole as jest.MockedFunction<typeof isSuperadminRole>;
const mockedLogAdminAction = logAdminAction as jest.MockedFunction<typeof logAdminAction>;

function buildBackupSupabaseMock() {
  const select = jest.fn().mockResolvedValue({
    data: [{ id: 'row-1' }],
    error: null,
  });
  const not = jest.fn().mockResolvedValue({ error: null });
  const remove = jest.fn(() => ({ not }));
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const from = jest.fn(() => ({ select, delete: remove, upsert }));

  return {
    supabase: { from },
    from,
    select,
    remove,
    not,
    upsert,
  };
}

describe('superadmin backup API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks non-superadmins from exporting a backup', async () => {
    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: {} as never,
        user: { id: 'user-1' } as never,
        role: 'staff',
      },
    });
    mockedIsSuperadminRole.mockReturnValue(false);

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Forbidden: superadmin role required',
    });
  });

  it('exports backup data for a superadmin', async () => {
    const supabaseMock = buildBackupSupabaseMock();
    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'superadmin',
      },
    });
    mockedIsSuperadminRole.mockReturnValue(true);

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(supabaseMock.from).toHaveBeenCalledWith('user_profiles');
    expect(supabaseMock.from).toHaveBeenCalledWith('dna_orders');
    expect(responseBody.backup.user_profiles).toEqual([{ id: 'row-1' }]);
    expect(responseBody.counts.user_profiles).toBe(1);
    expect(mockedLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'superadmin' }),
      expect.objectContaining({
        action: 'backup_exported',
        targetTable: 'system_backup',
      })
    );
  });

  it('restores supported tables for a superadmin backup', async () => {
    const supabaseMock = buildBackupSupabaseMock();
    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'superadmin',
      },
    });
    mockedIsSuperadminRole.mockReturnValue(true);

    const request = new Request('http://localhost/api/superadmin/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backup: {
          organizations: [{ id: 'org-1', user_id: 'user-1' }],
          dna_orders: [],
          dna_samples: [],
          plates: [],
          plate_wells: [],
          notifications: [],
          support_tickets: [],
          support_messages: [],
          sequencing_data: [],
          sequencing_samples: [],
          site_settings: [{ key: 'siteName', value: 'Berkeley Sequencing Lab' }],
        },
      }),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(supabaseMock.from).toHaveBeenCalledWith('site_settings');
    expect(supabaseMock.remove).toHaveBeenCalled();
    expect(supabaseMock.upsert).toHaveBeenCalledWith(
      [{ id: 'org-1', user_id: 'user-1' }],
      expect.objectContaining({ onConflict: 'id' })
    );
    expect(responseBody.skippedTables).toEqual(['user_profiles', 'admin_audit_logs']);
    expect(mockedLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'superadmin' }),
      expect.objectContaining({
        action: 'backup_restored',
        targetTable: 'system_backup',
      })
    );
  });
});
