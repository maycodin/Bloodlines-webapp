// components/CurvedProgressFulfillment.tsx
import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const CurvedProgressFulfillment = () => {
  const percentage = 87;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg h-76 border border-[#D8D6D6]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-normal text-black">Donation Fulfillment Rate</h3>
        
        {/* Month Selector */}
        <div className="relative">
          <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
            <option>Month</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Circular Progress Section */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-40 h-40 mb-1">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
            {/* Background track */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              strokeWidth="12"
              stroke="#f3f4f6"
              fill="transparent"
            />
            {/* Progress bar */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              strokeWidth="12"
              stroke="url(#progress-gradient)"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.5s ease-in-out',
              }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>

          {/* Percentage in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-900">{percentage}%</div>
            
          </div>
        </div>

        {/* Stats below */}
        <div className="text-center">
          <p className="text-black text-sm">
            <span className="font-normal text-black">120 requests</span> •{' '}
            <span className="font-normal text-black">108 fulfilled</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurvedProgressFulfillment;