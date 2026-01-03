"use client";

import { useState } from "react";
import Image from "next/image";
import AuthNavbar from "@/components/AuthNavbar";
import StepBadge from "@/components/StepBadge";

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

  /* VALIDATION */

  const step1Complete =
    formData.fullName.trim() && formData.gender && formData.phone.trim();

  const step2Complete =
    formData.email &&
    formData.bloodGroup &&
    formData.genotype &&
    formData.location &&
    formData.lastDonationDate;
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
    const active = currentStep === index;
    const done = currentStep > index;

    return (
      <div
        className={`flex-1 py-2 rounded-md text-center text-sm font-medium
        ${
          done
            ? "bg-white/40 text-gray-700"
            : active
            ? "bg-green-500 text-white"
            : "bg-white/40 text-gray-700"
        }`}
      >
        Step {index}
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <AuthNavbar />

      <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-between px-14">
        <Image
          src="/Side.png"
          alt="Visual"
          width={600}
          height={300}
          className="hidden lg:block"
        />

        {/* FORM */}
        <div className="w-full max-w-lg bg-white p-10">
          <h1 className="text-3xl font-semibold mb-2">Join BloodLines</h1>
          <p className="text-gray-700 mb-6">
            Create your account to start saving lives
          </p>

          {/* STEP INDICATOR */}
          <div className="flex gap-2 mb-8 bg-light-mint p-2 rounded-lg">
            <StepBadge index={1} currentStep={step} />
            <StepBadge index={2} currentStep={step} />
            <StepBadge index={3} currentStep={step} />
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <label htmlFor="fullName">Full name</label>
              <input
                className="input bg-gray-100 outline-none ring-0 border border-transparen"
                value={formData.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />

              <label htmlFor="gender">Gender</label>
              <select
                className="input bg-gray-100 focus:outline-none focus:ring-0"
                value={formData.gender}
                onChange={(e) => update("gender", e.target.value)}
                disabled={!formData.fullName}
              >
                <option value=""></option>
                <option>Male</option>
                <option>Female</option>
              </select>

              <label htmlFor="phoneNumber">Phone number</label>
              <input
                className="input bg-gray-100"
                value={formData.phone}
                onChange={(e) => update("phone", e.target.value)}
                disabled={!formData.gender}
              />

              <button
                disabled={!step1Complete}
                onClick={() => setStep(2)}
                className={`w-full py-3 mt-16 rounded-lg font-medium
                  ${
                    step1Complete
                      ? "bg-red-600 text-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <label htmlFor="email">Email address</label>
              <input
                className="input bg-gray-100"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
              />

              <label htmlFor="bloodGroup">Blood Group</label>
              <select
                className="input bg-gray-100"
                value={formData.bloodGroup}
                onChange={(e) => update("bloodGroup", e.target.value)}
                disabled={!formData.email}
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

              <label htmlFor="genotype">Genotype</label>
              <select
                className="input bg-gray-100"
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

              {/* <div className="flex flex-row">
                <label htmlFor="location">Location</label>
                <select
                  className="input bg-gray-100"
                  value={formData.location}
                  onChange={(e) => update("location", e.target.value)}
                  disabled={!formData.genotype}
                >
                  <option value="">Location</option>
                  <option>Ondo</option>
                  <option>Lagos</option>
                  <option>Ekiti</option>
                  <option>Abuja</option>
                </select>

                <label htmlFor="">Last Donation Date (Optional)</label>
                <input
                  type="date"
                  className="input bg-gray-100"
                  value={formData.lastDonationDate}
                  onChange={(e) => update("lastDonationDate", e.target.value)}
                  disabled={!formData.location}
                />
              </div> */}
              <button
                disabled={!step2Complete}
                onClick={() => setStep(3)}
                className={`w-full py-3 mt-16 rounded-lg font-medium
                  ${
                    step2Complete
                      ? "bg-red-600 text-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <input
                type="password"
                placeholder="Password"
                className="input bg-gray-100"
                value={formData.password}
                onChange={(e) => update("password", e.target.value)}
              />

              {/* PASSWORD STRENGTH */}
              <div className="space-y-2 text-sm">
                <div className="h-2 rounded bg-gray-300 overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(passwordScore / 3) * 100}%` }}
                  />
                </div>

                <Checklist ok={hasMinLength} label="At least 8 characters" />
                <Checklist ok={hasNumber} label="Contains a number" />
                <Checklist ok={hasSpecial} label="Special character" />
              </div>

              <input
                type="password"
                placeholder="Confirm password"
                className="input"
                value={formData.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                disabled={!passwordStrong}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.agreed}
                  onChange={(e) => update("agreed", e.target.checked)}
                />
                I agree to donate voluntarily and responsibly
              </label>

              <button
                disabled={!step3Complete}
                className={`w-full py-3 mt-16 rounded-lg font-medium
                  ${
                    step3Complete
                      ? "bg-red-600 text-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Checklist({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 ${
        ok ? "text-green-600" : "text-red-500"
      }`}
    >
      <span>{ok ? "✔" : "✖"}</span>
      <span>{label}</span>
    </div>
  );
}
