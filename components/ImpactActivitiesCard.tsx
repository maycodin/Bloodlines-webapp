// components/ImpactActivitiesCards.tsx
import React from 'react';
import Image from 'next/image';
import { Droplets, Users, HeartPulse, Clock } from 'lucide-react';

const ImpactActivitiesCards = () => {
  const impactStats = [
    {
      id: 1,
      label: 'Total Donations',
      value: 8,
      icon: <Droplets className="w-6 h-6 text-red-600" />,
      bgColor: 'bg-red-50',
      imageSrc: '/HeartPulses.png' 
    },
    {
      id: 2,
      label: 'New Donors Recruited',
      value: 8,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      imageSrc: '/Target.png' 
    },
    {
      id: 3,
      label: 'Emergencies Handled',
      value: 8,
      icon: <HeartPulse className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-50',
      imageSrc: '/siren.png' 
    }
  ];

  const recentActivities = [
    {
      id: 1,
      description: 'Coordinated emergency O+ request',
      time: '2 hours ago',
      icon: <HeartPulse className="w-4 h-4 text-red-600" />
    },
    {
      id: 2,
      description: 'Recruited 3 new donors at university',
      time: '3 days ago',
      icon: <Users className="w-4 h-4 text-blue-600" />
    },
    {
      id: 3,
      description: 'Organized community blood drive',
      time: '1 week ago',
      icon: <Droplets className="w-4 h-4 text-green-600" />
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Impact Card */}
      <div className="bg-white rounded-xl border border-[#D8D6D6] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Impact</h2>
        
        {/* Three stats cards side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {impactStats.map((stat) => (
            <div 
              key={stat.id} 
              className={`border border-[#D8D6D6] rounded-lg p-6 text-center hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              {/* Image container */}
              <div className="flex justify-center mb-3">
                <div className=" flex items-center justify-center relative">
                  {/* Using Next.js Image component */}
                  <Image
                    src={stat.imageSrc}
                    alt={stat.label}
                    width={60}
                    height={60}
                    className="object-contain"
                    onError={(e) => {
                      
                      e.currentTarget.style.display = 'none';
                     
                    }}
                  />
                  {/* Fallback icon (hidden when image loads) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0">
                    {stat.icon}
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        
      </div>

      {/* Recent Activities Card */}
      <div className="bg-white rounded-xl border border-[#D8D6D6] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Last 7 days
          </span>
        </div>

        {/* Activities stacked vertically */}
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
              {/* Optional: Action button or status indicator */}
              <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                View
              </button>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-6 pt-4 border-t border-[#D8D6D6]">
          <button className="text-sm text-red-600 font-medium hover:text-red-700 flex items-center gap-1">
            View all activities
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpactActivitiesCards;