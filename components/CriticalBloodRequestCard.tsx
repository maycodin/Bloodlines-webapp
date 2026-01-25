"use client"
import React from 'react';
import { Clock, Phone } from 'lucide-react';

export type BloodRequestType = {
  id: string | number;
  status: 'Critical' | 'Urgent' | 'Scheduled';
  bloodType: string;
  unitsNeeded: number;
  postedTime: string;
  contactNumber: string;
  patientCondition: string;
  showActions?: boolean;
  customStatusColor?: string;
  customBloodTypeColor?: string;
  timestamp?: Date; // For sorting or time calculations
};

// Props for the component
type CriticalBloodRequestCardProps = {
  request: BloodRequestType;
  onConfirm?: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  className?: string;
};

const CriticalBloodRequestCard: React.FC<CriticalBloodRequestCardProps> = ({ 
  request, 
  onConfirm, 
  onEdit, 
  className = '' 
}) => {
  
  const getStatusStyles = () => {
    switch (request.status) {
      case 'Critical':
        return 'bg-[#C91E1E] text-white';
      case 'Urgent':
        return 'bg-[#F97316] text-white';
      case 'Scheduled':
        return 'bg-[#10B981] text-white';
      default:
        return 'bg-[#C91E1E] text-white';
    }
  };

  const getBloodTypeStyles = () => {
    return 'text-[#C91E1E] border border-[#C91E1E]';
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(request.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(request.id);
    }
  };

  return (
    <div className={`border border-[#D8D6D6] mb-4 rounded-lg p-5 ${className}`}>
      {/* Header Section */}
      <div className="flex gap-2 mb-4">
        {/* Status Badge */}
        <div className={`text-sm text-center py-1 px-3 rounded-lg ${getStatusStyles()}`}>
          {request.status}
        </div>
        
        {/* Blood Type Badge */}
        <div className={`text-sm text-center py-1 px-3 rounded-lg ${getBloodTypeStyles()}`}>
          {request.bloodType}
        </div>
        
        {/* Units Needed */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span>{request.unitsNeeded} unit{request.unitsNeeded !== 1 ? 's' : ''} needed</span>
        </div>
      </div>

      {/* Info and Actions Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Contact and Time Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm">{request.postedTime}</span>
          </div>
          
          <div className="hidden sm:block text-gray-300">|</div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <div className="text-sm font-light text-gray-900">{request.contactNumber}</div>
          </div>
        </div>

        
          <div className="flex gap-2 self-start sm:self-auto">
            <button 
              onClick={handleConfirm}
              className="text-sm rounded-lg font-semibold text-white py-1 px-3 bg-[#C91E1E] hover:bg-[#A01818] transition-colors"
            >
              Confirm donation
            </button>
            <button 
              onClick={handleEdit}
              className="text-sm rounded-lg font-semibold text-[#C91E1E] py-1 px-3 border border-[#C91E1E] hover:bg-red-50 transition-colors"
            >
              Edit
            </button>
          </div>
    
      </div>

      {/* Patient Condition */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className={`w-2 h-2 rounded-full ${
            request.status === 'Critical' ? 'bg-red-500' : 
            request.status === 'Urgent' ? 'bg-orange-500' : 
            'bg-green-500'
          } animate-pulse`}></div>
          <span>{request.patientCondition}</span>
        </div>
      </div>
    </div>
  );
};

export default CriticalBloodRequestCard;