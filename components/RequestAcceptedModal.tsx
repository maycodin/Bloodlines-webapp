// components/RequestAcceptedModal.tsx
"use client";

import { useState } from "react";
import { X, MapPin, Clock, Phone, Navigation } from "lucide-react";
import { BloodRequest } from "@/lib/api";

interface RequestAcceptedModalProps {
  request: BloodRequest;
  onClose: () => void;
  onArrivalAlert?: (requestId: string) => void;
}

const RequestAcceptedModal: React.FC<RequestAcceptedModalProps> = ({ 
  request, 
  onClose,
  onArrivalAlert 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleArrivalAlert = async () => {
    setIsLoading(true);
    try {
      if (onArrivalAlert) {
        await onArrivalAlert(request.id);
      }
      alert('Arrival alert sent! The hospital has been notified.');
    } catch (error) {
      console.error('Failed to send arrival alert:', error);
      alert('Failed to send arrival alert. Please call the hospital directly.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Map priority level to display text
  const getPriorityDisplay = (priority: string) => {
    const map: Record<string, string> = {
      'CRITICAL': 'Critical',
      'URGENT': 'Urgent',
      'HIGH': 'High',
      'MEDIUM': 'Medium',
      'LOW': 'Low'
    };
    return map[priority] || priority;
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      'CRITICAL': 'text-red-600 bg-red-50 border-red-200',
      'URGENT': 'text-orange-600 bg-orange-50 border-orange-200',
      'HIGH': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'MEDIUM': 'text-blue-600 bg-blue-50 border-blue-200',
      'LOW': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return map[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Request Accepted! 🩸</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Blood Type & Urgency */}
          <div className="flex items-center gap-4">
            <div className="bg-[#C91E1E] text-white px-4 py-2 rounded-lg">
              <span className="text-2xl font-bold">{request.bloodType}</span>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(request.priorityLevel || 'MEDIUM')}`}>
                {getPriorityDisplay(request.priorityLevel || 'MEDIUM')}
              </span>
              <p className="text-sm text-gray-500 mt-1">{request.unitsNeeded} units needed</p>
            </div>
          </div>
          
          {/* Hospital Info */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Hospital Details</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-800">{request.facilityName || request.hospitalName}</p>
              <p className="text-gray-600">{request.facilityAddress}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{request.contactPhone}</span>
              </div>
            </div>
          </div>
          
          {/* Patient Condition */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Patient Condition</h3>
            <p className="text-sm text-gray-700 p-3 bg-blue-50 rounded-lg border border-blue-100">
              {request.patientCondition}
            </p>
            {request.additionalNotes && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Additional Notes:</span> {request.additionalNotes}
              </p>
            )}
          </div>
          
          {/* Time Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Posted: {new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Required by: {new Date(request.requiredByDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleArrivalAlert}
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              {isLoading ? 'Sending...' : "I've Arrived at Hospital"}
            </button>
            
            <button
              onClick={() => {
                // Open navigation to hospital
                const address = request.facilityAddress || request.hospitalName || '';
                window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
              }}
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAcceptedModal;