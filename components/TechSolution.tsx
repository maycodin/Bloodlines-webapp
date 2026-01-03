import React from 'react';
import { Bell, Calendar, MapPin, Heart, Users, Trophy, ChevronRight, Download } from 'lucide-react';

export default function TechSolution() {
  const features = [
    {
      icon: <Bell className="w-5 h-5" />,
      text: "Instant notifications when your blood type is needed."
    },
    {
      icon: <Calendar className="w-5 h-5" />, 
      text: "Track your donation history and impact."
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      text: "Find nearby donation centers and mobile drives."
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      text: "Earn badges and join our community of heroes."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-2 ml-100">
              <h1 className="text-sm md:text-lg lg:text-lg font-bold text-black mb-4 tracking-tight">
                OUR TECH SOLUTION
              </h1>
        </div>
        <div className="mb-4 ml-100">
          <h2 className="text-xl md:text-xl lg:text-3xl font-bold">
            <span className="text-black">Bloodlines app</span>
          </h2>
        </div>

        {/* Main Content - Image Left, Content Right */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 ">

          {/* Left Side - Content */}
          <div className="lg:w-2/5 p-8 rounded-3xl bg-[#C91E1E] border-4 border-[#2F3B40] text-white">
            <div className="text-center">
            <div className="inline-block justify-center bg-[#1C7C3A] px-6 py-3 text-white font-bold text-lg rounded-lg mb-3 shadow-lg">
              COMING SOON!
            </div>
            </div>
            <p className="text-base leading-relaxed mb-8">
              Soon, donating blood will be easier than ever, our upcoming mobile app will connect donors with recipients in real-time, 
              making life-saving donations just a tap away.
            </p>
            
            {/* Features List */}
            <div className="space-y-5 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start group">
                  <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                    <div>
                      {feature.icon}
                    </div>
                  </div>
                  <p className="text-base group-hover:text-white/30 transition-colors">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>      
          </div>
          {/* Right Side - Image */}
            <div className="lg:w-3/5">
            <div className="relative">
                <img 
                src="/TabImage.png" 
                alt="Bloodlines App Screenshot" 
                className="rounded-xl  w-full h-auto"
                />
            </div>
            </div>
        </div>
      </div>
    </section>
  );
}