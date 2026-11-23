"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

type Role = "donor" | "bridger" | "pulse-leader" | "admin";

const ROLE_NAMES: Record<Role, string> = {
  donor: "Donor",
  bridger: "Bridger",
  "pulse-leader": "Pulse Leader",
  admin: "Admin",
};

// "Switch to Bridger dashboard" links for every other role the user is approved for.
// Shows nothing when the user only has one role.
export default function RoleSwitcher({ variant = "dropdown" }: { variant?: "dropdown" | "mobile" }) {
  const { user, switchRole } = useAuth();
  const [switchingTo, setSwitchingTo] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The admin area has no page in this app yet, so it isn't offered here
  const otherRoles = (user?.approvedRoles || []).filter(
    (role): role is Role => role !== user?.role && role !== "admin" && role in ROLE_NAMES
  );
  if (otherRoles.length === 0) return null;

  const handleSwitch = async (role: Role) => {
    setSwitchingTo(role);
    setError(null);
    try {
      await switchRole(role);
    } catch (err: any) {
      setError(err?.message || "Could not switch dashboards. Please try again.");
      setSwitchingTo(null);
    }
  };

  const buttonClass =
    variant === "mobile"
      ? "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-left text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      : "flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition disabled:opacity-50";

  return (
    <div className="border-t border-gray-100 mt-1 pt-1">
      {otherRoles.map((role) => (
        <button key={role} onClick={() => handleSwitch(role)} disabled={switchingTo !== null} className={buttonClass}>
          <ArrowLeftRight className="w-4 h-4 text-gray-500" />
          {switchingTo === role ? "Switching..." : `Switch to ${ROLE_NAMES[role]} dashboard`}
        </button>
      ))}
      {error && <p className="px-4 py-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
