"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { privacy, PrivacySettings as Settings } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Switch from "@/components/ui/Switch";
import SettingsCard, { SettingRow } from "@/components/profile/SettingsCard";

const getPosition = () =>
  new Promise<GeolocationCoordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support location access."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "Location permission is required to enable location sharing."
              : "Could not get your location. Please try again."
          )
        ),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });

export default function PrivacySettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState<keyof Settings | null>(null);

  useEffect(() => {
    privacy.get().then(setSettings).catch(() => setSettings({ locationSharingEnabled: false, anonymous: false }));
  }, []);

  const toggleLocation = async (enabled: boolean) => {
    setSaving("locationSharingEnabled");
    try {
      if (enabled) {
        const { latitude, longitude } = await getPosition();
        await privacy.update({ locationSharingEnabled: true, latitude, longitude });
      } else {
        await privacy.update({ locationSharingEnabled: false });
      }
      setSettings((s) => ({ ...(s as Settings), locationSharingEnabled: enabled }));
      showToast(enabled ? "Location sharing turned on" : "Location sharing turned off");
    } catch (err: any) {
      showToast(err?.message || "Could not update location sharing.", "error");
    } finally {
      setSaving(null);
    }
  };

  const toggleAnonymous = async (anonymous: boolean) => {
    setSaving("anonymous");
    try {
      await privacy.update({ anonymous });
      setSettings((s) => ({ ...(s as Settings), anonymous }));
      showToast(anonymous ? "Your name is now hidden in community activity" : "Your name is now shown in community activity");
    } catch (err: any) {
      showToast(err?.message || "Could not update this setting.", "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <SettingsCard icon={<MapPin className="w-6 h-6 text-[#C91E1E] dark:text-[#F44336]" />} title="Location & Privacy Settings">
      <SettingRow
        title="Share Location for Emergency Requests"
        description={
          settings?.locationSharingEnabled
            ? "You'll receive blood request alerts based on where you are."
            : "Location sharing is off. You will not receive proximity-based blood request alerts."
        }
      >
        <Switch
          label="Share location for emergency requests"
          checked={!!settings?.locationSharingEnabled}
          disabled={!settings || saving !== null}
          onChange={toggleLocation}
        />
      </SettingRow>
      <SettingRow title="Stay Anonymous" description="Hide your name in community activity.">
        <Switch label="Stay anonymous" checked={!!settings?.anonymous} disabled={!settings || saving !== null} onChange={toggleAnonymous} />
      </SettingRow>
    </SettingsCard>
  );
}
