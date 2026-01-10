// app/testimonials/page.tsx
import React from 'react';
import TestimonialCarousel from '@/components/TestimonialCarousel';

const TestimonialsPage = () => {
  const testimonials = [
    {
      id: 1,
      content: "As a volunteer, I've witnessed countless moments where a simple blood donation transformed someone's life. The gratitude in families' eyes when we can help their loved ones is incredibly powerful. Every volunteer at Bloodlines Foundation is part of this beautiful chain of compassion.",
      author: "Adedamola Frank",
      role: "Volunteer, Bloodlines",
      avatar: "/Testimonial 1.jpg",
      rating: 5
    },
    {
      id: 2,
      content: "Being part of Bloodlines Foundation has been life-changing. Seeing how our efforts directly impact communities and save lives gives me purpose. The organization's dedication is truly inspiring.",
      author: "Chidinma Okafor",
      role: "Donor Advocate",
      avatar: "/Testimonial 2.jpg",
      rating: 5
    },
    {
      id: 3,
      content: "The transparency and efficiency of Bloodlines Foundation are remarkable. They ensure every donation reaches those in need, and their volunteer training programs are exceptional.",
      author: "Emmanuel Johnson",
      role: "Partner Hospital Representative",
      avatar: "/Testimonial 3.jpg",
      rating: 5
    },
    {
      id: 4,
      content: "I was hesitant about donating blood for years, but Bloodlines made the process so easy and comfortable. Now I'm a regular donor and encourage everyone in my community to join.",
      author: "Amina Yusuf",
      role: "Regular Donor",
      avatar: "/Testimonial 2.jpg",
      rating: 5
    },
    {
      id: 5,
      content: "As a medical professional, I've seen firsthand how Bloodlines Foundation bridges the gap between donors and hospitals. Their work saves countless lives every day.",
      author: "Dr. Tunde Williams",
      role: "Medical Director",
      avatar: "/Testimonial 1.jpg",
      rating: 5
    },
  ];

  return (
    <div className="min-h-screen bg-[#090909]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        
        {/* Header Section */}
        

        <div className="mb-2 ml-100">
              <h1 className="text-sm md:text-lg lg:text-lg font-bold text-white mb-4 tracking-tight">
                TESTIMONIALS
              </h1>
        </div>
        <div className="mb-4 ml-100">
          <h2 className="text-xl md:text-xl lg:text-3xl font-bold">
            <span className="text-white">Bloodliner's Spotlight</span>
          </h2>
        </div>
        

        {/* Carousel Section - Shows 3 at once */}
        <div className="mb-16 lg:mb-20">
          <TestimonialCarousel testimonials={testimonials} />
        </div>

        
      </div>
    </div>
  );
};

export default TestimonialsPage;