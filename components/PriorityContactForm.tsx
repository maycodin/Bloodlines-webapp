"use client"
import React, { useState } from 'react';
import { Phone, X, MessageSquare } from 'lucide-react';
import { BloodRequestType } from './CriticalBloodRequestCard';

interface PriorityContactFormProps {
  onAddRequest?: (newRequest: BloodRequestType) => void;
  onCancel?: () => void;
  onSuccess?: () => void; // Callback for successful submission
}

const PriorityContactForm: React.FC<PriorityContactFormProps> = ({ onAddRequest, onCancel, onSuccess }) => {
  const [selectedPriority, setSelectedPriority] = useState<'Critical' | 'Urgent' | 'Scheduled' | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [unitsNeeded, setUnitsNeeded] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const unitsOptions = Array.from({ length: 8 }, (_, i) => (i + 1).toString());
  const priorityOptions = ['Critical', 'Urgent', 'Scheduled'];

  // Function to format time 
//   const formatPostedTime = () => {
//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = now.getMinutes();
    
//     // Convert to 12-hour format
//     const ampm = hours >= 12 ? 'pm' : 'am';
//     const formattedHours = hours % 12 || 12;
//     const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
//     return `posted at ${formattedHours}:${formattedMinutes}${ampm}`;
//   };

  // Function to get relative time 
//   const getRelativeTime = (timestamp: Date) => {
//     const now = new Date();
//     const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
//     if (diffInSeconds < 60) {
//       return 'just now';
//     } else if (diffInSeconds < 3600) {
//       const minutes = Math.floor(diffInSeconds / 60);
//       return `${minutes} min ago`;
//     } else if (diffInSeconds < 86400) {
//       const hours = Math.floor(diffInSeconds / 3600);
//       return `${hours} hour${hours > 1 ? 's' : ''} ago`;
//     } else {
//       const days = Math.floor(diffInSeconds / 86400);
//       return `${days} day${days > 1 ? 's' : ''} ago`;
//     }
//   };

  // Validate phone number contains only numbers and valid symbols
  const validatePhoneNumber = (phone: string) => {
    // Allow numbers, plus sign, parentheses, spaces, and dashes
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone) || phone === '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (validatePhoneNumber(value)) {
      setPhoneNumber(value);
      setPhoneError('');
    } else {
      setPhoneError('Phone number can only contain numbers, spaces, +, -, (, and )');
    }
  };

  const getFormattedTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `posted at ${formattedHours}:${formattedMinutes}${ampm}`;
};

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Reset errors
  setPhoneError('');
  
  // Validate phone number
  if (!validatePhoneNumber(phoneNumber)) {
    setPhoneError('Please enter a valid phone number');
    return;
  }
  
  // Validate required fields
  if (!selectedPriority || !phoneNumber.trim() || !bloodType || !unitsNeeded) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Validate phone number is not just symbols
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    setPhoneError('Please enter a valid phone number with at least 7 digits');
    return;
  }
  
  setIsSubmitting(true);
  
  // Get current timestamp
  const now = new Date();
  
  // Create new blood request object
  const newRequest: BloodRequestType = {
    id: Date.now(),
    status: selectedPriority as 'Critical' | 'Urgent' | 'Scheduled',
    bloodType: bloodType,
    unitsNeeded: parseInt(unitsNeeded),
    postedTime: getFormattedTime(), // This will give "posted at 3:00pm"
    contactNumber: phoneNumber.trim(),
    patientCondition: additionalNotes.trim() || 'Additional details not provided',
    showActions: true,
    timestamp: now
  };
  
  // Simulate API call
  setTimeout(() => {
    if (onAddRequest) {
      onAddRequest(newRequest);
    }
    
    // Reset form
    setSelectedPriority('');
    setPhoneNumber('');
    setBloodType('');
    setUnitsNeeded('');
    setAdditionalNotes('');
    setIsSubmitting(false);
    
    // Show success message
    if (onSuccess) {
        onSuccess();
      }
    }, 1000);
  
};

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setSelectedPriority('');
      setPhoneNumber('');
      setBloodType('');
      setUnitsNeeded('');
      setAdditionalNotes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className='flex items-center justify-between gap-5'>
        {/* Blood Type */}
        <div className="w-1/2 space-y-2 ">
            <label className="block text-sm font-light text-gray-900">
            Blood Type Required <span className="text-red-600">*</span>
            </label>
            <div className="relative bg-[#F4F2F2] rounded-lg">
            <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full text-[#978C8C] font-light text-sm px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                required
            >
                <option  value="">Select blood type</option>
                {bloodTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            </div>
        </div>
        {/* Priority Level */}
        <div className="w-1/2 space-y-2">
            <label className="block text-sm font-light text-gray-900">
            Priority Level <span className="text-red-600">*</span>
            </label>
            <div className="relative bg-[#F4F2F2] rounded-lg">
            <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as 'Critical' | 'Urgent' | 'Scheduled')}
                className="w-full px-3 py-3 text-[#978C8C] font-light text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                required
            >
                <option value="">Select priority level</option>
                {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>{priority == 'Critical' ? 'Critical - Immediate need' : priority == 'Urgent' ? 'Urgent - Needed within hours' : priority == 'Scheduled' ? 'Scheduled - Planned within days' : ''}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            </div>
        </div>
        </div>  
      
       <div className='flex items-center justify-between gap-5'>
        {/* Units Needed */}
        <div className="w-1/2 space-y-2">
            <label className="block text-sm font-light text-gray-900">
            Units Needed <span className="text-red-600">*</span>
            </label>
            <div className="relative bg-[#F4F2F2] rounded-lg">
            <select
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(e.target.value)}
                className="w-full px-3 py-3 text-[#978C8C] font-light text-sm  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                required
            >
                <option value="">Select units needed</option>
                {unitsOptions.map((unit) => (
                <option key={unit} value={unit}>{unit} unit{unit !== '1' ? 's' : ''}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            </div>
        </div>
        {/* Contact Phone */}
        <div className="w-1/2 space-y-2">
            <label className="block text-sm font-light text-gray-900">
            Contact Phone <span className="text-red-600">*</span>
            </label>
            
            <div className="relative bg-[#F4F2F2] rounded-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+1 (555) 123-4567"
                className={`block w-full pl-10 pr-3 py-3 border ${
                phoneError ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                required
            />
            </div>
            {phoneError && (
            <p className="text-xs text-red-600 mt-1">{phoneError}</p>
            )}
        </div>
       </div>
      
      

     

      {/* Additional Notes - Optional */}
      <div className="space-y-2">
        <label className="block text-sm font-light text-gray-900">
          Additional Notes <span className="text-gray-500 text-xs">(Optional)</span>
        </label>

        <div className="relative bg-[#F4F2F2] rounded-lg">
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Patient situation, special instructions, parking info, etc."
            className="block w-full text-[#978C8C] font-light text-sm pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-25 resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !selectedPriority || !phoneNumber.trim() || !bloodType || !unitsNeeded || !!phoneError}
          className=" py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className=" py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        
      </div>

      
    </form>
  );
};

export default PriorityContactForm;