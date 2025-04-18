"use client"
 import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const Auth = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const handleSignUp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, organization, phone, is_admin: false },
      },
    });
    if (error) alert(error.message);
    else alert("Check your email for the confirmation link!");
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google"
      });
      if (error) {
        console.error("Error signing in with Google:", error);
      }
    } catch (err) {
      console.error("Exception during Google sign-in:", err);
    }
  };

  return (
    <div className="flex bg-white min-h-screen">
      <div className="w-1/2 text-black p-8 flex items-center rounded-r-lg">
        <p className="text-lg font-semibold">
          TODO: put an image here
        </p>
      </div>
      <div className="w-1/2 flex flex-col justify-center p-8">
        <h2 className="text-2xl text-black font-bold mb-4">Create an Account</h2>
        <form onSubmit={handleSignUp} className="space-y-4 [&>*]:placeholder-gray-300">
          <h3 className="text-lg text-gray-900 font-semibold">Basic Information</h3>
          <div className="flex space-x-4 [&>*]:placeholder-gray-300">
            <input type="text" placeholder="First Name" className="p-2 border text-gray-300 rounded w-1/2" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <input type="text" placeholder="Last Name" className="p-2 border text-gray-300 placeholder-gray-300 rounded w-1/2" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <input type="text" placeholder="Organization Name" className="p-2 text-gray-300 border rounded w-full" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          <input type="text" placeholder="Phone Number" className="p-2 text-gray-300 border rounded w-full" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <h3 className="text-lg text-gray-900 font-semibold mt-6">Login Details</h3>
          <input type="email" placeholder="Email" className="p-2 border text-gray-300 rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="p-2 text-gray-300 border rounded w-full" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm Password" className="p-2 text-gray-300 border rounded w-full" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit" className="w-full p-3 bg-gray-900 text-white rounded text-lg" disabled={loading}>SIGN UP</button>
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
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 px-4 text-gray-700 hover:bg-gray-50"
        >
          <FcGoogle size={20} />
          Sign up with Google
        </button>
        
        <p className="mt-4 text-gray-300 text-center text-sm">
          Already have an account? <Link href="/login" className="text-sm underline text-gray-900">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
