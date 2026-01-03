import React from 'react';
import Image from 'next/image';
import SolutionSection from '../components/SolutionSection';
import ImpactSection from '../components/ImpactSection';
import TechSolution from '../components/TechSolution';
import TeamSection from '../components/TeamSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-2 ml-100">
              <h1 className="text-sm md:text-lg lg:text-lg font-bold text-black mb-4 tracking-tight">
                ABOUT US
              </h1>
        </div>
        <div className="mb-4 ml-100">
          <h2 className="text-lg md:text-xl lg:text-3xl font-bold">
            <span className="text-black">We are </span>
            <span className="text-[#1c7c3a] relative">
              BloodLines
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Graphic Section */}
          <div className="relative order-2 lg:order-1">
            {/* Green Background Rectangle - Smaller backdrop */}
            <div className="relative bg-[#1c7c3a] rounded-2xl lg:rounded-3xl p-4 md:p-6 aspect-square lg:aspect-auto lg:h-112.5 shadow-xl">
              
              {/* Container for image grid that extends beyond backdrop */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Organic Image Grid Layout - Slightly larger than backdrop */}
                <div className="relative h-[120%] w-[120%]">
                  
                  {/* Top Left Image - Tall Vertical */}
                  <div className="absolute top-[1%] left-[3%] w-[65%] h-[55%] z-10">
                    <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                      <Image
                        src="/Rectangle 5.png"
                        alt="Blood donor smiling"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 40vw, 20vw"
                      />
                     
                    </div>
                  </div>
                  
                  {/* Top Right Image - Medium Square */}
                  <div className="absolute top-[20%] right-[-5%] w-[35%] h-[30%] z-20">
                    <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl transform rotate-0  hover:rotate-2 transition-transform duration-200">
                      <Image
                        src="/Rectangle 7.png"
                        alt="Community blood drive event"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 40vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                    </div>
                  </div>
                  
                  {/* Middle Left Image - Wide Horizontal */}
                  <div className="absolute top-[65%] left-[3%] w-[40%] h-[29.1%] z-30">
                    <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                      <Image
                        src="/Rectangle 8.png"
                        alt="Medical team working"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 40vw, 20vw"
                      />
                    </div>
                  </div>

                  {/* Bottom Right Image - Small Square */}
                  <div className="absolute bottom-[0%] right-[-5%] w-[60%] h-[50%] z-40">
                    <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <Image
                        src="/Rectangle 6.png"
                        alt="Hand holding blood bag"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 30vw, 15vw"
                      />
                    </div>
                  </div>
                  
                 
                  
                </div>
              </div>
              
        
              
            </div>
            
            
            
          </div>

          {/* Right Column - Text Content */}
          <div className="order-1 lg:order-2">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Tagline in elegant box */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-500 to-emerald-600 rounded-full" />
                <div className="pl-6">
                  <p className="text-lg md:text-xl lg:text-2xl text-black leading-relaxed font-light">
                    We envision an Africa where no one dies waiting for blood because 
                    the simple act of giving has become a shared rhythm of compassion, 
                    a culture that connects one life to another.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
      <SolutionSection />
      <ImpactSection />
      <TechSolution />
      <TeamSection />
      </section>
    </div>
  );
}

