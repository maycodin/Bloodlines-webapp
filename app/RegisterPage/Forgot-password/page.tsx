"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);
    setSuccess(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bloodlines-api-service.onrender.com';
      
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Clear email field after success
        setEmail("");
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/RegisterPage/Login');
        }, 3000);
      } else {
        // Handle specific error responses
        const errorMessage = result.message || result.error || 'Failed to send reset link. Please try again.';
        setServerError(errorMessage);
      }
    } catch (error) {
      setServerError("An error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
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
              className="rounded-sm object-cover"
            />
          </div>

          {/* Form */}
          <div className="bg-white p-10 md:px-10 md:py-20 relative">
            {/* DESIGN LINES */}
            <div className="absolute top-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute bottom-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute right-0 top-0 h-full w-px bg-gray-200" />

            <h1 className="text-3xl font-semibold mb-2">Forgot Password?</h1>
            <p className="text-gray-600 mb-8">
              Enter your email address and we&apos;ll send you a reset link.
            </p>

            {/* Server Error Message */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {serverError}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Reset link sent! Please check your email inbox. Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-gray-600">Email address</label>
                <input
                  type="email"
                  className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || success}
                  placeholder="you@example.com"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full py-3 mt-6 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </button>

              <p className="text-xs text-center text-gray-600">
                Remembered your password?{" "}
                <Link
                  href="/RegisterPage/Login"
                  className="text-[#2d7c39] hover:underline font-medium"
                >
                  Back to login
                </Link>
              </p>
            </form>

            {/* Additional Help Text */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setServerError(null);
                    setSuccess(false);
                  }}
                  className="text-red-600 hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}