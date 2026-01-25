// components/SuccessModal.tsx
"use client"
import React from 'react';
import { CheckCircle, Home, Droplets } from 'lucide-react';
import Image from 'next/image';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, onGoHome }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        
        
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center">
            <Image 
              src="/Modal check.png"
              alt="Success"
              width={300}
              height={267}
              className="mb-4"
            />
          
          {/* Title */}
          <h2 className="text-lg font-normal text-[#37373D]  mb-4">
            Blood Request Posted Successfully!
          </h2>
          
          {/* Message */}
          <p className="text-[#37373D] text-sm mb-4">
            You blood request has been sent, kindly wait a few minutes a for your request to be updated.
          </p>
          
          
          
          {/* Action Buttons */}
          <div className="flex items-center">
            <button
              onClick={onGoHome}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-3 h-3" />
              Return Home
            </button>
            
          </div>
          
          
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;