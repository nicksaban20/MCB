/** @jest-environment node */

import { GET, PATCH } from './route';
import { requireAuthenticatedUser } from '@/app/api/_lib/auth';

jest.mock('@/app/api/_lib/auth', () => ({
  requireAuthenticatedUser: jest.fn(),
}));

const mockedRequireAuthenticatedUser = requireAuthenticatedUser as jest.MockedFunction<
  typeof requireAuthenticatedUser
>;

function buildOrganizationsSupabaseMock() {
  const maybeSingle = jest.fn();
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn(() => ({ eq }));
  const updateEq = jest.fn();
  const update = jest.fn(() => ({ eq: updateEq }));
  const insert = jest.fn();
  const from = jest.fn(() => ({
    select,
    update,
    insert,
  }));

  return {
    supabase: { from },
    from,
    select,
    eq,
    maybeSingle,
    update,
    updateEq,
    insert,
  };
}

describe('profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the current user organization profile', async () => {
    const supabaseMock = buildOrganizationsSupabaseMock();
    supabaseMock.maybeSingle.mockResolvedValue({
      data: { id: 'org-1', user_id: 'user-1', name: 'GenAI' },
      error: null,
    });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'customer',
      },
    });

    const response = await GET();

    expect(supabaseMock.from).toHaveBeenCalledWith('organizations');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: 'org-1',
      name: 'GenAI',
    });
  });

  it('updates an existing organization profile and returns the refreshed row', async () => {
    const supabaseMock = buildOrganizationsSupabaseMock();
    supabaseMock.maybeSingle
      .mockResolvedValueOnce({
        data: { id: 'org-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: 'org-1',
          user_id: 'user-1',
          name: 'Updated Org',
          city: 'Berkeley',
        },
        error: null,
      });
    supabaseMock.updateEq.mockResolvedValue({ error: null });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'customer',
      },
    });

    const response = await PATCH(
      new Request('http://localhost/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: 'Updated Org',
          city: 'Berkeley',
          phone: '555-0101',
        }),
      })
    );

    expect(supabaseMock.update).toHaveBeenCalledWith({
      name: 'Updated Org',
      phone: '555-0101',
      street_address: null,
      city: 'Berkeley',
      state: null,
      zip_code: null,
      department: null,
    });
    expect(supabaseMock.updateEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      profile: {
        id: 'org-1',
        name: 'Updated Org',
        city: 'Berkeley',
      },
    });
  });
});
