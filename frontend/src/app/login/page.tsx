"use client"
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      router.push("/home");
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
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
      {/* Left Side - Image with Text */}
      <div className="w-1/2 bg-white text-black p-8 flex items-center justify-center rounded-r-lg">
        <p className="text-xl font-semibold max-w-md">
          TODO: put an image here
        </p>
      </div>
      {/* Right Side - Login Form */}
      <div className="w-1/2 flex flex-col justify-center px-16 py-12">
        <h2 className="text-3xl text-black font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input type="email" placeholder="Email" className="p-3 placeholder-gray-300 text-gray-300 border rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="p-3  placeholder-gray-300 text-gray-300 border rounded w-full" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full p-3 bg-gray-900 text-white rounded text-lg" disabled={loading}>SIGN IN</button>
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
          Don't have an account? <Link href="/signup" className="text-gray-900 underline not-last:font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
