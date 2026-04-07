import { useState } from "react";
import { ArrowUpCircle } from "lucide-react";
import RoleUpgradeForm from "./RoleUpgradeForm";

type UpgradeRoleProps = {
  onSubmitSuccess: (roleLabel: string) => void;
};

const UpgradeRole = ({ onSubmitSuccess }: UpgradeRoleProps) => {
  const [formOpen, setFormOpen] = useState(false);

  if (formOpen) {
    return <RoleUpgradeForm onSubmitSuccess={(role) => {
      setFormOpen(false);
      onSubmitSuccess(role);
    }} />;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D6D6]">
      <div className="flex items-center gap-2 mb-4">
          <ArrowUpCircle className="w-5 h-5 text-[#1B59F8]" />
        <p className="font-semibold text-gray-800">Upgrade Your Role</p>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Want to contribute more to BloodLines community? You can request to become a{" "}
        <span className="font-medium">Pulse Leader</span> (Community Coordinator),{" "}
        <span className="font-medium">Bridger</span> (Hospital Staff), or{" "}
        <span className="font-medium">Admin</span>
      </p>

      <button
        onClick={() => setFormOpen(true)}
        className="bg-[#1B59F8] hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition"
      >
        Request Role Upgrade
      </button>
    </div>
  );
};

export default UpgradeRole;