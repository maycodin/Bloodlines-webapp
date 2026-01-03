import React from 'react';
import { Heart, Users, Target, HeartPulse } from 'lucide-react';

interface SimpleImpactCardProps {
  number: string;
  label: string;
  icon: React.ReactNode;
}

const SimpleImpactCard = ({ number, label, icon}: SimpleImpactCardProps) => {
  return (
    <div className="flex flex-row gap-3 items-center bg-[#F7FFBD] p-4 text-left">
      {/* Icon */}
      <div 
        className="flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-[#C91E1E]">
        <div style={{ color: '#ffffff' }}>
          {icon}
        </div>
      </div>
      <div>
      <div className="mb-2">
        <span className="text-4xl font-bold text-[#1C7C3A]">{number}</span>
        <span className="text-4xl font-bold text-[#1C7C3A]">+</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      </div>
    </div>
  );
};

export default function SimpleOurImpact() {
  const impactStats = [
    {
      number: "500",
      label: "Lives Saved",
      icon: <HeartPulse className="w-8 h-8" />,
    }, 
    {
      number: "800",
      label: "Donor's Registered",
      icon: <Users className="w-8 h-8" />,
    },
    {
      number: "50",
      label: "Active Volunteers",
      icon: <Target className="w-8 h-8" />,
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F7FFBD]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-2 ml-100">
              <h1 className="text-sm md:text-lg lg:text-lg font-bold text-black mb-4 tracking-tight">
                OUR IMPACT
              </h1>
        </div>
        <div className="mb-4 ml-100">
          <h2 className="text-xl md:text-xl lg:text-3xl font-bold">
            <span className="text-black">What we have achieved so far</span>
          </h2>
        </div>

        {/* 1x3 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {impactStats.map((stat) => (
            <SimpleImpactCard
              key={stat.label}
              number={stat.number}
              label={stat.label}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}