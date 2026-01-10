"use client"
import React, { useState } from 'react';
import { Users, Heart, Target, Award, Linkedin, Twitter, Mail, ChevronRight } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  isExpanded: boolean;
  onHover: () => void;
  onLeave: () => void;
}

const TeamMember = ({ name, role, bio, imageSrc, isExpanded, onHover, onLeave }: TeamMemberProps) => {
  return (
    <div 
      className={`relative transition-all duration-500 ease-in-out overflow-hidden rounded-2xl cursor-pointer group ${isExpanded ? 'flex-1' : 'flex-[0.5]'}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Background Overlay */}
      <div 
        className={`absolute inset-0 transition-all duration-500 z-10 ${
          isExpanded 
            ? 'bg-linear-to-t from-black/80 via-black/50 to-transparent' 
            : 'bg-linear-to-t from-black/60 via-black/40 to-transparent'
        }`}
      />
      
      {/* Member Image */}
      <div className="absolute inset-0">
        <img 
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback if image doesn't load
            const target = e.target as HTMLImageElement;
            target.src = `/images/team/placeholder.jpg`;
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 lg:p-8 text-white">
        {/* Name and Role - Always visible */}
        <div className={`transition-all duration-500 ${isExpanded ? 'mb-6' : 'mb-4'}`}>
          <h3 className="text-xl lg:text-2xl font-bold mb-1">{name}</h3>
          <div className="flex items-center">
            <div className="h-1 w-6 lg:w-8 mr-3 rounded-full bg-[#1c7c3a]" />
            <p className="text-base lg:text-lg opacity-90">{role}</p>
          </div>
        </div>
        
        {/* Bio - Only shows when expanded */}
        <div 
          className={`transition-all duration-500 overflow-hidden ${
            isExpanded ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'
          }`}
        >
          <p className="text-white/90 leading-relaxed text-sm lg:text-base mb-6">{bio}</p>
          
          {/* Social Links */}
          <div className="flex space-x-3 lg:space-x-4">
            <a href="#" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Linkedin className="w-4 h-4 lg:w-5 lg:h-5" />
            </a>
            <a href="#" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Twitter className="w-4 h-4 lg:w-5 lg:h-5" />
            </a>
            <a href="#" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OurTeam() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  

  const teamMembers = [
    {
      name: "Ogunkoya Muyiwa",
      role: "Founder, Bloodlines",
      bio: "A visionary leader passionate about saving lives through technology.",
      imageSrc: "/Member 1.jpg", 
    },
    {
      name: "Dr. Amina Chukwu",
      role: "Medical Director",
      bio: "Board-certified hematologist with 15+ years of experience in blood transfusion medicine.",
      imageSrc: "/Member 2.jpg", 
    },
    {
      name: "Chinedu Okoro",
      role: "Tech Lead",
      bio: "Full-stack developer specializing in real-time systems.",
      imageSrc: "/Member 3.jpg", 
    },
    {
      name: "Fatima Bello",
      role: "Community Manager",
      bio: "Dedicated to building and nurturing our donor community.",
      imageSrc: "/Member 4.png",
    },
    {
      name: "Fatima Bello",
      role: "Community Manager",
      bio: "Dedicated to building and nurturing our donor community.",
      imageSrc: "/Member 5.jpg", 
    },
    {
      name: "Ahmed Bello",
      role: "Community Manager",
      bio: "Dedicated to building and nurturing our donor community.",
      imageSrc: "/Member 6.jpg",
    }
  ];

  return (
    <section className="py-8 lg:py-12 px-4 sm:px-6 lg:px-2 bg-linear-to-b bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-2 ml-100">
              <h1 className="text-sm md:text-lg lg:text-lg font-bold text-black mb-4 tracking-tight">
                OUR TEAM
              </h1>
        </div>
        <div className="mb-4 ml-100">
          <h2 className="text-lg md:text-xl lg:text-3xl font-bold">
            <span className="text-black">Together we have a dream </span>
          </h2>
        </div>
        <div className="mb-16 lg:mb-20">
          <div className="flex h-100 lg:h-125 gap-2 lg:gap-3">
            {teamMembers.map((member, index) => (
              <TeamMember
                key={index}
                {...member}
                isExpanded={expandedIndex === index}
                onHover={() => setExpandedIndex(index)}
                onLeave={() => setExpandedIndex(null)}
              />
            ))}
          </div>
        </div>
  
      </div>
    </section>
  );
}