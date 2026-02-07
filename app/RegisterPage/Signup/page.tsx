"use client";

import { useState } from "react";
import Image from "next/image";

type FormData = {
  fullName: string;
  gender: string;
  phone: string;
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
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gender: "",
    phone: "",
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
  };

  /* ---- Validation ---- */

  const phoneRegex = /^(0\d{10}|\+234\d{10})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const step1Complete =
    formData.fullName.trim() &&
    formData.gender &&
    phoneRegex.test(formData.phone);

  const step2Complete =
    emailRegex.test(formData.email) &&
    formData.bloodGroup &&
    formData.genotype &&
    formData.location;

  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  const passwordScore = [hasMinLength, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  const passwordStrong = passwordScore === 3;

  const step3Complete =
    passwordStrong &&
    formData.password === formData.confirmPassword &&
    formData.agreed;

  function StepBadge({
    index,
    currentStep,
  }: {
    index: number;
    currentStep: number;
  }) {
    const isActive = currentStep === index;
    const isImageStep = index === 1;

    return (
      <div
        className={`relative flex-1 py-2 text-center text-sm font-medium rounded-md
          ${
            isActive
              ? isImageStep
                ? "bg-transparent text-white"
                : "bg-[#2d7c39] text-white"
              : "bg-green-50 text-gray-700"
          }`}
      >
        {isActive && isImageStep && (
          <Image
            src="/Rectangle.png"
            alt="Visual"
            fill
            className="object-cover z-0"
          />
        )}

        <span className="relative z-10">Step {index}</span>
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
            {/* Design Lines */}
            <div className="absolute top-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute bottom-0 right-0 w-2 h-px bg-gray-200" />
            <div className="absolute right-0 top-0 h-full w-px bg-gray-200" />

            <h1 className="text-3xl font-semibold mb-2">Join BloodLines</h1>
            <p className="text-gray-700 mb-6">
              Create your account to start saving lives
            </p>

            {/* STEPS */}
            <div className="flex gap-0.5 mb-8 bg-green-50 rounded-xl">
              <StepBadge index={1} currentStep={step} />
              <StepBadge index={2} currentStep={step} />
              <StepBadge index={3} currentStep={step} />
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Full name</label>
                  <input
                    className="input bg-gray-100 outline-none border-none"
                    value={formData.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Gender</label>
                  <select
                    className="input bg-gray-100 outline-none border-none"
                    value={formData.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    disabled={!formData.fullName.trim()}
                  >
                    <option value=""></option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Phone number</label>
                  <input
                    className="input bg-gray-100 outline-none border-none"
                    value={formData.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    disabled={!formData.gender}
                  />
                </div>

                <button
                  disabled={!step1Complete}
                  onClick={() => setStep(2)}
                  className={`w-full py-3 mt-20 rounded-lg font-medium
      ${step1Complete ? "bg-red-600 text-white" : "bg-gray-400 text-white"}`}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Email address</label>
                  <input
                    className="input bg-gray-100 outline-none border-none"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Blood Group</label>
                  <select
                    className="input bg-gray-100 outline-none border-none"
                    value={formData.bloodGroup}
                    onChange={(e) => update("bloodGroup", e.target.value)}
                    disabled={!emailRegex.test(formData.email)}
                  >
                    <option value=""></option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Genotype</label>
                  <select
                    className="input bg-gray-100 outline-none border-none"
                    value={formData.genotype}
                    onChange={(e) => update("genotype", e.target.value)}
                    disabled={!formData.bloodGroup}
                  >
                    <option value=""></option>
                    <option>AC</option>
                    <option>AS</option>
                    <option>AA</option>
                    <option>SS</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm">Location</label>
                    <select
                      className="input bg-gray-100 outline-none border-none"
                      value={formData.location}
                      onChange={(e) => update("location", e.target.value)}
                      disabled={!formData.genotype}
                    >
                      <option value=""></option>
                      <option>Ondo</option>
                      <option>Lagos</option>
                      <option>Ekiti</option>
                      <option>Abuja</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Last Donation Date</label>
                    <input
                      type="date"
                      className="input bg-gray-100 outline-none border-none"
                      value={formData.lastDonationDate}
                      onChange={(e) =>
                        update("lastDonationDate", e.target.value)
                      }
                      disabled={!formData.location}
                    />
                  </div>
                </div>

                <button
                  disabled={!step2Complete}
                  onClick={() => setStep(3)}
                  className={`w-full py-3 rounded-lg font-medium
      ${step2Complete ? "bg-red-600 text-white" : "bg-gray-400 text-white"}`}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-sm">Password</label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input bg-gray-100 outline-none border-none pr-10"
                      value={formData.password}
                      onChange={(e) => update("password", e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span>Password strength</span>

                  <div className="flex-1 h-1.5 bg-gray-300 rounded">
                    <div
                      className="h-full bg-[#2d7c39] transition-all"
                      style={{
                        width: `${(passwordScore / 3) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Hints */}
                {formData.password && !passwordStrong && (
                  <div className="flex gap-4 text-xs">
                    <Checklist
                      ok={hasMinLength}
                      label="at least 8 characters"
                    />
                    <Checklist ok={hasNumber} label="number" />
                    <Checklist ok={hasSpecial} label="special character" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm">Confirm Password</label>

                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="input bg-gray-100 outline-none border-none pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        update("confirmPassword", e.target.value)
                      }
                      disabled={!passwordStrong}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      disabled={!passwordStrong}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 text-xs">
                  <input
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={(e) => update("agreed", e.target.checked)}
                    disabled={
                      !passwordStrong ||
                      formData.password !== formData.confirmPassword
                    }
                    className="w-4 h-4"
                  />
                  I agree to donate voluntarily and responsibly
                </label>

                <button
                  disabled={!step3Complete}
                  className={`w-full py-3 rounded-lg font-medium
      ${step3Complete ? "bg-red-600 text-white" : "bg-gray-400 text-white"}`}
                >
                  Create an account
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Checklist({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 ${
        ok ? "text-[#2d7c39]" : "text-red-500"
      }`}
    >
      <span>{ok ? "✔" : "✖"}</span>
      <span>{label}</span>
    </div>
  );
}
