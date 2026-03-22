"use client"
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { validatePassword } from "@/utils/security";
import { validateOnboardingData } from "@/utils/onboarding";

const Auth = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validate all fields
    const validation = validateOnboardingData({
      firstName,
      lastName,
      organization,
      phone,
      email,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Additional password strength check
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors({
        ...errors,
        password: passwordValidation.errors.join(', '),
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            organization: organization.trim() || null,
            phone: phone.trim() || null,
            is_admin: false,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('already registered')) {
          setErrors({ email: 'This email is already registered. Please sign in instead.' });
        } else if (error.message.includes('invalid email')) {
          setErrors({ email: 'Please enter a valid email address' });
        } else if (error.message.includes('password')) {
          setErrors({ password: error.message });
        } else {
          setErrors({ general: error.message || 'An error occurred. Please try again.' });
        }
      } else {
        setSuccessMessage("Account created successfully! Please check your email to verify your account before signing in.");
        // Reset form
        setFirstName("");
        setLastName("");
        setOrganization("");
        setPhone("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPasswordStrength(null);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0) {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength);
      if (validation.errors.length > 0 && confirmPassword) {
        // Clear confirm password error if password is being changed
        const newErrors = { ...errors };
        delete newErrors.confirmPassword;
        setErrors(newErrors);
      }
    } else {
      setPasswordStrength(null);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Allow only digits, spaces, hyphens, and parentheses
    const formatted = value.replace(/[^\d\s\-()]/g, '');
    setPhone(formatted);
  };

  const handleGoogleSignIn = async () => {
    setErrors({});
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
          setErrors({ general: "Google sign-in is not enabled. Please contact the administrator or use email/password to sign up." });
        } else {
          setErrors({ general: `Google sign-in failed: ${error.message}` });
        }
      }
      // If successful, the user will be redirected to Google's OAuth page
      // No need to handle success here as redirect happens automatically
    } catch (err: unknown) {
      console.error("Exception during Google sign-in:", err);
      setErrors({ general: "An unexpected error occurred during Google sign-in. Please try again." });
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return '';
    }
  };

  return (
    <div className="flex bg-white min-h-screen">
      <div className="w-1/2 text-black p-8 flex items-center justify-center rounded-r-lg">
        <img
          src="/login_img.png"
          alt="Berkeley Sequencing Lab"
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>
      <div className="w-1/2 flex flex-col justify-center p-8 max-w-md mx-auto">
        <h2 className="text-2xl text-black font-bold mb-4">Create an Account</h2>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <h3 className="text-lg text-gray-900 font-semibold">Basic Information</h3>
          
          <div className="flex space-x-4">
            <div className="w-1/2">
              <input 
                type="text" 
                placeholder="First Name" 
                className={`p-2 border rounded w-full ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                value={firstName} 
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    const newErrors = { ...errors };
                    delete newErrors.firstName;
                    setErrors(newErrors);
                  }
                }}
                required 
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="w-1/2">
              <input 
                type="text" 
                placeholder="Last Name" 
                className={`p-2 border rounded w-full ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                value={lastName} 
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    const newErrors = { ...errors };
                    delete newErrors.lastName;
                    setErrors(newErrors);
                  }
                }}
                required 
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <input 
              type="text" 
              placeholder="Organization Name (Optional)" 
              className={`p-2 border rounded w-full ${errors.organization ? 'border-red-500' : 'border-gray-300'}`}
              value={organization} 
              onChange={(e) => {
                setOrganization(e.target.value);
                if (errors.organization) {
                  const newErrors = { ...errors };
                  delete newErrors.organization;
                  setErrors(newErrors);
                }
              }}
            />
            {errors.organization && (
              <p className="text-red-500 text-sm mt-1">{errors.organization}</p>
            )}
          </div>

          <div>
            <input 
              type="text" 
              placeholder="Phone Number (Optional)" 
              className={`p-2 border rounded w-full ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              value={phone} 
              onChange={(e) => {
                handlePhoneChange(e.target.value);
                if (errors.phone) {
                  const newErrors = { ...errors };
                  delete newErrors.phone;
                  setErrors(newErrors);
                }
              }}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <h3 className="text-lg text-gray-900 font-semibold mt-6">Login Details</h3>
          
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              className={`p-2 border rounded w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  const newErrors = { ...errors };
                  delete newErrors.email;
                  setErrors(newErrors);
                }
              }}
              required 
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className={`p-2 border rounded w-full pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                value={password} 
                onChange={(e) => {
                  handlePasswordChange(e.target.value);
                  if (errors.password) {
                    const newErrors = { ...errors };
                    delete newErrors.password;
                    setErrors(newErrors);
                  }
                }}
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {passwordStrength && password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 capitalize">{passwordStrength}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
            )}
          </div>

          <div>
            <input 
              type="password" 
              placeholder="Confirm Password" 
              className={`p-2 border rounded w-full ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              value={confirmPassword} 
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  const newErrors = { ...errors };
                  delete newErrors.confirmPassword;
                  setErrors(newErrors);
                }
              }}
              required 
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full p-3 bg-[#003262] text-white rounded text-lg hover:bg-[#00204a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'SIGN UP'}
          </button>
        </form>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white border border-[#003262] rounded-md py-2 px-4 text-[#003262] hover:bg-[#FDB515] hover:text-[#003262]"
        >
          <FcGoogle size={20} />
          Sign up with Google
        </button>
        
        <p className="mt-4 text-gray-300 text-center text-sm">
          Already have an account? <Link href="/login" className="text-sm underline text-[#003262]">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
