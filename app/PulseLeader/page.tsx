// app/pulse-leader/dashboard/page.tsx
"use client"
import React, { useState } from 'react';
import { CheckCircle, Calendar, CircleArrowUp, Plus, Search, Home, BarChart3, User, Bell } from 'lucide-react';
import PulseLeaderNavbar from '@/components/PulseLeaderNavbar';
import DonationFulfillmentRate from '@/components/DonationFulfillment';
import CriticalBloodRequestCard, { BloodRequestType } from '@/components/CriticalBloodRequestCard';
import Image from 'next/image';
import ImpactActivitiesCards from '@/components/ImpactActivitiesCard';
import DonorSearch from '@/components/DonorSearch';
import PulseAnalytics from '@/components/PulseAnalytics';

const PulseLeaderDashboard = () => {
  const [activePage, setActivePage] = useState('home');
  const [bloodRequests, setBloodRequests] = useState<BloodRequestType[]>([]);
  const [isThereActiveRequest, setIsThereActiveRequest] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [reason, setReason] = useState('');
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedRole(e.target.value);
      setCommunityName('');
      setFacilityName('');
      setFacilityAddress('');
    };
  
    const handleProfileSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      console.log({
        role: selectedRole,
        communityName: selectedRole === 'pulse-leader' ? communityName : undefined,
        facilityName: selectedRole === 'bridger' ? facilityName : undefined,
        facilityAddress: selectedRole === 'bridger' ? facilityAddress : undefined,
        reason
      })};

  const handleConfirm = (id: string | number) => {
    console.log('Confirm donation for request:', id);
    // Remove the request after confirmation
    setBloodRequests(prev => prev.filter(request => request.id !== id));
    
    // If no requests left, show empty state
    if (bloodRequests.length <= 1) {
      setIsThereActiveRequest(false);
    }
  };

  const handleEdit = (id: string | number) => {
    console.log('Edit request:', id);
  };

  // Handle page change from navbar
  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

   const monthlyData = [
    { month: 'Jan', value: 30 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 60 },
    { month: 'Apr', value: 40 },
    { month: 'May', value: 75 },
    { month: 'Jun', value: 65 },
    { month: 'Jul', value: 85 },
    { month: 'Aug', value: 70 },
    { month: 'Sep', value: 90 },
    { month: 'Oct', value: 80 },
    { month: 'Nov', value: 95 },
    { month: 'Dec', value: 100 },
  ];

  // Render content based on active page
  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="space-y-8">
                {/* First Section */}
                <div className='flex justify-center gap-4 mb-5'>
                  <div className="flex-1">
                    {/* Total Requests */}
                    <div className="bg-white rounded-lg w-80 h-35 p-6 shadow-md border border-[#D8D6D6] mb-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-black text-sm font-medium">Total Requests</p>
                          <p className="text-2xl font-normal text-black mt-2">25</p>
                        </div>
                        <div className="relative">
                          <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
                            <option>Month</option>
                            <option>January</option>
                            <option>February</option>
                            <option>March</option>
                            <option>April</option>
                            <option>May</option>
                            <option>June</option>
                            <option>July</option>
                            <option>August</option>
                            <option>September</option>
                            <option>October</option>
                            <option>November</option>
                            <option>December</option>
                          </select>
                          <div className="pointer-events-none absolute top-3 right-0 flex items-center px-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Avg Response Time */}
                    <div className="bg-white rounded-lg w-80 h-35 p-6 shadow-md border border-[#D8D6D6]">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-black text-sm font-medium">Avg Response Time</p>
                          <p className="text-2xl font-normal text-black mt-2">5m 10s</p>
                        </div>
                        <div className="relative">
                          <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
                            <option>Month</option>
                            <option>January</option>
                            <option>February</option>
                            <option>March</option>
                            <option>April</option>
                            <option>May</option>
                            <option>June</option>
                            <option>July</option>
                            <option>August</option>
                            <option>September</option>
                            <option>October</option>
                            <option>November</option>
                            <option>December</option>
                          </select>
                          <div className="pointer-events-none absolute top-3 right-0 flex items-center px-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-2">
                    <DonationFulfillmentRate />
                  </div>
                  
                  <div className="flex-3">
                    <div className="bg-white rounded-lg p-5 shadow-md border border-[#D8D6D6]">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">Activity</h2>
                        <div className="relative">
                          <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
                            <option>Month</option>
                            <option>January</option>
                            <option>February</option>
                            <option>March</option>
                            <option>April</option>
                            <option>May</option>
                            <option>June</option>
                            <option>July</option>
                            <option>August</option>
                            <option>September</option>
                            <option>October</option>
                            <option>November</option>
                            <option>December</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Chart Container */}
                      <div className="relative h-53">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-sm text-gray-500">
                          <span>100</span>
                          <span>50</span>
                          <span>0</span>
                        </div>

                        <div className="ml-10 h-full flex items-end justify-between">
                          {monthlyData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div className="relative">
                                <div
                                  className="w-2 bg-[#1C7C3A] rounded-lg"
                                  style={{ height: `${item.value * 0.6}px` }}
                                />
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {item.value}
                                </div>
                              </div>
                              <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Existing Requests Section */}
            <div className="bg-white rounded-xl p-6 border border-[#C91E1E] w-full mx-auto">
                <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Blood Requests in your area</h2>
                </div>
                
                {bloodRequests.length > 0 ? (
                <div className="space-y-4">
                    {bloodRequests.map((request) => (
                    <CriticalBloodRequestCard
                        key={request.id}
                        request={request}
                        onConfirm={handleConfirm}
                        onEdit={handleEdit}
                    />
                    ))}
                </div>
                ) : (
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No blood requests yet</h3>
                    <p className="text-gray-600">Post your first blood request using the form above.</p>
                    </div>
                </div>
                )}
            </div>
            <ImpactActivitiesCards />
            </div>
        );

      case 'search':
        return (
          <div className="max-w-4xl mx-auto">
            <DonorSearch />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <PulseAnalytics />
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mx-auto">
                        <div className="bg-white rounded-lg border border-[#D8D6D6] p-5">
                          {/* Profile Content */}
                          <div className="space-y-2">
                            <h1 className="text-lg font-bold text-gray-900">Profile Information</h1>
                            <div className="flex items-start gap-20 mb-2">
                              {/* Full Name */}
                              <div className="w-1/2">
                                <p className="text-sm font-bold text-black mb-1">Full name</p>
                                <p className="text-sm font-light text-gray-900">Maria Mustafa</p>
                              </div>
                              {/* Email */}
                              <div className="w-1/2">
                                <p className="text-sm font-bold text-black mb-1">Email address</p>
                                <p className="text-sm font-light text-gray-900">Maria.Mustafa@gmail.com</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-20 mb-2">
                              {/* Phone */}
                              <div className="w-1/2">
                                <p className="text-sm font-bold text-black mb-1">Phone</p>
                                <p className="text-sm font-light text-gray-900">07032891653</p>
                              </div>
                              {/* Hospital */}
                              <div className="w-1/2">
                                <p className="text-sm font-bold text-black mb-1">Name of Hospital</p>
                                <p className="text-sm font-light text-gray-900">Lagos, University Teaching Hospital</p>
                                <p className="text-sm font-light text-gray-900mt-1">Idi-Araba, Lagos</p>
                              </div>
                            </div>
            
                            {/* Edit Button */}
                            <button className="bg-[#C91E1E] text-white font-medium px-4 py-2 rounded-sm">Edit Profile</button>
                          </div>
                        </div>
                        
                        <div className="mt-8 bg-white rounded-lg border border-[#D8D6D6] p-5">
                          <div className="flex items-start gap-2 mb-4">
                            <CircleArrowUp className="w-6 h-6 text-[#1B59F8]" />
                            <h3 className="text-xl font-bold text-gray-900">Upgrade Your Role</h3>
                          </div>
                          <p className="text-black font-bold">
                            Request Role Upgrade
                          </p>
                          <p className="text-gray-600 mb-8">
                            Apply to become a Pulse Leader, Bridger, or Admin
                          </p>
            
                          <form onSubmit={handleProfileSubmit} className="space-y-6">
                            {/* Requested Role */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Requested Role <span className="text-[#C91E1E]">*</span>
                              </label>
                              <select 
                                value={selectedRole}
                                onChange={handleRoleChange}
                                className="w-full bg-[#F4F2F2] p-3 border border-[#D8D6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C91E1E] focus:border-transparent text-gray-700"
                                required
                              >
                                <option value="" disabled>Select role type</option>
                                <option value="pulse-leader">Pulse Leader</option>
                                <option value="bridger">Bridger (Hospital Staff)</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
            
                            {/* Conditional Fields for Pulse Leader */}
                            {selectedRole === 'pulse-leader' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Community Name <span className="text-[#C91E1E]">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={communityName}
                                  onChange={(e) => setCommunityName(e.target.value)}
                                  placeholder="Enter your community's name"
                                  className="w-full bg-[#F4F2F2] p-3 border border-[#D8D6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C91E1E] focus:border-transparent text-gray-700 placeholder-gray-400"
                                  required={selectedRole === 'pulse-leader'}
                                />
                              </div>
                            )}
            
                            {/* Conditional Fields for Bridger (Hospital Staff) */}
                            {selectedRole === 'bridger' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Facility Name <span className="text-[#C91E1E]">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={facilityName}
                                    onChange={(e) => setFacilityName(e.target.value)}
                                    placeholder="Enter Hospital/clinic name"
                                    className="w-full bg-[#F4F2F2] p-3 border border-[#D8D6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C91E1E] focus:border-transparent text-gray-700 placeholder-gray-400"
                                    required={selectedRole === 'bridger'}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Facility Address <span className="text-[#C91E1E]">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={facilityAddress}
                                    onChange={(e) => setFacilityAddress(e.target.value)}
                                    placeholder="Enter facility address"
                                    className="w-full bg-[#F4F2F2] p-3 border border-[#D8D6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C91E1E] focus:border-transparent text-gray-700 placeholder-gray-400"
                                    required={selectedRole === 'bridger'}
                                  />
                                </div>
                              </>
                            )}
            
                            {/* Reason for Request */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Request <span className="text-[#C91E1E]">*</span>
                              </label>
                              <textarea 
                                rows={5}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 bg-[#F4F2F2] border border-[#D8D6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C91E1E] focus:border-transparent text-gray-700 placeholder-gray-400 resize-none"
                                placeholder="Please explain why you want to upgrade to this role and how you plan to contribute..."
                                required
                              />
                            </div>
            
                            {/* Info Message */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                              <span className="text-blue-500 text-lg">🔑</span>
                              <p className="text-sm text-blue-700">
                                Role upgrade requests are reviewed by administrators. You will receive a notification once your request is processed.
                              </p>
                            </div>
            
                            {/* Submit Button */}
                            <div className="flex justify-end">
                              <button 
                                type="submit"
                                className="px-8 py-3 bg-[#C91E1E] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Submit Request
                              </button>
                            </div>
                          </form>
                        </div>
            
                        <div className="mt-4 bg-white rounded-lg border border-[#D8D6D6] p-5">
                          <div className="font-bold">Notification Preferences</div>
                            <div className="flex items-center justify-between mt-3 mb-3">
                              <div className="space-y-1">
                                <h1 className="font-semibold">Emmergency Alerts</h1>
                                <span className="font-light">Critical Blood requests in your area</span>
                              </div>
                              <button className="border border-[#000000] rounded-lg py-2 px-4">
                                Configure
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-3 mb-3">
                              <div className="space-y-1">
                                <h1 className="font-semibold">Donation Reminders</h1>
                                <span className="font-light">When you're eligible to donate again</span>
                              </div>
                              <button className="border border-[#000000] rounded-lg py-2 px-4">
                                Configure
                              </button>
                            </div>
                        </div>
                      </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The requested page could not be found.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <PulseLeaderNavbar onPageChange={handlePageChange} activePage={activePage} />
      <div className='m-8'>
        {renderPageContent()}
      </div>
    </>
  );
};

export default PulseLeaderDashboard;

// Missing icon imports
const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const Droplets = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 16.2A4.5 4.5 0 0017.5 12h-11A4.5 4.5 0 004 16.2M12 3v9m0 0l-3-3m3 3l3-3" />
  </svg>
);

const HeartPulse = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);