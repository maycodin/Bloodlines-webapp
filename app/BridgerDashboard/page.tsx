"use client"
import React, { useState } from 'react';
import { CheckCircle, Plus, Users, Calendar, HeartPulse } from 'lucide-react';
import BridgerNavbar from '@/components/BridgerNavbar';
import DonationFulfillmentRate from '@/components/DonationFulfillment';
import CriticalBloodRequestCard, { BloodRequestType } from '@/components/CriticalBloodRequestCard';
import PriorityContactForm from '@/components/PriorityContactForm';
import SuccessModal from '@/components/SuccessModal'; 
const Dashboard = () => {
  const [isThereActiveRequest, setIsThereActiveRequest] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [bloodRequests, setBloodRequests] = useState<BloodRequestType[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  
  const bloodInventory = [
    { type: 'O+', units: 45, status: 'good', color: '#1C7C3A' },
    { type: 'O-', units: 8, status: 'low', color: '#413D3D' },
    { type: 'AB+', units: 3, status: 'critical', color: '#C91E1E' },
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-white bg-[#1C7C3A]';
      case 'low': return 'text-white bg-[#413D3D]';
      case 'critical': return 'text-white bg-[#C91E1E]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'good';
      case 'low': return 'low';
      case 'critical': return 'critical';
      default: return '';
    }
  };

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
    // Add your edit logic here
  };

  // Handle page change from navbar
  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  // Handle adding new blood request from form
  const handleAddRequest = (newRequest: BloodRequestType) => {
    setBloodRequests(prev => [newRequest, ...prev]);
    setIsThereActiveRequest(true);
  };

  // Handle form success (show modal)
  const handleFormSuccess = () => {
    setShowSuccessModal(true);
  };

  // Handle going back to home from modal
  const handleGoHome = () => {
    setShowSuccessModal(false);
    setActivePage('home');
  };

  // Close modal
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  // Render content based on active page
  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <>
            <div className="border border-[#D8D6D6] rounded-2xl p-3 md:p-8">
              <div className="flex items-center justify-center flex-col mt-8 gap-3">
                <h2 className="text-xl md:text-2xl text-center font-bold">
                  Need Blood Urgently?
                </h2>
                <p className="text-black">
                  Post a request and get connected with nearby donors instantly
                </p>
                <button 
                  onClick={() => setActivePage('blood-requests')}
                  className="bg-[#C91E1E] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Post Blood Request
                </button>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="">
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

                {/* Next Section */}
                <div className="">
                  <div className="bg-white rounded-xl h-73 p-6 shadow-md border border-[#D8D6D6]">
                    <h2 className="text-xl font-bold text-black mb-3">Current Blood Inventory</h2>
                    <div className="flex flex-row gap-4">
                      {bloodInventory.map((item, index) => (
                        <div key={index} className="flex flex-col items-center justify-center p-8 w-40 h-50 border border-[#D8D6D6] rounded-lg">
                          <div className="flex justify-center items-center gap-4">
                            <div>
                              <p className="font-bold text-lg text-gray-800">{item.type}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="font-normal text-lg text-gray-800">{item.units} <br /> units</p>
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Last Section */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                      <HeartPulse className="w-6 h-6 text-gray-400" />
                      <h2 className="text-xl font-bold text-gray-800">Active Blood Requests</h2>
                    </div>
                    <button 
                      onClick={() => setActivePage('blood-requests')}
                      className="bg-[#C91E1E] text-sm text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Post Blood Request
                    </button>
                  </div>
                  
                  {bloodRequests.length > 0 ? (
                    bloodRequests.map((request) => (
                      <CriticalBloodRequestCard
                        key={request.id}
                        request={request}
                        onConfirm={handleConfirm}
                        onEdit={handleEdit}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No active blood requests</h3>
                        <p className="text-gray-600">All current needs are being met.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      
      case 'blood-requests':
        return (
          <div className="space-y-8">
            {/* Form Section */}
            <div className="bg-white rounded-xl p-6 border border-[#C91E1E] w-full mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Create Blood Request</h2>
              
              <PriorityContactForm 
                onAddRequest={handleAddRequest}
                onCancel={() => setActivePage('home')}
                onSuccess={handleFormSuccess} // Pass success callback
              />
            </div>

            {/* Existing Requests Section */}
            <div className="bg-white rounded-xl p-6 border border-[#C91E1E] w-full mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">All Blood Requests</h2>
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
          </div>
        );
      
      case 'analytics':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Analytics Page</h1>
              <p className="text-gray-600">Analytics content will be displayed here.</p>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Page</h1>
              <p className="text-gray-600">Profile content will be displayed here.</p>
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
      <BridgerNavbar onPageChange={handlePageChange} activePage={activePage} />
      <div className='m-8'>
        {renderPageContent()}
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onGoHome={handleGoHome}
      />
    </>
  );
};

export default Dashboard;