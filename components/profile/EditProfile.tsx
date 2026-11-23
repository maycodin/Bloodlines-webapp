"use client";

import { useState } from "react";
import { ArrowLeft, Check, Loader2, LocateFixed, Pencil, Plus, X } from "lucide-react";
import { donor, DonorProfile, DonorProfileInput } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { UserAvatar } from "@/components/DashboardNavbar";

type FieldKey = keyof DonorProfileInput;

type Field = {
  key: FieldKey;
  label: string;
  type?: "text" | "tel" | "date" | "select";
  options?: string[];
  placeholder?: string;
};

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: "Personal",
    fields: [
      { key: "fullName", label: "Full Name" },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
      { key: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "+2348012345678" },
      { key: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
      { key: "genotype", label: "Genotype", type: "select", options: ["AA", "AS", "SS", "AC", "SC"] },
    ],
  },
  {
    title: "Location & Care",
    fields: [
      { key: "state", label: "State", placeholder: "e.g., Lagos State" },
      { key: "city", label: "City", placeholder: "e.g., Ikeja" },
      { key: "address", label: "Street Address", placeholder: "e.g., 12 Allen Avenue" },
      { key: "closestHospital", label: "Closest Hospital", placeholder: "e.g., Lagos University Teaching Hospital" },
    ],
  },
  {
    title: "Donation",
    fields: [{ key: "lastDonationDate", label: "Last Donation Date", type: "date" }],
  },
  {
    title: "Emergency Contact",
    fields: [
      { key: "emergencyContact", label: "Contact Name" },
      { key: "emergencyContactPhone", label: "Contact Phone", type: "tel" },
    ],
  },
];

const inputClass =
  "w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C91E1E]";

const displayValue = (profile: DonorProfile, key: FieldKey) => {
  const value = (profile as any)[key];
  if (!value) return "";
  return key === "lastDonationDate" ? String(value).slice(0, 10) : String(value);
};

type EditProfileProps = {
  profile: DonorProfile;
  onBack: () => void;
  onSaved: (profile: DonorProfile) => void;
};

export default function EditProfile({ profile, onBack, onSaved }: EditProfileProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState<FieldKey | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const hasMapLocation = typeof profile.latitude === "number" && typeof profile.longitude === "number" && !(profile.latitude === 0 && profile.longitude === 0);

  const save = async (changes: DonorProfileInput, successText = "Profile updated") => {
    setSaving(true);
    try {
      await donor.updateProfile(changes);
      onSaved(await donor.getProfile());
      setEditing(null);
      showToast(successText);
    } catch (err: any) {
      showToast(err?.message || "Could not save your changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveField = (key: FieldKey) => {
    const value = draft.trim();
    if (!value) {
      showToast("Please enter a value, or press cancel.", "error");
      return;
    }
    const changes: DonorProfileInput = { [key]: key === "lastDonationDate" ? new Date(value).toISOString() : value };
    // The backend counts "location" and "country" towards profile completion
    if (key === "city" || key === "state") {
      const city = key === "city" ? value : profile.city;
      const state = key === "state" ? value : profile.state;
      changes.location = [city, state].filter(Boolean).join(", ");
      if (!profile.country) changes.country = "Nigeria";
    }
    save(changes);
  };

  const setMapLocation = () => {
    if (!navigator.geolocation) {
      showToast("Your browser does not support location access.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLocating(false);
        await save({ latitude: coords.latitude, longitude: coords.longitude }, "Map location saved");
      },
      (error) => {
        setLocating(false);
        showToast(
          error.code === error.PERMISSION_DENIED
            ? "Location access was blocked. Please allow it in your browser to set your map location."
            : "Could not get your location. Please try again.",
          "error"
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const renderInput = (field: Field) =>
    field.type === "select" ? (
      <select autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} className={inputClass}>
        <option value="">Select</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : (
      <input
        autoFocus
        type={field.type || "text"}
        value={draft}
        placeholder={field.placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && saveField(field.key)}
        className={inputClass}
      />
    );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} aria-label="Back to profile" className="p-2 -ml-2 rounded-lg text-gray-900 hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <UserAvatar size="w-16 h-16" textSize="text-2xl" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{profile.fullName}</p>
          <p className="text-sm text-gray-500 truncate">{profile.email}</p>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">{section.title}</h2>
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {section.fields.map((field) => {
              const value = displayValue(profile, field.key);
              const isEditing = editing === field.key;
              return (
                <div key={field.key} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{field.label}</p>
                      {isEditing ? (
                        renderInput(field)
                      ) : value ? (
                        <p className="text-lg text-gray-900 break-words">{value}</p>
                      ) : (
                        <p className="text-gray-400 italic">Not set, tap to add</p>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-1 pt-6">
                        <button onClick={() => saveField(field.key)} disabled={saving} aria-label={`Save ${field.label}`} className="p-2 rounded-lg text-[#1E7B3A] hover:bg-green-50 disabled:opacity-50">
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setEditing(null)} disabled={saving} aria-label="Cancel" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditing(field.key);
                          setDraft(value);
                        }}
                        aria-label={`Edit ${field.label}`}
                        className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        {value ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {section.title === "Location & Care" && (
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Map Location</p>
                  <p className={hasMapLocation ? "text-lg text-gray-900" : "text-gray-400 italic"}>{hasMapLocation ? "Set" : "Not set"}</p>
                  <p className="text-xs text-gray-500 mt-1">Used to match you with blood requests near you.</p>
                </div>
                <button onClick={setMapLocation} disabled={locating || saving} className="flex items-center gap-2 text-sm font-medium text-[#C91E1E] dark:text-[#F44336] disabled:opacity-50">
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                  {hasMapLocation ? "Update" : "Use my location"}
                </button>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
