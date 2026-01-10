'use client';

import React, { useState } from 'react';

interface FAQItem {
  id: number;
  number: string;
  title: string;
  content: string;
  isOpen: boolean;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState<FAQItem[]>(initialItems);

  const toggleItem = (id: number) => {
    setItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        isOpen: item.id === id ? !item.isOpen : false
      }))
    );
  };

  return (
    <div className="space-y-4 p-10 bg-black">
        <div>
            {/* FACS Title */}
            <div className="mb-3">
              <h1 className="text-lg font-extralight text-white leading-none">
                FAQS
              </h1>
            </div>
            {/* Subtitle */}
            <div>
              <h2 className="text-3xl font-normal text-white">
                Frequently Asked <br /> Questions
              </h2>
              
            </div>
          </div>
      {items.map((item) => ( 
        <div
          key={item.id}
          className={`rounded-2xl overflow-hidden transition-all duration-300 ${
            item.isOpen 
              ? ' backdrop-blur-sm shadow-2xl border-red-200' 
              : ' backdrop-blur-sm '
          }`}
        >
          {/* Accordion Header - Always Visible */}
          <div className="p-3 border-b border-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Number */}
                <div className="shrink-0">
                  <span className="text-xl font-light text-white">
                    {item.number}
                  </span>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-xl font-normal text-white mb-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Plus/Minus Button */}
              <button
                onClick={() => toggleItem(item.id)}
                className="shrink-0 w-12 h-12  flex items-center justify-center transition-colors duration-200 ml-4"
                aria-label={item.isOpen ? "Collapse" : "Expand"}
              >
                <span className="text-2xl font-light text-white">
                  {item.isOpen ? '−' : '+'}
                </span>
              </button>
            </div>

            {/* Expanded Content - Only shows when open */}
            {item.isOpen && (
              <div className="pl-3">
                <p className="text-white text-sm font-light leading-relaxed">
                  {item.content}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;