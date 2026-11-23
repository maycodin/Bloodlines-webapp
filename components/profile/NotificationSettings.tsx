"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { notifications, NotificationPreferences } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Switch from "@/components/ui/Switch";
import SettingsCard, { SettingRow } from "@/components/profile/SettingsCard";

type Key = keyof NotificationPreferences;

const ROWS: { key: Key; title: string; description: string }[] = [
  { key: "emergencyAlerts", title: "Emergency alerts", description: "Urgent blood requests that match your blood type" },
  { key: "donationReminders", title: "Donation reminders", description: "When you become eligible to donate again" },
  { key: "communityUpdates", title: "Community updates", description: "News and activity from the Bloodlines community" },
  { key: "emailEnabled", title: "Email notifications", description: "Receive notifications by email" },
  { key: "smsEnabled", title: "SMS notifications", description: "Receive notifications by text message" },
];

export default function NotificationSettings() {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState<Key | null>(null);

  useEffect(() => {
    notifications.getPreferences().then(setPrefs).catch(() => setFailed(true));
  }, []);

  const update = async (key: Key, value: boolean) => {
    if (!prefs) return;
    setSaving(key);
    setPrefs({ ...prefs, [key]: value });
    try {
      await notifications.updatePreferences({ [key]: value });
    } catch (err: any) {
      setPrefs((p) => (p ? { ...p, [key]: !value } : p));
      showToast(err?.message || "Could not save this setting.", "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <SettingsCard icon={<Bell className="w-6 h-6 text-[#C91E1E] dark:text-[#F44336]" />} title="Notification Preferences">
      {failed ? (
        <p className="text-sm text-gray-500">Could not load your notification settings. Please refresh the page.</p>
      ) : (
        ROWS.map((row) => (
          <SettingRow key={row.key} title={row.title} description={row.description}>
            <Switch label={row.title} checked={!!prefs?.[row.key]} disabled={!prefs || saving === row.key} onChange={(v) => update(row.key, v)} />
          </SettingRow>
        ))
      )}
    </SettingsCard>
  );
}
