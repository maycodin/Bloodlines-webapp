"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { donor, DonorProfile } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ThemeToggle from "@/components/profile/ThemeToggle";
import CurrentRoleCard from "@/components/profile/CurrentRoleCard";
import EditProfile from "@/components/profile/EditProfile";
import PrivacySettings from "@/components/profile/PrivacySettings";
import NotificationSettings from "@/components/profile/NotificationSettings";

type AccountProfileProps = {
  startEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onProfileChanged?: () => void;
  children?: React.ReactNode;
};

export default function AccountProfile({ startEditing = false, onEditingChange, onProfileChanged, children }: AccountProfileProps) {
  const { logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditingState] = useState(startEditing);

  const setEditing = (value: boolean) => {
    setEditingState(value);
    onEditingChange?.(value);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    donor.getProfile().then(setProfile).catch(() => setFailed(true));
  }, []);

  const handleSaved = (updated: DonorProfile) => {
    setProfile(updated);
    refreshUser();
    onProfileChanged?.();
  };

  if (editing && profile) {
    return <EditProfile profile={profile} onBack={() => setEditing(false)} onSaved={handleSaved} />;
  }

  const rows: [string, string | undefined][] = [
    ["Full name", profile?.fullName],
    ["Phone", profile?.phoneNumber],
    ["Email address", profile?.email],
    ["Closest Hospital", profile?.closestHospital],
    ["Address", [profile?.address, profile?.city, profile?.state].filter(Boolean).join(", ")],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-6 pt-2">
        <AvatarUpload avatarUrl={profile?.avatarUrl} />
        <ThemeToggle />
      </div>

      <CurrentRoleCard />

      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Profile Information</h2>
        {failed ? (
          <p className="text-sm text-gray-500">Could not load your profile. Please refresh the page.</p>
        ) : !profile ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#C91E1E]" />
          </div>
        ) : (
          <dl className="space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[9rem_1fr] sm:grid-cols-[11rem_1fr] gap-2">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-gray-900 break-words">{value || <span className="text-gray-400 italic">Not set</span>}</dd>
              </div>
            ))}
          </dl>
        )}
        <button
          onClick={() => setEditing(true)}
          disabled={!profile}
          className="mt-6 w-full py-3 rounded-xl bg-[#C91E1E] dark:bg-[#F44336] text-white font-semibold hover:opacity-90 disabled:opacity-50"
        >
          Edit Profile
        </button>
      </section>

      <PrivacySettings />
      <NotificationSettings />

      {children}

      <button onClick={() => logout()} className="w-full py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50">
        Logout
      </button>
    </div>
  );
}
