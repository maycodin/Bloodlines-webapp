'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Donor responses to this Bridger's requests, from GET /bridger/dashboard (donorResponseMetrics)
interface DonorResponsePieChartProps {
  metrics?: { accepted?: number; rejected?: number; noResponse?: number };
}

export default function DonorResponsePieChart({ metrics }: DonorResponsePieChartProps) {
  const counts = [
    { name: 'Accepted', count: metrics?.accepted || 0, color: '#1C7C3A' },
    { name: 'Declined', count: metrics?.rejected || 0, color: '#EBBE54' },
    { name: 'No Response', count: metrics?.noResponse || 0, color: '#EF9A9A' },
  ];
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  const data = counts.map((item) => ({ ...item, value: total ? Math.round((item.count / total) * 100) : 0 }));

  return (
    <div className="bg-white rounded-xl border border-[#D8D6D6] p-5">
      <h3 className="text-base font-bold text-black mb-3">Donor Response</h3>

      {total === 0 ? (
        <p className="text-sm text-gray-500">Shows once donors respond to your requests.</p>
      ) : (
        <div className="flex items-center h-44">
          {/* Donut chart */}
          <div className="w-2/5 h-full pr-3">
            <div className="relative h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.filter((d) => d.count > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="count">
                    {data.filter((d) => d.count > 0).map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xl font-bold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">responses</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-3/5 h-full pl-3 space-y-3 flex flex-col justify-center">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
