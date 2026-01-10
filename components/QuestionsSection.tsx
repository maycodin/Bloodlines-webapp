// app/faq/page.tsx
import React from 'react';
import Image from 'next/image';
import FAQAccordion from '@/components/FAQAccordion';

const FAQPage = () => {
  const faqItems = [
    {
      id: 1,
      number: '01',
      title: 'Pulse Leaders',
      content: 'The heartbeat of our movement – volunteers who lead awareness in schools, NYSC camps, workplaces, and faith centers. They organize drives, educate others, and make blood donation relatable and fun.',
      isOpen: true
    },
    {
      id: 2,
      number: '02',
      title: 'Bridgers',
      content: 'Connecting donors with recipients, these volunteers ensure seamless coordination between blood banks and hospitals.',
      isOpen: false
    },
    {
      id: 3,
      number: '03',
      title: 'Donors',
      content: 'Heroes who give the gift of life. Regular and first-time donors form the backbone of our initiative.',
      isOpen: false
    },
    {
      id: 4,
      number: '04',
      title: 'Blood Banks',
      content: 'Medical partners who ensure safe collection, testing, storage, and distribution of donated blood.',
      isOpen: false
    },
  ];

  return (
    <div className="min-h-screen mt-10 relative overflow-hidden">
      {/* Background Image using Next.js Image component */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Accordbg.jpg"
          alt="Blood donation background"
          fill
          priority
          className="object-cover object-center"
          quality={100}
          sizes="100vw"
        />
       
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - FAQ Title */}
          <div>
            
          </div>

          {/* Right Column - Accordion */}
          <div>
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;