"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const err: typeof errors = {};

    if (!email) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) err.email = "Enter a valid email";

    if (!password) err.password = "Password is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    console.log({ email, password, remember });
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
            {/* DESIGN LINES */}
            <div className="absolute top-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute bottom-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute right-0 top-0 h-full w-px bg-gray-200" />

            <h1 className="text-3xl font-semibold mb-2">Welcome Back!</h1>
            <p className="text-gray-600 mb-8">
              Please provide your details to log into your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-gray-600">
                  Enter email address
                </label>
                <input
                  type="email"
                  className="input bg-gray-100 outline-none border-none focus:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    className="input bg-gray-100 pr-10 outline-none border-none focus:ring-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
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
                className="w-full py-3 mt-6 rounded-lg font-medium bg-red-600 text-white"
              >
                Login
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
