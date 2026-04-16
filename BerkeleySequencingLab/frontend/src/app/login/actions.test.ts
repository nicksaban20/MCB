/** @jest-environment node */

import { login, resetPassword } from './actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loginServerRateLimiter } from '@/utils/server-rate-limit';
import { clearCaptchaChallengesForEmail, validateCaptchaChallenge } from '@/utils/server-captcha';

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/utils/server-captcha', () => ({
  validateCaptchaChallenge: jest.fn(),
  clearCaptchaChallengesForEmail: jest.fn(),
}));

const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
const mockedValidateCaptchaChallenge = validateCaptchaChallenge as jest.MockedFunction<
  typeof validateCaptchaChallenge
>;
const mockedClearCaptchaChallengesForEmail = clearCaptchaChallengesForEmail as jest.MockedFunction<
  typeof clearCaptchaChallengesForEmail
>;

function createSupabaseAuthMock() {
  return {
    auth: {
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  };
}

describe('login actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loginServerRateLimiter.clearAll();
  });

  it('rejects invalid email input before hitting Supabase', async () => {
    const supabaseMock = createSupabaseAuthMock();
    mockedCreateClient.mockResolvedValue(supabaseMock as never);

    const formData = new FormData();
    formData.set('email', 'not-an-email');
    formData.set('password', 'secret123');

    await expect(login(formData)).rejects.toThrow('Please enter a valid email address');
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('redirects to the dashboard after successful login', async () => {
    const supabaseMock = createSupabaseAuthMock();
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email_confirmed_at: '2026-04-02T00:00:00.000Z',
        },
      },
      error: null,
    });
    mockedCreateClient.mockResolvedValue(supabaseMock as never);

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'secret123');

    await expect(login(formData)).rejects.toThrow('NEXT_REDIRECT');
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
    });
    expect(mockedClearCaptchaChallengesForEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('returns success when password reset email is sent', async () => {
    const supabaseMock = createSupabaseAuthMock();
    supabaseMock.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    mockedCreateClient.mockResolvedValue(supabaseMock as never);

    const result = await resetPassword('test@example.com');

    expect(supabaseMock.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/reset-password'),
      })
    );
    expect(result).toEqual({ success: true });
  });

  it('requires a challenge after repeated failed attempts', async () => {
    const supabaseMock = createSupabaseAuthMock();
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });
    mockedCreateClient.mockResolvedValue(supabaseMock as never);

    const formData = new FormData();
    formData.set('email', 'captcha@example.com');
    formData.set('password', 'wrong-password');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(login(formData)).rejects.toThrow('Invalid email or password. Please try again.');
    }

    await expect(login(formData)).rejects.toThrow('CAPTCHA_REQUIRED');
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledTimes(3);
  });

  it('blocks after too many failed attempts even with a valid challenge', async () => {
    const supabaseMock = createSupabaseAuthMock();
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });
    mockedCreateClient.mockResolvedValue(supabaseMock as never);
    mockedValidateCaptchaChallenge.mockReturnValue(true);

    const firstAttempts = new FormData();
    firstAttempts.set('email', 'blocked@example.com');
    firstAttempts.set('password', 'wrong-password');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(login(firstAttempts)).rejects.toThrow('Invalid email or password. Please try again.');
    }

    const captchaAttempt = new FormData();
    captchaAttempt.set('email', 'blocked@example.com');
    captchaAttempt.set('password', 'wrong-password');
    captchaAttempt.set('captchaId', 'captcha-1');
    captchaAttempt.set('captchaAnswer', '7');

    await expect(login(captchaAttempt)).rejects.toThrow('Invalid email or password. Please try again.');
    await expect(login(captchaAttempt)).rejects.toThrow('Invalid email or password. Please try again.');
    await expect(login(captchaAttempt)).rejects.toThrow('Too many login attempts. Please try again in');
    expect(mockedValidateCaptchaChallenge).toHaveBeenCalled();
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledTimes(5);
  });
});
