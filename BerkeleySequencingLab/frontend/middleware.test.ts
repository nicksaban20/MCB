/** @jest-environment node */

import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { createServerClient } from '@supabase/ssr';

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

const mockedCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;

function buildSupabaseMiddlewareMock({
  user,
  role,
  isActive = true,
}: {
  user: { id: string } | null;
  role?: string | null;
  isActive?: boolean;
}) {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: role ? { role, is_active: isActive } : null,
    error: null,
  });
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select }));

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
      }),
    },
    from,
  };
}

describe('middleware RBAC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SESSION_TIMEOUT_MINUTES = '30';
  });

  it('redirects unauthenticated users away from protected pages', async () => {
    mockedCreateServerClient.mockReturnValue(
      buildSupabaseMiddlewareMock({ user: null }) as never
    );

    const request = new NextRequest('http://localhost:3000/dashboard');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/unauthorized?reason=auth');
  });

  it('blocks customers from admin pages', async () => {
    mockedCreateServerClient.mockReturnValue(
      buildSupabaseMiddlewareMock({
        user: { id: 'user-1' },
        role: 'customer',
      }) as never
    );

    const request = new NextRequest('http://localhost:3000/admin-dash');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/unauthorized?reason=admin');
  });

  it('allows superadmins onto superadmin pages', async () => {
    mockedCreateServerClient.mockReturnValue(
      buildSupabaseMiddlewareMock({
        user: { id: 'user-1' },
        role: 'superadmin',
      }) as never
    );

    const request = new NextRequest('http://localhost:3000/superadmin');
    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects deactivated users away from all authenticated pages', async () => {
    mockedCreateServerClient.mockReturnValue(
      buildSupabaseMiddlewareMock({
        user: { id: 'user-1' },
        role: 'customer',
        isActive: false,
      }) as never
    );

    const request = new NextRequest('http://localhost:3000/profile', {
      headers: {
        cookie: 'sb-test-auth-token=abc123',
      },
    });
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/unauthorized?reason=deactivated');
  });

  it('expires inactive sessions and redirects to login', async () => {
    mockedCreateServerClient.mockReturnValue(
      buildSupabaseMiddlewareMock({
        user: { id: 'user-1' },
        role: 'customer',
      }) as never
    );

    const staleTimestamp = Date.now() - 31 * 60 * 1000;
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: `mcb-last-activity=${staleTimestamp}; sb-test-auth-token=abc123`,
      },
    });
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login?reason=timeout');
    expect(response.headers.get('set-cookie')).toContain('mcb-last-activity=');
  });

  it('refreshes the activity timeout cookie for active sessions', async () => {
    mockedCreateServerClient.mockReturnValue(
      buildSupabaseMiddlewareMock({
        user: { id: 'user-1' },
        role: 'customer',
      }) as never
    );

    const activeTimestamp = Date.now() - 5 * 60 * 1000;
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: `mcb-last-activity=${activeTimestamp}`,
      },
    });
    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('mcb-last-activity=');
  });
});
