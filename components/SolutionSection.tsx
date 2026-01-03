import React from 'react';
import { Users, Building2, Heart, Megaphone, LucideIcon } from 'lucide-react';

interface RoleCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
}

const RoleCard = ({ title, description, Icon, color }: RoleCardProps) => {
  return (
    <div className="group relative flex flex-col h-105 p-10 border-2 rounded-lg transition-all duration-300 hover:shadow-lg border-[#8A8585] bg-white hover:bg-[#C91E1E] hover:-translate-y-1">
      {/* Header with icon and title */}
      <div className="flex items-start mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4 group-hover:bg-white/30 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] group-hover:shadow-white transition-all duration-300"
          style={{ 
            backgroundColor: `${color}10`
           }}>
          {/* Icon container with glow effect */}
          <div className="transition-all duration-300 group-hover:scale-110" style={{ color }}>
            <Icon 
              className="w-6 h-6"
              stroke="currentColor"
              fill="none"
            />
          </div>
        </div>
        <h3 className="text-xl text-black font-bold pt-2 transition-colors duration-300 group-hover:text-white">
          {title}
        </h3>
      </div>
      
      {/* Description */}
      <p className="text-[#5B5353] text-[18px] grow leading-10 transition-colors duration-300 group-hover:text-white">
        {description}
      </p>
      
    </div>
  );
};

export default function BloodDonationSolution() {
  const roles = [
    {
      title: "Donors",
      description: "Everyday people like you and me who give blood to save lives. They can register, receive alerts, and track their life-saving impact through our app.",
      Icon: Users,
      color: '#1c7c3a', 
    },
    {
      title: "Blood Bank",
      description: "Partners who ensure safe, tested blood is stored, separated, and supplied promptly. They share real-time data on inventory and shortages, helping direct donors where they're most needed.",
      Icon: Building2,
      color: '#1c7c3a',  
    },
    {
      title: "Bridgers",
      description: "Professionals within the hospital systems who raise alerts when patients need blood. They are the lifeline between hospitals and the BloodLines network, ensuring no time is wasted when emergencies happen.",
      Icon: Heart,
      color: '#1c7c3a', 
    },
    {
      title: "Pulse Leaders",
      description: "The heartbeat of our movement – volunteers who lead awareness in schools, NYSC camps, workplaces, and faith centers. They organize drives, educate others, and make blood donation relatable and fun.",
      Icon: Megaphone,
      color: '#1c7c3a', 
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-2 ml-100">
              <h1 className="text-sm md:text-lg lg:text-lg font-bold text-black mb-4 tracking-tight">
                OUR SOLUTION
              </h1>
        </div>
        <div className="mb-4 ml-100">
          <h2 className="text-xl md:text-xl lg:text-3xl font-bold">
            <span className="text-black">Solving the Blood donation problem</span>
          </h2>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Row 1 - First Column */}
          <div className="space-y-6 lg:space-y-8">
            <RoleCard {...roles[0]} />
            <RoleCard {...roles[2]} />
          </div>
          
          {/* Row 1 - Second Column */}
          <div className="space-y-0 lg:space-y-8">
            <RoleCard {...roles[1]} />
            <RoleCard {...roles[3]} />
          </div>
        </div>
      </div>
    </div>
  );
}