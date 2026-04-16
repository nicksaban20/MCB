/** @jest-environment node */

import { GET, POST } from './route';
import { isStaffRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { logAdminAction } from '@/app/api/_lib/audit';

jest.mock('@/app/api/_lib/auth', () => ({
  requireAuthenticatedUser: jest.fn(),
  isStaffRole: jest.fn(),
}));

jest.mock('@/app/api/_lib/audit', () => ({
  logAdminAction: jest.fn(),
}));

const mockedRequireAuthenticatedUser = requireAuthenticatedUser as jest.MockedFunction<
  typeof requireAuthenticatedUser
>;
const mockedIsStaffRole = isStaffRole as jest.MockedFunction<typeof isStaffRole>;
const mockedLogAdminAction = logAdminAction as jest.MockedFunction<typeof logAdminAction>;

function buildPlatesSupabaseMock() {
  const order = jest.fn();
  const select = jest.fn(() => ({ order }));
  const eq = jest.fn();
  const update = jest.fn(() => ({ eq }));
  const single = jest.fn();
  const insert = jest.fn(() => ({ select: jest.fn(() => ({ single })) }));
  const upsert = jest.fn();
  const from = jest.fn((table: string) => {
    if (table === 'plates') {
      return { select, update, insert };
    }

    if (table === 'plate_wells') {
      return { upsert };
    }

    return { select, update, insert, upsert };
  });

  return {
    supabase: { from },
    from,
    select,
    order,
    update,
    eq,
    insert,
    single,
    upsert,
  };
}

describe('plates API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks customers from loading plates', async () => {
    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: {} as never,
        user: { id: 'user-1' } as never,
        role: 'customer',
      },
    });
    mockedIsStaffRole.mockReturnValue(false);

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Forbidden: staff or superadmin role required',
    });
  });

  it('returns plates for staff users', async () => {
    const supabaseMock = buildPlatesSupabaseMock();
    supabaseMock.order.mockResolvedValue({
      data: [{ id: 'plate-1', name: 'Plate A' }],
      error: null,
    });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'staff',
      },
    });
    mockedIsStaffRole.mockReturnValue(true);

    const response = await GET();

    expect(supabaseMock.from).toHaveBeenCalledWith('plates');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([{ id: 'plate-1', name: 'Plate A' }]);
  });

  it('creates a plate and saves wells for staff users', async () => {
    const supabaseMock = buildPlatesSupabaseMock();
    supabaseMock.single.mockResolvedValue({
      data: { id: 'plate-1' },
      error: null,
    });
    supabaseMock.upsert.mockResolvedValue({ error: null });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: { id: 'user-1' } as never,
        role: 'staff',
      },
    });
    mockedIsStaffRole.mockReturnValue(true);

    const response = await POST(
      new Request('http://localhost/api/plates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Plate A',
          status: 'loaded',
          wells: [
            {
              well: 'A1',
              order_id: 'order-1',
              sample_id: 'sample-1',
              notes: 'first well',
            },
          ],
        }),
      })
    );

    expect(supabaseMock.insert).toHaveBeenCalledWith([
      {
        name: 'Plate A',
        status: 'loaded',
        created_by: 'user-1',
      },
    ]);
    expect(supabaseMock.upsert).toHaveBeenCalledWith(
      [
        {
          plate_id: 'plate-1',
          well: 'A1',
          sample_id: 'sample-1',
          order_id: 'order-1',
          notes: 'first well',
        },
      ],
      { onConflict: 'plate_id,well' }
    );
    expect(mockedLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'staff' }),
      expect.objectContaining({
        action: 'plate_created',
        targetTable: 'plates',
        targetId: 'plate-1',
      })
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ plateId: 'plate-1' });
  });
});
