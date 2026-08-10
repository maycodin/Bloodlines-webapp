"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

// Update FormData to match backend expectations
type FormData = {
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string;
  bloodGroup: string;
  genotype: string;
  location: string;
  lastDonationDate: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
};

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/DonorDashboard');
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gender: "",
    phoneNumber: "",
    email: "",
    bloodGroup: "",
    genotype: "",
    location: "",
    lastDonationDate: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const update = (key: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError(null);
    // Clear field-specific error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  /* ---- Validation ---- */

  const phoneRegex = /^(0\d{10}|\+234\d{10})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const step1Complete =
    formData.fullName.trim() &&
    formData.gender &&
    phoneRegex.test(formData.phoneNumber);

  const step2Complete =
    emailRegex.test(formData.email) &&
    formData.bloodGroup &&
    formData.genotype &&
    formData.location;

  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);

  const passwordScore = [hasMinLength, hasNumber, hasSpecial].filter(Boolean).length;
  const passwordStrong = passwordScore === 3;

  const step3Complete =
    passwordStrong &&
    formData.password === formData.confirmPassword &&
    formData.agreed;

  // Validate email format in real-time
  const isEmailValid = emailRegex.test(formData.email);

  const handleSubmit = async () => {
    if (!step3Complete) return;
    
    // Additional validation
    if (!formData.agreed) {
      setError("Please agree to the terms and conditions");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    
    const signupData = {
      fullName: formData.fullName,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      bloodGroup: formData.bloodGroup,
      genotype: formData.genotype,
      location: formData.location,
    };
    
    try {
      const result = await auth.signup(signupData);
      
      if (result.success) {
        setSuccess(
          "Account created successfully! Please check your email to verify your account before logging in."
        );
        
        // Reset form
        setFormData({
          fullName: "",
          gender: "",
          phoneNumber: "",
          email: "",
          bloodGroup: "",
          genotype: "",
          location: "",
          lastDonationDate: "",
          password: "",
          confirmPassword: "",
          agreed: false,
        });
        setStep(1);
        
        // Redirect to check email page after 3 seconds
        setTimeout(() => {
          router.push("/RegisterPage/check-email");
        }, 3000);
      } else {
        // Handle specific field errors from backend
        if (result.error?.includes("email already exists") || result.error?.includes("duplicate key")) {
          setFieldErrors({ email: "This email is already registered. Please login instead." });
          setError("Email already exists. Please use a different email or login.");
        } else if (result.error?.includes("phone")) {
          setFieldErrors({ phoneNumber: "This phone number is already registered." });
          setError(result.error);
        } else {
          setError(result.error || "Signup failed. Please try again.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (newStep: number) => {
    // Validate before moving to next step
    if (newStep === 2 && !step1Complete) {
      if (!formData.fullName.trim()) setFieldErrors({ fullName: "Full name is required" });
      if (!formData.gender) setFieldErrors({ gender: "Please select your gender" });
      if (!phoneRegex.test(formData.phoneNumber)) setFieldErrors({ phoneNumber: "Enter a valid Nigerian phone number" });
      return;
    }
    if (newStep === 3 && !step2Complete) {
      if (!isEmailValid) setFieldErrors({ email: "Enter a valid email address" });
      if (!formData.bloodGroup) setFieldErrors({ bloodGroup: "Please select your blood group" });
      if (!formData.genotype) setFieldErrors({ genotype: "Please select your genotype" });
      if (!formData.location) setFieldErrors({ location: "Please select your location" });
      return;
    }
    setStep(newStep);
    setError(null);
  };

  function StepBadge({ index, currentStep }: { index: number; currentStep: number }) {
    const isActive = currentStep === index;
    const isCompleted = currentStep > index;
    const isImageStep = index === 1;

    return (
      <div
        className={`relative flex-1 py-2 text-center text-sm font-medium rounded-md transition-all
          ${
            isActive
              ? isImageStep
                ? "bg-transparent text-white"
                : "bg-[#2d7c39] text-white"
              : isCompleted
              ? "bg-green-100 text-green-700"
              : "bg-green-50 text-gray-700"
          }`}
      >
        {isActive && isImageStep && (
          <Image
            src="/Rectangle.png"
            alt="Visual"
            fill
            className="object-cover z-0 rounded-md"
          />
        )}
        <span className="relative z-10">
          Step {index} {isCompleted && "✓"}
        </span>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="min-h-[calc(100vh-80px)] p-10 md:py-16 flex items-center">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="hidden lg:block relative h-162.5">
            <Image
              src="/Side.png"
              alt="Visual"
              fill
              className="rounded-sm object-cover"
            />
          </div>

          {/* Form */}
          <div className="w-full max-w-lg bg-white p-10 md:py-16 relative text-sm">
            <div className="absolute top-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute bottom-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute right-0 top-0 h-full w-px bg-gray-200" />

            <h1 className="text-3xl font-semibold mb-2">Join BloodLines</h1>
            <p className="text-gray-700 mb-6">
              Create your account to start saving lives
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* STEPS */}
            <div className="flex gap-0.5 mb-8 bg-green-50 rounded-xl overflow-hidden">
              <StepBadge index={1} currentStep={step} />
              <StepBadge index={2} currentStep={step} />
              <StepBadge index={3} currentStep={step} />
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name <span className="text-red-500">*</span></label>
                  <input
                    className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                    value={formData.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                  {fieldErrors.fullName && <p className="text-xs text-red-500">{fieldErrors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender <span className="text-red-500">*</span></label>
                  <select
                    className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                    value={formData.gender}
                    onChange={(e) => update("gender", e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                  {fieldErrors.gender && <p className="text-xs text-red-500">{fieldErrors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone number <span className="text-red-500">*</span></label>
                  <input
                    className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                    value={formData.phoneNumber}
                    onChange={(e) => update("phoneNumber", e.target.value)}
                    placeholder="08012345678 or +2348012345678"
                  />
                  {formData.phoneNumber && !phoneRegex.test(formData.phoneNumber) && (
                    <p className="text-xs text-red-500 mt-1">
                      Enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)
                    </p>
                  )}
                  {fieldErrors.phoneNumber && <p className="text-xs text-red-500">{fieldErrors.phoneNumber}</p>}
                </div>

                <button
                  disabled={!step1Complete}
                  onClick={() => goToStep(2)}
                  className={`w-full py-3 mt-20 rounded-lg font-medium transition-colors
                    ${step1Complete ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-400 text-white cursor-not-allowed"}`}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                  {formData.email && !emailRegex.test(formData.email) && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid email address</p>
                  )}
                  {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Blood Group <span className="text-red-500">*</span></label>
                  <select
                    className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                    value={formData.bloodGroup}
                    onChange={(e) => update("bloodGroup", e.target.value)}
                  >
                    <option value="">Select blood group</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                  {fieldErrors.bloodGroup && <p className="text-xs text-red-500">{fieldErrors.bloodGroup}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Genotype <span className="text-red-500">*</span></label>
                  <select
                    className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                    value={formData.genotype}
                    onChange={(e) => update("genotype", e.target.value)}
                  >
                    <option value="">Select genotype</option>
                    <option>AA</option><option>AS</option><option>AC</option><option>SS</option>
                  </select>
                  {fieldErrors.genotype && <p className="text-xs text-red-500">{fieldErrors.genotype}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                      value={formData.location}
                      onChange={(e) => update("location", e.target.value)}
                    >
                      <option value="">Select location</option>
                      <option>Lagos</option><option>Abuja</option><option>Ondo</option>
                      <option>Ekiti</option><option>Ogun</option><option>Oyo</option><option>Rivers</option>
                    </select>
                    {fieldErrors.location && <p className="text-xs text-red-500">{fieldErrors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Donation Date</label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-100 rounded outline-none border-none focus:ring-2 focus:ring-red-300"
                      value={formData.lastDonationDate}
                      onChange={(e) => update("lastDonationDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    disabled={!step2Complete}
                    onClick={() => goToStep(3)}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors
                      ${step2Complete ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-400 text-white cursor-not-allowed"}`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-3 bg-gray-100 rounded outline-none border-none pr-10 focus:ring-2 focus:ring-red-300"
                      value={formData.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span>Password strength</span>
                  <div className="flex-1 h-1.5 bg-gray-300 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#2d7c39] transition-all duration-300"
                      style={{ width: `${(passwordScore / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {formData.password && !passwordStrong && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Checklist ok={hasMinLength} label="8+ characters" />
                    <Checklist ok={hasNumber} label="number" />
                    <Checklist ok={hasSpecial} label="special character" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="w-full p-3 bg-gray-100 rounded outline-none border-none pr-10 focus:ring-2 focus:ring-red-300"
                      value={formData.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <label className="flex items-start gap-3 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={(e) => update("agreed", e.target.checked)}
                    className="w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <span className="text-gray-600">
                    I confirm that I am medically fit to donate blood and agree to the{" "}
                    <a href="/terms" className="text-red-600 hover:underline">Terms of Service</a> and{" "}
                    <a href="/privacy" className="text-red-600 hover:underline">Privacy Policy</a>.
                  </span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    disabled={!step3Complete || isSubmitting}
                    onClick={handleSubmit}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors
                      ${step3Complete && !isSubmitting ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-400 text-white cursor-not-allowed"}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Login link for existing users */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/RegisterPage/Login")}
                  className="text-red-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Checklist({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-red-500"}`}>
      <span className="text-sm">{ok ? "✓" : "✗"}</span>
      <span>{label}</span>
    </div>
  );
}