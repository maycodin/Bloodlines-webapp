"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, Plus, Users, Calendar, HeartPulse,
  Droplets, History, AlertTriangle, Phone, MapPin, Clock, Trophy, Loader2, LogOut
} from "lucide-react";
import BridgerNavbar from "@/components/BridgerNavbar";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DonationFulfillmentRate from "@/components/DonationFulfillment";
import CriticalBloodRequestCard, { BloodRequestType } from "@/components/CriticalBloodRequestCard";
import PriorityContactForm from "@/components/PriorityContactForm";
import SuccessModal from "@/components/SuccessModal";
import BloodInventoryDashboard from "@/components/BloodInventory";
import InlineMessage, { Message } from "@/components/InlineMessage";
import RoleUpgradeForm from "@/components/RoleUpgradeForm";
import EditBloodRequestModal from "@/components/EditBloodRequestModal";
import ConfirmDonationModal from "@/components/ConfirmDonationModal";
import { bloodRequests, bridger, users, UserProfile } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

type Page = "home" | "blood-requests" | "analytics" | "profile";

// Bridger Dashboard Data Type
interface BridgerDashboardData {
  activeRequests: number;
  upcomingAppointments: number;
  donorsNearby: number;
  inventorySummary: any[];
  donationActivity: {
    totalUnitsFulfilled: number;
    totalFulfilledRequests: number;
  };
  requestOverview: {
    totalRequests: number;
    fulfilledRequests: number;
    overallFulfillmentRate: number;
    byStatus: any[];
  };
  donorResponseMetrics: {
    accepted: number;
    rejected: number;
    noResponse: number;
  };
  fulfillmentHistory: any[];
  fulfillmentByBloodType: any[];
  // Monthly breakdowns (12 entries, Jan to Dec)
  monthlyActiveRequests?: { month: string; monthIndex: number; activeRequests: number; totalRequests: number }[];
  monthlyAverageResponseTime?: { month: string; monthIndex: number; averageMinutes: number; formattedDuration: string; totalFulfilled: number }[];
  fulfillmentByPriority: any[];
}

const Dashboard = () => {
  const { user: authUser, refreshUser, logout } = useAuth();
  
  // State - renamed to avoid conflict with imported bloodRequests
  const [localBloodRequests, setLocalBloodRequests] = useState<BloodRequestType[]>([]);
  const [isThereActiveRequest, setIsThereActiveRequest] = useState(false);
  const [activePage, setActivePage] = useState<Page>("home");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<BridgerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  
  // API state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Edit / Confirm donation panels for a request, and a message shown above the page
  const [editingRequest, setEditingRequest] = useState<BloodRequestType | null>(null);
  const [confirmingRequest, setConfirmingRequest] = useState<BloodRequestType | null>(null);
  const [pageMessage, setPageMessage] = useState<Message | null>(null);

  // Profile editing (PUT /users/me)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', bloodGroup: '', location: '' });
  
  // Bridger-specific state
  const [requestData, setRequestData] = useState({
    bloodType: '',
    unitsNeeded: '',
    priorityLevel: '',
    contactPhone: '',
    facilityName: '',
    facilityAddress: '',
    patientCondition: '',
    requiredByDate: '',
  });
  const [requestMessage, setRequestMessage] = useState<Message | null>(null);
  const [emergencyMessage, setEmergencyMessage] = useState<Message | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState({
    bloodType: '',
    message: '',
    requestId: ''
  });

  // Blood inventory from /bridger/dashboard (inventorySummary). Empty until the backend records inventory.
  const bloodInventory = (dashboardData?.inventorySummary || []).map((item: any) => {
    const units = Number(item.units ?? item.totalUnits ?? item.quantity ?? item.count ?? 0);
    return {
      type: item.bloodType || item.bloodGroup || item.type || item._id || '?',
      units,
      status: item.status || (units <= 5 ? 'critical' : units <= 15 ? 'low' : 'good'),
    };
  });

  // Monthly fulfillment rate: fulfilled requests (from the response-time breakdown) / total requests that month
  const monthlyFulfillment = (dashboardData?.monthlyActiveRequests || []).map((m) => {
    const fulfilled = dashboardData?.monthlyAverageResponseTime?.find((r) => r.monthIndex === m.monthIndex)?.totalFulfilled ?? 0;
    return {
      month: m.month.slice(0, 3),
      value: m.totalRequests ? Math.round((fulfilled / m.totalRequests) * 100) : 0,
      detail: `${fulfilled} of ${m.totalRequests} fulfilled`,
    };
  });

  // Turn the backend's request objects into the shape the request cards use
  const formatRequests = (requests: any[]): BloodRequestType[] =>
    requests.map((req) => ({
      id: req._id || req.id,
      status: req.priorityLevel === 'CRITICAL' ? 'Critical' : req.priorityLevel === 'URGENT' ? 'Urgent' : 'Scheduled',
      bloodType: req.bloodType,
      unitsNeeded: req.unitsNeeded,
      postedTime: new Date(req.createdAt).toLocaleTimeString(),
      contactNumber: req.contactPhone || 'Not provided',
      patientCondition: req.patientCondition || 'No details provided',
      showActions: true,
      priorityLevel: req.priorityLevel,
      requestStatus: req.status,
      facilityName: req.facilityName,
      facilityAddress: req.facilityAddress,
      additionalNotes: req.additionalNotes,
      assignedDonors: Array.isArray(req.assignedDonors) ? req.assignedDonors : [],
      unitsConfirmed: req.unitsConfirmed,
    }));

  const loadMyRequests = async () => {
    const myRequests = await bloodRequests.getMyRequests();
    const formatted = formatRequests(myRequests);
    setLocalBloodRequests(formatted);
    setIsThereActiveRequest(formatted.length > 0);
  };

  // Ask the browser for the bridger's location; the backend needs it to match nearby donors
  const getCurrentCoordinates = () =>
    new Promise<[number, number]>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Your browser does not support location access, which is needed to post a request.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve([position.coords.longitude, position.coords.latitude]),
        (geoError) =>
          reject(
            new Error(
              geoError.code === geoError.PERMISSION_DENIED
                ? 'Location access is needed so nearby donors can be matched. Please allow it in your browser and try again.'
                : 'Could not get your location. Please try again.'
            )
          ),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });

  // Fetch dashboard data
  useEffect(() => {
    const fetchBridgerData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const profileData = await users.getMyProfile().catch(() => null);
        if (profileData) setProfile(profileData);
        
        // Fetch bridger dashboard data
        const data = await bridger.getDashboard();
        setDashboardData(data);
        
        // Load this bridger's existing requests (a failure here shouldn't hide the dashboard)
        await loadMyRequests().catch((err) => console.error('Failed to load blood requests:', err));
        
      } catch (err: any) {
        console.error("Failed to fetch bridger data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBridgerData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

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

  // "Confirm donation" opens the list of donors who accepted this request
  const handleConfirm = (id: string | number) => {
    setConfirmingRequest(localBloodRequests.find((request) => request.id === id) || null);
  };

  // "Edit" opens the edit panel for this request
  const handleEdit = (id: string | number) => {
    setEditingRequest(localBloodRequests.find((request) => request.id === id) || null);
  };

  const refreshRequests = () =>
    loadMyRequests().catch((err) => console.error('Failed to refresh blood requests:', err));

  const startEditingProfile = () => {
    setProfileForm({
      fullName: profile?.fullName || '',
      phoneNumber: profile?.phoneNumber || '',
      bloodGroup: profile?.bloodGroup || '',
      location: profile?.location || '',
    });
    setProfileMessage(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      await users.updateMyProfile(profileForm);
      // Reload the saved profile rather than trusting the update response's shape
      const saved = await users.getMyProfile();
      setProfile(saved);
      setIsEditingProfile(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err?.message || 'Failed to update profile. Please try again.' });
    } finally {
      setIsSavingProfile(false);
    }
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
    setRequestMessage(null);
    
    if (!requestData.bloodType || !requestData.unitsNeeded || !requestData.priorityLevel || 
        !requestData.contactPhone || !requestData.facilityName || !requestData.facilityAddress ||
        !requestData.patientCondition || !requestData.requiredByDate) {
      setRequestMessage({ type: 'error', text: 'Please fill in all required fields' });
      setIsLoading(false);
      return;
    }
    
    try {
      const coordinates = await getCurrentCoordinates();

      await bloodRequests.create({
        bloodType: requestData.bloodType,
        unitsNeeded: parseInt(requestData.unitsNeeded),
        priorityLevel: requestData.priorityLevel as 'CRITICAL' | 'URGENT' | 'SCHEDULED',
        contactPhone: requestData.contactPhone,
        facilityName: requestData.facilityName,
        facilityAddress: requestData.facilityAddress,
        facilityLocation: { type: 'Point', coordinates },
        patientCondition: requestData.patientCondition,
        // The date picker gives local time without a zone; the API expects a full date-time
        requiredByDate: new Date(requestData.requiredByDate).toISOString(),
      });
      
      setRequestMessage({ type: 'success', text: 'Blood request created successfully!' });
      
      // Reset form
      setRequestData({
        bloodType: '',
        unitsNeeded: '',
        priorityLevel: '',
        contactPhone: '',
        // Keep the facility details: a bridger usually posts from the same hospital
        facilityName: requestData.facilityName,
        facilityAddress: requestData.facilityAddress,
        patientCondition: '',
        requiredByDate: '',
      });
      
      // Refresh the requests list
      await loadMyRequests().catch((err) => console.error('Failed to refresh blood requests:', err));
      
    } catch (error: any) {
      console.error('Failed to create request:', error);
      setRequestMessage({ type: 'error', text: error.message || 'Failed to create blood request. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Emergency Broadcast
  const handleEmergencyBroadcast = async () => {
    if (!emergencyData.requestId || !emergencyData.bloodType) {
      setEmergencyMessage({ type: 'error', text: 'Please select a request for emergency broadcast' });
      return;
    }
    
    setIsLoading(true);
    setEmergencyMessage(null);
    try {
      const result = await bridger.sendEmergencyAlert({
        targetBloodGroups: [emergencyData.bloodType],
        message: emergencyData.message || 'Emergency: Patient in critical condition',
      });
      setEmergencyMessage({
        type: 'success',
        text: typeof result?.recipientCount === 'number'
          ? `Emergency alert sent to ${result.recipientCount} donors!`
          : 'Emergency alert sent to eligible donors.',
      });
      setShowEmergencyModal(false);
      setEmergencyData({ bloodType: '', message: '', requestId: '' });
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      setEmergencyMessage({ type: 'error', text: 'Failed to send emergency alert. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPageContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

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
                      <p className="text-black text-sm font-medium">Active Requests</p>
                      <p className="text-2xl font-normal text-black mt-2">{dashboardData?.activeRequests || 0}</p>
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
                      <p className="text-black text-sm font-medium">Donors Nearby</p>
                      <p className="text-2xl font-normal text-black mt-2">{dashboardData?.donorsNearby || 0}</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg cursor-pointer">
                        <option>Month</option>
                      </select>
                      <Calendar className="absolute top-3 right-2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <DonationFulfillmentRate
                  percentage={dashboardData?.requestOverview?.overallFulfillmentRate || 0}
                  totalRequests={dashboardData?.requestOverview?.totalRequests || 0}
                  fulfilledRequests={dashboardData?.requestOverview?.fulfilledRequests || 0}
                />
                
                <div className="bg-white rounded-lg p-5 shadow-md border border-[#D8D6D6] w-96">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">Fulfillment Rate</h2>
                    <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg cursor-pointer">
                      <option>Month</option>
                    </select>
                  </div>
                  <div className="relative h-53">
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-sm text-gray-500">
                      <span>100</span><span>50</span><span>0</span>
                    </div>
                    <div className="ml-10 h-full flex items-end justify-between">
                      {monthlyFulfillment.length === 0 && (
                        <p className="text-sm text-gray-500 self-center mx-auto">No monthly data yet</p>
                      )}
                      {monthlyFulfillment.map((item, index) => (
                        <div key={index} className="flex flex-col items-center" title={`${item.month}: ${item.value}% (${item.detail})`}>
                          {/* 100% = 185px tall, matching the 0-100 scale on the left */}
                          <div className="w-2 bg-[#1C7C3A] rounded-lg" style={{ height: `${Math.max(item.value * 1.85, item.value > 0 ? 4 : 0)}px` }} />
                          <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6] mb-8">
                <h2 className="text-xl font-bold text-black mb-3">Current Blood Inventory</h2>
                {bloodInventory.length === 0 && (
                  <p className="text-sm text-gray-500">No inventory recorded yet. Stock levels will show here once the facility's inventory is added.</p>
                )}
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
              <InlineMessage message={requestMessage} onClose={() => setRequestMessage(null)} />
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
                    <select className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.priorityLevel} onChange={(e) => setRequestData({...requestData, priorityLevel: e.target.value})} required>
                      <option value="">Select urgency</option>
                      <option value="CRITICAL">🔴 Critical</option>
                      <option value="URGENT">🟠 Urgent</option>
                      <option value="SCHEDULED">🟢 Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone *</label>
                    <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.contactPhone} onChange={(e) => setRequestData({...requestData, contactPhone: e.target.value})} placeholder="+2348012345678" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Facility Name *</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.facilityName} onChange={(e) => setRequestData({...requestData, facilityName: e.target.value})} placeholder="e.g., Lagos University Teaching Hospital" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Facility Address *</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={requestData.facilityAddress} onChange={(e) => setRequestData({...requestData, facilityAddress: e.target.value})} placeholder="e.g., Idi-Araba, Lagos" required />
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
                <p className="text-xs text-gray-500 text-center">
                  Your browser will ask to share your location, so donors near your facility can be matched.
                </p>
              </form>
            </div>

            {/* Emergency Broadcast Section */}
            <div className="bg-white rounded-xl p-6 border border-red-500 w-full mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-600">Emergency Broadcast</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Send urgent alerts to nearby eligible donors. Use only for genuine critical emergencies.</p>
              <InlineMessage message={emergencyMessage} onClose={() => setEmergencyMessage(null)} />
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
            <BloodInventoryDashboard bloodRequests={localBloodRequests} handleConfirm={handleConfirm} handleEdit={handleEdit} setActivePage={handlePageChange} /> 
          </div>
        );
      
      case 'profile':
        return (
          <div className="mx-auto max-w-2xl">
            {/* Profile Information Section */}
            <div className="bg-white rounded-lg border border-[#D8D6D6] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
              <InlineMessage message={profileMessage} onClose={() => setProfileMessage(null)} />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    {isEditingProfile ? (
                      <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                    ) : (
                      <p className="text-gray-900">{profile?.fullName || 'Loading...'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{profile?.email || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    {isEditingProfile ? (
                      <input type="tel" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                    ) : (
                      <p className="text-gray-900">{profile?.phoneNumber || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Group</p>
                    {isEditingProfile ? (
                      <select value={profileForm.bloodGroup} onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })} className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group} value={group}>{group}</option>)}
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile?.bloodGroup || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    {isEditingProfile ? (
                      <input type="text" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} placeholder="e.g., Surulere, Lagos" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                    ) : (
                      <p className="text-gray-900">{profile?.location || 'Not set'}</p>
                    )}
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
                {isEditingProfile ? (
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                      {isSavingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile} className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={startEditingProfile} className="mt-4 bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Role Upgrade Request Section */}
            <RoleUpgradeForm />
          </div>
        );
      
      default:
        return (<div className="flex items-center justify-center h-96"><div className="text-center"><h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1><p className="text-gray-600">The requested page could not be found.</p></div></div>);
    }
  };

  return (
    <>
      <BridgerNavbar 
        onPageChange={handlePageChange} 
        activePage={activePage}
        onLogout={handleLogout}
      />
      <div className='m-8'>
        <InlineMessage message={pageMessage} onClose={() => setPageMessage(null)} />
        {renderPageContent()}
      </div>
      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} onGoHome={handleGoHome} />
      {editingRequest && (
        <EditBloodRequestModal
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSaved={(text) => {
            setEditingRequest(null);
            setPageMessage({ type: 'success', text });
            refreshRequests();
          }}
        />
      )}
      {confirmingRequest && (
        <ConfirmDonationModal
          request={confirmingRequest}
          onClose={() => setConfirmingRequest(null)}
          onChanged={(text) => {
            if (text) setPageMessage({ type: 'success', text });
            refreshRequests();
          }}
        />
      )}
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