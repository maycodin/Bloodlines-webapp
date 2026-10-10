"use client";

import { useEffect, useState } from "react";
import { Edit2, Save, X, Loader2, LocateFixed } from "lucide-react";
import { donor, DonorProfile, DonorProfileInput } from "@/lib/api";
import InlineMessage, { Message } from "@/components/InlineMessage";

type DonorProfileFormProps = {
  // Called after a successful save, so the dashboard can refresh the completion card
  onSaved?: () => void;
};

type FormState = {
  fullName: string;
  phoneNumber: string;
  gender: string;
  bloodGroup: string;
  genotype: string;
  lastDonationDate: string;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  emergencyContact: string;
  emergencyContactPhone: string;
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "SS", "AC", "SC"];
const GENDERS = ["Male", "Female", "Other"];

const toFormState = (p: DonorProfile | null): FormState => ({
  fullName: p?.fullName || "",
  phoneNumber: p?.phoneNumber || "",
  gender: p?.gender || "",
  bloodGroup: p?.bloodGroup || "",
  genotype: p?.genotype || "",
  lastDonationDate: p?.lastDonationDate ? p.lastDonationDate.slice(0, 10) : "",
  location: p?.location || "",
  address: p?.address || "",
  city: p?.city || "",
  state: p?.state || "",
  country: p?.country || "",
  latitude: typeof p?.latitude === "number" ? p.latitude : null,
  longitude: typeof p?.longitude === "number" ? p.longitude : null,
  emergencyContact: p?.emergencyContact || "",
  emergencyContactPhone: p?.emergencyContactPhone || "",
});

const hasCoordinates = (lat: number | null | undefined, lng: number | null | undefined) =>
  typeof lat === "number" && typeof lng === "number" && !(lat === 0 && lng === 0);

const inputClass =
  "w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent";

const DonorProfileForm = ({ onSaved }: DonorProfileFormProps) => {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [form, setForm] = useState<FormState>(toFormState(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const loadProfile = async () => {
    try {
      const data = await donor.getProfile();
      setProfile(data);
      return data;
    } catch (error: any) {
      console.error("Failed to load donor profile:", error);
      setMessage({ type: "error", text: error?.message || "Could not load your profile." });
      return null;
    }
  };

  useEffect(() => {
    loadProfile().finally(() => setIsLoading(false));
  }, []);

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const startEditing = () => {
    setForm(toFormState(profile));
    setMessage(null);
    setIsEditing(true);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Your browser does not support location access." });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setIsLocating(false);
      },
      (geoError) => {
        setIsLocating(false);
        setMessage({
          type: "error",
          text:
            geoError.code === geoError.PERMISSION_DENIED
              ? "Location access was blocked. Please allow it in your browser to set your map location."
              : "Could not get your location. Please try again.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    // Only send fields that have a value, so blank inputs never wipe saved data
    const payload: DonorProfileInput = {};
    const textFields: (keyof FormState)[] = [
      "fullName", "phoneNumber", "gender", "bloodGroup", "genotype", "location",
      "address", "city", "state", "country", "emergencyContact", "emergencyContactPhone",
    ];
    textFields.forEach((field) => {
      const value = form[field];
      if (typeof value === "string" && value.trim() !== "") {
        (payload as any)[field] = value.trim();
      }
    });
    // Fewer fields on screen: fill the two the backend still counts for completion
    // ("location" and "country") from what the donor did enter
    if (!payload.location && (form.city.trim() || form.state.trim())) {
      payload.location = [form.city.trim(), form.state.trim()].filter(Boolean).join(", ");
    }
    if (!payload.country) {
      payload.country = "Nigeria";
    }
    if (form.lastDonationDate) {
      payload.lastDonationDate = new Date(form.lastDonationDate).toISOString();
    }
    if (hasCoordinates(form.latitude, form.longitude)) {
      payload.latitude = form.latitude as number;
      payload.longitude = form.longitude as number;
    }

    try {
      await donor.updateProfile(payload);
      await loadProfile();
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      onSaved?.();
    } catch (error: any) {
      console.error("Failed to update donor profile:", error);
      setMessage({ type: "error", text: error?.message || "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  // Plain render functions (not components), so inputs keep focus while typing
  const renderField = (label: string, value?: string | null) => (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-900 break-words">{value || "Not set"}</p>
    </div>
  );

  const renderTextInput = (label: string, field: keyof FormState, type = "text", placeholder?: string) => (
    <label className="block">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <input
        type={type}
        value={(form[field] as string) || ""}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );

  const renderSelect = (label: string, field: keyof FormState, options: string[]) => (
    <label className="block">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <select
        value={(form[field] as string) || ""}
        onChange={(e) => update(field, e.target.value)}
        className={inputClass}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );

  const renderSectionTitle = (title: string) => (
    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide pt-4 border-t border-gray-100">
      {title}
    </h3>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-[#D8D6D6] p-6 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  const mapLocationSet = isEditing
    ? hasCoordinates(form.latitude, form.longitude)
    : hasCoordinates(profile?.latitude, profile?.longitude);

  return (
    <div className="bg-white rounded-lg border border-[#D8D6D6] p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
        {!isEditing ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => { setIsEditing(false); setMessage(null); }}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <InlineMessage message={message} onClose={() => setMessage(null)} />

      <div className="space-y-4">
        {/* Personal details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              {renderTextInput("Full Name", "fullName")}
              {renderField("Email", profile?.email)}
              {renderTextInput("Phone", "phoneNumber", "tel", "+2348012345678")}
              {renderSelect("Gender", "gender", GENDERS)}
              {renderSelect("Blood Group", "bloodGroup", BLOOD_GROUPS)}
              {renderSelect("Genotype", "genotype", GENOTYPES)}
              {renderTextInput("Last Donation Date", "lastDonationDate", "date")}
            </>
          ) : (
            <>
              {renderField("Full Name", profile?.fullName)}
              {renderField("Email", profile?.email)}
              {renderField("Phone", profile?.phoneNumber)}
              {renderField("Gender", profile?.gender)}
              {renderField("Blood Group", profile?.bloodGroup)}
              {renderField("Genotype", profile?.genotype)}
              {renderField(
                "Last Donation Date",
                profile?.lastDonationDate ? new Date(profile.lastDonationDate).toLocaleDateString() : null
              )}
              {renderField(
                "Member Since",
                profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : null
              )}
            </>
          )}
        </div>

        {/* Address and location */}
        {renderSectionTitle("Address")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              {renderTextInput("Street Address", "address", "text", "e.g., 12 Aminu Kano Crescent")}
              {renderTextInput("City", "city", "text", "e.g., Wuse 2")}
              {renderTextInput("State", "state", "text", "e.g., FCT")}
            </>
          ) : (
            <>
              {renderField(
                "Address",
                [profile?.address, profile?.city, profile?.state].filter(Boolean).join(", ") || null
              )}
            </>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Map Location</p>
            <p className="text-gray-900">{mapLocationSet ? "Set" : "Not set"}</p>
            {isEditing && (
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={isLocating}
                className="mt-1 flex items-center gap-2 text-sm text-[#1B59F8] hover:underline disabled:opacity-50"
              >
                <LocateFixed className="w-4 h-4" />
                {isLocating ? "Getting your location..." : "Use my current location"}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-1">Used to match you with requests near you.</p>
          </div>
        </div>

        {/* Emergency contact */}
        {renderSectionTitle("Emergency Contact")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              {renderTextInput("Contact Name", "emergencyContact")}
              {renderTextInput("Contact Phone", "emergencyContactPhone", "tel")}
            </>
          ) : (
            <>
              {renderField("Contact Name", profile?.emergencyContact)}
              {renderField("Contact Phone", profile?.emergencyContactPhone)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorProfileForm;