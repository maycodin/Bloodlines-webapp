import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

// --- Types ---
interface MonthlyData {
  month: string;
  value: number;
}

interface EscalationItem {
  id: number;
  urgency: string;
  details: string;
  posted: string;
  outcome: string;
}

interface BloodTypeData {
  type: string;
  donors: number;
  status: 'Good' | 'Low' | 'Critical';
}

// --- Mock Data ---
const monthlyData: MonthlyData[] = [
  { month: 'Jan', value: 30 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 35 },
  { month: 'Apr', value: 55 },
  { month: 'May', value: 25 },
  { month: 'Jun', value: 50 },
  { month: 'Jul', value: 30 },
  { month: 'Aug', value: 70 },
  { month: 'Sep', value: 50 },
  { month: 'Oct', value: 90 },
  { month: 'Nov', value: 95 },
  { month: 'Dec', value: 85 },
];

const escalationData: EscalationItem[] = [
  { id: 1, urgency: 'O+ Critical', details: '2 units needed', posted: 'Sep 14, 2025 at 5:14pm', outcome: '2 donors responded' },
  { id: 2, urgency: 'O+ Critical', details: '2 units needed', posted: 'Sep 14, 2025 at 5:14pm', outcome: '2 donors responded' },
  { id: 3, urgency: 'O+ Critical', details: '2 units needed', posted: 'Sep 14, 2025 at 5:14pm', outcome: '2 donors responded' },
  { id: 4, urgency: 'O+ Critical', details: '2 units needed', posted: 'Sep 14, 2025 at 5:14pm', outcome: '2 donors responded' },
  { id: 5, urgency: 'O+ Critical', details: '2 units needed', posted: 'Sep 14, 2025 at 5:14pm', outcome: '2 donors responded' },
];

const bloodTypeDistribution: BloodTypeData[] = [
  { type: 'O+', donors: 1203, status: 'Good' },
  { type: 'A+', donors: 806, status: 'Good' },
  { type: 'B+', donors: 543, status: 'Good' },
  { type: 'AB+', donors: 145, status: 'Low' },
  { type: 'O-', donors: 67, status: 'Low' },
  { type: 'A-', donors: 45, status: 'Good' },
  { type: 'B-', donors: 45, status: 'Critical' },
  { type: 'AB-', donors: 45, status: 'Critical' },
];

// --- Sub-Components ---

const MonthSelector = () => (
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
);

const ActiveDonorsCard = () => (
  <div className="bg-white rounded-lg p-4 shadow-md border border-[#D8D6D6] flex-1 flex flex-col justify-center">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-black text-sm font-medium">Active Donors</p>
        <p className="text-2xl font-normal text-black mt-2">25</p>
      </div>
      <MonthSelector />
    </div>
  </div>
);

const AvgResponseCard = () => (
  <div className="bg-white rounded-lg p-4 shadow-md border border-[#D8D6D6] flex-1 flex flex-col justify-center">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-black text-sm font-medium">Avg Response Time</p>
        <p className="text-2xl font-normal text-black mt-2">5m 10s</p>
      </div>
      <MonthSelector />
    </div>
  </div>
);

const EscalationFulfillmentCard = () => {
  const percentage = 87;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-5 shadow-md border border-[#D8D6D6] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-normal text-black text-sm">Escalation</h3>
          <h3 className="font-normal text-black text-sm">Fulfillment Rate</h3>
        </div>
        <MonthSelector />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="relative w-40 h-20 mb-2">
          <svg className="w-full h-full" viewBox="0 0 150 80" preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a7c59" />
                <stop offset="100%" stopColor="#2d5a3d" />
              </linearGradient>
            </defs>
            <path
              d="M 15 75 A 60 60 0 0 1 135 75"
              fill="none"
              stroke="#f0fdf4"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 15 75 A 60 60 0 0 1 135 75"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference / 2}
              strokeDashoffset={strokeDashoffset / 2}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <div className="text-3xl font-bold text-gray-900">{percentage}%</div>
          </div>
        </div>
        <p className="text-black text-xs mt-2">
          <span className="font-normal">120 escalations</span> •{' '}
          <span className="font-normal">108 donations</span>
        </p>
      </div>
    </div>
  );
};

const TotalCoordinatedDonationChart = () => (
  <div className="bg-white rounded-lg p-4 shadow-md border border-[#D8D6D6] h-full flex flex-col overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-normal text-black text-sm">Total coordinated donation</h3>
      <MonthSelector />
    </div>

    <div className="relative flex-1 min-h-0">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
        <span>100</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>

      <div className="ml-10 h-full flex items-end justify-between gap-1 pb-6">
        {monthlyData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
            <div className="w-full flex justify-center items-end h-full">
              <div
                className="w-3 bg-[#4a7c59] rounded-t-sm"
                style={{ height: `${(item.value / 100) * 80}%` }}
              />
            </div>
            <span className="text-xs text-gray-600  absolute -bottom-1">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EscalationHistoryCard = () => (
  <div className="bg-white rounded-lg p-5 shadow-md border border-[#D8D6D6] h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-normal text-black text-sm">Escalation History</h3>
      <div className="relative">
        <select className="appearance-none bg-transparent text-blue-600 text-sm font-medium py-1 pr-6 focus:outline-none cursor-pointer">
          <option>Last 5 requests</option>
          <option>Last 10 requests</option>
          <option>Last 20 requests</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-blue-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <div className="flex-1 space-y-4 overflow-hidden">
      <div className="grid grid-cols-3 text-xs text-gray-500 mb-2">
        <span>Urgency</span>
        <span>Posted</span>
        <span>Outcome</span>
      </div>
      
      {escalationData.map((item) => (
        <div key={item.id} className="grid grid-cols-3 text-sm py-2 border-b border-gray-100 last:border-0">
          <div>
            <p className="font-medium text-black">{item.urgency}</p>
            <p className="text-xs text-gray-500">{item.details}</p>
          </div>
          <div className="text-gray-600 text-xs">
            {item.posted.split(' at ')[0]}<br />
            at {item.posted.split(' at ')[1]}
          </div>
          <div className="text-gray-600 text-xs">
            {item.outcome.split(' ')[0]}<br />
            {item.outcome.split(' ').slice(1).join(' ')}
          </div>
        </div>
      ))}
    </div>

    <button className="flex items-center gap-1 text-sm text-gray-600 mt-4 hover:text-gray-900 transition-colors">
      View all escalations
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

const RegionalBloodTypeDistribution = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-[#4a7c59] text-white';
      case 'Low': return 'bg-gray-600 text-white';
      case 'Critical': return 'bg-red-700 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-[#D8D6D6]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="font-normal text-black text-sm">Regional Blood Type Distribution</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {bloodTypeDistribution.map((item) => (
          <div key={item.type} className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-black mb-1">{item.type}</p>
            <p className="text-sm text-gray-500 mb-3">{item.donors} donors</p>
            <span className={`inline-block px-4 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component!!! ---

export default function PulseAnalytics() {
  return (
    <div className="space-y-6">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Top Row: Active/Avg stacked (left) + Fulfillment (right) */}
          <div className="grid grid-cols-2 gap-6 h-55">
            {/* Left: Stacked Active Donors & Avg Response */}
            <div className="flex flex-col gap-4 h-full">
              <ActiveDonorsCard />
              <AvgResponseCard />
            </div>
            
            {/* Right: Escalation Fulfillment */}
            <EscalationFulfillmentCard />
          </div>

          {/* Bottom Row */}
          <div className="h-55">
            <TotalCoordinatedDonationChart />
          </div>
        </div>

        {/* Right Column */}
        <div className="h-116"> 
          <EscalationHistoryCard />
        </div>
      </div>

      {/* Bottom Section */}
      <RegionalBloodTypeDistribution />
    </div>
  );
}