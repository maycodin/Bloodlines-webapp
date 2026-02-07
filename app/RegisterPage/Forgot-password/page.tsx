"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setError(null);
    setSuccess(true);

    // call API to send reset link
    console.log("Reset link sent to:", email);
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-gray-600">Email address</label>
                <input
                  type="email"
                  className="input bg-gray-100 outline-none border-none focus:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {success && (
                <p className="text-xs text-green-600">
                  Reset link sent! Check your inbox.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 mt-6 rounded-lg font-medium bg-red-600 text-white"
              >
                Send reset link
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
          </div>
        </div>
      </section>
    </main>
  );
}
