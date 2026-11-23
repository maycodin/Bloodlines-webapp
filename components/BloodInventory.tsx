// components/BloodInventory.tsx
// Bridger Analytics tab. Every figure here comes from the Bridger's own requests
// (GET /blood-requests/my-requests) or from GET /bridger/dashboard. Nothing is hardcoded.
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import type { BloodRequestType } from '@/components/CriticalBloodRequestCard';
import DonorResponsePieChart from '@/components/DonorResponsePieCart';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS: BloodRequestType['status'][] = ['Critical', 'Urgent', 'Scheduled'];
const URGENCY_COLORS: Record<string, string> = { Critical: '#C91E1E', Urgent: '#EBBE54', Scheduled: '#1C7C3A' };

interface BloodInventoryDashboardProps {
  bloodRequests: BloodRequestType[];
  // The /bridger/dashboard response, for figures the request list doesn't hold
  dashboardData?: {
    inventorySummary?: any[];
    donorResponseMetrics?: { accepted?: number; rejected?: number; noResponse?: number };
    monthlyAverageResponseTime?: { month: string; monthIndex: number; averageMinutes: number; formattedDuration: string; totalFulfilled: number }[];
  } | null;
  handleConfirm?: (id: string | number) => void;
  handleEdit?: (id: string | number) => void;
  setActivePage?: (page: string) => void;
}

// Share of requests in a group that were fulfilled, as a whole percentage
const fulfilmentRate = (requests: BloodRequestType[]) => {
  if (requests.length === 0) return 0;
  const fulfilled = requests.filter((r) => r.requestStatus === 'FULFILLED').length;
  return Math.round((fulfilled / requests.length) * 100);
};

const RateTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">{item.value}%</span> fulfilled ({item.fulfilled} of {item.total})
      </p>
    </div>
  );
};

const CountTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">{payload[0].value}</span> request{payload[0].value !== 1 ? 's' : ''} posted
      </p>
    </div>
  );
};

const EmptyChart = ({ text }: { text: string }) => (
  <div className="h-full flex items-center justify-center text-sm text-gray-500 text-center px-4">{text}</div>
);

export default function BloodInventoryDashboard({ bloodRequests, dashboardData }: BloodInventoryDashboardProps) {
  const total = bloodRequests.length;
  const fulfilledCount = bloodRequests.filter((r) => r.requestStatus === 'FULFILLED').length;
  const openCount = bloodRequests.filter((r) => !['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(r.requestStatus || '')).length;

  // Fulfilment by blood type: only types this Bridger has requested
  const bloodTypeData = BLOOD_TYPES.map((type) => {
    const group = bloodRequests.filter((r) => r.bloodType === type);
    return { name: type, value: fulfilmentRate(group), total: group.length, fulfilled: group.filter((r) => r.requestStatus === 'FULFILLED').length };
  }).filter((row) => row.total > 0);

  // Fulfilment by urgency
  const urgencyData = URGENCY_LEVELS.map((level) => {
    const group = bloodRequests.filter((r) => r.status === level);
    return { name: level, value: fulfilmentRate(group), total: group.length, fulfilled: group.filter((r) => r.requestStatus === 'FULFILLED').length };
  }).filter((row) => row.total > 0);

  // Requests posted per month, for the last 6 months
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const requests = bloodRequests.filter((r) => {
      if (!r.createdAt) return false;
      const created = new Date(r.createdAt);
      return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
    }).length;
    return { month: date.toLocaleString('en-GB', { month: 'short' }), requests };
  });
  const hasMonthlyData = monthlyData.some((m) => m.requests > 0);

  // Average response time: the most recent month the backend has fulfilled requests for
  const responseMonths = (dashboardData?.monthlyAverageResponseTime || []).filter((m) => m.totalFulfilled > 0);
  const latestResponse = responseMonths[responseMonths.length - 1];

  // Facilities this Bridger posts for most
  const facilityCounts = Object.entries(
    bloodRequests.reduce<Record<string, number>>((acc, r) => {
      const name = r.facilityName?.trim();
      if (name) acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Inventory from the backend (empty until the facility's stock is recorded)
  const inventory = (dashboardData?.inventorySummary || []).map((item: any) => ({
    type: item.bloodType || item.bloodGroup || item.type || item._id || '?',
    units: Number(item.units ?? item.totalUnits ?? item.quantity ?? item.count ?? 0),
  }));

  return (
    <div className="w-full space-y-6">
      {/* Summary figures */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total requests', value: total },
          { label: 'Open now', value: openCount },
          { label: 'Fulfilled', value: fulfilledCount },
          { label: 'Fulfilment rate', value: `${fulfilmentRate(bloodRequests)}%` },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#D8D6D6] p-5">
            <p className="text-sm font-medium text-black">{card.label}</p>
            <p className="text-2xl font-bold text-black mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Request fulfilment charts */}
      <div className="bg-white rounded-xl border border-[#D8D6D6] p-6">
        <h3 className="text-lg font-bold text-black">Request Fulfilment</h3>
        <hr className="my-3 border-[#e5e7eb]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">By Blood Type</h4>
            <div className="h-60">
              {bloodTypeData.length === 0 ? (
                <EmptyChart text="No requests yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={bloodTypeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid horizontal={false} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} width={40} />
                    <Tooltip content={<RateTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} background={{ fill: '#ECEFF1' }} fill="#1C7C3A" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:border-l lg:border-[#e5e7eb] lg:pl-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">By Urgency Level</h4>
            <div className="h-60">
              {urgencyData.length === 0 ? (
                <EmptyChart text="No requests yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={urgencyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid horizontal={false} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} width={70} />
                    <Tooltip content={<RateTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} background={{ fill: '#ECEFF1' }}>
                      {urgencyData.map((entry) => (
                        <Cell key={entry.name} fill={URGENCY_COLORS[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:border-l lg:border-[#e5e7eb] lg:pl-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Requests Posted (last 6 months)</h4>
            <div className="h-60">
              {!hasMonthlyData ? (
                <EmptyChart text="No requests in the last 6 months" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip content={<CountTooltip />} />
                    <Line type="monotone" dataKey="requests" stroke="#1C7C3A" strokeWidth={2} dot={{ r: 4, fill: '#1C7C3A', strokeWidth: 2, stroke: '#ffffff' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response time, donor response, facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        <div className="bg-white rounded-xl p-5 border border-[#D8D6D6]">
          <p className="text-black text-base font-bold">Avg Response Time</p>
          {latestResponse ? (
            <>
              <p className="text-2xl font-normal text-black mt-3">{latestResponse.formattedDuration}</p>
              <p className="text-sm text-gray-500 mt-1">
                {latestResponse.month}, across {latestResponse.totalFulfilled} fulfilled request{latestResponse.totalFulfilled !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-3">Shows once a request has been fulfilled.</p>
          )}
        </div>

        <DonorResponsePieChart metrics={dashboardData?.donorResponseMetrics} />

        <div className="bg-white rounded-xl p-5 border border-[#D8D6D6]">
          <p className="text-black text-base font-bold">Top Facilities</p>
          {facilityCounts.length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">No requests yet.</p>
          ) : (
            facilityCounts.map(([name, count]) => (
              <div key={name} className="mt-3 pb-2 flex justify-between gap-3 border-b border-[#D8D6D6]">
                <span className="text-sm font-light text-black">{name}</span>
                <span className="text-sm font-light text-black">{count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Blood inventory */}
      <div className="bg-white rounded-xl border border-[#D8D6D6] p-6">
        <h3 className="text-base font-bold text-black mb-4">Blood Inventory</h3>
        {inventory.length === 0 ? (
          <p className="text-sm text-gray-500">No inventory recorded yet. Stock levels will show here once the facility's inventory is added.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.map((item) => (
              <div key={item.type} className="flex flex-col items-center rounded-lg p-3 bg-red-50">
                <div className="text-sm font-medium text-black">{item.type}</div>
                <div className="text-xs font-light text-black mt-1">{item.units} unit{item.units !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
