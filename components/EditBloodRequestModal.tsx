// components/EditBloodRequestModal.tsx
// Lets a Bridger change or cancel one of their blood requests.
// Saves with POST /blood-requests/{id}/update and cancels with POST /blood-requests/{id}/cancel.
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { bloodRequests } from "@/lib/api";
import InlineMessage, { Message } from "@/components/InlineMessage";
import type { BloodRequestType } from "@/components/CriticalBloodRequestCard";

type EditBloodRequestModalProps = {
  request: BloodRequestType;
  onClose: () => void;
  // Called after a successful save or cancel, with a message for the page to show
  onSaved: (message: string) => void;
};

const PRIORITY_FROM_STATUS: Record<string, "CRITICAL" | "URGENT" | "SCHEDULED"> = {
  Critical: "CRITICAL",
  Urgent: "URGENT",
  Scheduled: "SCHEDULED",
};

const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent";

const EditBloodRequestModal = ({ request, onClose, onSaved }: EditBloodRequestModalProps) => {
  const initial = {
    priorityLevel: request.priorityLevel || PRIORITY_FROM_STATUS[request.status] || "URGENT",
    unitsNeeded: String(request.unitsNeeded ?? ""),
    contactPhone: request.contactNumber && request.contactNumber !== "Not provided" ? request.contactNumber : "",
    facilityName: request.facilityName || "",
    facilityAddress: request.facilityAddress || "",
    additionalNotes: request.additionalNotes || "",
  };
  const [form, setForm] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const update = (field: keyof typeof initial, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const units = parseInt(form.unitsNeeded);
    if (!units || units < 1) {
      setMessage({ type: "error", text: "Units needed must be at least 1." });
      return;
    }

    // Only send what changed
    const changes: Parameters<typeof bloodRequests.update>[1] = {};
    if (form.priorityLevel !== initial.priorityLevel) changes.priorityLevel = form.priorityLevel;
    if (form.unitsNeeded !== initial.unitsNeeded) changes.unitsNeeded = units;
    (["contactPhone", "facilityName", "facilityAddress", "additionalNotes"] as const).forEach((field) => {
      if (form[field].trim() !== initial[field].trim() && form[field].trim() !== "") {
        changes[field] = form[field].trim();
      }
    });

    if (Object.keys(changes).length === 0) {
      setMessage({ type: "error", text: "Nothing has changed yet." });
      return;
    }

    setIsSaving(true);
    try {
      await bloodRequests.update(String(request.id), changes);
      onSaved("Blood request updated.");
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Could not update the request. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelRequest = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await bloodRequests.cancel(String(request.id));
      onSaved("Blood request cancelled.");
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Could not cancel the request. Please try again." });
      setConfirmingCancel(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900">Edit Blood Request</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {request.bloodType} request. Blood type can't be changed; cancel and post a new request instead.
        </p>

        <InlineMessage message={message} onClose={() => setMessage(null)} />

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Urgency</span>
              <select className={inputClass} value={form.priorityLevel} onChange={(e) => update("priorityLevel", e.target.value)}>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="URGENT">🟠 Urgent</option>
                <option value="SCHEDULED">🟢 Scheduled</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Units Needed</span>
              <input type="number" min={1} className={inputClass} value={form.unitsNeeded} onChange={(e) => update("unitsNeeded", e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Contact Phone</span>
            <input type="tel" className={inputClass} value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Facility Name</span>
            <input type="text" className={inputClass} value={form.facilityName} onChange={(e) => update("facilityName", e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Facility Address</span>
            <input type="text" className={inputClass} value={form.facilityAddress} onChange={(e) => update("facilityAddress", e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Additional Notes</span>
            <textarea rows={3} className={`${inputClass} resize-none`} value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} placeholder="Anything donors should know" />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Close
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm bg-[#C91E1E] text-white rounded-lg hover:bg-[#A01818] disabled:opacity-50 flex items-center gap-2">
              {isSaving && !confirmingCancel && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>

        {/* Cancel the whole request, with a second step so it can't happen by accident */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {!confirmingCancel ? (
            <button type="button" onClick={() => setConfirmingCancel(true)} disabled={isSaving} className="text-sm text-red-700 hover:underline">
              Cancel this request
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800 mb-3">Cancel this request? Donors will no longer see it, and this can't be undone.</p>
              <div className="flex gap-2">
                <button type="button" onClick={handleCancelRequest} disabled={isSaving} className="px-3 py-1.5 text-sm bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50">
                  {isSaving ? "Cancelling..." : "Yes, cancel request"}
                </button>
                <button type="button" onClick={() => setConfirmingCancel(false)} disabled={isSaving} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white">
                  Keep it
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBloodRequestModal;
