"use client"
import React, { useState } from 'react';
import { Play, BookOpen, ChevronRight, Users, Award, X } from 'lucide-react';
import ArticlesSection from './ArticlesSection';


const extractYouTubeId = (url: string): string => {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return '';
};

interface ResourceCardProps {
  type: 'video' | 'course';
  title: string;
  description: string;
  youtubeUrl: string;
  onPlay: (youtubeId: string, title: string) => void;
}

const ResourceCard = ({ 
  type, 
  title, 
  youtubeUrl, 
  onPlay
}: ResourceCardProps) => {
  const youtubeId = extractYouTubeId(youtubeUrl);
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  
  return (
    <div className="group">
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        {/* Thumbnail Section */}
        <div className="relative aspect-video overflow-hidden">
          {/* Thumbnail Image */}
          <img 
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `/images/youtube-placeholder.jpg`;
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Type Label - Top Left */}
          <div className="absolute top-4 left-4">
            <div className={`px-5 py-2 rounded-full font-bold text-sm tracking-wide ${
              type === 'video' 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-blue-500 text-white shadow-lg'
            }`}>
              {type === 'video' ? 'VIDEO' : 'COURSE'}
            </div>
          </div>
          
          {/* Play Button Center */}
          <button
            onClick={() => onPlay(youtubeId, title)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer focus:outline-none"
          >
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white hover:shadow-2xl">
              <Play className="w-8 h-8 text-red-600 ml-1" fill="currentColor" />
            </div>
          </button>
          
          
        </div>
      </div>
      
      {/* Title Below Card */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>

      </div>
    </div>
  );
};

// Video Modal Component
const VideoModal = ({ 
  isOpen, 
  onClose, 
  youtubeId, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  youtubeId: string; 
  title: string; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close video"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {/* Video Player */}
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              Watch on YouTube
            </a>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Close Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResourcesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{id: string, title: string} | null>(null);

  const handlePlayVideo = (youtubeId: string, title: string) => {
    setCurrentVideo({ id: youtubeId, title });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentVideo(null);
  };

  // Using your provided YouTube links
  const resources = [
    {
      type: 'video' as const,
      title: 'The Real Secret to Preparing for your first Blood Donation activity',
      description: 'Learn everything you need to know before donating blood for the first time.',
      youtubeUrl: 'https://youtu.be/oj8a88xIHbM?si=Zx5xUA2-raBl-huh', // Your first link
   
    },
    {
      type: 'video' as const,
      title: 'The Real Secret to Preparing for your first Blood Donation activity',
      description: 'A comprehensive course covering nutrition, hydration, recovery.',
      youtubeUrl: 'https://youtu.be/J40rPlmqw5s?si=_-OfaMitK6qLDuhz', // Your second link

    }
  ];

  // Extract YouTube IDs for the demo button
  const demoVideoId = extractYouTubeId(resources[0].youtubeUrl);

  return (
    <>
    {/* Header */}
    <div className='bg-[#1B1B1B] py-6'>
    <div className="mb-2 ml-100">
        <h1 className="text-sm md:text-lg lg:text-lg font-light text-white mb-4 tracking-tight">
            RESOURCES
        </h1>
    </div>
    <div className="mb-4 ml-100">
    <h2 className="text-xl md:text-xl lg:text-3xl font-bold">
        <span className="text-white">Learn all you need to know</span>
    </h2>
    </div>
    </div>
      <section className="mt-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b bg-white">
        <div className="max-w-7xl mx-auto">
          

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-20">
            {resources.map((resource, index) => (
              <ResourceCard 
                key={index} 
                {...resource} 
                onPlay={handlePlayVideo}
              />
            ))}
          </div>
        </div>
      </section>
      <ArticlesSection />

      {/* Video Modal */}
      <VideoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        youtubeId={currentVideo?.id || ''}
        title={currentVideo?.title || ''}
      />
    </>
  );
}