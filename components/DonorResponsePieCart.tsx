"use client";

import { PieChart, Pie, Cell } from "recharts";

type DonorResponsePieChartProps = {
  metrics?: { accepted?: number; rejected?: number; noResponse?: number };
};

export default function DonorResponsePieChart({ metrics }: DonorResponsePieChartProps) {
  const counts = [
    { name: "Accepted", count: metrics?.accepted || 0, color: "#1E7B3A" },
    { name: "Rejected", count: metrics?.rejected || 0, color: "#FBBF24" },
    { name: "No response", count: metrics?.noResponse || 0, color: "#E57373" },
  ];
  const total = counts.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Donor Response</h2>
      {total === 0 ? (
        <p className="text-sm text-gray-500">Shows once donors respond to your requests.</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            <PieChart width={144} height={144}>
                <Pie data={counts.filter((c) => c.count > 0)} dataKey="count" cx={72} cy={72} isAnimationActive={false} innerRadius={45} outerRadius={68} paddingAngle={1} stroke="none">
                  {counts
                    .filter((c) => c.count > 0)
                    .map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
          </div>
          <ul className="space-y-3">
            {counts.map((item) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-bold text-gray-900">{Math.round((item.count / total) * 100)}%</span>
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-400 text-sm">({item.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
