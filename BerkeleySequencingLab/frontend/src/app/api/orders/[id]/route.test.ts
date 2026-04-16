/** @jest-environment node */

import { PATCH } from './route';
import { requireAuthenticatedUser, isStaffRole } from '@/app/api/_lib/auth';
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

function buildSupabaseMock() {
  const single = jest.fn();
  const select = jest.fn(() => ({ single }));
  const eq = jest.fn(() => ({ select }));
  const update = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ update }));

  return {
    supabase: { from },
    from,
    update,
    eq,
    select,
    single,
  };
}

describe('PATCH /api/orders/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks customers from updating order status', async () => {
    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: {} as never,
        user: {} as never,
        role: 'customer',
      },
    });
    mockedIsStaffRole.mockReturnValue(false);

    const response = await PATCH(
      new Request('http://localhost/api/orders/order-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: Promise.resolve({ id: 'order-1' }) }
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Forbidden: staff or superadmin role required',
    });
  });

  it('updates status for staff users', async () => {
    const supabaseMock = buildSupabaseMock();
    supabaseMock.single.mockResolvedValue({
      data: { id: 'order-1', status: 'in_progress' },
      error: null,
    });

    mockedRequireAuthenticatedUser.mockResolvedValue({
      context: {
        supabase: supabaseMock.supabase as never,
        user: {} as never,
        role: 'staff',
      },
    });
    mockedIsStaffRole.mockReturnValue(true);

    const response = await PATCH(
      new Request('http://localhost/api/orders/order-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: Promise.resolve({ id: 'order-1' }) }
    );

    expect(supabaseMock.from).toHaveBeenCalledWith('dna_orders');
    expect(supabaseMock.update).toHaveBeenCalledWith({ status: 'in_progress' });
    expect(supabaseMock.eq).toHaveBeenCalledWith('id', 'order-1');
    expect(mockedLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'staff' }),
      expect.objectContaining({
        action: 'order_status_updated',
        targetTable: 'dna_orders',
        targetId: 'order-1',
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      order: { id: 'order-1', status: 'in_progress' },
    });
  });
});
