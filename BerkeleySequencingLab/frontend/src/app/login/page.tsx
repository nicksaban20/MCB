"use client"
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { login, resetPassword } from "./actions";
import { createClient } from "@/utils/supabase/client";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaPrompt, setCaptchaPrompt] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get('reason') === 'timeout') {
      setError('Your session expired due to inactivity. Please sign in again.');
    }
    if (searchParams.get('reset') === 'success') {
      setSuccessMessage('Password updated successfully. Please sign in with your new password.');
    }
  }, [searchParams]);

  const loadCaptchaChallenge = async (email: string) => {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setCaptchaLoading(true);

    try {
      const response = await fetch('/api/auth/captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to load verification challenge.');
      }

      setCaptchaId(responseBody.captchaId);
      setCaptchaPrompt(responseBody.prompt);
      setCaptchaAnswer("");
      setShowCaptcha(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load verification challenge.'));
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setShowResendVerification(false);
    const formData = new FormData(e.currentTarget);
    const submittedEmail = ((formData.get('email') as string) || '').trim().toLowerCase();
    
    try {
      if (captchaId) {
        formData.set('captchaId', captchaId);
      }
      if (captchaAnswer) {
        formData.set('captchaAnswer', captchaAnswer);
      }

      await login(formData);
      // If we get here, redirect happened on server side
      // But just in case, redirect client-side too
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "An unexpected error occurred. Please try again.");
      setError(errorMessage);
      
      if (errorMessage === 'EMAIL_NOT_VERIFIED') {
        setShowResendVerification(true);
        setError('Please verify your email address before signing in. Check your inbox for the verification link.');
      } else if (errorMessage === 'CAPTCHA_REQUIRED') {
        setError('Please complete the verification challenge before trying again.');
        await loadCaptchaChallenge(submittedEmail);
      } else if (errorMessage === 'CAPTCHA_INVALID') {
        setError('That verification answer was incorrect. Please try a new challenge.');
        await loadCaptchaChallenge(submittedEmail);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setSuccessMessage("Password reset email sent! Please check your inbox.");
        setResetEmail("");
        setTimeout(() => {
          setShowForgotPassword(false);
        }, 3000);
      } else {
        setError(result.error || "Failed to send password reset email.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResetLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const form = document.querySelector('form') as HTMLFormElement;
      if (!form) {
        setError("Please enter your email address first.");
        setResetLoading(false);
        return;
      }

      const formData = new FormData(form);
      const email = formData.get('email') as string;
      
      if (!email || !email.trim()) {
        setError("Please enter your email address first.");
        setResetLoading(false);
        return;
      }

      // Use Supabase client to resend verification email
      // Calling signUp again with the same email will resend the verification email
      // This is safe - it won't create a duplicate user
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // If resend fails, try signUp as fallback (Supabase will resend email for existing users)
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: 'temp-password-to-trigger-resend', // Dummy password
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
          setError("Failed to send verification email. Please try signing up again.");
        } else {
          setSuccessMessage("Verification email sent! Please check your inbox.");
          setShowResendVerification(false);
        }
      } else {
        setSuccessMessage("Verification email sent! Please check your inbox.");
        setShowResendVerification(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Resend verification error:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMessage("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Error signing in with Google:", error);
        if (error.message.includes('provider is not enabled')) {
          setError("Google sign-in is not enabled. Please contact the administrator or use email/password to sign in.");
        } else {
          setError(`Google sign-in failed: ${error.message}`);
        }
      }
      // If successful, the user will be redirected to Google's OAuth page
      // No need to handle success here as redirect happens automatically
    } catch (err: unknown) {
      console.error("Exception during Google sign-in:", err);
      setError("An unexpected error occurred during Google sign-in. Please try again.");
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
            Secure access for clients, staff, and superadmins
          </h1>
          <p className="text-sm text-blue-100 sm:text-base">
            Sign in to manage orders, review sequencing data, and access lab operations tools from any device.
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 md:px-10 lg:w-1/2 lg:px-16 lg:py-12">
        <div className="mx-auto w-full max-w-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-black">Sign In</h2>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Resend Verification */}
        {showResendVerification && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
            <p className="mb-2">Your email needs to be verified before you can sign in.</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resetLoading}
              className="text-yellow-900 underline hover:no-underline"
            >
              {resetLoading ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <input 
                name="email"
                type="email" 
                placeholder="Email" 
                className="w-full rounded border p-3 text-gray-700 placeholder-gray-400" 
                required 
              />
            </div>
            <div>
              <input 
                name="password"
                type="password" 
                placeholder="Password" 
                className="w-full rounded border p-3 text-gray-700 placeholder-gray-400" 
                required 
              />
            </div>
            {showCaptcha && (
              <div className="space-y-2 rounded-md border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-yellow-900">
                    Verification challenge: {captchaPrompt || 'Loading...'}
                  </p>
                  <button
                    type="button"
                    onClick={() => loadCaptchaChallenge(((document.querySelector('input[name=\"email\"]') as HTMLInputElement | null)?.value || '').trim().toLowerCase())}
                    className="text-sm text-yellow-900 underline hover:no-underline"
                    disabled={captchaLoading}
                  >
                    {captchaLoading ? 'Refreshing...' : 'Refresh challenge'}
                  </button>
                </div>
                <input type="hidden" name="captchaId" value={captchaId} />
                <input
                  name="captchaAnswer"
                  type="text"
                  placeholder="Enter the answer"
                  className="p-3 placeholder-gray-400 text-gray-700 border rounded w-full"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Forgot password?
            </button>
            <button 
              type="submit" 
              className="w-full rounded bg-[#003262] p-3 text-lg text-white transition-colors hover:bg-[#00204a] disabled:cursor-not-allowed disabled:bg-gray-400" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-gray-600 mb-4">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full rounded border p-3 text-gray-700 placeholder-gray-400"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required 
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button 
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  setError("");
                }}
                className="flex-1 rounded border border-[#003262] bg-white p-3 text-lg text-[#003262] transition-colors hover:bg-[#FDB515] hover:text-[#003262]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 rounded bg-[#003262] p-3 text-lg text-white transition-colors hover:bg-[#00204a] disabled:cursor-not-allowed disabled:bg-gray-400" 
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
        
        {/* Google Sign In */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#003262] bg-white px-4 py-3 text-lg font-medium text-[#003262] hover:bg-[#FDB515] hover:text-[#003262]"
        >
          <FcGoogle size={24} />
          Sign in with Google
        </button>
        
        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account? <Link href="/signin" className="text-[#003262] underline not-last:font-semibold">Sign Up</Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
