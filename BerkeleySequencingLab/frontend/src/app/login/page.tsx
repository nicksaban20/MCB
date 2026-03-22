"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { login, resetPassword } from "./actions";
import { createClient } from "@/utils/supabase/client";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setShowResendVerification(false);
    
    try {
      const formData = new FormData(e.currentTarget);
      await login(formData);
      // If we get here, redirect happened on server side
      // But just in case, redirect client-side too
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      
      if (errorMessage === 'EMAIL_NOT_VERIFIED') {
        setShowResendVerification(true);
        setError('Please verify your email address before signing in. Check your inbox for the verification link.');
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
    <div className="flex min-h-screen bg-white">
      <div className="w-1/2 bg-white text-black p-8 flex items-center justify-center rounded-r-lg">
        <img
          src="/login_img.png"
          alt="Berkeley Sequencing Lab"
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>
      <div className="w-1/2 flex flex-col justify-center px-16 py-12">
        <h2 className="text-3xl text-black font-bold mb-6 text-center">Sign In</h2>
        
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
                className="p-3 placeholder-gray-300 text-gray-300 border rounded w-full" 
                required 
              />
            </div>
            <div>
              <input 
                name="password"
                type="password" 
                placeholder="Password" 
                className="p-3 placeholder-gray-300 text-gray-300 border rounded w-full" 
                required 
              />
            </div>
            <button 
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Forgot password?
            </button>
            <button 
              type="submit" 
              className="w-full p-3 bg-[#003262] text-white rounded text-lg hover:bg-[#00204a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" 
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
              className="p-3 placeholder-gray-300 text-gray-300 border rounded w-full"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required 
            />
            <div className="flex space-x-2">
              <button 
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  setError("");
                }}
                className="flex-1 p-3 bg-white border border-[#003262] text-[#003262] rounded text-lg hover:bg-[#FDB515] hover:text-[#003262] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 p-3 bg-[#003262] text-white rounded text-lg hover:bg-[#00204a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" 
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
          className="w-full flex items-center justify-center gap-2 bg-white border border-[#003262] rounded-md py-3 px-4 text-[#003262] hover:bg-[#FDB515] hover:text-[#003262] text-lg font-medium"
        >
          <FcGoogle size={24} />
          Sign in with Google
        </button>
        
        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account? <Link href="/signin" className="text-[#003262] underline not-last:font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
