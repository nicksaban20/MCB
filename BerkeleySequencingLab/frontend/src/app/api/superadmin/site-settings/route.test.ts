/** @jest-environment node */

import { GET, PATCH } from './route';
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

function buildSettingsSupabaseMock() {
  const maybeSingle = jest.fn();
  const single = jest.fn();
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn(() => ({ eq, single }));
  const upsert = jest.fn(() => ({ select }));
  const from = jest.fn(() => ({ select, upsert }));

  return {
    supabase: { from },
    from,
    maybeSingle,
    single,
    upsert,
  };
}

describe('superadmin site settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads site settings for a superadmin', async () => {
    const supabaseMock = buildSettingsSupabaseMock();
    supabaseMock.maybeSingle.mockResolvedValue({
      data: {
        key: 'general',
        value: {
          siteName: 'Test Lab',
          supportEmail: 'test@example.com',
          maintenanceMode: true,
          announcementText: 'Closed Friday',
        },
        updated_at: '2026-04-12T00:00:00Z',
      },
      error: null,
    });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'superadmin',
      },
    });
    mockedIsSuperadminRole.mockReturnValue(true);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      key: 'general',
      settings: {
        siteName: 'Test Lab',
        supportEmail: 'test@example.com',
        maintenanceMode: true,
        announcementText: 'Closed Friday',
      },
    });
  });

  it('saves site settings for a superadmin', async () => {
    const supabaseMock = buildSettingsSupabaseMock();
    supabaseMock.single.mockResolvedValue({
      data: {
        key: 'general',
        value: {
          siteName: 'Saved Lab',
          supportEmail: 'saved@example.com',
          maintenanceMode: false,
          announcementText: 'Open as usual',
        },
        updated_at: '2026-04-12T00:00:00Z',
      },
      error: null,
    });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'superadmin',
      },
    });
    mockedIsSuperadminRole.mockReturnValue(true);

    const response = await PATCH(
      new Request('http://localhost/api/superadmin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            siteName: 'Saved Lab',
            supportEmail: 'saved@example.com',
            maintenanceMode: false,
            announcementText: 'Open as usual',
          },
        }),
      })
    );

    expect(supabaseMock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'general',
        updated_by: 'user-1',
      }),
      { onConflict: 'key' }
    );
    expect(mockedLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'superadmin' }),
      expect.objectContaining({
        action: 'site_settings_updated',
        targetTable: 'site_settings',
        targetId: 'general',
      })
    );
    expect(response.status).toBe(200);
  });
});
