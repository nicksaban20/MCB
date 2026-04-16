'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { formatRetryDelay, loginServerRateLimiter } from '@/utils/server-rate-limit'
import { clearCaptchaChallengesForEmail, validateCaptchaChallenge } from '@/utils/server-captcha'

export interface LoginResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const captchaId = (formData.get('captchaId') as string | null)?.trim() ?? ''
  const captchaAnswer = (formData.get('captchaAnswer') as string | null)?.trim() ?? ''

  // Basic validation - throw error that client can catch
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address')
  }

  const rateLimitStatus = await loginServerRateLimiter.getStatus(email)
  if (!rateLimitStatus.allowed) {
    throw new Error(
      `Too many login attempts. Please try again in ${formatRetryDelay(rateLimitStatus.retryAfterMs)}.`
    )
  }

  if (await loginServerRateLimiter.getAttemptCount(email) >= 3) {
    if (!captchaId || !captchaAnswer) {
      throw new Error('CAPTCHA_REQUIRED')
    }

    const isCaptchaValid = validateCaptchaChallenge({
      email,
      captchaId,
      captchaAnswer,
    })

    if (!isCaptchaValid) {
      throw new Error('CAPTCHA_INVALID')
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    await loginServerRateLimiter.recordFailure(email)
    // Handle specific error types
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please try again.')
    } else if (error.message.includes('Email not confirmed') || error.message.includes('email')) {
      throw new Error('EMAIL_NOT_VERIFIED')
    } else if (error.message.includes('Too many requests')) {
      throw new Error('Too many login attempts. Please try again later.')
    } else {
      throw new Error(error.message || 'An error occurred during login. Please try again.')
    }
  }

  // Check if email is verified
  if (data.user && !data.user.email_confirmed_at) {
    await loginServerRateLimiter.recordFailure(email)
    throw new Error('EMAIL_NOT_VERIFIED')
  }

  await loginServerRateLimiter.reset(email)
  clearCaptchaChallengesForEmail(email)

  // Successful login - redirect
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  if (!email || !email.trim()) {
    return {
      success: false,
      error: 'Email is required',
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return {
      success: false,
      error: 'Please enter a valid email address',
    }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to send password reset email',
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    console.error('Password reset error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Resend email verification
 * Note: Supabase requires calling signUp again with the same email to resend verification
 * This is safe - it won't create a duplicate user, just resends the email
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.trim()) {
    return {
      success: false,
      error: 'Email is required',
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return {
      success: false,
      error: 'Please enter a valid email address',
    }
  }

  try {
    // Use a client-side approach - the client component will handle this
    // This is because Supabase's resend verification requires the client SDK
    // The client will call signUp again with a dummy password to trigger resend
    return {
      success: true,
      error: 'Please use the resend button in the login form. This will trigger a new verification email.',
    }
  } catch (err) {
    console.error('Resend verification error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
} 
