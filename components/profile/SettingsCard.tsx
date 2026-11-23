import React from "react";

type SettingsCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

export default function SettingsCard({ icon, title, children }: SettingsCardProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-5">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingRow({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}
