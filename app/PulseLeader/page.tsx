// app/PulseLeader/page.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, Plus, Search, Home, BarChart3, User, Bell, Loader2, Edit2, Save, X, Mail, Phone, MapPin, Droplets as DropletsIcon, LogOut } from 'lucide-react';
import PulseLeaderNavbar from '@/components/PulseLeaderNavbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DonationFulfillmentRate from '@/components/DonationFulfillment';
import CriticalBloodRequestCard, { BloodRequestType } from '@/components/CriticalBloodRequestCard';
import Image from 'next/image';
import ImpactActivitiesCards from '@/components/ImpactActivitiesCard';
import DonorSearch from '@/components/DonorSearch';
import PulseAnalytics from '@/components/PulseAnalytics';
import RoleUpgradeForm from "@/components/RoleUpgradeForm";
import { useAuth } from "@/app/contexts/AuthContext";
import { users, UserProfile, pulseLeader } from '@/lib/api';

// Type for the backend response
interface PulseLeaderDashboardData {
  statistics: {
    activeDonors: number;
    avgResponseTime: string;
    escalationFulfillmentRate: number;
    totalRequests: number;
    totalDonations: number;
    newDonorsRecruited: number;
    emergenciesHandled: number;
    impactScore: number;
  };
  monthlyMetrics: {
    year: number;
    totalDonations: number;
    peakMonthlyVolume: number;
    metrics: Array<{
      month: string;
      monthIndex: number;
      count: number;
      percentage: number;
      dbValue: number | null;
    }>;
  };
  donorBloodTypeDistribution: Array<{
    bloodTypes: Array<{ bloodType: string; count: number }>;
    totalDonors: number;
    state: string;
  }>;
  coordinationHistory: any[];
  recentBloodRequests: any[];
  recentActivities: Array<{
    id: string;
    activityType: string;
    description: string;
    actor: string;
    timestamp: string;
    bloodType: string;
    units: number;
  }>;
  requestFulfillmentByBloodType: Array<{
    bloodType: string;
    percentage: number;
    total: number;
    fulfilled: number;
  }>;
  requestFulfillmentByUrgency: Array<{
    urgency: string;
    percentage: number;
    total: number;
    fulfilled: number;
  }>;
}

const PulseLeaderDashboard = () => {
  const { user: authUser, refreshUser, logout } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [bloodRequests, setBloodRequests] = useState<BloodRequestType[]>([]);
  const [isThereActiveRequest, setIsThereActiveRequest] = useState(false);
  const [dashboardData, setDashboardData] = useState<PulseLeaderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const profileData = await users.getMyProfile().catch(() => null);
        if (profileData) {
          setProfile(profileData);
          setEditForm({
            fullName: profileData.fullName || "",
            phoneNumber: profileData.phoneNumber || "",
            bloodGroup: profileData.bloodGroup || "",
            location: profileData.location || "",
          });
        }
        
        // ✅ Use the API client instead of direct fetch
        const data = await pulseLeader.getDashboard();
        setDashboardData(data);
        
        // Transform recent blood requests to BloodRequestType format
        if (data.recentBloodRequests) {
          const formattedRequests = data.recentBloodRequests.map((req: any) => ({
            id: req._id || req.id,
            status: req.priorityLevel === 'CRITICAL' ? 'Critical' : 
                    req.priorityLevel === 'URGENT' ? 'Urgent' : 'Scheduled',
            bloodType: req.bloodType,
            unitsNeeded: req.unitsNeeded,
            postedTime: new Date(req.createdAt).toLocaleString(),
            contactNumber: req.contactPhone || 'Not provided',
            patientCondition: req.patientCondition || 'No details provided',
            showActions: true
          }));
          setBloodRequests(formattedRequests);
          setIsThereActiveRequest(formattedRequests.length > 0);
        }
        
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Handle profile edit
  const handleEditProfile = async () => {
    if (isEditing) {
      setIsSaving(true);
      setSaveMessage(null);
      
      try {
        await users.updateMyProfile(editForm);
        // Reload the saved profile rather than trusting the update response's shape
        const savedProfile = await users.getMyProfile();
        setProfile(savedProfile);
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

  const handleConfirm = (id: string | number) => {
    setBloodRequests(prev => prev.filter(request => request.id !== id));
    if (bloodRequests.length <= 1) {
      setIsThereActiveRequest(false);
    }
  };

  const handleEdit = (id: string | number) => {
    // TODO: open the edit form for this request
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Format monthly data for the chart
  const getMonthlyChartData = () => {
    if (!dashboardData?.monthlyMetrics?.metrics) return [];
    return dashboardData.monthlyMetrics.metrics.map((m) => ({
      month: m.month.substring(0, 3),
      value: m.count || 0,
    }));
  };

  // Get total requests count
  const getTotalRequests = () => {
    return dashboardData?.statistics?.totalRequests || 0;
  };

  // Get active donors count
  const getActiveDonors = () => {
    return dashboardData?.statistics?.activeDonors || 0;
  };

  // Get average response time
  const getAvgResponseTime = () => {
    const time = dashboardData?.statistics?.avgResponseTime || '0m';
    if (time.includes('h')) {
      const parts = time.split(' ');
      return parts[0] + 'h ' + (parts[1] || '');
    }
    return time;
  };

  const monthlyData = getMonthlyChartData().length > 0 
    ? getMonthlyChartData() 
    : [
        { month: 'Jan', value: 0 },
        { month: 'Feb', value: 0 },
        { month: 'Mar', value: 0 },
        { month: 'Apr', value: 0 },
        { month: 'May', value: 0 },
        { month: 'Jun', value: 0 },
        { month: 'Jul', value: 0 },
        { month: 'Aug', value: 0 },
        { month: 'Sep', value: 0 },
        { month: 'Oct', value: 0 },
        { month: 'Nov', value: 0 },
        { month: 'Dec', value: 0 },
      ];

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
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold">
                Welcome back, {profile?.fullName?.split(' ')[0] || 'Pulse Leader'}! 👋
              </h1>
              <p className="text-red-100 mt-2">
                {getTotalRequests()} total requests • {getActiveDonors()} active donors
              </p>
            </div>

            {/* Stats Cards */}
            <div className='flex justify-center gap-4 mb-5 flex-wrap'>
              <div className="bg-white rounded-lg w-64 p-6 shadow-md border border-[#D8D6D6]">
                <div>
                  <p className="text-black text-sm font-medium">Total Requests</p>
                  <p className="text-2xl font-normal text-black mt-2">{getTotalRequests()}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg w-64 p-6 shadow-md border border-[#D8D6D6]">
                <div>
                  <p className="text-black text-sm font-medium">Active Donors</p>
                  <p className="text-2xl font-normal text-black mt-2">{getActiveDonors()}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg w-64 p-6 shadow-md border border-[#D8D6D6]">
                <div>
                  <p className="text-black text-sm font-medium">Avg Response Time</p>
                  <p className="text-2xl font-normal text-black mt-2">{getAvgResponseTime()}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg w-64 p-6 shadow-md border border-[#D8D6D6]">
                <div>
                  <p className="text-black text-sm font-medium">Impact Score</p>
                  <p className="text-2xl font-normal text-black mt-2">{dashboardData?.statistics?.impactScore || 0}</p>
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-lg p-5 shadow-md border border-[#D8D6D6]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800">Monthly Activity</h2>
                <span className="text-sm text-gray-500">
                  Total Donations: {dashboardData?.monthlyMetrics?.totalDonations || 0}
                </span>
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
                          style={{ height: `${Math.min(item.value * 0.6, 100)}px` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Blood Type Fulfillment Rates */}
            <div className="bg-white rounded-lg p-5 shadow-md border border-[#D8D6D6]">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Fulfillment by Blood Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dashboardData?.requestFulfillmentByBloodType?.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="font-bold text-lg text-[#C91E1E]">{item.bloodType}</p>
                    <p className="text-sm text-gray-600">{item.fulfilled}/{item.total} fulfilled</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        className="h-full bg-[#1C7C3A] rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Blood Requests */}
            <div className="bg-white rounded-xl p-6 border border-[#C91E1E] w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Blood Requests</h2>
                <span className="text-sm text-gray-500">{bloodRequests.length} total</span>
              </div>
              
              {bloodRequests.length > 0 ? (
                <div className="space-y-4">
                  {bloodRequests.slice(0, 5).map((request) => (
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
                    <p className="text-gray-600">Blood requests will appear here.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-6 border border-[#D8D6D6]">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {dashboardData?.recentActivities?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {activity.actor} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {activity.bloodType}
                    </span>
                  </div>
                ))}
                {(!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0) && (
                  <p className="text-center text-gray-500 py-8">No recent activities</p>
                )}
              </div>
            </div>
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
                    <p className="text-gray-900">{profile?.email || 'Loading...'}</p>
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
                      <p className="text-gray-900">{profile?.phoneNumber || 'Not set'}</p>
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
                      <p className="text-gray-900">{profile?.bloodGroup || 'Not set'}</p>
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
                      <p className="text-gray-900">{profile?.location || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Member Since
                  </p>
                  <p className="text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Loading...'}</p>
                </div>
              </div>
            </div>

            {/* Role Upgrade Request Section */}
            <RoleUpgradeForm />

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
      <PulseLeaderNavbar 
        onPageChange={handlePageChange} 
        activePage={activePage}
        onLogout={handleLogout}
      />
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