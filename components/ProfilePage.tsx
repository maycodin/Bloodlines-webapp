import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import ProfileInfo from "./ProfileInfo";
import UpgradeRole from "./UpgradeRole";
import NotificationPreferences from "./NotificationPreferences";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  hospitalName: string;
};

// Mock data

const PROFILE_DATA: ProfileData = {
  fullName: "Maria Mustafa",
  email: "Maria.Mustafa@gmail.com",
  phone: "07032891653",
  hospitalName: "Lagos, University Teaching Hospital\nIdi-Araba, Lagos",
};

const ProfilePage = () => {
  const [submitToast, setSubmitToast] = useState<string | null>(null);

  const handleRoleSubmitSuccess = (roleLabel: string) => {
    setSubmitToast(`Your request to update your account to ${roleLabel} has been submitted`);
    setTimeout(() => setSubmitToast(null), 4000);
  };

  const handleConfigure = (id: string) => {
    // Placeholder — wire to notification settings flow
    console.log("Configure:", id);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <ProfileInfo
        fullName={PROFILE_DATA.fullName}
        email={PROFILE_DATA.email}
        phone={PROFILE_DATA.phone}
        hospitalName={PROFILE_DATA.hospitalName}
        onEditProfile={() => console.log("Edit profile")}
      />

      <UpgradeRole onSubmitSuccess={handleRoleSubmitSuccess} />

      <NotificationPreferences onConfigure={handleConfigure} />

      {submitToast && (
        <div className="fixed bottom-6 right-6 bg-white border shadow-lg px-4 py-3 rounded-md text-sm flex items-center gap-2 z-50 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p>{submitToast}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;