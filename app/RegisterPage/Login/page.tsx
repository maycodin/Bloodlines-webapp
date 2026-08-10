"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('🔐 Already authenticated, redirecting to:', user.role);
      if (user.role === 'pulse-leader') {
        router.push('/PulseLeader');
      } else if (user.role === 'bridger') {
        router.push('/BridgerDashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/DonorDashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const validate = () => {
    const err: typeof errors = {};

    if (!email) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) err.email = "Enter a valid email";

    if (!password) err.password = "Password is required";

    setErrors(err);
    setServerError(null);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setIsLoading(true);
  setServerError(null);
  setNeedsVerification(false);

  try {
    await login(email, password, remember);
    // Redirect is handled in the auth context after successful login
  } catch (error: any) {
    // Check if error is about email verification
    if (error.message?.toLowerCase().includes("verify") || 
        error.message?.toLowerCase().includes("email not verified")) {
      setNeedsVerification(true);
      setUnverifiedEmail(email);
      setServerError("Please verify your email before logging in.");
    } else {
      setServerError(error.message || "Login failed. Please check your credentials.");
    }
  } finally {
    setIsLoading(false);
  }
};

  const resendVerification = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bloodlines-api-service.onrender.com';
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      
      if (response.ok) {
        alert("Verification email resent! Please check your inbox.");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      alert("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <main className="min-h-screen">
      <section className="min-h-[calc(100vh-80px)] p-10 md:py-16 flex items-center">
        <div className="mx-auto mb-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="hidden lg:block relative h-162.5">
            <Image
              src="/Side.png"
              alt="Visual"
              fill
              className="rounded-sm object-cover w-full h-full"
            />
          </div>

          {/* Form */}
          <div className="bg-white p-10 md:px-10 md:py-20 relative">
            <div className="absolute top-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute bottom-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute right-0 top-0 h-full w-px bg-gray-200" />

            <h1 className="text-3xl font-semibold mb-2">Welcome Back!</h1>
            <p className="text-gray-600 mb-8">
              Please provide your details to log into your account
            </p>

            {/* Server Error Message */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-gray-600">
                  Enter email address
                </label>
                <input
                  type="email"
                  className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || authLoading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600">Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 bg-gray-100 pr-10 rounded outline-none border-none focus:ring-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || authLoading}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    disabled={isLoading || authLoading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {needsVerification && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    Your email hasn't been verified yet.
                  </p>
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="text-sm text-red-600 hover:underline"
                    disabled={isLoading}
                  >
                    Resend verification email
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                    disabled={isLoading || authLoading}
                  />
                  Remember me
                </label>
                <Link
                  href="/RegisterPage/Forgot-password"
                  className="text-gray-900 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full py-3 mt-6 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isLoading || authLoading) ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>

              <p className="text-xs text-center text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/RegisterPage/Signup"
                  className="text-[#2d7c39] hover:underline font-medium"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}