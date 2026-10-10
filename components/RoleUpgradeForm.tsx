// components/RoleUpgradeForm.tsx
// The one shared "Upgrade Your Role" form, used on the Donor, Bridger and Pulse Leader profile pages.
"use client";

import { useState } from "react";
import { CircleArrowUp, Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import InlineMessage, { Message } from "@/components/InlineMessage";

// Values are sent to the backend as-is (POST /role-upgrades/request).
// The API docs say upgrades are for Bridger or Pulse Leader only.
type RoleValue = "PULSE_LEADER" | "BRIDGER";

const ROLE_LABELS: Record<RoleValue, string> = {
  PULSE_LEADER: "Pulse Leader",
  BRIDGER: "Bridger",
};

const ROLE_HINTS: Record<RoleValue, string> = {
  PULSE_LEADER: "Lead and manage blood donation campaigns in your community",
  BRIDGER: "Create and manage blood requests at your hospital",
};

// Matches the normalised role names used in AuthContext
const CURRENT_ROLE_VALUE: Record<string, RoleValue> = {
  bridger: "BRIDGER",
  "pulse-leader": "PULSE_LEADER",
};

type RoleUpgradeFormProps = {
  // Called after a request is submitted successfully (e.g. to reload the history list)
  onSubmitted?: () => void;
  // Same moment, but also passes the readable role name
  onSubmitSuccess?: (roleLabel: string) => void;
  className?: string;
};

const inputClass =
  "w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";

const RoleUpgradeForm = ({
  onSubmitted,
  onSubmitSuccess,
  className = "mt-6 bg-white rounded-lg border border-[#D8D6D6] p-6",
}: RoleUpgradeFormProps) => {
  const { requestRoleUpgrade, user } = useAuth();
  // Don't offer the role the user already has
  const currentRole = user?.role ? CURRENT_ROLE_VALUE[user.role] : undefined;

  const [selectedRole, setSelectedRole] = useState<RoleValue | "">("");
  const [communityName, setCommunityName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const resetForm = () => {
    setSelectedRole("");
    setCommunityName("");
    setFacilityName("");
    setFacilityAddress("");
    setReason("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setMessage({ type: "error", text: "Please select a role to upgrade to" });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Please provide a reason for the role upgrade request" });
      return;
    }
    if (selectedRole === "PULSE_LEADER" && !communityName.trim()) {
      setMessage({ type: "error", text: "Please enter your community name" });
      return;
    }
    if (selectedRole === "BRIDGER" && (!facilityName.trim() || !facilityAddress.trim())) {
      setMessage({ type: "error", text: "Please enter both facility name and address" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const details: Record<string, string> = { reason };
      if (selectedRole === "PULSE_LEADER") {
        // The backend has no community field yet, so it travels with the reason for the reviewer
        details.reason = `${reason}\n\nCommunity: ${communityName}`;
      } else if (selectedRole === "BRIDGER") {
        details.facilityName = facilityName;
        details.facilityAddress = facilityAddress;
      }

      await requestRoleUpgrade(selectedRole, details);

      const roleLabel = ROLE_LABELS[selectedRole];
      setMessage({
        type: "success",
        text: `Your request to become a ${roleLabel} has been submitted successfully! You will be notified once reviewed.`,
      });
      resetForm();
      onSubmitted?.();
      onSubmitSuccess?.(roleLabel);
    } catch (error: any) {
      console.error("Role upgrade error:", error);
      setMessage({
        type: "error",
        text: error?.message || "Failed to submit role upgrade request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-start gap-3 mb-4">
        <CircleArrowUp className="w-6 h-6 text-[#1B59F8] flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Upgrade Your Role</h3>
          <p className="text-sm text-gray-500 mt-1">
            Apply to become a Pulse Leader or Bridger
          </p>
        </div>
      </div>

      <InlineMessage message={message} onClose={() => setMessage(null)} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="requested-role" className="block text-sm font-medium text-gray-700 mb-1">
            Requested Role <span className="text-red-500">*</span>
          </label>
          <select
            id="requested-role"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value as RoleValue | "");
              setCommunityName("");
              setFacilityName("");
              setFacilityAddress("");
            }}
            className={inputClass}
            required
            disabled={isSubmitting}
          >
            <option value="" disabled>Select role type</option>
            {currentRole !== "PULSE_LEADER" && <option value="PULSE_LEADER">Pulse Leader</option>}
            {currentRole !== "BRIDGER" && <option value="BRIDGER">Bridger (Hospital Staff)</option>}
          </select>
          {selectedRole && (
            <p className="text-xs text-gray-500 mt-1">{ROLE_HINTS[selectedRole]}</p>
          )}
        </div>

        {selectedRole === "PULSE_LEADER" && (
          <div>
            <label htmlFor="community-name" className="block text-sm font-medium text-gray-700 mb-1">
              Community Name <span className="text-red-500">*</span>
            </label>
            <input
              id="community-name"
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="e.g., Lagos Central Community"
              className={inputClass}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">The community you will be leading</p>
          </div>
        )}

        {selectedRole === "BRIDGER" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="facility-name" className="block text-sm font-medium text-gray-700 mb-1">
                Facility Name <span className="text-red-500">*</span>
              </label>
              <input
                id="facility-name"
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="e.g., Lagos University Teaching Hospital"
                className={inputClass}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="facility-address" className="block text-sm font-medium text-gray-700 mb-1">
                Facility Address <span className="text-red-500">*</span>
              </label>
              <input
                id="facility-address"
                type="text"
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
                placeholder="e.g., Idi-Araba, Lagos"
                className={inputClass}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="upgrade-reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Request <span className="text-red-500">*</span>
          </label>
          <textarea
            id="upgrade-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Please explain why you want to upgrade to this role and how you plan to contribute..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <span className="text-blue-500 text-lg">🔑</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">About Role Upgrades</p>
            <p className="text-xs text-blue-700 mt-1">
              Role upgrade requests are reviewed by administrators. You will receive a notification once your request is processed. This may take 1-3 business days.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !selectedRole || !reason}
            className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleUpgradeForm;
