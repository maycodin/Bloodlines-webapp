"use client";

import { useState } from "react";
import { Loader2, LocateFixed, X } from "lucide-react";
import { bloodRequests } from "@/lib/api";
import { geocodeAddress, BLOOD_TYPES } from "@/lib/requests";
import type { BloodRequestType } from "@/components/CriticalBloodRequestCard";
import InlineMessage, { Message } from "@/components/InlineMessage";

type PostRequestModalProps = {
  existingRequests: BloodRequestType[];
  onClose: () => void;
  onCreated: () => void;
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-300 bg-green-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E7B3A] dark:bg-[#1f2a22]";

const labelClass = "block text-sm font-medium text-gray-900 mb-1.5";

const EMPTY_FORM = {
  bloodType: "",
  priorityLevel: "",
  unitsNeeded: "",
  facilityName: "",
  facilityAddress: "",
  contactPhone: "",
  requiredByDate: "",
  patientCondition: "",
};

const getCurrentCoordinates = () =>
  new Promise<[number, number]>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support location access. The hospital address will be used instead."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve([coords.longitude, coords.latitude]),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "Location access was blocked. The hospital address will be used instead."
              : "Could not get your location. The hospital address will be used instead."
          )
        ),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });

export default function PostRequestModal({ existingRequests, onClose, onCreated }: PostRequestModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sharedCoordinates, setSharedCoordinates] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const update = (field: keyof typeof EMPTY_FORM, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const toggleCurrentLocation = async () => {
    if (sharedCoordinates) {
      setSharedCoordinates(null);
      return;
    }
    setLocating(true);
    setMessage(null);
    try {
      setSharedCoordinates(await getCurrentCoordinates());
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLocating(false);
    }
  };

  // The shared location first, then an earlier request from the same hospital, then the address on the map
  const resolveCoordinates = async (): Promise<[number, number] | null> => {
    if (sharedCoordinates) return sharedCoordinates;
    const name = form.facilityName.trim().toLowerCase();
    const address = form.facilityAddress.trim().toLowerCase();
    const sameFacility = existingRequests.find(
      (r) => r.facilityCoordinates && r.facilityName?.trim().toLowerCase() === name && r.facilityAddress?.trim().toLowerCase() === address
    );
    return sameFacility?.facilityCoordinates || geocodeAddress(form.facilityAddress, form.facilityName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const coordinates = await resolveCoordinates();
      if (!coordinates) {
        setMessage({
          type: "error",
          text: "We couldn't find that hospital address on the map. Add the area and city (e.g. \"Yaba, Lagos\"), or tap the location icon if you're at the hospital.",
        });
        return;
      }
      await bloodRequests.create({
        bloodType: form.bloodType,
        unitsNeeded: parseInt(form.unitsNeeded, 10),
        priorityLevel: form.priorityLevel as "CRITICAL" | "URGENT" | "SCHEDULED",
        contactPhone: form.contactPhone,
        facilityName: form.facilityName,
        facilityAddress: form.facilityAddress,
        facilityLocation: { type: "Point", coordinates },
        patientCondition: form.patientCondition,
        requiredByDate: new Date(form.requiredByDate).toISOString(),
      });
      onCreated();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Could not create the request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-request-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 id="post-request-title" className="text-2xl font-bold text-gray-900">
              Create Blood Request
            </h2>
            <p className="text-gray-500 mt-1">Broadcast to nearby compatible donors</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full bg-gray-100 text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <InlineMessage message={message} onClose={() => setMessage(null)} />

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Blood Type *</span>
              <select required value={form.bloodType} onChange={(e) => update("bloodType", e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {BLOOD_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Units *</span>
              <input required type="number" min={1} max={20} value={form.unitsNeeded} onChange={(e) => update("unitsNeeded", e.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Priority Level *</span>
            <select required value={form.priorityLevel} onChange={(e) => update("priorityLevel", e.target.value)} className={inputClass}>
              <option value="">Select priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="URGENT">Urgent</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Hospital *</span>
            <input required value={form.facilityName} onChange={(e) => update("facilityName", e.target.value)} placeholder="e.g. Lagos University Teaching Hospital" className={inputClass} />
          </label>

          <div>
            <label htmlFor="facility-address" className={labelClass}>
              Hospital Address *
            </label>
            <div className="relative">
              <input
                id="facility-address"
                required
                value={form.facilityAddress}
                onChange={(e) => update("facilityAddress", e.target.value)}
                placeholder="e.g. Idi-Araba, Surulere, Lagos"
                className={`${inputClass} pr-14`}
              />
              <button
                type="button"
                onClick={toggleCurrentLocation}
                disabled={locating}
                title={sharedCoordinates ? "Using your current location. Tap to use the address instead" : "I'm at the hospital: use my current location"}
                aria-label={sharedCoordinates ? "Stop using my current location" : "Use my current location"}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                  sharedCoordinates ? "bg-[#1E7B3A] text-white" : "text-[#1E7B3A] hover:bg-green-100 dark:hover:bg-white/10"
                }`}
              >
                {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {sharedCoordinates ? "Using your current location to find nearby donors." : "Nearby donors are found using this address."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Contact Phone *</span>
              <input required type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="+2348012345678" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Needed By *</span>
              <input required type="datetime-local" value={form.requiredByDate} onChange={(e) => update("requiredByDate", e.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Patient Condition *</span>
            <textarea required rows={3} value={form.patientCondition} onChange={(e) => update("patientCondition", e.target.value)} placeholder="Patient situation..." className={`${inputClass} rounded-2xl`} />
          </label>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button type="submit" disabled={submitting} className="py-3 rounded-xl bg-[#C91E1E] dark:bg-[#F44336] text-white font-semibold disabled:opacity-50">
              {submitting ? "Posting..." : "Create Blood Request"}
            </button>
            <button type="button" onClick={onClose} className="py-3 rounded-xl border border-[#C91E1E] text-[#C91E1E] dark:border-[#F44336] dark:text-[#F44336] font-semibold">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
