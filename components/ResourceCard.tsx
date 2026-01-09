// components/ResourceCard.tsx
import React from 'react';
import Link from 'next/link';

interface ResourceCardProps {
  resource: {
    id: number;
    title: string;
    description: string;
    category: string;
    slug: string;
  };
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {resource.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
          {resource.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6 line-clamp-3">
          {resource.description}
        </p>

        {/* Read More Link */}
        <Link 
          href={`/resources/${resource.slug}`}
          className="inline-flex items-center text-red-600 font-semibold hover:text-red-800 transition-colors duration-200 group"
        >
          Read More
          <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;