'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { validatePassword } from '@/utils/security';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const initializeRecovery = async () => {
      try {
        const code = searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw new Error(exchangeError.message);
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!isMounted) {
          return;
        }

        setRecoveryReady(Boolean(session));

        if (!session) {
          setError('This password reset link is invalid or has expired. Please request a new one from the login page.');
        }
      } catch (recoveryError) {
        if (!isMounted) {
          return;
        }

        setError(
          recoveryError instanceof Error
            ? recoveryError.message
            : 'Unable to validate the reset link. Please request a new one.'
        );
      } finally {
        if (isMounted) {
          setCheckingLink(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setRecoveryReady(Boolean(session));
        setCheckingLink(false);
        setError('');
      }
    });

    initializeRecovery();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams, supabase.auth]);

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(' '));
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      await supabase.auth.signOut();
      setSuccessMessage('Password updated successfully. Redirecting you to sign in...');

      setTimeout(() => {
        router.push('/login?reset=success');
      }, 1500);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : 'Unable to reset your password. Please request a new reset link.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <div className="flex items-center justify-center bg-[#0A215C] px-6 py-10 text-white lg:w-1/2 lg:px-10">
        <div className="max-w-lg space-y-4 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FDB515]">
            Berkeley Sequencing Lab
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Reset your password securely
          </h1>
          <p className="text-sm text-blue-100 sm:text-base">
            Choose a new password for your account and return to the portal with secure access.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 md:px-10 lg:px-16 lg:py-12">
        <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-2 text-3xl font-bold text-black">Set a New Password</h2>
          <p className="mb-6 text-sm text-gray-600">
            Use at least 8 characters and include uppercase, lowercase, a number, and a special character.
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
              {successMessage}
            </div>
          )}

          {checkingLink ? (
            <p className="text-sm text-gray-600">Checking your reset link...</p>
          ) : recoveryReady ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                className="w-full rounded border p-3 text-gray-700 placeholder-gray-400"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded border p-3 text-gray-700 placeholder-gray-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[#003262] p-3 text-lg text-white transition-colors hover:bg-[#00204a] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? 'Updating password...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Request a fresh password reset email from the login page and then open the newest link.
              </p>
              <Link
                href="/login"
                className="inline-flex rounded bg-[#003262] px-5 py-3 text-sm font-semibold text-white hover:bg-[#00204a]"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
