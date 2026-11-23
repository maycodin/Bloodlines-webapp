"use client";

import type { BloodRequestType } from "@/components/CriticalBloodRequestCard";
import DonorResponsePieChart from "@/components/DonorResponsePieCart";
import { fulfilmentByBloodType, fulfilmentByUrgency } from "@/lib/requests";
import { FulfilmentBars, MonthlyBars, StatCard, rateBarColor, urgencyBarColor } from "@/components/bridger/FulfilmentCharts";
import type { BridgerDashboardData } from "@/components/bridger/types";

type BridgerAnalyticsProps = {
  requests: BloodRequestType[];
  dashboardData: BridgerDashboardData | null;
};

export const latestResponseTime = (data: BridgerDashboardData | null) => {
  const months = (data?.monthlyAverageResponseTime || []).filter((m) => m.totalFulfilled > 0);
  return months[months.length - 1]?.formattedDuration || "-";
};

export const fulfilledPerMonth = (data: BridgerDashboardData | null) =>
  (data?.monthlyAverageResponseTime || []).map((m) => ({
    month: m.month.slice(0, 3),
    value: m.totalFulfilled,
    detail: `${m.month}: ${m.totalFulfilled} fulfilled`,
  }));

export default function BridgerAnalytics({ requests, dashboardData }: BridgerAnalyticsProps) {
  const facilities = Object.entries(
    requests.reduce<Record<string, number>>((acc, r) => {
      const name = r.facilityName?.trim();
      if (name) acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const inventory = (dashboardData?.inventorySummary || []).map((item: any) => ({
    type: item.bloodType || item.bloodGroup || item.type || item._id || "?",
    units: Number(item.units ?? item.totalUnits ?? item.quantity ?? item.count ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Active Requests" value={dashboardData?.activeRequests ?? 0} />
        <StatCard label="Average Response Time" value={latestResponseTime(dashboardData)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FulfilmentBars title="Request Fulfillment by Blood Type" rows={fulfilmentByBloodType(requests)} colorFor={rateBarColor} />
        <div className="space-y-6">
          <FulfilmentBars title="By Urgency Level" rows={fulfilmentByUrgency(requests)} colorFor={urgencyBarColor} />
          <DonorResponsePieChart metrics={dashboardData?.donorResponseMetrics} />
        </div>
      </div>

      <MonthlyBars title="Overall Fulfillment History" subtitle="Requests fulfilled each month" values={fulfilledPerMonth(dashboardData)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Facilities</h2>
          {facilities.length === 0 ? (
            <p className="text-sm text-gray-500">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {facilities.map(([name, count]) => (
                <li key={name} className="flex justify-between gap-3 py-2.5">
                  <span className="text-gray-900">{name}</span>
                  <span className="text-gray-500">
                    {count} request{count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Blood Inventory</h2>
          {inventory.length === 0 ? (
            <p className="text-sm text-gray-500">No inventory recorded yet. Stock levels will show here once the facility&apos;s inventory is added.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {inventory.map((item) => (
                <div key={item.type} className="rounded-xl p-3 bg-red-50 text-center">
                  <p className="font-bold text-gray-900">{item.type}</p>
                  <p className="text-sm text-gray-600">
                    {item.units} unit{item.units === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
