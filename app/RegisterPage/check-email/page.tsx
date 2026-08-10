// app/check-email/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function CheckEmailPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen">
      <section className="min-h-[calc(100vh-80px)] p-10 md:py-16 flex items-center justify-center">
        <div className="mx-auto w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/Logo.png"
                alt="BloodLines Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-4">
              We've sent a verification link to your email address.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please click the link in the email to verify your account. 
              If you don't see the email, check your spam folder.
            </p>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Next steps:</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Click the verification link in the email from BloodLines</li>
                <li>Return to this page and click "I've Verified"</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/RegisterPage/Login")}
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                I've Verified, Go to Login
              </button>
              
              <button
                onClick={() => router.push("/RegisterPage/Signup")}
                className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign Up
              </button>
            </div>

            {/* Resend Option */}
            <p className="text-xs text-gray-500 mt-6">
              Didn't receive the email?{" "}
              <button 
                onClick={() => {/* Handle resend */}}
                className="text-red-600 hover:underline"
              >
                Click here to resend
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}