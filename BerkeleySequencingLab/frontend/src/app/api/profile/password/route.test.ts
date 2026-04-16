/** @jest-environment node */

import { PATCH } from './route';
import { requireAuthenticatedUser } from '@/app/api/_lib/auth';

jest.mock('@/app/api/_lib/auth', () => ({
  requireAuthenticatedUser: jest.fn(),
}));

const mockedRequireAuthenticatedUser = requireAuthenticatedUser as jest.MockedFunction<
  typeof requireAuthenticatedUser
>;

function buildPasswordSupabaseMock() {
  return {
    supabase: {
      auth: {
        updateUser: jest.fn(),
        signOut: jest.fn(),
      },
    },
  };
}

describe('PATCH /api/profile/password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects weak passwords', async () => {
    const supabaseMock = buildPasswordSupabaseMock();
    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'customer',
      },
    });

    const response = await PATCH(
      new Request('http://localhost/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'weak' }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid password',
    });
    expect(supabaseMock.supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it('updates password and signs out globally', async () => {
    const supabaseMock = buildPasswordSupabaseMock();
    supabaseMock.supabase.auth.updateUser.mockResolvedValue({ error: null });
    supabaseMock.supabase.auth.signOut.mockResolvedValue({ error: null });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'customer',
      },
    });

    const response = await PATCH(
      new Request('http://localhost/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'StrongerPass1!' }),
      })
    );

    expect(supabaseMock.supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'StrongerPass1!',
    });
    expect(supabaseMock.supabase.auth.signOut).toHaveBeenCalledWith({
      scope: 'global',
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      requiresReauth: true,
    });
  });
});
