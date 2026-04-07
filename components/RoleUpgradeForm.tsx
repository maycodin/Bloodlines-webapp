import { useState, useRef, useEffect } from "react";
import {
  ArrowUpCircle,
  Users,
  Heart,
  Shield,
  ChevronDown,
  Info
} from "lucide-react";

type RoleKey = "pulse_leader" | "bridger" | "admin";

type Role = {
  key: RoleKey;
  label: string;
  description: string;
  icon: React.ReactNode;
};

type RoleFields = {
  communityName?: string;
  facilityName?: string;
  facilityAddress?: string;
};

const MIN_REASON_LENGTH = 100;

const ROLES: Role[] = [
  {
    key: "pulse_leader",
    label: "Pulse Leader",
    description: "Community coordinator",
    icon: <Users className="w-4 h-4 text-[#1B59F8]" />,
  },
  {
    key: "bridger",
    label: "Bridger (Hospital Staff)",
    description: "Submit blood requests",
    icon: <Heart className="w-4 h-4 text-gray-500" />,
  },
  {
    key: "admin",
    label: "Admin",
    description: "System administrator",
    icon: <Shield className="w-4 h-4 text-gray-500" />,
  },
];

const ROLE_LABELS: Record<RoleKey, string> = {
  pulse_leader: "Pulse Leader",
  bridger: "Bridger",
  admin: "Admin",
};

type RoleUpgradeFormProps = {
  onSubmitSuccess: (roleLabel: string) => void;
};

const RoleUpgradeForm = ({ onSubmitSuccess }: RoleUpgradeFormProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [reason, setReason] = useState("");
  const [roleFields, setRoleFields] = useState<RoleFields>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRoleSelect = (key: RoleKey) => {
    setSelectedRole(key);
    setDropdownOpen(false);
    setRoleFields({});
  };

  const handleSubmit = () => {
    if (!selectedRole) return;
    onSubmitSuccess(ROLE_LABELS[selectedRole]);
    // Reset form
    setSelectedRole(null);
    setReason("");
    setRoleFields({});
  };

  const selectedRoleData = ROLES.find((r) => r.key === selectedRole);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D6D6]">
      <div className="flex items-center gap-2 mb-4">
          <ArrowUpCircle className="w-5 h-5 text-[#1B59F8]" />
       <p className="font-semibold text-gray-800">Upgrade Your Role</p>
      </div>

      <p className="text-sm font-medium text-gray-800 mb-1">Request Role Upgrade</p>
      <p className="text-sm text-gray-500 mb-5">
        Apply to become a Pulse Leader, Bridger, or Admin
      </p>

      <div className="mb-4" ref={dropdownRef}>
        <label className="text-sm font-medium text-gray-800 block mb-1.5">
          Requested Role<span className="text-[#C91E1E]">*</span>
        </label>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between border border-gray-200 bg-gray-50 rounded-md px-4 py-2.5 text-sm text-left"
          >
            {selectedRoleData ? (
              <span className="flex items-center gap-2">
                {selectedRoleData.icon}
                <span className="font-medium">{selectedRoleData.label}</span>
                <span className="text-gray-500 text-xs">{selectedRoleData.description}</span>
              </span>
            ) : (
              <span className="text-gray-400">Select role type</span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-md mt-1">
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => handleRoleSelect(role.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-gray-50 transition ${
                    selectedRole === role.key ? "bg-gray-50" : ""
                  }`}
                >
                  {role.icon}
                  <div>
                    <p className="font-medium text-gray-800">{role.label}</p>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conditional fields per role */}

      {selectedRole === "pulse_leader" && (
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-800 block mb-1.5">
            Community Name<span className="text-[#C91E1E]">*</span>
          </label>
          <input
            type="text"
            value={roleFields.communityName ?? ""}
            onChange={(e) => setRoleFields((prev) => ({ ...prev, communityName: e.target.value }))}
            placeholder="Enter your community's name"
            className="w-full border border-gray-200 bg-gray-50 rounded-md px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B59F8]"
          />
        </div>
      )}

      {selectedRole === "bridger" && (
        <>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-800 block mb-1.5">
              Facility Name<span className="text-[#C91E1E]">*</span>
            </label>
            <input
              type="text"
              value={roleFields.facilityName ?? ""}
              onChange={(e) => setRoleFields((prev) => ({ ...prev, facilityName: e.target.value }))}
              placeholder="Enter hospital/clinic name"
              className="w-full border border-gray-200 bg-gray-50 rounded-md px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B59F8]"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-800 block mb-1.5">
              Facility Address
            </label>
            <input
              type="text"
              value={roleFields.facilityAddress ?? ""}
              onChange={(e) => setRoleFields((prev) => ({ ...prev, facilityAddress: e.target.value }))}
              placeholder="Enter facility address"
              className="w-full border border-gray-200 bg-gray-50 rounded-md px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B59F8]"
            />
          </div>
        </>
      )}

      {selectedRole && (
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-800 block mb-1.5">
            Reason for Request<span className="text-[#C91E1E]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you want to upgrade to this role and how you plan to contribute..."
            className={`w-full border bg-gray-50 rounded-md px-4 py-3 text-sm placeholder:text-gray-400 h-28 resize-none focus:outline-none focus:ring-1 transition ${
              reason.length > 0 && reason.length < MIN_REASON_LENGTH
                ? "border-red-300 focus:ring-red-300"
                : "border-gray-200 focus:ring-[#1B59F8]"
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {reason.length > 0 && reason.length < MIN_REASON_LENGTH ? (
              <p className="text-xs text-[#C91E1E]">
                Please provide at least {MIN_REASON_LENGTH} characters
              </p>
            ) : (
              <span />
            )}
            <p className={`text-xs ml-auto ${
              reason.length >= MIN_REASON_LENGTH ? "text-green-600" : "text-gray-400"
            }`}>
              {reason.length} / {MIN_REASON_LENGTH}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-md px-4 py-3 mb-5">
        <Info className="w-4 h-4 text-[#1B59F8] mt-0.5 shrink-0" />
        <p className="text-xs text-[#1B59F8]">
          Role upgrade requests are reviewed by administrators. You will receive a notification once your request is processed.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedRole || reason.length < MIN_REASON_LENGTH}
        className="w-full bg-[#C91E1E] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-md text-sm font-medium transition"
      >
        Submit Request
      </button>
    </div>
  );
};

export default RoleUpgradeForm;