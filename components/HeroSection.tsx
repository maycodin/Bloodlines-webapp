import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative flex mt-70 ml-12 items-center">
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-158">
          <div className="items-center text-white text-4xl font-semibold">
            <span className='font-bold'>Connecting Lives with Lifesavers</span>
          </div>

          <span className="text-4xl text-[#EAF8DF] font-semibold">
            Join the Future of 
            <span className='text-[#B6F507]'>
            {" "}Blood Donation
            </span>
          </span>

          <div className="">
            <p className="text-sm/6 font-extralight md:text-lg text-white">
              A community-powered network that connects people who need blood with those who can give—quickly, freely, safely.
            </p>

          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/join"
              className="group bg-[#C91E1E] items-center justify-center px-8 py-4 text-sm/snug font-bold text-white from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            >
              Join the Community
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;