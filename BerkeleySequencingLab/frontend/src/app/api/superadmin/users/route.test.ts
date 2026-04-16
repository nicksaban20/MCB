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

function buildUserProfilesSupabaseMock() {
  const single = jest.fn();
  const order = jest.fn();
  const select = jest.fn(() => ({ order, single }));
  const eq = jest.fn(() => ({ select }));
  const update = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select, update }));

  return {
    supabase: { from },
    from,
    select,
    order,
    update,
    eq,
    single,
  };
}

describe('superadmin users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks non-superadmins from listing users', async () => {
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

  it('returns user profiles for a superadmin', async () => {
    const supabaseMock = buildUserProfilesSupabaseMock();
    supabaseMock.order.mockResolvedValue({
      data: [{ id: 'user-2', role: 'staff', is_active: true }],
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

    expect(supabaseMock.from).toHaveBeenCalledWith('user_profiles');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      currentUserId: 'user-1',
      profiles: [{ id: 'user-2', role: 'staff', is_active: true }],
    });
  });

  it('updates another user role for a superadmin', async () => {
    const supabaseMock = buildUserProfilesSupabaseMock();
    supabaseMock.single.mockResolvedValue({
      data: { id: 'user-2', role: 'staff', is_active: true },
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
      new Request('http://localhost/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'user-2',
          role: 'staff',
        }),
      })
    );

    expect(supabaseMock.update).toHaveBeenCalledWith({ role: 'staff' });
    expect(supabaseMock.eq).toHaveBeenCalledWith('id', 'user-2');
    expect(mockedLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'superadmin' }),
      expect.objectContaining({
        action: 'user_role_updated',
        targetTable: 'user_profiles',
        targetId: 'user-2',
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      profile: { id: 'user-2', role: 'staff', is_active: true },
    });
  });

  it('deactivates another user for a superadmin', async () => {
    const supabaseMock = buildUserProfilesSupabaseMock();
    supabaseMock.single.mockResolvedValue({
      data: { id: 'user-2', role: 'customer', is_active: false },
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
      new Request('http://localhost/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'user-2',
          isActive: false,
        }),
      })
    );

    expect(supabaseMock.update).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: false })
    );
    expect(mockedLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'superadmin' }),
      expect.objectContaining({
        action: 'user_deactivated',
        targetTable: 'user_profiles',
        targetId: 'user-2',
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      profile: { id: 'user-2', is_active: false },
    });
  });
});
