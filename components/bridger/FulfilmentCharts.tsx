"use client";

import { Droplet } from "lucide-react";
import { fulfilmentLevel, FulfilmentRow } from "@/lib/requests";

const TARGET_PERCENT = 80;

const TONE_STYLES = {
  green: { bar: "bg-[#1E7B3A] dark:bg-[#34C759]", badge: "bg-green-100 text-[#1E7B3A] dark:bg-[#173a22] dark:text-[#34C759]" },
  amber: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-[#4a3a12] dark:text-[#FBBF24]" },
  red: { bar: "bg-[#D32F2F] dark:bg-[#F44336]", badge: "bg-red-100 text-[#C91E1E] dark:bg-[#4a1d1d] dark:text-[#FF6B6B]" },
};

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between min-h-[9rem]">
      <p className="text-gray-900">{label}</p>
      <p className="text-4xl font-bold text-gray-900 mt-4">{value}</p>
    </div>
  );
}

export function FulfilmentDonut({ total, fulfilled }: { total: number; fulfilled: number }) {
  const percent = total ? (fulfilled / total) * 100 : 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const gap = Math.round(TARGET_PERCENT - percent);

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900">Overall Fulfillment Rate</h2>
      <div className="flex justify-center my-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
            <circle cx="90" cy="90" r={radius} fill="none" strokeWidth="22" className="stroke-green-200 dark:stroke-[#1f3d29]" />
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percent / 100)}
              className="stroke-[#1E7B3A] dark:stroke-[#34C759]"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-900">
            {percent.toFixed(percent % 1 === 0 ? 0 : 2)}%
          </span>
        </div>
      </div>
      <div className="flex justify-center gap-12 text-center">
        <div>
          <p className="text-3xl font-bold text-[#D32F2F] dark:text-[#F44336]">{total}</p>
          <p className="text-gray-500">Requests</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#1E7B3A] dark:text-[#34C759]">{fulfilled}</p>
          <p className="text-gray-500">Fulfilled</p>
        </div>
      </div>
      {total > 0 && (
        <p className="flex justify-center mt-4">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${gap > 0 ? TONE_STYLES.red.badge : TONE_STYLES.green.badge}`}>
            {gap > 0 ? `${gap}% below the ${TARGET_PERCENT}% target` : `Meeting the ${TARGET_PERCENT}% target`}
          </span>
        </p>
      )}
    </section>
  );
}

export function BloodTypeDistribution({ rows }: { rows: FulfilmentRow[] }) {
  return (
    <section>
      <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
        <Droplet className="w-6 h-6 text-[#D32F2F] dark:text-[#F44336]" />
        Blood Type Distribution
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {rows.map((row) => {
          const level = fulfilmentLevel(row.percent);
          const tone = TONE_STYLES[level.tone];
          return (
            <div key={row.label} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-[#C91E1E] dark:bg-[#4a1d1d] dark:text-[#FF6B6B] text-xl font-bold">{row.label}</span>
                <span className="text-xl font-bold text-gray-900">{row.percent}%</span>
              </div>
              <p className="text-gray-600 mt-3 text-sm">
                {row.fulfilled} of {row.total} request{row.total === 1 ? "" : "s"} met
              </p>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-[#333] mt-3 overflow-hidden">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${row.percent}%` }} />
              </div>
              {row.total > 0 && <span className={`inline-block mt-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${tone.badge}`}>{level.label}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FulfilmentBars({ title, rows, colorFor }: { title: string; rows: FulfilmentRow[]; colorFor: (row: FulfilmentRow) => string }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">{title}</h2>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3" title={`${row.fulfilled} of ${row.total} fulfilled`}>
            <span className="text-gray-900 uppercase text-sm">{row.label}</span>
            <div className="h-7 rounded-lg bg-gray-100 dark:bg-[#333] overflow-hidden">
              <div className={`h-full rounded-lg ${colorFor(row)}`} style={{ width: `${row.percent}%` }} />
            </div>
            <span className="text-right font-bold text-gray-900">{row.percent}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MonthlyBars({ title, subtitle, values }: { title: string; subtitle?: string; values: { month: string; value: number; detail?: string }[] }) {
  const max = Math.max(1, ...values.map((v) => v.value));
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      <div className="h-40 mt-6 flex items-end justify-between gap-1">
        {values.map((v) => (
          <div key={v.month} className="flex-1 flex flex-col items-center justify-end h-full" title={v.detail || `${v.month}: ${v.value}`}>
            {v.value > 0 && <span className="text-xs font-semibold text-gray-700 mb-1">{v.value}</span>}
            <div
              className={`w-full max-w-[1.5rem] rounded-md ${v.value > 0 ? "bg-[#1E7B3A] dark:bg-[#34C759]" : "bg-gray-200 dark:bg-[#333]"}`}
              style={{ height: v.value > 0 ? `${(v.value / max) * 100}%` : "6px" }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-1 mt-2">
        {values.map((v) => (
          <span key={v.month} className="flex-1 text-center text-xs text-gray-500">
            {v.month}
          </span>
        ))}
      </div>
    </section>
  );
}

export const rateBarColor = (row: FulfilmentRow) => (row.percent >= 50 ? TONE_STYLES.green.bar : row.percent >= 25 ? "bg-amber-500" : "bg-[#E57373]");

export const urgencyBarColor = (row: FulfilmentRow) =>
  row.label === "Critical" ? "bg-[#E57373]" : row.label === "Urgent" ? "bg-amber-400" : TONE_STYLES.green.bar;
