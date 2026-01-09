// app/resources/page.tsx
import React from 'react';
import ResourceCard from '@/components/ResourceCard';

const ResourcesPage = () => {
  const resources = [
    {
      id: 1,
      title: 'The Real Secret to Preparing for your first Blood Donation activity',
      description: 'Discover essential tips and preparation steps to ensure a smooth and successful first-time blood donation experience.',
      category: 'Guide',
      slug: 'preparing-first-blood-donation',
    },
    {
      id: 2,
      title: 'The Real Secret to Preparing for your first Blood Donation activity',
      description: 'Learn about hydration, nutrition, and mental preparation strategies that can make your donation process more comfortable.',
      category: 'Guide',
      slug: 'blood-donation-preparation-tips',
    },
    {
      id: 3,
      title: 'The Real Secret to Preparing for your first Blood Donation activity',
      description: 'Understand post-donation care and recovery tips to help your body replenish after giving blood.',
      category: 'Guide',
      slug: 'post-donation-care',
    },
  ];

  return (
    <div className=" bg-white px-4 sm:px-6 lg:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="inline-flex items-center px-8 py-3 border border-[#5B5353] text-base font-medium rounded-md text-black hover:text-white bg-white hover:bg-red-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            View all Resources
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;