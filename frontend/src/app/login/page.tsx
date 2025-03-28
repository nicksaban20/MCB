"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { login } from "./actions";
import { createClient } from "@/utils/supabase/client";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await login(formData);
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
    <div className="flex min-h-screen bg-white">
      <div className="w-1/2 bg-white text-black p-8 flex items-center justify-center rounded-r-lg">
        <p className="text-xl font-semibold max-w-md">
          TODO: put an image here
        </p>
      </div>
      <div className="w-1/2 flex flex-col justify-center px-16 py-12">
        <h2 className="text-3xl text-black font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input 
            name="email"
            type="email" 
            placeholder="Email" 
            className="p-3 placeholder-gray-300 text-gray-300 border rounded w-full" 
            required 
          />
          <input 
            name="password"
            type="password" 
            placeholder="Password" 
            className="p-3 placeholder-gray-300 text-gray-300 border rounded w-full" 
            required 
          />
          <button 
            type="submit" 
            className="w-full p-3 bg-gray-900 text-white rounded text-lg" 
            disabled={loading}
          >
            SIGN IN
          </button>
        </form>
        
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
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-700 hover:bg-gray-50 text-lg font-medium"
        >
          <FcGoogle size={24} />
          Sign in with Google
        </button>
        
        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <Link href="/signin" className="text-gray-900 underline not-last:font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
