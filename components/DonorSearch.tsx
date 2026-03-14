import { useState, useMemo } from 'react';
import { Phone, Send, ChevronDown } from 'lucide-react';


interface Donor {
  id: number;
  name: string;
  initials: string;
  bloodType: string;
  distance: number;
  lastDonated: string;
  availability: 'Urgent' | 'Critical' | 'Escalated' | 'Scheduled';
  phone: string;
}

// Mock Data - 20 entries
const mockDonors: Donor[] = [
  { id: 1, name: 'Abdul Matthew', initials: 'AM', bloodType: 'B+', distance: 2.3, lastDonated: '2 months ago', availability: 'Urgent', phone: '+2348012345678' },
  { id: 2, name: 'Sarah Johnson', initials: 'SJ', bloodType: 'O+', distance: 5.1, lastDonated: '3 weeks ago', availability: 'Critical', phone: '+2348023456789' },
  { id: 3, name: 'Michael Chen', initials: 'MC', bloodType: 'A+', distance: 1.8, lastDonated: '1 month ago', availability: 'Scheduled', phone: '+2348034567890' },
  { id: 4, name: 'Emily Davis', initials: 'ED', bloodType: 'AB+', distance: 8.5, lastDonated: '4 months ago', availability: 'Escalated', phone: '+2348045678901' },
  { id: 5, name: 'James Wilson', initials: 'JW', bloodType: 'O-', distance: 3.2, lastDonated: '2 weeks ago', availability: 'Urgent', phone: '+2348056789012' },
  { id: 6, name: 'Amina Hassan', initials: 'AH', bloodType: 'B-', distance: 12.0, lastDonated: '5 months ago', availability: 'Critical', phone: '+2348067890123' },
  { id: 7, name: 'David Okonkwo', initials: 'DO', bloodType: 'A-', distance: 4.5, lastDonated: '1 month ago', availability: 'Scheduled', phone: '+2348078901234' },
  { id: 8, name: 'Fatima Bello', initials: 'FB', bloodType: 'AB-', distance: 6.8, lastDonated: '3 months ago', availability: 'Escalated', phone: '+2348089012345' },
  { id: 9, name: 'John Smith', initials: 'JS', bloodType: 'O+', distance: 9.3, lastDonated: '2 months ago', availability: 'Urgent', phone: '+2348090123456' },
  { id: 10, name: 'Grace Adeyemi', initials: 'GA', bloodType: 'B+', distance: 1.2, lastDonated: '1 week ago', availability: 'Critical', phone: '+2348101234567' },
  { id: 11, name: 'Robert Taylor', initials: 'RT', bloodType: 'A+', distance: 15.5, lastDonated: '6 months ago', availability: 'Scheduled', phone: '+2348112345678' },
  { id: 12, name: 'Blessing Nwosu', initials: 'BN', bloodType: 'O-', distance: 7.2, lastDonated: '2 months ago', availability: 'Escalated', phone: '+2348123456789' },
  { id: 13, name: 'Daniel Park', initials: 'DP', bloodType: 'AB+', distance: 11.4, lastDonated: '4 weeks ago', availability: 'Urgent', phone: '+2348134567890' },
  { id: 14, name: 'Chidinma Okafor', initials: 'CO', bloodType: 'B-', distance: 3.9, lastDonated: '3 months ago', availability: 'Critical', phone: '+2348145678901' },
  { id: 15, name: 'William Brown', initials: 'WB', bloodType: 'A-', distance: 17, lastDonated: '5 months ago', availability: 'Scheduled', phone: '+2348156789012' },
  { id: 16, name: 'Ngozi Ibrahim', initials: 'NI', bloodType: 'O+', distance: 2.8, lastDonated: '1 month ago', availability: 'Escalated', phone: '+2348167890123' },
  { id: 17, name: 'Christopher Lee', initials: 'CL', bloodType: 'B+', distance: 14.2, lastDonated: '2 months ago', availability: 'Urgent', phone: '+2348178901234' },
  { id: 18, name: 'Aisha Mohammed', initials: 'AM', bloodType: 'AB-', distance: 5.6, lastDonated: '3 weeks ago', availability: 'Critical', phone: '+2348189012345' },
  { id: 19, name: 'Kevin Wright', initials: 'KW', bloodType: 'A+', distance: 10.1, lastDonated: '4 months ago', availability: 'Scheduled', phone: '+2348190123456' },
  { id: 20, name: 'Olivia Thompson', initials: 'OT', bloodType: 'O-', distance: 6.3, lastDonated: '1 month ago', availability: 'Escalated', phone: '+2348201234567' },
];

const bloodTypes = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];
const radiusOptions = Array.from({ length: 20 }, (_, i) => i + 1);
const availabilityOptions = ['Urgent', 'Critical', 'Escalated', 'Scheduled'];

// Avatar color based on blood type
const getAvatarColor = (bloodType: string): string => {
  const colors: Record<string, string> = {
    'A+': 'bg-blue-600',
    'A-': 'bg-blue-700',
    'B+': 'bg-red-500',
    'B-': 'bg-red-600',
    'AB+': 'bg-purple-500',
    'AB-': 'bg-purple-600',
    'O+': 'bg-green-500',
    'O-': 'bg-green-600',
  };
  return colors[bloodType] || 'bg-gray-500';
};

export default function DonorSearch() {
  const [bloodType, setBloodType] = useState('');
  const [radius, setRadius] = useState('');
  const [availability, setAvailability] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const filteredDonors = useMemo(() => {
    if (!hasSearched) return [];
    
    return mockDonors.filter((donor) => {
      const matchesBlood = !bloodType || donor.bloodType === bloodType;
      const matchesRadius = !radius || donor.distance <= parseInt(radius);
      const matchesAvailability = !availability || donor.availability === availability;
      return matchesBlood && matchesRadius && matchesAvailability;
    });
  }, [bloodType, radius, availability, hasSearched]);

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Donor Search & Outreach</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Blood Type Select */}
          <div className="relative">
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Blood Type</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Location Radius Select */}
          <div className="relative">
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Location (radius in km)</option>
              {radiusOptions.map((km) => (
                <option key={km} value={km}>{km} km</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Availability Select */}
          <div className="relative">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Availability</option>
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Search donors
        </button>
      </div>

      {/* Results Card */}
      {hasSearched && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">Search results</h3>
          
          <div className="space-y-3">
            {filteredDonors.length > 0 ? (
              filteredDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(donor.bloodType)} flex items-center justify-center text-white font-medium text-sm`}>
                      {donor.initials}
                    </div>
                    
                    {/* Info */}
                    <div>
                      <h4 className="font-medium text-gray-900">{donor.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          {donor.bloodType}
                        </span>
                        <span>•</span>
                        <span>{donor.distance} km away</span>
                        <span>•</span>
                        <span>Last donated: {donor.lastDonated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      title="Call donor"
                    >
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                      title="Send message"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No donors found matching your criteria
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}