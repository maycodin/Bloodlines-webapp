// components/DonorResponsePieChart.tsx (Compact 240px)
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar } from 'lucide-react';
import { useState } from 'react';

export default function DonorResponsePieChart() {
  const [selectedMonth, setSelectedMonth] = useState('Month');
  
  const data = [
    { name: 'Accepted', value: 60, color: '#1C7C3A' },
    { name: 'Escalated', value: 40, color: '#EBBE54' },
    { name: 'No Response', value: 10, color: '#EF9A9A' },
  ];

  const totalResponses = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-[#D8D6D6] p-5 w-1/2 h-60">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-black">Donor Response</h3>
        
        {/* Month Selector */}
        <div className="relative">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-medium py-1 pl-2 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent cursor-pointer"
          >
            <option>Month</option>
            <option>Sep</option>
            <option>Oct</option>
            <option>Nov</option>
            <option>Dec</option>
          </select>
          <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Chart and Legend */}
      <div className="flex items-center h-44]">
        {/* Donut Chart */}
        <div className="w-2/5 h-full pr-3">
          <div className="relative h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xl font-bold text-gray-900">{totalResponses}%</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Legend - Compact */}
        <div className="w-3/5 h-full pl-3">
          <div className="space-y-3 h-full flex flex-col justify-center">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}