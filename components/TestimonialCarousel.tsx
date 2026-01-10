'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxVisible = 3;
  const minSwipeDistance = 50;

  const nextSlide = () => {
    if (currentIndex >= testimonials.length - maxVisible) {
      setCurrentIndex(0); // Loop back to start
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex <= 0) {
      setCurrentIndex(testimonials.length - maxVisible); // Loop to end
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (index < 0) index = 0;
    if (index > testimonials.length - maxVisible) index = testimonials.length - maxVisible;
    setCurrentIndex(index);
  };

  // Get visible testimonials (3 at a time)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < maxVisible; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <div className="relative">
      {/* Navigation Arrows - Top Right */}
      <div className="flex justify-end items-center mb-8">
        <div className="flex items-center space-x-4">
          

          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full  border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 shadow-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-white hover:text-black" />
            </button>
            
            <button
              onClick={nextSlide}
              className="p-2 rounded-full  border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 shadow-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-white hover:text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${(currentIndex * (100 / maxVisible))}%)`,
            width: `${(testimonials.length * 100) / maxVisible}%`
          }}
        >
          {testimonials.map((testimonial, index) => {
            const isCurrent = index >= currentIndex && index < currentIndex + maxVisible;
            
            return (
              <div 
                key={testimonial.id} 
                className={`shrink-0 transition-all duration-500 ${
                  isCurrent ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
                }`}
                style={{ width: `${100 / testimonials.length}%` }}
              >
                <div className="mx-2">
                  <div className="bg-[#1B1B1B] overflow-hidden border h-100 hover:bg-[#1C7C3A] transition-shadow duration-300">
                    <div className="p-6">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                      {/* Testimonial Content */}
                      <blockquote className="mb-6">
                        <p className="text-white py-14 text-sm leading-relaxed line-clamp-4">
                          {testimonial.content}
                        </p>
                      </blockquote>

                      {/* Author Info */}
                      <div className="flex items-center border-t border-gray-100 pt-4">
                        
                        <div className="ml-4">
                          <h3 className="font-semibold text-white">{testimonial.author}</h3>
                          <p className="text-sm text-white font-medium">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;