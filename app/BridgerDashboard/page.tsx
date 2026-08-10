"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, Plus, Users, Calendar, HeartPulse, CircleArrowUp,
  Droplets, History, AlertTriangle, Phone, MapPin, Clock, Trophy, Loader2 
} from "lucide-react";
import BridgerNavbar from "@/components/BridgerNavbar";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DonationFulfillmentRate from "@/components/DonationFulfillment";
import CriticalBloodRequestCard, { BloodRequestType } from "@/components/CriticalBloodRequestCard";
import PriorityContactForm from "@/components/PriorityContactForm";
import SuccessModal from "@/components/SuccessModal";
import BloodInventoryDashboard from "@/components/BloodInventory";
import { bloodRequests, analytics, donor, UserProfile } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

type Page = "home" | "blood-requests" | "analytics" | "profile";

// Donor Match Type
interface DonorMatch {
  id: string;
  fullName: string;
  bloodType: string;
  distance: number;
  phoneNumber?: string;
  email?: string;
  lastDonationDate?: string;
}

const Dashboard = () => {
  const { user: authUser, requestRoleUpgrade, refreshUser } = useAuth();
  
  // State - renamed to avoid conflict with imported bloodRequests
  const [localBloodRequests, setLocalBloodRequests] = useState<BloodRequestType[]>([]);
  const [isThereActiveRequest, setIsThereActiveRequest] = useState(false);
  const [activePage, setActivePage] = useState<Page>("home");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Profile form state
  const [selectedRole, setSelectedRole] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // API state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Bridger-specific state
  const [requestData, setRequestData] = useState({
    bloodType: '',
    unitsNeeded: '',
    urgency: '',
    patientCondition: '',
    requiredByDate: '',
    hospitalId: '',
  });
  const [matches, setMatches] = useState<DonorMatch[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [bridgerStats, setBridgerStats] = useState({
    totalRequests: 0,
    fulfillmentRate: 0,
    avgResponseTime: '',
    monthlyData: []
  });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState({
    bloodType: '',
    message: '',
    requestId: ''
  });

  // Mock data
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

  // Fetch profile and stats on mount
  useEffect(() => {
    const fetchBridgerData = async () => {
      try {
        const profileData = await donor.getProfile().catch(() => null);
        if (profileData) setProfile(profileData);
        
        if (profileData?.id) {
          const statsData = await analytics.getBridgerAnalytics(profileData.id);
          setBridgerStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch bridger data:", error);
      }
    };
    
    fetchBridgerData();
  }, []);

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
    setLocalBloodRequests(prev => prev.filter(request => request.id !== id));
    if (localBloodRequests.length <= 1) {
      setIsThereActiveRequest(false);
    }
  };

  const handleEdit = (id: string | number) => {
    console.log('Edit request:', id);
  };

  const handleAddRequest = (newRequest: BloodRequestType) => {
    setLocalBloodRequests(prev => [newRequest, ...prev]);
    setIsThereActiveRequest(true);
  };

  
  const handlePageChange = (page: string) => {
    setActivePage(page as Page);
  };

  const handleFormSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    setActivePage("home");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  // Create Blood Request with API
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!requestData.bloodType || !requestData.unitsNeeded || !requestData.urgency || 
        !requestData.patientCondition || !requestData.requiredByDate) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    try {
      const newRequest = await bloodRequests.create({
        bloodType: requestData.bloodType,
        unitsNeeded: parseInt(requestData.unitsNeeded),
        urgency: requestData.urgency,
        hospitalId: profile?.id || 'temp-hospital-id',
        patientCondition: requestData.patientCondition,
        requiredByDate: requestData.requiredByDate,
      });
      
      console.log('Request created:', newRequest);
      alert('Blood request created successfully!');
      setSelectedRequestId(newRequest.id);
      
      // Get donor matches
      try {
        const matchesData = await bloodRequests.getMatches(newRequest.id);
        setMatches(matchesData.donors || []);
        setShowMatches(true);
      } catch (matchError) {
        console.error('Error fetching matches:', matchError);
      }
      
      // Reset form
      setRequestData({
        bloodType: '',
        unitsNeeded: '',
        urgency: '',
        patientCondition: '',
        requiredByDate: '',
        hospitalId: '',
      });
      
      // Refresh the requests list
      const updatedRequests = await bloodRequests.getMyRequests();
      if (updatedRequests?.data) {
        const formattedRequests = updatedRequests.data.map((req: any) => ({
          id: req.id,
          status: req.urgency === 'critical' ? 'Critical' : req.urgency === 'high' ? 'Urgent' : 'Normal',
          bloodType: req.bloodType,
          unitsNeeded: req.unitsNeeded,
          postedTime: new Date(req.createdAt).toLocaleTimeString(),
          contactNumber: profile?.phoneNumber || 'Not provided',
          patientCondition: req.patientCondition,
          showActions: true
        }));
        setLocalBloodRequests(formattedRequests);
        setIsThereActiveRequest(true);
      }
      
    } catch (error: any) {
      console.error('Failed to create request:', error);
      alert(error.message || 'Failed to create blood request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Emergency Broadcast
  const handleEmergencyBroadcast = async () => {
    if (!emergencyData.requestId || !emergencyData.bloodType) {
      alert('Please select a request for emergency broadcast');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await bloodRequests.emergencyBroadcast({
        requestId: emergencyData.requestId,
        bloodType: emergencyData.bloodType,
        message: emergencyData.message || 'Emergency: Patient in critical condition',
      });
      alert(`🚨 Emergency alert sent to ${result.recipientCount} donors!`);
      setShowEmergencyModal(false);
      setEmergencyData({ bloodType: '', message: '', requestId: '' });
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      alert('Failed to send emergency alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Role Change Handler
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    // Reset conditional fields
    setCommunityName('');
    setFacilityName('');
    setFacilityAddress('');
  };

  // Role Upgrade Handler using Auth Context
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
    
    // Validate role-specific fields
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
      // Prepare details based on selected role
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
        text: `Your request to become a ${selectedRole === 'pulse-leader' ? 'Pulse Leader' : selectedRole === 'bridger' ? 'Bridger' : 'Admin'} has been submitted successfully! You will be notified once reviewed.` 
      });
      
      // Reset form after successful submission
      setSelectedRole('');
      setCommunityName('');
      setFacilityName('');
      setFacilityAddress('');
      setReason('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setUpgradeMessage(null), 5000);
      
    } catch (error: any) {
      console.error('Role upgrade error:', error);
      setUpgradeMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit role upgrade request. Please try again.' 
      });
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <>
            <div className="border border-[#D8D6D6] rounded-2xl p-3 md:p-8">
              <div className="flex items-center justify-center flex-col mt-8 gap-3">
                <h2 className="text-xl md:text-2xl text-center font-bold">
                  Welcome back, {profile?.fullName?.split(' ')[0] || 'Bridger'}! 👋
                </h2>
                <p className="text-black">Manage blood requests, track inventory, and save lives.</p>
                <button onClick={() => setActivePage('blood-requests')} className="bg-[#C91E1E] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Post Blood Request
                </button>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-center gap-4 mb-5 flex-wrap">
                <div className="bg-white rounded-lg w-80 p-6 shadow-md border border-[#D8D6D6]">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-black text-sm font-medium">Total Requests</p>
                      <p className="text-2xl font-normal text-black mt-2">{bridgerStats.totalRequests || 25}</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg cursor-pointer">
                        <option>Month</option>
                      </select>
                      <Calendar className="absolute top-3 right-2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg w-80 p-6 shadow-md border border-[#D8D6D6]">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-black text-sm font-medium">Avg Response Time</p>
                      <p className="text-2xl font-normal text-black mt-2">{bridgerStats.avgResponseTime || '5m 10s'}</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg cursor-pointer">
                        <option>Month</option>
                      </select>
                      <Calendar className="absolute top-3 right-2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <DonationFulfillmentRate />
                
                <div className="bg-white rounded-lg p-5 shadow-md border border-[#D8D6D6] w-96">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">Activity</h2>
                    <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg cursor-pointer">
                      <option>Month</option>
                    </select>
                  </div>
                  <div className="relative h-53">
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-sm text-gray-500">
                      <span>100</span><span>50</span><span>0</span>
                    </div>
                    <div className="ml-10 h-full flex items-end justify-between">
                      {monthlyData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="w-2 bg-[#1C7C3A] rounded-lg" style={{ height: `${item.value * 0.6}px` }} />
                          <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6] mb-8">
                <h2 className="text-xl font-bold text-black mb-3">Current Blood Inventory</h2>
                <div className="flex flex-wrap gap-4">
                  {bloodInventory.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center p-6 w-36 border border-[#D8D6D6] rounded-lg">
                      <p className="font-bold text-lg text-gray-800">{item.type}</p>
                      <p className="font-normal text-lg text-gray-800">{item.units}<br />units</p>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    <HeartPulse className="w-6 h-6 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-800">Active Blood Requests</h2>
                  </div>
                  <button onClick={() => setActivePage('blood-requests')} className="bg-[#C91E1E] text-sm text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Post Blood Request
                  </button>
                </div>
                
                {localBloodRequests.length > 0 ? (
                  localBloodRequests.map((request) => (
                    <CriticalBloodRequestCard key={request.id} request={request} onConfirm={handleConfirm} onEdit={handleEdit} />
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
          </>
        );
      
      case 'blood-requests':
        return (
          <div className="space-y-8">
            {/* Create Request Form */}
            <div className="bg-white rounded-xl p-6 border border-[#C91E1E] w-full mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Create Blood Request</h2>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Type *</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.bloodType} onChange={(e) => setRequestData({...requestData, bloodType: e.target.value})} required>
                      <option value="">Select blood type</option>
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Units Needed *</label>
                    <input type="number" min="1" max="20" className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.unitsNeeded} onChange={(e) => setRequestData({...requestData, unitsNeeded: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Urgency *</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.urgency} onChange={(e) => setRequestData({...requestData, urgency: e.target.value})} required>
                      <option value="">Select urgency</option>
                      <option value="critical">🔴 Critical</option>
                      <option value="high">🟠 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Required By Date *</label>
                    <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.requiredByDate} onChange={(e) => setRequestData({...requestData, requiredByDate: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Patient Condition *</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-lg" rows={3} value={requestData.patientCondition} onChange={(e) => setRequestData({...requestData, patientCondition: e.target.value})} placeholder="Describe the patient's condition..." required />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {isLoading ? "Creating..." : "Create Blood Request"}
                </button>
              </form>
            </div>

            {/* Donor Matches Section */}
            {showMatches && matches.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-green-500 w-full mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-700">✅ Compatible Donors Found!</h2>
                  <button onClick={() => setShowMatches(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <p className="text-sm text-gray-600 mb-4">{matches.length} donor{matches.length !== 1 ? 's' : ''} matched by blood type and proximity</p>
                <div className="space-y-3">
                  {matches.map((donor) => (
                    <div key={donor.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div>
                        <p className="font-semibold">{donor.fullName}</p>
                        <div className="flex gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {donor.bloodType}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {donor.distance}km away</span>
                          {donor.lastDonationDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last: {donor.lastDonationDate}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {donor.phoneNumber && <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</button>}
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Notify</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Broadcast Section */}
            <div className="bg-white rounded-xl p-6 border border-red-500 w-full mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-600">Emergency Broadcast</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Send urgent alerts to nearby eligible donors. Use only for genuine critical emergencies.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Blood Request</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg" value={emergencyData.requestId} onChange={(e) => {
                    const request = localBloodRequests.find(r => r.id.toString() === e.target.value);
                    setEmergencyData({ requestId: e.target.value, bloodType: request?.bloodType || '', message: emergencyData.message });
                  }}>
                    <option value="">Select a request</option>
                    {localBloodRequests.map((req) => (<option key={req.id} value={req.id}>{req.bloodType} - {req.unitsNeeded} units needed</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Emergency: Patient in critical condition" value={emergencyData.message} onChange={(e) => setEmergencyData({...emergencyData, message: e.target.value})} />
                </div>
              </div>
              <button onClick={handleEmergencyBroadcast} disabled={isLoading || !emergencyData.requestId} className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {isLoading ? "Sending..." : "🚨 Send Emergency Alert"}
              </button>
            </div>

            {/* Existing Requests Section */}
            <div className="bg-white rounded-xl p-6 border border-[#D8D6D6] w-full mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">All Blood Requests</h2>
                <span className="text-sm text-gray-500">{localBloodRequests.length} total</span>
              </div>
              {localBloodRequests.length > 0 ? (
                <div className="space-y-4">
                  {localBloodRequests.map((request) => (<CriticalBloodRequestCard key={request.id} request={request} onConfirm={handleConfirm} onEdit={handleEdit} />))}
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
          <div className="flex items-center justify-center">
            <BloodInventoryDashboard bloodRequests={localBloodRequests} handleConfirm={handleConfirm} handleEdit={handleEdit} setActivePage={setActivePage} /> 
          </div>
        );
      
      case 'profile':
        return (
          <div className="mx-auto max-w-2xl">
            {/* Profile Information Section */}
            <div className="bg-white rounded-lg border border-[#D8D6D6] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-gray-900">{profile?.fullName || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{profile?.email || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{profile?.phoneNumber || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Group</p>
                    <p className="text-gray-900">{profile?.bloodGroup || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="inline-block px-2 py-1 text-xs font-semibold text-white bg-[#C91E1E] rounded-full">
                      {profile?.role || 'Donor'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Loading...'}</p>
                  </div>
                </div>
                <button className="mt-4 bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Edit Profile
                </button>
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

              {/* Success/Error Message */}
              {upgradeMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  upgradeMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {upgradeMessage.text}
                </div>
              )}

              <form onSubmit={handleRoleUpgrade} className="space-y-5">
                {/* Requested Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested Role <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={isSubmittingUpgrade}
                  >
                    <option value="" disabled>Select role type</option>
                    <option value="pulse-leader">Pulse Leader</option>
                    <option value="bridger">Bridger (Hospital Staff)</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedRole === 'pulse-leader' && 'Lead and manage blood donation campaigns in your community'}
                    {selectedRole === 'bridger' && 'Create and manage blood requests at your hospital'}
                    {selectedRole === 'admin' && 'Full platform access and user management'}
                  </p>
                </div>

                {/* Conditional Fields for Pulse Leader */}
                {selectedRole === 'pulse-leader' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Community Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      placeholder="e.g., Lagos Central Community"
                      className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required={selectedRole === 'pulse-leader'}
                      disabled={isSubmittingUpgrade}
                    />
                    <p className="text-xs text-gray-500 mt-1">The community you will be leading</p>
                  </div>
                )}

                {/* Conditional Fields for Bridger */}
                {selectedRole === 'bridger' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facility Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        placeholder="e.g., Lagos University Teaching Hospital"
                        className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required={selectedRole === 'bridger'}
                        disabled={isSubmittingUpgrade}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facility Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={facilityAddress}
                        onChange={(e) => setFacilityAddress(e.target.value)}
                        placeholder="e.g., Idi-Araba, Lagos"
                        className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required={selectedRole === 'bridger'}
                        disabled={isSubmittingUpgrade}
                      />
                    </div>
                  </div>
                )}

                {/* Reason for Request */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Request <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Please explain why you want to upgrade to this role and how you plan to contribute..."
                    required
                    disabled={isSubmittingUpgrade}
                  />
                </div>

                {/* Info Message */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 text-lg">🔑</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">About Role Upgrades</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Role upgrade requests are reviewed by administrators. You will receive a notification once your request is processed. This may take 1-3 business days.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmittingUpgrade || !selectedRole || !reason}
                    className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          </div>
        );
      
      default:
        return (<div className="flex items-center justify-center h-96"><div className="text-center"><h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1><p className="text-gray-600">The requested page could not be found.</p></div></div>);
    }
  };

  return (
    <>
      <BridgerNavbar onPageChange={handlePageChange} activePage={activePage} />
      <div className='m-8'>{renderPageContent()}</div>
      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} onGoHome={handleGoHome} />
    </>
  );
};

// Wrap the component with ProtectedRoute for role-based access
export default function BridgerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['bridger', 'admin']}>
      <Dashboard />
    </ProtectedRoute>
  );
}