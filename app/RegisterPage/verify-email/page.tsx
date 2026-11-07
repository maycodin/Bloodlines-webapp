// app/verify-email/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_URL, auth } from "@/lib/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // The email address saved at signup (kept in this browser tab only), so resending needs no typing
  useEffect(() => {
    try {
      setResendEmail(sessionStorage.getItem("pendingVerificationEmail") || "");
    } catch {}
  }, []);

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      setResendStatus("Enter the email address you signed up with.");
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    const result = await auth.resendVerification(resendEmail.trim());
    setIsResending(false);
    setResendStatus(result.success ? "A new verification link has been sent. Please check your inbox." : result.error || "Could not resend the email. Please try again.");
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided. Please check your email link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully! You can now log in.");
          
          // Redirect to login after 3 seconds; the login page then shows "email verified"
          setTimeout(() => {
            router.push("/RegisterPage/Login?verified=1");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.message || "Email verification failed. The link may be expired or invalid.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

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

            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {status === "verifying" && (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              )}
              {status === "error" && (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {status === "verifying" && "Verifying Email"}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-8">{message}</p>

            {/* Action Buttons */}
            {status === "success" && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/RegisterPage/Login?verified=1")}
                  className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <Link
                  href="/RegisterPage/Login"
                  className="block w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
                >
                  Back to Login
                </Link>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full p-3 bg-gray-100 rounded-lg outline-none text-left"
                />
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </button>
                {resendStatus && <p className="text-sm text-gray-600">{resendStatus}</p>}
              </div>
            )}

            {status === "verifying" && (
              <p className="text-sm text-gray-500">
                Please wait while we verify your email...
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}