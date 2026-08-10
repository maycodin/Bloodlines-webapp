// app/pulse-leader/dashboard/page.tsx
"use client"
import React, { useState } from 'react';
import { CheckCircle, Calendar, CircleArrowUp, Plus, Search, Home, BarChart3, User, Bell, Loader2, Edit2, Save, X, Mail, Phone, MapPin, Droplets as DropletsIcon } from 'lucide-react';
import PulseLeaderNavbar from '@/components/PulseLeaderNavbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DonationFulfillmentRate from '@/components/DonationFulfillment';
import CriticalBloodRequestCard, { BloodRequestType } from '@/components/CriticalBloodRequestCard';
import Image from 'next/image';
import ImpactActivitiesCards from '@/components/ImpactActivitiesCard';
import DonorSearch from '@/components/DonorSearch';
import PulseAnalytics from '@/components/PulseAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { users, UserProfile } from '@/lib/api';

const PulseLeaderDashboard = () => {
  const { user: authUser, requestRoleUpgrade, refreshUser } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [bloodRequests, setBloodRequests] = useState<BloodRequestType[]>([]);
  const [isThereActiveRequest, setIsThereActiveRequest] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    bloodGroup: "",
    location: "",
  });
  
  // Role upgrade state
  const [selectedRole, setSelectedRole] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCommunityName('');
    setFacilityName('');
    setFacilityAddress('');
  };
  
  // Handle profile edit
  const handleEditProfile = async () => {
    if (isEditing) {
      setIsSaving(true);
      setSaveMessage(null);
      
      try {
        const updatedProfile = await users.updateMyProfile(editForm);
        setProfile(updatedProfile);
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (err: any) {
        setSaveMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        setTimeout(() => setSaveMessage(null), 3000);
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup || "",
        location: profile.location || "",
      });
    }
  };

  // Role upgrade handler
  const handleRoleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      alert('Please select a role to upgrade to');
      return;
    }
    
    if (!reason) {
      alert('Please provide a reason for the role upgrade request');
      return;
    }
    
    if (selectedRole === 'pulse-leader' && !communityName) {
      alert('Please enter your community name');
      return;
    }
    
    if (selectedRole === 'bridger' && (!facilityName || !facilityAddress)) {
      alert('Please enter both facility name and address');
      return;
    }
    
    setIsSubmittingUpgrade(true);
    setUpgradeMessage(null);
    
    try {
      const details: any = { reason };
      
      if (selectedRole === 'pulse-leader') {
        details.communityName = communityName;
      } else if (selectedRole === 'bridger') {
        details.facilityName = facilityName;
        details.facilityAddress = facilityAddress;
      }
      
      await requestRoleUpgrade(selectedRole, details);
      
      setUpgradeMessage({ 
        type: 'success', 
        text: `Your request to become a ${selectedRole === 'pulse-leader' ? 'Pulse Leader' : selectedRole === 'bridger' ? 'Bridger' : 'Admin'} has been submitted successfully!` 
      });
      
      setSelectedRole('');
      setCommunityName('');
      setFacilityName('');
      setFacilityAddress('');
      setReason('');
      
      setTimeout(() => setUpgradeMessage(null), 5000);
      
    } catch (error: any) {
      setUpgradeMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit role upgrade request. Please try again.' 
      });
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  const handleConfirm = (id: string | number) => {
    console.log('Confirm donation for request:', id);
    setBloodRequests(prev => prev.filter(request => request.id !== id));
    if (bloodRequests.length <= 1) {
      setIsThereActiveRequest(false);
    }
  };

  const handleEdit = (id: string | number) => {
    console.log('Edit request:', id);
  };

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

  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className='flex justify-center gap-4 mb-5'>
              <div className="flex-1">
                <div className="bg-white rounded-lg w-80 h-35 p-6 shadow-md border border-[#D8D6D6] mb-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-black text-sm font-medium">Total Requests</p>
                      <p className="text-2xl font-normal text-black mt-2">25</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
                        <option>Month</option>
                      </select>
                      <div className="pointer-events-none absolute top-3 right-0 flex items-center px-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg w-80 h-35 p-6 shadow-md border border-[#D8D6D6]">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-black text-sm font-medium">Avg Response Time</p>
                      <p className="text-2xl font-normal text-black mt-2">5m 10s</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
                        <option>Month</option>
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
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

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
                          </div>
                          <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                    <p className="text-gray-600">Blood requests in your area will appear here.</p>
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
            {/* Profile Information Section */}
            <div className="bg-white rounded-lg border border-[#D8D6D6] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Mail className="w-4 h-4" /> Email
                    </p>
                    <p className="text-gray-900">{profile?.email || 'maria.mustafa@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Phone className="w-4 h-4" /> Phone
                    </p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.phoneNumber || '07032891653'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <DropletsIcon className="w-4 h-4" /> Blood Group
                    </p>
                    {isEditing ? (
                      <select
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select blood group</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile?.bloodGroup || 'O+'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Location
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="e.g., Lagos, Nigeria"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.location || 'Lagos, Nigeria'}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Member Since
                  </p>
                  <p className="text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'January 2024'}</p>
                </div>
              </div>
            </div>

            {/* Role Upgrade Request Section */}
            <div className="mt-6 bg-white rounded-lg border border-[#D8D6D6] p-6">
              <div className="flex items-start gap-3 mb-4">
                <CircleArrowUp className="w-6 h-6 text-[#1B59F8] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Upgrade Your Role</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Apply to become a Pulse Leader, Bridger, or Admin
                  </p>
                </div>
              </div>

              {upgradeMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  upgradeMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {upgradeMessage.text}
                </div>
              )}

              <form onSubmit={handleRoleUpgrade} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Role <span className="text-[#C91E1E]">*</span>
                  </label>
                  <select 
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="w-full bg-[#F4F2F2] p-3 border border-[#D8D6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C91E1E] focus:border-transparent text-gray-700"
                    required
                    disabled={isSubmittingUpgrade}
                  >
                    <option value="" disabled>Select role type</option>
                    <option value="pulse-leader">Pulse Leader</option>
                    <option value="bridger">Bridger (Hospital Staff)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

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
                      disabled={isSubmittingUpgrade}
                    />
                  </div>
                )}

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
                        disabled={isSubmittingUpgrade}
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
                        disabled={isSubmittingUpgrade}
                      />
                    </div>
                  </>
                )}

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
                    disabled={isSubmittingUpgrade}
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 text-lg">🔑</span>
                  <p className="text-sm text-blue-700">
                    Role upgrade requests are reviewed by administrators. You will receive a notification once your request is processed. This may take 1-3 business days.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmittingUpgrade || !selectedRole || !reason}
                    className="px-8 py-3 bg-[#C91E1E] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmittingUpgrade ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-4 bg-white rounded-lg border border-[#D8D6D6] p-5">
              <div className="font-bold">Notification Preferences</div>
              <div className="flex items-center justify-between mt-3 mb-3">
                <div className="space-y-1">
                  <h1 className="font-semibold">Emergency Alerts</h1>
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

// Wrap the component with ProtectedRoute for role-based access
export default function PulseLeaderDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['pulse-leader', 'admin']}>
      <PulseLeaderDashboard />
    </ProtectedRoute>
  );
}